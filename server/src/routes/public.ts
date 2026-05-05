import { asc, eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db/client.js';
import {
	about,
	contact_messages,
	cv_meta,
	education,
	experiences,
	languages,
	projects,
	skill_categories,
} from '../db/schema.js';

const contact_schema = z.object({
	name: z.string().trim().min(1).max(255),
	email: z.string().trim().email().max(255),
	message: z.string().trim().min(1).max(5000),
});

export const public_routes = new Hono();

public_routes.get('/about', async (c) => {
	const rows = await db.select().from(about).where(eq(about.id, 1)).limit(1);
	if (rows.length === 0) return c.json({ about: null });
	return c.json({ about: rows[0] });
});

public_routes.get('/projects', async (c) => {
	const rows = await db
		.select()
		.from(projects)
		.where(eq(projects.is_published, true))
		.orderBy(asc(projects.display_order), asc(projects.id));
	return c.json({ projects: rows });
});

public_routes.get('/cv', async (c) => {
	const [exp, edu, skills, langs, meta_rows] = await Promise.all([
		db.select().from(experiences).orderBy(asc(experiences.display_order), asc(experiences.id)),
		db.select().from(education).orderBy(asc(education.display_order), asc(education.id)),
		db
			.select()
			.from(skill_categories)
			.orderBy(asc(skill_categories.display_order), asc(skill_categories.id)),
		db.select().from(languages).orderBy(asc(languages.display_order), asc(languages.id)),
		db.select().from(cv_meta).where(eq(cv_meta.id, 1)).limit(1),
	]);

	return c.json({
		experiences: exp,
		education: edu,
		skill_categories: skills,
		languages: langs,
		cv_meta: meta_rows[0] ?? null,
	});
});

public_routes.post('/contact', async (c) => {
	const body = await c.req.json().catch(() => null);
	const parsed = contact_schema.safeParse(body);
	if (!parsed.success) {
		return c.json({ error: 'invalid_input', issues: parsed.error.flatten() }, 400);
	}

	const ip =
		c.req.header('x-forwarded-for')?.split(',')[0].trim() ||
		c.req.header('x-real-ip') ||
		null;

	await db.insert(contact_messages).values({
		name: parsed.data.name,
		email: parsed.data.email,
		message: parsed.data.message,
		ip: ip ?? undefined,
	});

	return c.json({ ok: true });
});
