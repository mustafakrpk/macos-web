import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { nanoid } from 'nanoid';
import sharp from 'sharp';
import { env } from './env.js';

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const ALLOWED_PDF_TYPES = new Set(['application/pdf']);
const MAX_BYTES = env.MAX_UPLOAD_MB * 1024 * 1024;

export type UploadResult = {
	filename: string;
	path: string;
	mimetype: string;
	size_bytes: number;
	url: string;
};

export class UploadError extends Error {
	constructor(
		public code: string,
		message: string,
	) {
		super(message);
	}
}

async function ensure_dir(): Promise<string> {
	const dir = resolve(env.UPLOAD_DIR);
	await mkdir(dir, { recursive: true });
	return dir;
}

export async function save_upload(file: File): Promise<UploadResult> {
	if (file.size > MAX_BYTES) {
		throw new UploadError(
			'too_large',
			`Dosya ${env.MAX_UPLOAD_MB} MB sınırını aşıyor.`,
		);
	}

	const is_image = ALLOWED_IMAGE_TYPES.has(file.type);
	const is_pdf = ALLOWED_PDF_TYPES.has(file.type);

	if (!is_image && !is_pdf) {
		throw new UploadError('invalid_type', 'Sadece görsel veya PDF kabul ediliyor.');
	}

	const dir = await ensure_dir();
	const buffer = Buffer.from(await file.arrayBuffer());

	let final_buffer: Buffer;
	let extension: string;

	if (is_image) {
		const processed = await sharp(buffer)
			.rotate()
			.resize({ width: 1280, height: 1280, fit: 'inside', withoutEnlargement: true })
			.webp({ quality: 85 })
			.toBuffer();
		final_buffer = processed;
		extension = 'webp';
	} else {
		final_buffer = buffer;
		extension = 'pdf';
	}

	const filename = `${nanoid(16)}.${extension}`;
	const file_path = join(dir, filename);
	await writeFile(file_path, final_buffer);

	return {
		filename,
		path: file_path,
		mimetype: is_image ? 'image/webp' : 'application/pdf',
		size_bytes: final_buffer.byteLength,
		url: `${env.UPLOAD_PUBLIC_URL}/${filename}`,
	};
}
