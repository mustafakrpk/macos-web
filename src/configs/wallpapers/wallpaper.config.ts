import type { Theme } from '🍎/state/preferences.svelte.ts';

export type Wallpaper = {
	name: string;
	gradient: string;
	theme: Theme['scheme'];
};

export const wallpapers_config = {
	'aurora-purple': {
		name: 'Aurora Purple',
		gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #2d1b69 100%)',
		theme: 'dark' as const,
	},
	'sunset-warm': {
		name: 'Sıcak Gün Batımı',
		gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #fbb454 100%)',
		theme: 'light' as const,
	},
	'ocean-deep': {
		name: 'Derin Okyanus',
		gradient: 'linear-gradient(180deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
		theme: 'dark' as const,
	},
	'mint-forest': {
		name: 'Naneli Orman',
		gradient: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
		theme: 'light' as const,
	},
	'midnight-blue': {
		name: 'Gece Mavisi',
		gradient: 'linear-gradient(180deg, #141e30 0%, #243b55 100%)',
		theme: 'dark' as const,
	},
	'rose-gold': {
		name: 'Gül Pembesi',
		gradient: 'linear-gradient(135deg, #ffafbd 0%, #ffc3a0 100%)',
		theme: 'light' as const,
	},
	'cosmic-fusion': {
		name: 'Kozmik Füzyon',
		gradient: 'linear-gradient(135deg, #ff00cc 0%, #333399 100%)',
		theme: 'dark' as const,
	},
	'mojito-fresh': {
		name: 'Mojito',
		gradient: 'linear-gradient(135deg, #1d976c 0%, #93f9b9 100%)',
		theme: 'light' as const,
	},
	'firewatch-dusk': {
		name: 'Firewatch Alacakaranlık',
		gradient: 'linear-gradient(180deg, #ff512f 0%, #dd2476 50%, #4a00e0 100%)',
		theme: 'dark' as const,
	},
	'morpheus-den': {
		name: 'Morpheus Mağarası',
		gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
		theme: 'dark' as const,
	},
	'desert-bloom': {
		name: 'Çöl Çiçeği',
		gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
		theme: 'light' as const,
	},
	'arctic-aurora': {
		name: 'Kuzey Işıkları',
		gradient: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 50%, #00d2ff 100%)',
		theme: 'dark' as const,
	},
} as const;

export type WallpaperID = keyof typeof wallpapers_config;
