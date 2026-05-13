<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { elevation } from '🍎/actions';

	type BeforeInstallPromptEvent = Event & {
		prompt: () => Promise<void>;
		userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
	};

	const STORAGE_KEY = 'mk_pwa_dismissed_at';
	const COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 gün sonra tekrar göster

	let deferred = $state<BeforeInstallPromptEvent | null>(null);
	let visible = $state(false);

	function recently_dismissed(): boolean {
		try {
			const last = localStorage.getItem(STORAGE_KEY);
			if (!last) return false;
			return Date.now() - Number(last) < COOLDOWN_MS;
		} catch {
			return false;
		}
	}

	function on_before_install(e: Event) {
		e.preventDefault();
		if (recently_dismissed()) return;
		deferred = e as BeforeInstallPromptEvent;
		// Birkaç saniye bekle ki sayfa otururken çıksın
		setTimeout(() => (visible = true), 4000);
	}

	function on_installed() {
		visible = false;
		deferred = null;
	}

	async function accept() {
		if (!deferred) return;
		await deferred.prompt();
		await deferred.userChoice;
		visible = false;
		deferred = null;
	}

	function dismiss() {
		visible = false;
		try {
			localStorage.setItem(STORAGE_KEY, String(Date.now()));
		} catch {
			// noop
		}
	}

	onMount(() => {
		window.addEventListener('beforeinstallprompt', on_before_install);
		window.addEventListener('appinstalled', on_installed);
	});

	onDestroy(() => {
		window.removeEventListener('beforeinstallprompt', on_before_install);
		window.removeEventListener('appinstalled', on_installed);
	});
</script>

{#if visible && deferred}
	<div class="prompt" use:elevation={'install-prompt'}>
		<div class="logo">MK</div>
		<div class="text">
			<strong>Uygulamayı yükle</strong>
			<span>Masaüstüne ekle, tek tıkla aç.</span>
		</div>
		<div class="actions">
			<button class="dismiss" onclick={dismiss} aria-label="Kapat">Sonra</button>
			<button class="accept" onclick={accept}>Yükle</button>
		</div>
	</div>
{/if}

<style>
	.prompt {
		position: fixed;
		bottom: 6.5rem;
		left: 50%;
		transform: translateX(-50%);

		display: flex;
		align-items: center;
		gap: 0.9rem;

		padding: 0.7rem 1rem;
		border-radius: 0.9rem;

		background-color: hsla(0, 0%, 12%, 0.85);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		box-shadow:
			0 12px 32px hsla(0, 0%, 0%, 0.4),
			inset 0 0 0 1px hsla(0, 0%, 100%, 0.08);
		color: white;

		max-width: calc(100vw - 2rem);
		animation: slide-up 0.35s ease-out;
	}

	@keyframes slide-up {
		from {
			transform: translate(-50%, 12px);
			opacity: 0;
		}
	}

	.logo {
		width: 2.4rem;
		height: 2.4rem;
		border-radius: 50%;
		background: linear-gradient(135deg, #667eea, #764ba2);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.85rem;
		font-weight: 600;
		flex-shrink: 0;
	}

	.text {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		line-height: 1.2;

		strong {
			font-size: 0.9rem;
			font-weight: 500;
		}

		span {
			color: hsla(0, 0%, 100%, 0.55);
			font-size: 0.78rem;
		}
	}

	.actions {
		display: flex;
		gap: 0.4rem;
		margin-left: 0.5rem;
	}

	button {
		padding: 0.45rem 0.9rem;
		border-radius: 0.5rem;
		font-size: 0.82rem;
		font-weight: 500;
		cursor: pointer;
		border: none;
		font-family: inherit;
		transition: filter 0.1s;
	}

	.dismiss {
		background: hsla(0, 0%, 100%, 0.1);
		color: hsla(0, 0%, 100%, 0.85);
	}

	.dismiss:hover {
		background: hsla(0, 0%, 100%, 0.18);
	}

	.accept {
		background: linear-gradient(135deg, #667eea, #764ba2);
		color: white;
	}

	.accept:hover {
		filter: brightness(1.1);
	}
</style>
