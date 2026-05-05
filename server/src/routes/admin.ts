import { asc, desc, eq } from 'drizzle-orm';
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
import { require_auth, type AuthVars } from '../middleware/auth.js';

const json_or_400 = async <T>(c: any, schema: z.ZodSchema<T>): Promise<T | Response> => {
	const body = await c.req.json().catch(() => null);
	const parsed = schema.safeParse(body);
	if (!parsed.success) {
		return c.json({ error: 'invalid_input', issues: parsed.error.flatten() }, 400);
	}
	return parsed.data;
};

const about_schema = z.object({
	full_name: z.string().min(1).max(128),
	title: z.string().min(1).max(255),
	intro_md: z.string().max(20000),
	avatar_url: z.string().max(512).nullable().optional(),
	email: z.string().email().max(255).nullable().optional(),
	github_url: z.string().url().max(512).nullable().optional(),
	linkedin_url: z.string().url().max(512).nullable().optional(),
	location: z.string().max(128).nullable().optional(),
});

const project_schema = z.object({
	title: z.string().min(1).max(255),
	description: z.string().max(5000),
	stack: z.array(z.string().max(64)).max(20),
	github_url: z.string().url().max(512).nullable().optional(),
	live_url: z.string().url().max(512).nullable().optional(),
	image_url: z.string().max(512).nullable().optional(),
	gradient: z.string().min(1).max(255),
	emoji: z.string().min(1).max(8),
	display_order: z.number().int().default(0),
	is_published: z.boolean().default(true),
});

const cv_schema = z.object({
	experiences: z.array(
		z.object({
			id: z.number().int().optional(),
			title: z.string().min(1).max(255),
			company: z.string().min(1).max(255),
			period_start: z.string().min(1).max(32),
			period_end: z.string().max(32).nullable().optional(),
			description: z.string().max(5000).nullable().optional(),
			display_order: z.number().int().default(0),
		}),
	),
	education: z.array(
		z.object({
			id: z.number().int().optional(),
			degree: z.string().min(1).max(255),
			school: z.string().min(1).max(255),
			period_start: z.string().min(1).max(32),
			period_end: z.string().max(32).nullable().optional(),
			display_order: z.number().int().default(0),
		}),
	),
	skill_categories: z.array(
		z.object({
			id: z.number().int().optional(),
			name: z.string().min(1).max(64),
			items: z.array(z.string().max(64)).max(50),
			display_order: z.number().int().default(0),
		}),
	),
	languages: z.array(
		z.object({
			id: z.number().int().optional(),
			name: z.string().min(1).max(64),
			level: z.string().min(1).max(64),
			display_order: z.number().int().default(0),
		}),
	),
	cv_meta: z.object({
		pdf_url: z.string().max(512).nullable().optional(),
	}),
});

export const admin_routes = new Hono<{ Variables: AuthVars }>();

admin_routes.use('*', require_auth);

// ─── ABOUT ───────────────────────────────────────────────────────
admin_routes.get('/about', async (c) => {
	const rows = await db.select().from(about).where(eq(about.id, 1)).limit(1);
	return c.json({ about: rows[0] ?? null });
});

admin_routes.put('/about', async (c) => {
	const data = await json_or_400(c, about_schema);
	if (data instanceof Response) return data;

	const existing = await db.select().from(about).where(eq(about.id, 1)).limit(1);
	if (existing.length === 0) {
		await db.insert(about).values({ id: 1, ...data, updated_at: new Date() });
	} else {
		await db.update(about).set({ ...data, updated_at: new Date() }).where(eq(about.id, 1));
	}

	const updated = await db.select().from(about).where(eq(about.id, 1)).limit(1);
	return c.json({ about: updated[0] });
});

// ─── PROJECTS ────────────────────────────────────────────────────
admin_routes.get('/projects', async (c) => {
	const rows = await db
		.select()
		.from(projects)
		.orderBy(asc(projects.display_order), asc(projects.id));
	return c.json({ projects: rows });
});

admin_routes.post('/projects', async (c) => {
	const data = await json_or_400(c, project_schema);
	if (data instanceof Response) return data;

	const inserted = await db.insert(projects).values({
		...data,
		github_url: data.github_url ?? undefined,
		live_url: data.live_url ?? undefined,
		image_url: data.image_url ?? undefined,
	});
	const id = Number(inserted[0].insertId);

	const created = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
	return c.json({ project: created[0] }, 201);
});

admin_routes.patch('/projects/:id', async (c) => {
	const id = Number(c.req.param('id'));
	if (!Number.isInteger(id) || id <= 0) return c.json({ error: 'invalid_id' }, 400);

	const data = await json_or_400(c, project_schema.partial());
	if (data instanceof Response) return data;

	await db
		.update(projects)
		.set({ ...data, updated_at: new Date() })
		.where(eq(projects.id, id));
	const updated = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
	if (updated.length === 0) return c.json({ error: 'not_found' }, 404);

	return c.json({ project: updated[0] });
});

admin_routes.delete('/projects/:id', async (c) => {
	const id = Number(c.req.param('id'));
	if (!Number.isInteger(id) || id <= 0) return c.json({ error: 'invalid_id' }, 400);

	await db.delete(projects).where(eq(projects.id, id));
	return c.json({ ok: true });
});

// ─── CV (tüm alt tablolar tek payload) ───────────────────────────
admin_routes.get('/cv', async (c) => {
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

admin_routes.put('/cv', async (c) => {
	const data = await json_or_400(c, cv_schema);
	if (data instanceof Response) return data;

	// Replace strategy: clear & insert (en basit, alt tablolar küçük olduğu için kabul edilebilir)
	await db.delete(experiences);
	await db.delete(education);
	await db.delete(skill_categories);
	await db.delete(languages);

	if (data.experiences.length > 0) {
		await db.insert(experiences).values(
			data.experiences.map(({ id, ...rest }) => ({
				...rest,
				period_end: rest.period_end ?? undefined,
				description: rest.description ?? undefined,
			})),
		);
	}
	if (data.education.length > 0) {
		await db.insert(education).values(
			data.education.map(({ id, ...rest }) => ({
				...rest,
				period_end: rest.period_end ?? undefined,
			})),
		);
	}
	if (data.skill_categories.length > 0) {
		await db.insert(skill_categories).values(
			data.skill_categories.map(({ id, ...rest }) => rest),
		);
	}
	if (data.languages.length > 0) {
		await db.insert(languages).values(data.languages.map(({ id, ...rest }) => rest));
	}

	const meta_existing = await db.select().from(cv_meta).where(eq(cv_meta.id, 1)).limit(1);
	if (meta_existing.length === 0) {
		await db.insert(cv_meta).values({ id: 1, pdf_url: data.cv_meta.pdf_url ?? null });
	} else {
		await db
			.update(cv_meta)
			.set({ pdf_url: data.cv_meta.pdf_url ?? null })
			.where(eq(cv_meta.id, 1));
	}

	return c.json({ ok: true });
});

// ─── MESSAGES ────────────────────────────────────────────────────
admin_routes.get('/messages', async (c) => {
	const rows = await db
		.select()
		.from(contact_messages)
		.orderBy(desc(contact_messages.created_at));
	return c.json({ messages: rows });
});

admin_routes.patch('/messages/:id', async (c) => {
	const id = Number(c.req.param('id'));
	if (!Number.isInteger(id) || id <= 0) return c.json({ error: 'invalid_id' }, 400);

	const body = await c.req.json().catch(() => ({}));
	const is_read = typeof body.is_read === 'boolean' ? body.is_read : true;

	await db.update(contact_messages).set({ is_read }).where(eq(contact_messages.id, id));
	return c.json({ ok: true });
});

admin_routes.delete('/messages/:id', async (c) => {
	const id = Number(c.req.param('id'));
	if (!Number.isInteger(id) || id <= 0) return c.json({ error: 'invalid_id' }, 400);

	await db.delete(contact_messages).where(eq(contact_messages.id, id));
	return c.json({ ok: true });
});
