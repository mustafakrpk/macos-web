<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	const SEQUENCE = [
		'ArrowUp',
		'ArrowUp',
		'ArrowDown',
		'ArrowDown',
		'ArrowLeft',
		'ArrowRight',
		'ArrowLeft',
		'ArrowRight',
		'b',
		'a',
	];

	let buffer: string[] = [];
	let active = $state(false);

	function on_key(e: KeyboardEvent) {
		const target = e.target as HTMLElement | null;
		if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;

		const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
		buffer = [...buffer, key].slice(-SEQUENCE.length);

		if (buffer.join(',') === SEQUENCE.join(',')) {
			fire();
			buffer = [];
		}
	}

	function fire() {
		active = true;
		setTimeout(() => (active = false), 4000);
	}

	onMount(() => {
		window.addEventListener('keydown', on_key);
	});

	onDestroy(() => {
		window.removeEventListener('keydown', on_key);
	});
</script>

{#if active}
	<div class="overlay" role="presentation">
		<div class="emoji">🎉</div>
		<div class="banner">
			<strong>Hidden mode activated!</strong>
			<span>Beni buldun. Daha çok keşfedilecek şey var, etrafa bak. ✨</span>
		</div>
	</div>

	<style>
		:global(.shake) {
			animation: shake 0.4s ease-in-out;
		}
		@keyframes shake {
			0%, 100% { transform: translateX(0); }
			25% { transform: translateX(-6px) rotate(-0.6deg); }
			75% { transform: translateX(6px) rotate(0.6deg); }
		}
	</style>
{/if}

<style>
	.overlay {
		position: fixed;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1.2rem;
		pointer-events: none;
		z-index: 9999;
		animation: fade-in 0.3s ease-out, fade-out 0.4s ease-in 3.5s forwards;
	}

	@keyframes fade-in {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes fade-out {
		from { opacity: 1; }
		to { opacity: 0; }
	}

	.emoji {
		font-size: 5rem;
		animation: spin 0.9s ease-in-out;
		filter: drop-shadow(0 8px 24px hsla(0, 0%, 0%, 0.3));
	}

	@keyframes spin {
		from { transform: scale(0) rotate(0); }
		to { transform: scale(1) rotate(360deg); }
	}

	.banner {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3rem;
		padding: 1rem 1.6rem;
		background: hsla(0, 0%, 12%, 0.92);
		backdrop-filter: blur(20px);
		border-radius: 0.9rem;
		color: white;
		box-shadow: 0 16px 40px hsla(0, 0%, 0%, 0.4);

		strong {
			font-size: 1rem;
			font-weight: 600;
		}

		span {
			font-size: 0.85rem;
			color: hsla(0, 0%, 100%, 0.65);
		}
	}
</style>
