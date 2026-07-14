import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Not: uygulamanın ağır vite plugin'lerini (PWA, imagetools, lightningcss)
// yüklememek için testler kendi minimal config'ini kullanır.
export default defineConfig({
	resolve: {
		alias: {
			'🍎': fileURLToPath(new URL('./src/', import.meta.url)),
		},
	},
	test: {
		environment: 'node',
		include: ['src/**/*.{test,spec}.ts'],
	},
});
