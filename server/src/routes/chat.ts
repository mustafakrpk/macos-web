import { asc, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db/client.js';
import {
	about,
	education,
	experiences,
	languages,
	projects,
	skill_categories,
} from '../db/schema.js';
import { env } from '../lib/env.js';

export const chat_routes = new Hono();

// ─── İstek şeması ──────────────────────────────────────────────
// Konuşma geçmişi + son mesaj. Kötüye kullanımı sınırlamak için sıkı limitler.
const chat_schema = z.object({
	messages: z
		.array(
			z.object({
				role: z.enum(['user', 'assistant']),
				content: z.string().trim().min(1).max(2000),
			}),
		)
		.min(1)
		.max(20),
});

// ─── System prompt (DB'den, 5 dk cache'li) ─────────────────────
let cached_system: { value: string; expires_at: number } | null = null;
const SYSTEM_TTL_MS = 5 * 60 * 1000;

function json_array(v: unknown): string[] {
	if (Array.isArray(v)) return v.filter((x): x is string => typeof x === 'string');
	if (typeof v === 'string' && v.length > 0) {
		try {
			const parsed = JSON.parse(v);
			if (Array.isArray(parsed)) return parsed.filter((x): x is string => typeof x === 'string');
		} catch {
			/* yoksay */
		}
	}
	return [];
}

async function build_system_prompt(): Promise<string> {
	const now = Date.now();
	if (cached_system && cached_system.expires_at > now) return cached_system.value;

	const [about_rows, exp, edu, skills, langs, projs] = await Promise.all([
		db.select().from(about).where(eq(about.id, 1)).limit(1),
		db.select().from(experiences).orderBy(asc(experiences.display_order), asc(experiences.id)),
		db.select().from(education).orderBy(asc(education.display_order), asc(education.id)),
		db
			.select()
			.from(skill_categories)
			.orderBy(asc(skill_categories.display_order), asc(skill_categories.id)),
		db.select().from(languages).orderBy(asc(languages.display_order), asc(languages.id)),
		db
			.select()
			.from(projects)
			.where(eq(projects.is_published, true))
			.orderBy(asc(projects.display_order), asc(projects.id)),
	]);

	const a = about_rows[0];
	const lines: string[] = [];

	lines.push('# Mustafa Kırpık — Profil Bilgileri');
	if (a) {
		lines.push(`İsim: ${a.full_name}`);
		lines.push(`Unvan: ${a.title}`);
		if (a.location) lines.push(`Konum: ${a.location}`);
		if (a.email) lines.push(`E-posta: ${a.email}`);
		if (a.github_url) lines.push(`GitHub: ${a.github_url}`);
		if (a.linkedin_url) lines.push(`LinkedIn: ${a.linkedin_url}`);
		if (a.current_status) lines.push(`Şu an: ${a.current_status}`);
		if (a.intro_md) lines.push(`\nÖzet:\n${a.intro_md}`);
	}

	if (exp.length) {
		lines.push('\n## Deneyimler');
		for (const e of exp) {
			const period = e.period_end ? `${e.period_start}–${e.period_end}` : `${e.period_start}–günümüz`;
			lines.push(`- ${e.title} @ ${e.company} (${period})${e.description ? `: ${e.description}` : ''}`);
		}
	}

	if (edu.length) {
		lines.push('\n## Eğitim');
		for (const e of edu) {
			const period = e.period_end ? `${e.period_start}–${e.period_end}` : `${e.period_start}–günümüz`;
			lines.push(`- ${e.degree}, ${e.school} (${period})`);
		}
	}

	if (skills.length) {
		lines.push('\n## Yetenekler');
		for (const s of skills) lines.push(`- ${s.name}: ${json_array(s.items).join(', ')}`);
	}

	if (langs.length) {
		lines.push('\n## Diller');
		for (const l of langs) lines.push(`- ${l.name}: ${l.level}`);
	}

	if (projs.length) {
		lines.push('\n## Projeler');
		for (const p of projs) {
			const stack = json_array(p.stack).join(', ');
			lines.push(
				`- ${p.title}${stack ? ` [${stack}]` : ''}: ${p.description}${p.github_url ? ` (${p.github_url})` : ''}`,
			);
		}
	}

	const facts = lines.join('\n');
	const system = `Sen, Mustafa Kırpık'ın kişisel portfolyo sitesindeki yardımcı asistanısın. Görevin, ziyaretçilerin (özellikle işverenlerin ve teknik ekiplerin) Mustafa hakkındaki sorularını yanıtlamak.

Kurallar:
- SADECE aşağıdaki profil bilgilerine dayanarak yanıt ver. Bilgi yoksa uydurma; "Bu konuda elimde bilgi yok, Mustafa'ya iletişim üzerinden ulaşabilirsin" de.
- Ziyaretçinin yazdığı dilde yanıt ver (Türkçe soruya Türkçe, İngilizce soruya İngilizce).
- Kısa, samimi ve net ol. Gerektiğinde madde işaretleri kullan.
- Mustafa'dan üçüncü şahıs olarak bahset ("Mustafa ... yaptı"), sen onun asistanısın.
- Konu dışı (Mustafa ile ilgisiz) sorularda kibarca portfolyoya yönlendir.
- Uzun kod yazma; teknik soruları Mustafa'nın deneyimi bağlamında yanıtla.

${facts}`;

	cached_system = { value: system, expires_at: now + SYSTEM_TTL_MS };
	return system;
}

// ─── POST /api/public/chat ─────────────────────────────────────
// OpenAI-uyumlu chat completions endpoint'ine istek atar (varsayılan: Gemini).
chat_routes.post('/', async (c) => {
	if (!env.CHAT_API_KEY) {
		return c.json({ error: 'chat_disabled', message: 'AI asistan yapılandırılmamış.' }, 503);
	}

	const body = await c.req.json().catch(() => null);
	const parsed = chat_schema.safeParse(body);
	if (!parsed.success) {
		return c.json({ error: 'invalid_input', issues: parsed.error.flatten() }, 400);
	}

	try {
		const system = await build_system_prompt();

		const res = await fetch(env.CHAT_API_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${env.CHAT_API_KEY}`,
			},
			body: JSON.stringify({
				model: env.CHAT_MODEL,
				max_tokens: 1024,
				temperature: 0.6,
				messages: [{ role: 'system', content: system }, ...parsed.data.messages],
			}),
		});

		if (!res.ok) {
			const detail = await res.text();
			console.error('[chat] provider error', res.status, detail.slice(0, 400));
			return c.json({ error: 'chat_failed', message: 'Asistan şu anda yanıt veremiyor.' }, 502);
		}

		const data = (await res.json()) as {
			choices?: Array<{ message?: { content?: string } }>;
		};
		const reply = data.choices?.[0]?.message?.content?.trim();

		return c.json({ reply: reply || 'Üzgünüm, bir yanıt üretemedim.' });
	} catch (err: any) {
		console.error('[chat] error', err?.message ?? err);
		return c.json({ error: 'chat_failed', message: 'Asistan şu anda yanıt veremiyor.' }, 502);
	}
});
