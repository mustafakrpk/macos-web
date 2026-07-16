<script lang="ts">
	import { apps_config } from '🍎/configs/apps/apps-config.ts';
	import { apps, type AppID } from '🍎/state/apps.svelte.ts';
	import HomeIcon from '~icons/mdi/circle-outline';

	// Ana ekranda gösterilecek uygulamalar (sıralı)
	const home_apps: AppID[] = [
		'purus-twitter',
		'appstore',
		'notes',
		'mail',
		'assistant',
		'terminal',
		'vscode',
		'messages',
		'safari',
		'calendar',
		'calculator',
		'wallpapers',
		'view-source',
		'vercel',
	];

	const items = home_apps.map((id) => ({
		id,
		title: apps_config[id].title,
		icon: `/app-icons/${id}/256.png`,
	}));

	const any_open = $derived(Object.values(apps.open).some(Boolean));

	function open(app_id: AppID) {
		const cfg = apps_config[app_id];
		if (cfg.should_open_window === false) {
			cfg.external_action?.(new MouseEvent('click'));
			return;
		}
		// mobilde tek seferde tek uygulama
		for (const key of Object.keys(apps.open) as AppID[]) apps.open[key] = false;
		apps.open[app_id] = true;
		apps.active = app_id;
	}

	function go_home() {
		for (const key of Object.keys(apps.open) as AppID[]) apps.open[key] = false;
	}
</script>

{#if !any_open}
	<section class="springboard">
		<div class="grid">
			{#each items as item}
				<button class="app" onclick={() => open(item.id)}>
					<img src={item.icon} alt="" draggable="false" />
					<span>{item.title}</span>
				</button>
			{/each}
		</div>
	</section>
{/if}

{#if any_open}
	<button class="home-btn" onclick={go_home} aria-label="Ana ekrana dön">
		<HomeIcon />
	</button>
{/if}

<style>
	.springboard {
		position: fixed;
		inset: 0;
		padding: calc(2.5rem + env(safe-area-inset-top)) 1rem 5rem;
		overflow-y: auto;
		z-index: 1;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1.1rem 0.6rem;
		max-width: 30rem;
		margin: 0 auto;
	}

	.app {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.35rem;
		background: none;
		cursor: pointer;

		img {
			width: 3.6rem;
			height: 3.6rem;
			object-fit: cover;
			border-radius: 24%;
			box-shadow: 0 3px 8px hsla(0, 0%, 0%, 0.35);
			transition: transform 0.1s ease;
		}

		&:active img {
			transform: scale(0.9);
		}

		span {
			font-size: 0.72rem;
			font-weight: 500;
			color: white;
			text-align: center;
			line-height: 1.15;
			text-shadow: 0 1px 3px hsla(0, 0%, 0%, 0.7);
			max-width: 4.5rem;
			word-break: break-word;
		}
	}

	.home-btn {
		position: fixed;
		bottom: calc(0.6rem + env(safe-area-inset-bottom));
		left: 50%;
		transform: translateX(-50%);
		z-index: 100000;

		display: grid;
		place-items: center;
		width: 2.9rem;
		height: 2.9rem;
		font-size: 1.4rem;

		border-radius: 50%;
		color: white;
		background: hsla(0, 0%, 0%, 0.45);
		backdrop-filter: blur(10px);
		box-shadow: 0 2px 10px hsla(0, 0%, 0%, 0.35);
		cursor: pointer;

		&:active {
			transform: translateX(-50%) scale(0.92);
		}
	}
</style>
