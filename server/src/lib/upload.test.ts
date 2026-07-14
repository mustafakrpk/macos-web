import { describe, expect, it } from 'vitest';
import { UploadError, save_upload } from './upload.js';

// save_upload boyut/tip doğrulamasını sharp veya diske yazmadan ÖNCE yapar,
// bu yüzden hata dallarını minimal bir File stub'ıyla test edebiliriz.
function fake_file(size: number, type: string): File {
	return { size, type } as unknown as File;
}

describe('save_upload doğrulama', () => {
	it('MAX_UPLOAD_MB sınırını aşan dosyayı reddeder', async () => {
		const big = fake_file(6 * 1024 * 1024, 'image/png'); // varsayılan sınır 5 MB
		await expect(save_upload(big)).rejects.toBeInstanceOf(UploadError);
		await expect(save_upload(big)).rejects.toMatchObject({ code: 'too_large' });
	});

	it('izin verilmeyen MIME tipini reddeder', async () => {
		const bad = fake_file(1024, 'text/plain');
		await expect(save_upload(bad)).rejects.toMatchObject({ code: 'invalid_type' });
	});

	it('image ve pdf dışındaki tipleri (ör. svg) reddeder', async () => {
		const svg = fake_file(1024, 'image/svg+xml');
		await expect(save_upload(svg)).rejects.toMatchObject({ code: 'invalid_type' });
	});
});
