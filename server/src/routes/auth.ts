import { randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { db } from '../db/client.js';
import { users } from '../db/schema.js';
import { env, is_production } from '../lib/env.js';
import {
	build_authorize_url,
	exchange_code,
	fetch_profile,
} from '../lib/github-oauth.js';
import {
	SESSION_COOKIE,
	create_session,
	delete_session,
	get_session_user,
	session_cookie_options,
} from '../lib/session.js';

const STATE_COOKIE = 'mk_oauth_state';
const STATE_MAX_AGE = 60 * 10;

export const auth_routes = new Hono();

auth_routes.get('/github', (c) => {
	const state = randomBytes(16).toString('hex');

	setCookie(c, STATE_COOKIE, state, {
		httpOnly: true,
		sameSite: 'Lax',
		path: '/',
		secure: is_production,
		maxAge: STATE_MAX_AGE,
	});

	return c.redirect(build_authorize_url(state));
});

auth_routes.get('/github/callback', async (c) => {
	const code = c.req.query('code');
	const state = c.req.query('state');
	const cookie_state = getCookie(c, STATE_COOKIE);

	deleteCookie(c, STATE_COOKIE, { path: '/' });

	if (!code || !state || !cookie_state || state !== cookie_state) {
		return c.json({ error: 'invalid_state' }, 400);
	}

	let access_token: string;
	let profile;
	try {
		access_token = await exchange_code(code);
		profile = await fetch_profile(access_token);
	} catch (err) {
		console.error('[oauth] exchange/profile error', err);
		return c.json({ error: 'oauth_failed' }, 500);
	}

	if (profile.login.toLowerCase() !== env.ADMIN_GITHUB_USERNAME.toLowerCase()) {
		return c.json({ error: 'forbidden', detail: 'GitHub kullanıcı adı yetkili değil.' }, 403);
	}

	const github_id = String(profile.id);
	const existing = await db
		.select()
		.from(users)
		.where(eq(users.github_id, github_id))
		.limit(1);

	let user_id: number;
	if (existing.length === 0) {
		const inserted = await db.insert(users).values({
			github_id,
			username: profile.login,
			avatar_url: profile.avatar_url,
		});
		user_id = Number(inserted[0].insertId);
	} else {
		user_id = existing[0].id;
		await db
			.update(users)
			.set({ username: profile.login, avatar_url: profile.avatar_url })
			.where(eq(users.id, user_id));
	}

	const { token } = await create_session(user_id);
	setCookie(c, SESSION_COOKIE, token, session_cookie_options(is_production));

	return c.redirect(`${env.PUBLIC_BASE_URL}/admin`);
});

auth_routes.get('/me', async (c) => {
	const token = getCookie(c, SESSION_COOKIE);
	if (!token) return c.json({ user: null });

	const user = await get_session_user(token);
	if (!user) return c.json({ user: null });

	return c.json({
		user: {
			id: user.id,
			username: user.username,
			avatar_url: user.avatar_url,
		},
	});
});

auth_routes.post('/logout', async (c) => {
	const token = getCookie(c, SESSION_COOKIE);
	if (token) await delete_session(token);
	deleteCookie(c, SESSION_COOKIE, { path: '/' });
	return c.json({ ok: true });
});
