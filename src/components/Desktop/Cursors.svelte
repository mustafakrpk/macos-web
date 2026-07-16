<script lang="ts">
	import { presence } from '🍎/state/presence.svelte.ts';
</script>

<div class="cursor-layer" aria-hidden="true">
	{#each presence.peers as p (p.id)}
		<div class="cursor" style:left="{p.x * 100}%" style:top="{p.y * 100}%">
			<svg width="20" height="22" viewBox="0 0 20 22" fill="none">
				<path
					d="M3 2 L3 17 L7.2 13.2 L9.8 19.5 L12.3 18.4 L9.7 12.2 L15 12 Z"
					fill={p.color}
					stroke="white"
					stroke-width="1.4"
					stroke-linejoin="round"
				/>
			</svg>
			<span class="label" style:background-color={p.color}>{p.name}</span>
		</div>
	{/each}
</div>

<style>
	.cursor-layer {
		position: fixed;
		inset: 0;
		pointer-events: none;
		z-index: 99999;
		overflow: hidden;
	}

	.cursor {
		position: absolute;
		transform: translate(-2px, -2px);
		will-change: left, top;
		display: flex;
		align-items: flex-start;
		gap: 0.25rem;
	}

	.label {
		margin-top: 0.9rem;
		margin-left: -0.2rem;
		padding: 0.1rem 0.45rem;
		border-radius: 0.6rem;
		font-size: 0.7rem;
		font-weight: 600;
		color: white;
		white-space: nowrap;
		box-shadow: 0 1px 4px hsla(0, 0%, 0%, 0.25);
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
	}
</style>
