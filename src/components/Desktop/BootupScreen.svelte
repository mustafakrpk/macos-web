<script lang="ts">
	import { onMount } from 'svelte';
	import { quintInOut } from 'svelte/easing';
	import { tweened } from 'svelte/motion';
	import { fade, fly, scale } from 'svelte/transition';
	import { elevation } from '🍎/actions';
	import { fade_out } from '🍎/helpers/fade.ts';
	import { sleep } from '🍎/helpers/sleep';

	const STORAGE_KEY = 'mk_boot_seen_at';
	const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 saat

	function should_show_boot(): boolean {
		if (import.meta.env.DEV) return false;
		try {
			const last = localStorage.getItem(STORAGE_KEY);
			if (!last) return true;
			const ts = Number(last);
			if (Number.isNaN(ts)) return true;
			return Date.now() - ts > COOLDOWN_MS;
		} catch {
			return true;
		}
	}

	let hidden_splash_screen = $state(!should_show_boot());
	let show_logo = $state(false);
	let show_name = $state(false);
	let show_progress = $state(false);
	let progress_val = tweened(100, { duration: 2500, easing: quintInOut });

	onMount(async () => {
		if (hidden_splash_screen) return;

		try {
			localStorage.setItem(STORAGE_KEY, String(Date.now()));
		} catch {
			// noop
		}

		await sleep(200);
		show_logo = true;
		await sleep(600);
		show_name = true;
		await sleep(500);
		show_progress = true;
		$progress_val = 0;

		await sleep(2700);
		hidden_splash_screen = true;
	});
</script>

{#if !hidden_splash_screen}
	<div out:fade_out={{ duration: 500 }} class="splash-screen" use:elevation={'bootup-screen'}>
		<div class="stack">
			{#if show_logo}
				<div class="logo" in:scale={{ duration: 600, start: 0.6, opacity: 0 }}>MK</div>
			{/if}

			{#if show_name}
				<div class="name-block" in:fly={{ y: 8, duration: 400 }}>
					<h1>Mustafa Kırpık</h1>
					<p>Yazılım Geliştirici</p>
				</div>
			{/if}

			{#if show_progress}
				<div
					class="progress"
					role="progressbar"
					aria-valuenow={100 - $progress_val}
					aria-valuemin={0}
					aria-valuemax={100}
					aria-valuetext="Yükleniyor"
					in:fade={{ duration: 300 }}
				>
					<div class="indicator" style:translate="-{$progress_val}% 0"></div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<!-- iframe => Firefox dahil tarayıcılarda autoplay için -->
{#if import.meta.env.PROD && !hidden_splash_screen}
	<iframe id="audio" src="/sounds/mac-startup-sound.mp3" allow="autoplay" title="boot sound"></iframe>
{/if}

<style>
	.splash-screen {
		position: fixed;
		top: 0;
		bottom: 0;
		height: 100vh;
		width: 100vw;

		cursor: none;

		display: flex;
		justify-content: center;
		align-items: center;

		background:
			radial-gradient(ellipse at center, #1a1a2e 0%, #000 70%),
			#000;
	}

	.stack {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
		min-height: 14rem;
		justify-content: center;
	}

	.logo {
		width: 5.5rem;
		height: 5.5rem;
		border-radius: 50%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2.2rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		box-shadow:
			0 0 60px hsla(232, 75%, 65%, 0.4),
			0 8px 24px hsla(0, 0%, 0%, 0.5);
	}

	.name-block {
		text-align: center;
		color: white;

		h1 {
			font-size: 1.4rem;
			margin: 0 0 0.25rem 0;
			font-weight: 500;
			letter-spacing: 0.02em;
		}

		p {
			margin: 0;
			color: hsla(0, 0%, 100%, 0.55);
			font-size: 0.85rem;
		}
	}

	.progress {
		border-radius: 50px;
		height: 3px;
		width: 160px;
		overflow-x: hidden;
		background-color: hsla(0, 0%, 100%, 0.12);
	}

	.indicator {
		background-color: hsla(0, 0%, 100%, 0.85);
		border-radius: inherit;
		width: 100%;
		height: 100%;
	}

	#audio {
		position: absolute;
		z-index: -9999;
		display: none;
	}
</style>
