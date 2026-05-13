<script lang="ts">
	import { untrack } from 'svelte';
	import { elevation } from '🍎/actions';
	import { wallpapers_config } from '🍎/configs/wallpapers/wallpaper.config.ts';
	import { preferences } from '🍎/state/preferences.svelte.ts';

	const current = $derived(
		wallpapers_config[preferences.wallpaper.id] ?? wallpapers_config['aurora-purple'],
	);

	// Wallpaper'ın temasını uygula (kullanıcı izin verdiyse)
	$effect(() => {
		const c = current;
		untrack(() => {
			if (preferences.wallpaper.canControlTheme) {
				preferences.theme.scheme = c.theme;
			}
		});
	});
</script>

<div
	class="background-cover"
	style:background-image={current.gradient}
	use:elevation={'wallpaper'}
></div>

<style>
	.background-cover {
		height: 100%;
		width: 100%;
		position: fixed;
		top: 0;
		left: 0;
		transition: background-image 300ms ease;
		background-repeat: no-repeat;
		background-size: cover;
		background-position: center;
	}
</style>
