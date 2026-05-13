<script lang="ts">
	import { onDestroy, onMount, untrack } from 'svelte';
	import lottie, { type AnimationItem } from 'lottie-web';
	import { apps } from '🍎/state/apps.svelte.ts';

	const WALK_ASSET = '/dog/walk.json';

	const WALK_SPEED = 1.4;
	const TOP_MARGIN = 50;
	const BOTTOM_MARGIN = 110;
	const SIDE_MARGIN = 40;
	const DOG_HEIGHT = 110;
	const DOG_WIDTH = 130;

	type Mood = 'walk' | 'chase';

	let container_el = $state<HTMLDivElement>();
	let anim: AnimationItem | null = null;
	let init_started = false;

	let asset_loaded = $state(false);
	let pos = $state({ x: 100, y: 100 });
	let target = $state({ x: 200, y: 200 });
	let mood = $state<Mood>('walk');
	let facing = $state<1 | -1>(1);

	let raf = 0;
	let chase_timeout = 0;
	let visible = $state(true);

	function pick_random_target() {
		const max_x = window.innerWidth - DOG_WIDTH - SIDE_MARGIN;
		const max_y = window.innerHeight - DOG_HEIGHT - BOTTOM_MARGIN;
		target = {
			x: SIDE_MARGIN + Math.random() * (max_x - SIDE_MARGIN),
			y: TOP_MARGIN + Math.random() * (max_y - TOP_MARGIN),
		};
	}

	async function init_dog() {
		if (init_started || !container_el) return;
		init_started = true;

		try {
			const res = await fetch(WALK_ASSET);
			if (!res.ok) {
				console.error('[DogPet] walk.json yüklenemedi:', res.status);
				return;
			}
			const data = await res.json();
			anim = lottie.loadAnimation({
				container: container_el,
				animationData: data,
				renderer: 'svg',
				loop: true,
				autoplay: true,
			});
			asset_loaded = true;
			tick();
		} catch (err) {
			console.error('[DogPet] init error:', err);
		}
	}

	// container_el bind edildiğinde animasyonu başlat
	$effect(() => {
		if (container_el) init_dog();
	});

	function tick() {
		const dx = target.x - pos.x;
		const dy = target.y - pos.y;
		const dist = Math.hypot(dx, dy);

		if (dist < 4) {
			pick_random_target();
			if (mood === 'chase') mood = 'walk';
		} else {
			facing = dx >= 0 ? 1 : -1;
			const speed = mood === 'chase' ? WALK_SPEED * 1.8 : WALK_SPEED;
			pos.x += (dx / dist) * speed;
			pos.y += (dy / dist) * speed;
		}

		raf = requestAnimationFrame(tick);
	}

	function on_window_open(app_id: string) {
		const win_el = document.querySelector(
			`[data-app-id="${app_id}"], #windows-area > div:has(.${app_id})`,
		) as HTMLElement | null;

		let new_x = window.innerWidth / 2;
		let new_y = window.innerHeight / 2;
		if (win_el) {
			const rect = win_el.getBoundingClientRect();
			new_x = rect.left + rect.width / 2 - DOG_WIDTH / 2;
			new_y = rect.bottom - DOG_HEIGHT - 20;
		} else {
			new_x = 100 + Math.random() * (window.innerWidth - 200);
			new_y = 100 + Math.random() * (window.innerHeight - 250);
		}

		clearTimeout(chase_timeout);
		target = {
			x: Math.max(SIDE_MARGIN, Math.min(window.innerWidth - DOG_WIDTH - SIDE_MARGIN, new_x)),
			y: Math.max(TOP_MARGIN, Math.min(window.innerHeight - DOG_HEIGHT - BOTTOM_MARGIN, new_y)),
		};
		mood = 'chase';
		chase_timeout = window.setTimeout(() => {
			if (mood === 'chase') mood = 'walk';
		}, 1500);
	}

	$effect(() => {
		const active = apps.active;
		untrack(() => {
			if (active && asset_loaded) on_window_open(active);
		});
	});

	function check_visibility() {
		visible = window.innerWidth > 768;
	}

	onMount(() => {
		check_visibility();
		pos.x = window.innerWidth / 2 - DOG_WIDTH / 2;
		pos.y = window.innerHeight - BOTTOM_MARGIN - DOG_HEIGHT;
		pick_random_target();

		const on_resize = () => {
			check_visibility();
			if (pos.x > window.innerWidth - DOG_WIDTH - SIDE_MARGIN) {
				pos.x = window.innerWidth - DOG_WIDTH - SIDE_MARGIN;
			}
			if (pos.y > window.innerHeight - DOG_HEIGHT - BOTTOM_MARGIN) {
				pos.y = window.innerHeight - DOG_HEIGHT - BOTTOM_MARGIN;
			}
			pick_random_target();
		};
		window.addEventListener('resize', on_resize);

		return () => window.removeEventListener('resize', on_resize);
	});

	onDestroy(() => {
		cancelAnimationFrame(raf);
		clearTimeout(chase_timeout);
		anim?.destroy();
	});
</script>

{#if visible}
	<div
		class="dog"
		style:left="{pos.x}px"
		style:top="{pos.y}px"
		style:transform="scaleX({facing})"
		style:opacity={asset_loaded ? 1 : 0}
		aria-hidden="true"
	>
		<div class="lottie-container" bind:this={container_el}></div>
	</div>
{/if}

<style>
	.dog {
		position: fixed;
		pointer-events: none;
		width: 130px;
		height: 110px;
		z-index: 5;
		transition:
			transform 0.2s ease,
			opacity 0.4s ease;
		will-change: transform, left, top;
	}

	.lottie-container {
		width: 100%;
		height: 100%;
	}
</style>
