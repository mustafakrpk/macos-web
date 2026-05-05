import type { MiddlewareHandler } from 'hono';

type Bucket = { count: number; reset_at: number };
const buckets = new Map<string, Bucket>();

export function rate_limit(opts: {
	window_ms: number;
	max: number;
	key?: (c: any) => string;
}): MiddlewareHandler {
	const get_key = opts.key ?? ((c) => {
		const ip =
			c.req.header('x-forwarded-for')?.split(',')[0].trim() ||
			c.req.header('x-real-ip') ||
			c.env?.incoming?.socket?.remoteAddress ||
			'unknown';
		return `${c.req.path}:${ip}`;
	});

	return async (c, next) => {
		const key = get_key(c);
		const now = Date.now();

		const bucket = buckets.get(key);
		if (!bucket || bucket.reset_at < now) {
			buckets.set(key, { count: 1, reset_at: now + opts.window_ms });
		} else {
			bucket.count++;
			if (bucket.count > opts.max) {
				const retry = Math.ceil((bucket.reset_at - now) / 1000);
				return c.json({ error: 'rate_limited', retry_after: retry }, 429);
			}
		}

		await next();
	};
}

// Periodically clean up expired buckets (her 5 dakikada bir)
setInterval(
	() => {
		const now = Date.now();
		for (const [k, v] of buckets) {
			if (v.reset_at < now) buckets.delete(k);
		}
	},
	5 * 60 * 1000,
);
