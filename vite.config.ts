import { fileURLToPath } from 'node:url';

import { svelte } from '@sveltejs/vite-plugin-svelte';
import UnpluginIcons from 'unplugin-icons/vite';
import { defineConfig } from 'vite';
import { imagetools } from 'vite-imagetools';
import { VitePWA } from 'vite-plugin-pwa';
import { browserslistToTargets } from 'lightningcss';
import browserslist from 'browserslist';

import { prefetch } from './prefetch-plugin';

export default defineConfig({
	plugins: [
		svelte(),
		prefetch(),

		UnpluginIcons({ autoInstall: true, compiler: 'svelte' }),
		VitePWA({
			includeAssets: [
				'robots.txt',
				'icons/32.png',
				'cover-image.png',
				'cursors/(normal|link|text|help)-select.svg',
			],
			manifest: {
				name: 'Mustafa Kırpık — Portfolyo',
				short_name: 'Mustafa Kırpık',
				theme_color: '#000000',
				description: 'Mustafa Kırpık kişisel portfolyo sitesi — masaüstü deneyimi.',
				icons: [
					{
						src: 'icons/128.png',
						sizes: '128x128',
						type: 'image/png',
					},
					{
						src: 'icons/192.png',
						sizes: '192x192',
						type: 'image/png',
					},
					{
						src: 'icons/256.png',
						sizes: '256x256',
						type: 'image/png',
					},
					{
						src: 'icons/512.png',
						sizes: '512x512',
						type: 'image/png',
					},
					{
						src: 'icons/512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any maskable',
					},
				],
			},
		}),
		imagetools({}),
	],
	resolve: {
		alias: {
			'🍎': fileURLToPath(new URL('./src/', import.meta.url)),
		},
	},
	server: {
		proxy: {
			'/api': {
				target: 'http://localhost:3000',
				changeOrigin: false,
				ws: true,
			},
			'/uploads': {
				target: 'http://localhost:3000',
				changeOrigin: false,
			},
		},
	},
	build: {
		minify: 'terser',
		cssMinify: 'lightningcss',
	},
	css: {
		transformer: 'lightningcss',
		lightningcss: {
			targets: browserslistToTargets(browserslist('defaults, not IE 11, not IE_Mob 11, not dead')),
		},
	},
});
