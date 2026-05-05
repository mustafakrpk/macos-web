import { z } from 'zod';

const env_schema = z.object({
	PORT: z.coerce.number().default(3000),
	NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
	PUBLIC_BASE_URL: z.string().url(),

	DATABASE_URL: z.string().min(1),

	SESSION_COOKIE_NAME: z.string().default('mk_portfolio_session'),
	SESSION_LIFETIME_DAYS: z.coerce.number().int().positive().default(30),
	ADMIN_GITHUB_USERNAME: z.string().min(1),

	GITHUB_CLIENT_ID: z.string().min(1),
	GITHUB_CLIENT_SECRET: z.string().min(1),
	GITHUB_REDIRECT_URL: z.string().url(),

	UPLOAD_DIR: z.string().default('./uploads'),
	UPLOAD_PUBLIC_URL: z.string().default('/uploads'),
	MAX_UPLOAD_MB: z.coerce.number().int().positive().default(5),
});

const parsed = env_schema.safeParse(process.env);

if (!parsed.success) {
	console.error('❌ Invalid environment configuration:');
	console.error(parsed.error.flatten().fieldErrors);
	process.exit(1);
}

export const env = parsed.data;
export const is_production = env.NODE_ENV === 'production';
