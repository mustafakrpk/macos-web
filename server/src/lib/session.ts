import { randomBytes } from 'node:crypto';
import { eq, lt } from 'drizzle-orm';
import { db } from '../db/client.js';
import { sessions, users, type User } from '../db/schema.js';
import { env } from './env.js';

export const SESSION_COOKIE = env.SESSION_COOKIE_NAME;
const LIFETIME_MS = env.SESSION_LIFETIME_DAYS * 24 * 60 * 60 * 1000;

export function generate_token(): string {
	return randomBytes(32).toString('hex');
}

export async function create_session(user_id: number): Promise<{ token: string; expires_at: Date }> {
	const token = generate_token();
	const expires_at = new Date(Date.now() + LIFETIME_MS);

	await db.insert(sessions).values({
		id: token,
		user_id,
		expires_at,
	});

	return { token, expires_at };
}

export async function get_session_user(token: string): Promise<User | null> {
	const rows = await db
		.select({ user: users, session: sessions })
		.from(sessions)
		.innerJoin(users, eq(users.id, sessions.user_id))
		.where(eq(sessions.id, token))
		.limit(1);

	if (rows.length === 0) return null;
	const { session, user } = rows[0];

	if (session.expires_at.getTime() < Date.now()) {
		await db.delete(sessions).where(eq(sessions.id, token));
		return null;
	}

	return user;
}

export async function delete_session(token: string): Promise<void> {
	await db.delete(sessions).where(eq(sessions.id, token));
}

export async function purge_expired(): Promise<void> {
	await db.delete(sessions).where(lt(sessions.expires_at, new Date()));
}

export function session_cookie_options(secure: boolean) {
	return {
		httpOnly: true,
		sameSite: 'Lax' as const,
		path: '/',
		secure,
		maxAge: env.SESSION_LIFETIME_DAYS * 24 * 60 * 60,
	};
}
