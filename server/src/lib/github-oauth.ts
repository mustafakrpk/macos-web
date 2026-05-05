import { env } from './env.js';

const GITHUB_AUTHORIZE = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN = 'https://github.com/login/oauth/access_token';
const GITHUB_USER = 'https://api.github.com/user';

export type GithubProfile = {
	id: number;
	login: string;
	avatar_url: string;
};

export function build_authorize_url(state: string): string {
	const params = new URLSearchParams({
		client_id: env.GITHUB_CLIENT_ID,
		redirect_uri: env.GITHUB_REDIRECT_URL,
		scope: 'read:user',
		state,
	});
	return `${GITHUB_AUTHORIZE}?${params.toString()}`;
}

export async function exchange_code(code: string): Promise<string> {
	const res = await fetch(GITHUB_TOKEN, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams({
			client_id: env.GITHUB_CLIENT_ID,
			client_secret: env.GITHUB_CLIENT_SECRET,
			code,
			redirect_uri: env.GITHUB_REDIRECT_URL,
		}),
	});

	if (!res.ok) {
		throw new Error(`GitHub token exchange failed: ${res.status}`);
	}

	const data = (await res.json()) as { access_token?: string; error?: string };
	if (!data.access_token) {
		throw new Error(`GitHub token exchange returned no token: ${data.error ?? 'unknown'}`);
	}

	return data.access_token;
}

export async function fetch_profile(access_token: string): Promise<GithubProfile> {
	const res = await fetch(GITHUB_USER, {
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${access_token}`,
			'User-Agent': 'mk-portfolio',
		},
	});

	if (!res.ok) {
		throw new Error(`GitHub user fetch failed: ${res.status}`);
	}

	const data = (await res.json()) as GithubProfile;
	return data;
}
