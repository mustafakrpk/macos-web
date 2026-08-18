<script lang="ts">
	import { apps, type AppID } from '🍎/state/apps.svelte.ts';
	import { apps_config } from '🍎/configs/apps/apps-config.ts';

	type DesktopItem = {
		app_id: AppID;
		label: string;
		icon: string;
	};

	const desktop_items: DesktopItem[] = [
		{ app_id: 'purus-twitter', label: 'Hakkımda', icon: '/app-icons/purus-twitter/256.png' },
		{ app_id: 'appstore', label: 'Projelerim', icon: '/app-icons/appstore/256.png' },
		{ app_id: 'notes', label: 'Özgeçmiş', icon: '/app-icons/notes/256.png' },
		{ app_id: 'mail', label: 'İletişim', icon: '/app-icons/mail/256.png' },
		{ app_id: 'safari', label: 'Sosyal Medya', icon: '/app-icons/safari/256.png' },
	];

	let selected = $state<AppID | null>(null);

	function open_app(app_id: AppID) {
		const config = apps_config[app_id];
		if (config.should_open_window === false) {
			config.external_action?.(new MouseEvent('click'));
			return;
		}
		apps.open[app_id] = true;
		apps.active = app_id;
	}

	function on_keydown(e: KeyboardEvent, app_id: AppID) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			open_app(app_id);
		}
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
<div
	class="desktop-icons"
	onclick={(e) => {
		if (e.target === e.currentTarget) selected = null;
	}}
>
	{#each desktop_items as item}
		<button
			class="icon"
			class:selected={selected === item.app_id}
			ondblclick={() => open_app(item.app_id)}
			onclick={(e) => {
				e.stopPropagation();
				selected = item.app_id;
			}}
			onkeydown={(e) => on_keydown(e, item.app_id)}
			aria-label="{item.label} - çift tıkla aç"
		>
			<img src={item.icon} alt="" draggable="false" />
			<span>{item.label}</span>
		</button>
	{/each}
</div>

<style>
	.desktop-icons {
		position: absolute;
		top: 2.5rem;
		right: 1rem;
		bottom: 6rem;

		display: grid;
		grid-template-columns: repeat(auto-fill, 5.5rem);
		grid-auto-rows: 6rem;
		gap: 0.4rem;

		direction: rtl;
		justify-content: start;

		pointer-events: auto;
		z-index: 1;
	}

	.icon {
		direction: ltr;

		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		gap: 0.3rem;

		padding: 0.3rem 0.2rem;
		border-radius: 0.4rem;

		background: transparent;
		border: 1px solid transparent;
		cursor: pointer;

		transition:
			background-color 0.1s ease,
			border-color 0.1s ease;

		&:hover {
			background-color: hsla(0, 0%, 100%, 0.1);
		}

		&.selected {
			background-color: hsla(210, 80%, 60%, 0.35);
			border-color: hsla(210, 80%, 70%, 0.5);
		}

		&:focus-visible {
			outline: 2px solid hsla(210, 80%, 70%, 0.7);
			outline-offset: 2px;
		}

		img {
			width: 3.5rem;
			height: 3.5rem;
			object-fit: cover;
			border-radius: 22%;
			filter: drop-shadow(0 2px 4px hsla(0, 0%, 0%, 0.3));
		}

		span {
			font-size: 0.78rem;
			color: white;
			font-weight: 500;
			text-align: center;
			text-shadow:
				0 1px 2px hsla(0, 0%, 0%, 0.7),
				0 0 4px hsla(0, 0%, 0%, 0.4);
			line-height: 1.2;
			max-width: 5.5rem;
			word-break: break-word;
		}
	}
</style>
