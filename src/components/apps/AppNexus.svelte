<script lang="ts">
	import type { AppID } from '🍎/state/apps.svelte';

	const {
		app_id,
		is_being_dragged,
	}: {
		app_id: AppID;
		is_being_dragged: boolean;
	} = $props();
</script>

{#if app_id === 'calendar'}
	{#await import('./Calendar/Calendar.svelte') then { default: Calendar }}
		<Calendar />
	{/await}
{:else if app_id === 'vscode'}
	{#await import('./VSCode/VSCode.svelte') then { default: VSCode }}
		<VSCode {is_being_dragged} />
	{/await}
{:else if app_id === 'calculator'}
	{#await import('./Calculator/Calculator.svelte') then { default: Calculator }}
		<Calculator />
	{/await}
{:else if app_id === 'wallpapers'}
	{#await import('./WallpaperApp/WallpaperSelectorApp.svelte') then { default: WallpaperSelector }}
		<WallpaperSelector />
	{/await}
{:else if app_id === 'purus-twitter'}
	{#await import('./About/About.svelte') then { default: About }}
		<About />
	{/await}
{:else if app_id === 'appstore'}
	{#await import('./Projects/Projects.svelte') then { default: Projects }}
		<Projects />
	{/await}
{:else if app_id === 'notes'}
	{#await import('./CV/CV.svelte') then { default: CV }}
		<CV />
	{/await}
{:else if app_id === 'mail'}
	{#await import('./Contact/Contact.svelte') then { default: Contact }}
		<Contact />
	{/await}
{:else if app_id === 'safari'}
	{#await import('./Social/Social.svelte') then { default: Social }}
		<Social />
	{/await}
{:else}
	{#await import('./AppStore/AppStore.svelte') then { default: AppStore }}
		<AppStore {app_id} />
	{/await}
{/if}
