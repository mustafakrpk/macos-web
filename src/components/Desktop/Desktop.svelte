<script>
	import Dock from '../Dock/Dock.svelte';
	import TopBar from '../TopBar/TopBar.svelte';
	import Wallpaper from '../apps/WallpaperApp/Wallpaper.svelte';
	import BootupScreen from './BootupScreen.svelte';
	import ContextMenu from './ContextMenu.svelte';
	import DesktopIcons from './DesktopIcons.svelte';
	import InstallPrompt from './InstallPrompt.svelte';
	import KonamiEgg from './KonamiEgg.svelte';
	import Spotlight from './Spotlight.svelte';
	import SystemUpdate from './SystemUpdate.svelte';
	import WindowsArea from './Window/WindowsArea.svelte';

	const isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);

	if (!isMac) {
		Promise.all([
			import('@fontsource/inter/latin-ext-300.css'),
			import('@fontsource/inter/latin-ext-400.css'),
			import('@fontsource/inter/latin-ext-500.css'),
			import('@fontsource/inter/latin-ext-600.css'),
		]);
	}
	/** @type {HTMLElement} */
	let mainEl;
</script>

<div bind:this={mainEl} class="container">
	<main>
		<TopBar />
		<WindowsArea />
		<DesktopIcons />
		<Dock />
	</main>

	<Wallpaper />
	<BootupScreen />
	<SystemUpdate />
	<InstallPrompt />
	<Spotlight />
	<KonamiEgg />

	<ContextMenu target_element={mainEl} />
</div>

<style>
	.container {
		height: 100%;
		width: 100%;
	}

	main {
		height: 100%;
		width: 100%;

		display: grid;
		grid-template-rows: auto 1fr auto;
	}
</style>
