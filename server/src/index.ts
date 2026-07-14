import { resolve } from 'node:path';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { env, is_production } from './lib/env.js';
import { rate_limit } from './middleware/rate-limit.js';
import { admin_routes } from './routes/admin.js';
import {
	admin_analytics_routes,
	public_event_routes,
} from './routes/analytics.js';
import { auth_routes } from './routes/auth.js';
import { github_routes } from './routes/github.js';
import { public_routes } from './routes/public.js';
import { upload_routes } from './routes/uploads.js';

const app = new Hono();

app.use('*', logger());

app.use(
	'*',
	secureHeaders({
		// SPA aynı domain'de servis edildiği için CSP'yi nginx'e bırakmak daha pratik;
		// Hono burada en azından temel header'ları koyar.
		xFrameOptions: 'SAMEORIGIN',
		xContentTypeOptions: 'nosniff',
		referrerPolicy: 'strict-origin-when-cross-origin',
	}),
);

app.use(
	'/api/*',
	cors({
		origin: env.PUBLIC_BASE_URL,
		credentials: true,
	}),
);

// Genel API rate limit: dakikada 120 istek per IP+path
app.use('/api/*', rate_limit({ window_ms: 60_000, max: 120 }));

// Contact ve OAuth callback için sıkı limit
app.use('/api/public/contact', rate_limit({ window_ms: 60_000, max: 5 }));
app.use('/api/auth/github/callback', rate_limit({ window_ms: 60_000, max: 10 }));

// Yüklenen dosyaları serve et. UPLOAD_DIR göreli ("./uploads") veya mutlak
// ("/var/www/.../uploads") olabilir; resolve() ikisini de doğru mutlak yola çevirir
// ve save_upload ile aynı konumu kullanır.
const upload_root = resolve(env.UPLOAD_DIR);
app.use(
	'/uploads/*',
	serveStatic({
		root: upload_root,
		rewriteRequestPath: (path) => path.replace(/^\/uploads/, ''),
	}),
);

app.get('/api/ping', (c) =>
	c.json({
		ok: true,
		ts: Date.now(),
		env: env.NODE_ENV,
	}),
);

app.route('/api/auth', auth_routes);
app.route('/api/public', public_routes);
app.route('/api/public', public_event_routes);
app.route('/api/public/github', github_routes);
app.route('/api/admin', admin_routes);
app.route('/api/admin/analytics', admin_analytics_routes);
app.route('/api/admin/uploads', upload_routes);

app.notFound((c) => c.json({ error: 'not_found' }, 404));

app.onError((err, c) => {
	console.error('[error]', err);
	return c.json(
		{
			error: is_production ? 'internal_error' : err.message,
		},
		500,
	);
});

serve(
	{
		fetch: app.fetch,
		port: env.PORT,
	},
	(info) => {
		console.log(`✓ Server ready: http://localhost:${info.port}`);
	},
);
