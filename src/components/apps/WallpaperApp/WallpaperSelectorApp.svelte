<script lang="ts">
	import { wallpapers_config, type WallpaperID } from '🍎/configs/wallpapers/wallpaper.config.ts';
	import { preferences } from '🍎/state/preferences.svelte.ts';

	const wallpapers = Object.entries(wallpapers_config) as [WallpaperID, typeof wallpapers_config[WallpaperID]][];

	const current_gradient = $derived(
		wallpapers_config[preferences.wallpaper.id]?.gradient ?? wallpapers_config['aurora-purple'].gradient,
	);
	const current_name = $derived(
		wallpapers_config[preferences.wallpaper.id]?.name ?? wallpapers_config['aurora-purple'].name,
	);

	function change_wallpaper(id: WallpaperID) {
		preferences.wallpaper.id = id;
	}
</script>

<section class="container">
	<header class="titlebar app-window-drag-handle">
		<span>Duvar Kağıtları</span>
	</header>

	<section class="main-area">
		<section class="selected-section">
			<div class="preview" style:background-image={current_gradient}></div>
			<div class="info">
				<h2>{current_name}</h2>
				<p class="meta">Gradient duvar kağıdı</p>

				<label>
					<input type="checkbox" bind:checked={preferences.wallpaper.canControlTheme} />
					Tema (açık/koyu) duvar kağıdına göre değişsin
				</label>
			</div>
		</section>

		<h3>Tüm duvar kağıtları</h3>

		<div class="grid">
			{#each wallpapers as [id, wp]}
				<button
					class="thumb"
					class:active={id === preferences.wallpaper.id}
					onclick={() => change_wallpaper(id)}
				>
					<div class="thumb-img" style:background-image={wp.gradient}></div>
					<span>{wp.name}</span>
				</button>
			{/each}
		</div>
	</section>
</section>

<style>
	.container {
		background-color: var(--system-color-light);
		color: var(--system-color-light-contrast);
		border-radius: inherit;
		display: grid;
		grid-template-rows: auto 1fr;
		height: 100% !important;
		overflow-y: hidden;
	}

	.titlebar {
		display: flex;
		justify-content: center;
		padding: 0.9rem 1rem;
		border-bottom: 1px solid hsla(var(--system-color-dark-hsl), 0.1);

		span {
			color: hsla(var(--system-color-dark-hsl), 0.85);
			font-weight: 500;
			font-size: 0.9rem;
			letter-spacing: 0.4px;
		}
	}

	.main-area {
		overflow-y: auto;
		padding: 1.5rem 2rem 2rem;
	}

	.selected-section {
		display: grid;
		grid-template-columns: 18rem 1fr;
		gap: 1.5rem;
		align-items: center;
		margin-bottom: 2rem;

		@media (max-width: 700px) {
			grid-template-columns: 1fr;
		}
	}

	.preview {
		width: 100%;
		aspect-ratio: 16 / 10;
		border-radius: 0.8rem;
		background-size: cover;
		background-position: center;
		box-shadow: 0 8px 24px hsla(0, 0%, 0%, 0.15);
		transition: background-image 200ms ease;
	}

	.info {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;

		h2 {
			font-size: 1.4rem;
			margin: 0;
		}

		.meta {
			color: hsla(var(--system-color-dark-hsl), 0.6);
			font-size: 0.85rem;
			margin: 0 0 1rem 0;
		}

		label {
			display: flex;
			align-items: center;
			gap: 0.5rem;
			font-size: 0.88rem;

			input {
				width: 1.1rem;
				height: 1.1rem;
				accent-color: var(--system-color-primary);
			}
		}
	}

	h3 {
		font-size: 0.95rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: hsla(var(--system-color-dark-hsl), 0.6);
		margin: 1rem 0 0.8rem 0;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 1rem;
	}

	.thumb {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		color: inherit;
		font-family: inherit;

		.thumb-img {
			width: 100%;
			aspect-ratio: 16 / 10;
			border-radius: 0.5rem;
			background-size: cover;
			background-position: center;
			transition: box-shadow 120ms ease;
			box-shadow: 0 1px 3px hsla(0, 0%, 0%, 0.1);
		}

		span {
			font-size: 0.78rem;
			text-align: center;
			color: hsla(var(--system-color-dark-hsl), 0.7);
		}

		&:hover .thumb-img,
		&:focus-visible .thumb-img {
			box-shadow: 0 0 0 3px hsla(var(--system-color-primary-hsl), 0.7);
		}

		&.active .thumb-img {
			box-shadow: 0 0 0 3px var(--system-color-primary);
		}
	}
</style>
