import type { MiddlewareHandler } from 'hono';
import { getCookie } from 'hono/cookie';
import { SESSION_COOKIE, get_session_user } from '../lib/session.js';
import type { User } from '../db/schema.js';

export type AuthVars = {
	user: User;
};

export const require_auth: MiddlewareHandler<{ Variables: AuthVars }> = async (c, next) => {
	const token = getCookie(c, SESSION_COOKIE);
	if (!token) return c.json({ error: 'unauthorized' }, 401);

	const user = await get_session_user(token);
	if (!user) return c.json({ error: 'unauthorized' }, 401);

	c.set('user', user);
	await next();
};

export const optional_auth: MiddlewareHandler<{ Variables: Partial<AuthVars> }> = async (
	c,
	next,
) => {
	const token = getCookie(c, SESSION_COOKIE);
	if (token) {
		const user = await get_session_user(token);
		if (user) c.set('user', user);
	}
	await next();
};
