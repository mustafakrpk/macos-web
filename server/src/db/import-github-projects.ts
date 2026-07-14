// GitHub repolarını çekip `projects` tablosunu doldurur.
// Çalıştırma: pnpm db:import-github   (server/ içinde)
// Not: Mevcut projeleri SİLER ve GitHub'dakilerle değiştirir.

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { env } from '../lib/env.js';
import { projects } from './schema.js';

// Fork'ları dahil et? (false = sadece kendi orijinal projelerin)
const INCLUDE_FORKS = false;
// Arşivlenmiş repoları dahil et?
const INCLUDE_ARCHIVED = false;

const GRADIENTS = [
	'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
	'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
	'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
	'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
	'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
	'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
	'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
	'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
];

// Dile göre emoji (yoksa 🚀)
const LANG_EMOJI: Record<string, string> = {
	TypeScript: '🟦',
	JavaScript: '🟨',
	Svelte: '🔥',
	Vue: '💚',
	Python: '🐍',
	Go: '🐹',
	Rust: '🦀',
	Java: '☕',
	'C++': '⚙️',
	C: '⚙️',
	'C#': '🎯',
	PHP: '🐘',
	Ruby: '💎',
	HTML: '🌐',
	CSS: '🎨',
	Shell: '🐚',
	Dart: '🎯',
	Kotlin: '🟪',
	Swift: '🦅',
};

type Repo = {
	name: string;
	description: string | null;
	html_url: string;
	homepage: string | null;
	language: string | null;
	topics?: string[];
	fork: boolean;
	archived: boolean;
	stargazers_count: number;
	updated_at: string;
};

async function fetch_all_repos(username: string): Promise<Repo[]> {
	const repos: Repo[] = [];
	for (let page = 1; page <= 10; page++) {
		const url = `https://api.github.com/users/${username}/repos?per_page=100&page=${page}&sort=updated&type=owner`;
		const res = await fetch(url, {
			headers: {
				Accept: 'application/vnd.github+json',
				'User-Agent': 'mk-portfolio-import',
			},
		});
		if (!res.ok) {
			throw new Error(`GitHub repos fetch failed (page ${page}): ${res.status} ${await res.text()}`);
		}
		const batch = (await res.json()) as Repo[];
		repos.push(...batch);
		if (batch.length < 100) break; // son sayfa
	}
	return repos;
}

function to_title(name: string): string {
	return name
		.replace(/[-_]+/g, ' ')
		.replace(/\b\w/g, (c) => c.toUpperCase())
		.trim();
}

async function main() {
	const username = env.ADMIN_GITHUB_USERNAME;
	console.log(`→ GitHub repoları çekiliyor: ${username}`);

	const all = await fetch_all_repos(username);
	const filtered = all
		.filter((r) => (INCLUDE_FORKS ? true : !r.fork))
		.filter((r) => (INCLUDE_ARCHIVED ? true : !r.archived))
		// En çok yıldızlı, sonra en yeni güncellenen önce
		.sort(
			(a, b) =>
				b.stargazers_count - a.stargazers_count ||
				new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
		);

	console.log(`→ ${all.length} repo bulundu, ${filtered.length} tanesi içeri aktarılacak.`);

	if (filtered.length === 0) {
		console.log('⚠️  Aktarılacak repo yok, çıkılıyor.');
		return;
	}

	const rows = filtered.map((r, i) => {
		const stack = Array.from(
			new Set([r.language, ...(r.topics ?? [])].filter((x): x is string => !!x)),
		).slice(0, 6);

		return {
			title: to_title(r.name),
			description: r.description ?? 'Açıklama için GitHub deposuna göz atın.',
			stack,
			github_url: r.html_url,
			live_url: r.homepage && r.homepage.trim().length > 0 ? r.homepage : null,
			image_url: null,
			gradient: GRADIENTS[i % GRADIENTS.length],
			emoji: (r.language && LANG_EMOJI[r.language]) || '🚀',
			display_order: i,
			is_published: true,
		};
	});

	const connection = await mysql.createConnection(env.DATABASE_URL);
	const db = drizzle(connection);

	console.log('→ Mevcut projeler siliniyor...');
	await db.delete(projects);

	console.log(`→ ${rows.length} proje ekleniyor...`);
	await db.insert(projects).values(rows);

	console.log('✓ GitHub projeleri içeri aktarıldı:');
	for (const row of rows) console.log(`   ${row.emoji}  ${row.title}  [${row.stack.join(', ')}]`);

	await connection.end();
}

main().catch((err) => {
	console.error('Import hatası:', err);
	process.exit(1);
});
