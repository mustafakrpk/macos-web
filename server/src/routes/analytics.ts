import { createHash } from 'node:crypto';
import { and, count, desc, eq, gte, sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { z } from 'zod';
import { db } from '../db/client.js';
import { events } from '../db/schema.js';
import { require_auth, type AuthVars } from '../middleware/auth.js';

const event_schema = z.object({
	type: z.string().min(1).max(64),
	app_id: z.string().max(64).optional(),
	project_id: z.number().int().optional(),
	post_slug: z.string().max(128).optional(),
});

function hash_ip(ip: string | null): string | null {
	if (!ip) return null;
	// Günlük salt — aynı IP, gün içinde aynı hash; gün değişince yeni hash
	const salt = new Date().toISOString().slice(0, 10);
	return createHash('sha256').update(salt + ip).digest('hex').slice(0, 32);
}

export const public_event_routes = new Hono();

public_event_routes.post('/event', async (c) => {
	const body = await c.req.json().catch(() => null);
	const parsed = event_schema.safeParse(body);
	if (!parsed.success) return c.json({ error: 'invalid_input' }, 400);

	const ip =
		c.req.header('x-forwarded-for')?.split(',')[0].trim() ||
		c.req.header('x-real-ip') ||
		null;

	const ua = c.req.header('user-agent')?.slice(0, 255) ?? null;
	const ref = c.req.header('referer')?.slice(0, 512) ?? null;

	await db.insert(events).values({
		type: parsed.data.type,
		app_id: parsed.data.app_id ?? null,
		project_id: parsed.data.project_id ?? null,
		post_slug: parsed.data.post_slug ?? null,
		ip_hash: hash_ip(ip),
		user_agent: ua,
		referrer: ref,
	});

	return c.json({ ok: true });
});

// ─── Admin tarafı ────────────────────────────────────────────────
export const admin_analytics_routes = new Hono<{ Variables: AuthVars }>();

admin_analytics_routes.use('*', require_auth);

admin_analytics_routes.get('/summary', async (c) => {
	const day_ago = new Date(Date.now() - 24 * 60 * 60 * 1000);
	const week_ago = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

	const total_q = await db
		.select({ n: count() })
		.from(events);

	const day_q = await db
		.select({ n: count() })
		.from(events)
		.where(gte(events.created_at, day_ago));

	const week_q = await db
		.select({ n: count() })
		.from(events)
		.where(gte(events.created_at, week_ago));

	const unique_q = await db
		.select({
			n: sql<number>`COUNT(DISTINCT ${events.ip_hash})`,
		})
		.from(events)
		.where(gte(events.created_at, week_ago));

	const top_apps = await db
		.select({
			app_id: events.app_id,
			n: count(),
		})
		.from(events)
		.where(and(eq(events.type, 'app_open'), gte(events.created_at, week_ago)))
		.groupBy(events.app_id)
		.orderBy(desc(count()))
		.limit(10);

	const top_projects = await db
		.select({
			project_id: events.project_id,
			n: count(),
		})
		.from(events)
		.where(and(eq(events.type, 'project_click'), gte(events.created_at, week_ago)))
		.groupBy(events.project_id)
		.orderBy(desc(count()))
		.limit(10);

	const daily = await db
		.select({
			day: sql<string>`DATE(${events.created_at})`,
			n: count(),
		})
		.from(events)
		.where(gte(events.created_at, week_ago))
		.groupBy(sql`DATE(${events.created_at})`)
		.orderBy(sql`DATE(${events.created_at})`);

	return c.json({
		total: total_q[0].n,
		last_24h: day_q[0].n,
		last_7d: week_q[0].n,
		unique_visitors_7d: Number(unique_q[0].n ?? 0),
		top_apps: top_apps.filter((r) => r.app_id),
		top_projects: top_projects.filter((r) => r.project_id),
		daily,
	});
});
