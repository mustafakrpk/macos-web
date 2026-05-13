import { Hono } from 'hono';
import { env } from '../lib/env.js';

const GH_API = 'https://api.github.com';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 dakika

type GithubStats = {
	username: string;
	avatar_url: string;
	bio: string | null;
	public_repos: number;
	followers: number;
	following: number;
	top_repos: Array<{
		name: string;
		description: string | null;
		stars: number;
		forks: number;
		language: string | null;
		url: string;
	}>;
	updated_at: number;
};

type CacheEntry = { value: GithubStats; expires_at: number };
let cache: CacheEntry | null = null;

async function fetch_stats(username: string): Promise<GithubStats> {
	const user_res = await fetch(`${GH_API}/users/${username}`, {
		headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'mk-portfolio' },
	});
	if (!user_res.ok) throw new Error(`GitHub user fetch failed: ${user_res.status}`);
	const user = (await user_res.json()) as any;

	const repos_res = await fetch(
		`${GH_API}/users/${username}/repos?sort=updated&per_page=100`,
		{
			headers: {
				Accept: 'application/vnd.github+json',
				'User-Agent': 'mk-portfolio',
			},
		},
	);
	const repos: any[] = repos_res.ok ? await repos_res.json() : [];

	const top_repos = repos
		.filter((r) => !r.fork)
		.sort((a, b) => (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0))
		.slice(0, 5)
		.map((r) => ({
			name: r.name,
			description: r.description,
			stars: r.stargazers_count ?? 0,
			forks: r.forks_count ?? 0,
			language: r.language,
			url: r.html_url,
		}));

	return {
		username: user.login,
		avatar_url: user.avatar_url,
		bio: user.bio,
		public_repos: user.public_repos,
		followers: user.followers,
		following: user.following,
		top_repos,
		updated_at: Date.now(),
	};
}

export const github_routes = new Hono();

github_routes.get('/stats', async (c) => {
	const username = env.ADMIN_GITHUB_USERNAME;
	const now = Date.now();

	if (cache && cache.expires_at > now) {
		return c.json({ stats: cache.value, cached: true });
	}

	try {
		const stats = await fetch_stats(username);
		cache = { value: stats, expires_at: now + CACHE_TTL_MS };
		return c.json({ stats, cached: false });
	} catch (err: any) {
		// Önbellekte eski veri varsa onu döndür (rate limit veya offline durumlarında)
		if (cache) {
			return c.json({ stats: cache.value, cached: true, stale: true });
		}
		return c.json({ error: 'github_unavailable', message: err.message }, 503);
	}
});
