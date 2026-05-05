import { unlink } from 'node:fs/promises';
import { eq } from 'drizzle-orm';
import { Hono } from 'hono';
import { db } from '../db/client.js';
import { uploads } from '../db/schema.js';
import { UploadError, save_upload } from '../lib/upload.js';
import { require_auth, type AuthVars } from '../middleware/auth.js';

export const upload_routes = new Hono<{ Variables: AuthVars }>();

upload_routes.use('*', require_auth);

upload_routes.post('/', async (c) => {
	const form = await c.req.formData().catch(() => null);
	if (!form) return c.json({ error: 'invalid_form' }, 400);

	const file = form.get('file');
	if (!(file instanceof File)) return c.json({ error: 'no_file' }, 400);

	try {
		const result = await save_upload(file);

		const inserted = await db.insert(uploads).values({
			filename: result.filename,
			path: result.path,
			mimetype: result.mimetype,
			size_bytes: result.size_bytes,
		});
		const id = Number(inserted[0].insertId);

		return c.json({
			upload: {
				id,
				url: result.url,
				filename: result.filename,
				mimetype: result.mimetype,
				size_bytes: result.size_bytes,
			},
		}, 201);
	} catch (err) {
		if (err instanceof UploadError) {
			return c.json({ error: err.code, message: err.message }, 400);
		}
		throw err;
	}
});

upload_routes.get('/', async (c) => {
	const rows = await db.select().from(uploads);
	return c.json({ uploads: rows });
});

upload_routes.delete('/:id', async (c) => {
	const id = Number(c.req.param('id'));
	if (!Number.isInteger(id) || id <= 0) return c.json({ error: 'invalid_id' }, 400);

	const rows = await db.select().from(uploads).where(eq(uploads.id, id)).limit(1);
	if (rows.length === 0) return c.json({ error: 'not_found' }, 404);

	await unlink(rows[0].path).catch(() => {
		// dosya zaten silinmiş olabilir, sorun değil
	});
	await db.delete(uploads).where(eq(uploads.id, id));

	return c.json({ ok: true });
});
