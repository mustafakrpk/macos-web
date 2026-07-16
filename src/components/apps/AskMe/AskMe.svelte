<script lang="ts">
	import { api } from '🍎/lib/api.ts';
	import SendIcon from '~icons/mdi/send';
	import SparkleIcon from '~icons/mdi/star-four-points';

	type Msg = { role: 'user' | 'assistant'; content: string };

	let messages = $state<Msg[]>([]);
	let draft = $state('');
	let loading = $state(false);
	let error_msg = $state<string | null>(null);
	let scroll_el = $state<HTMLElement | null>(null);

	const suggestions = [
		'Deneyimlerin neler?',
		'Hangi teknolojileri biliyorsun?',
		'e-Afet projesini anlat',
		'Nasıl iletişime geçebilirim?',
	];

	// Yeni mesajda en alta kaydır
	$effect(() => {
		void messages.length;
		void loading;
		if (scroll_el) scroll_el.scrollTop = scroll_el.scrollHeight;
	});

	async function send(text: string) {
		const content = text.trim();
		if (!content || loading) return;

		error_msg = null;
		messages.push({ role: 'user', content });
		draft = '';
		loading = true;

		try {
			const res = await api.post<{ reply: string }>('/api/public/chat', {
				messages: messages.map((m) => ({ role: m.role, content: m.content })),
			});
			messages.push({ role: 'assistant', content: res.reply });
		} catch (err: any) {
			if (err?.status === 503) {
				error_msg = 'Asistan şu an devre dışı. İletişim uygulamasından bana ulaşabilirsin.';
			} else {
				error_msg = 'Yanıt alınamadı. Lütfen biraz sonra tekrar dene.';
			}
		} finally {
			loading = false;
		}
	}

	function on_submit(e: Event) {
		e.preventDefault();
		send(draft);
	}
</script>

<section class="container">
	<header class="titlebar app-window-drag-handle">
		<span>Asistan</span>
	</header>

	<div class="messages" bind:this={scroll_el}>
		<div class="intro">
			<div class="avatar"><SparkleIcon /></div>
			<h2>Mustafa'nın AI Asistanı</h2>
			<p>
				Merhaba! Mustafa'nın deneyimi, projeleri ve yetenekleri hakkında merak ettiklerini bana
				sorabilirsin.
			</p>
		</div>

		{#if messages.length === 0}
			<div class="suggestions">
				{#each suggestions as s}
					<button type="button" class="chip" onclick={() => send(s)}>{s}</button>
				{/each}
			</div>
		{/if}

		{#each messages as m}
			<div class="bubble {m.role}">{m.content}</div>
		{/each}

		{#if loading}
			<div class="bubble assistant typing">
				<span></span><span></span><span></span>
			</div>
		{/if}

		{#if error_msg}
			<div class="error">{error_msg}</div>
		{/if}
	</div>

	<form class="composer" onsubmit={on_submit}>
		<input
			type="text"
			bind:value={draft}
			placeholder="Bir soru yaz…"
			autocomplete="off"
			disabled={loading}
		/>
		<button type="submit" disabled={loading || !draft.trim()} aria-label="Gönder">
			<SendIcon />
		</button>
	</form>
</section>

<style>
	.container {
		background-color: var(--system-color-light);
		color: var(--system-color-light-contrast);
		border-radius: inherit;
		height: 100%;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.titlebar {
		padding: 0.9rem 1rem;
		display: flex;
		justify-content: center;
		user-select: none;

		span {
			color: hsla(var(--system-color-dark-hsl), 0.8);
			font-weight: 500;
			font-size: 0.9rem;
			letter-spacing: 0.5px;
		}
	}

	.messages {
		flex: 1;
		overflow-y: auto;
		padding: 1rem 1.25rem 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.intro {
		text-align: center;
		padding: 1rem 0 0.5rem;

		.avatar {
			width: 3.2rem;
			height: 3.2rem;
			margin: 0 auto 0.6rem;
			display: grid;
			place-items: center;
			border-radius: 50%;
			color: white;
			font-size: 1.5rem;
			background: linear-gradient(135deg, #7c5cff, #4f46e5);
		}

		h2 {
			font-size: 1.15rem;
			margin: 0 0 0.3rem;
		}

		p {
			color: hsla(var(--system-color-dark-hsl), 0.6);
			font-size: 0.88rem;
			line-height: 1.5;
			margin: 0 auto;
			max-width: 32ch;
		}
	}

	.suggestions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		justify-content: center;
		margin: 0.5rem 0;
	}

	.chip {
		padding: 0.45rem 0.8rem;
		border-radius: 1rem;
		font-size: 0.82rem;
		cursor: pointer;
		border: 1px solid hsla(var(--system-color-dark-hsl), 0.15);
		background: hsla(var(--system-color-dark-hsl), 0.04);
		color: hsla(var(--system-color-dark-hsl), 0.85);
		transition: background 0.15s ease;

		&:hover {
			background: hsla(var(--system-color-dark-hsl), 0.1);
		}
	}

	.bubble {
		max-width: 78%;
		padding: 0.6rem 0.85rem;
		border-radius: 1rem;
		font-size: 0.9rem;
		line-height: 1.5;
		white-space: pre-wrap;
		word-break: break-word;

		&.user {
			align-self: flex-end;
			background: hsl(210, 100%, 50%);
			color: white;
			border-bottom-right-radius: 0.3rem;
		}

		&.assistant {
			align-self: flex-start;
			background: hsla(var(--system-color-dark-hsl), 0.07);
			color: hsla(var(--system-color-dark-hsl), 0.9);
			border-bottom-left-radius: 0.3rem;
		}
	}

	.typing {
		display: flex;
		gap: 0.25rem;
		align-items: center;

		span {
			width: 0.45rem;
			height: 0.45rem;
			border-radius: 50%;
			background: hsla(var(--system-color-dark-hsl), 0.4);
			animation: blink 1.2s infinite ease-in-out both;
		}
		span:nth-child(2) {
			animation-delay: 0.2s;
		}
		span:nth-child(3) {
			animation-delay: 0.4s;
		}
	}

	@keyframes blink {
		0%,
		80%,
		100% {
			opacity: 0.3;
		}
		40% {
			opacity: 1;
		}
	}

	.error {
		align-self: center;
		font-size: 0.82rem;
		color: hsl(0, 70%, 45%);
		background: hsla(0, 70%, 50%, 0.1);
		padding: 0.5rem 0.8rem;
		border-radius: 0.5rem;
	}

	.composer {
		display: flex;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		border-top: 1px solid hsla(var(--system-color-dark-hsl), 0.1);

		input {
			flex: 1;
			font-family: inherit;
			font-size: 0.9rem;
			padding: 0.6rem 0.85rem;
			border: 1px solid hsla(var(--system-color-dark-hsl), 0.15);
			border-radius: 1.2rem;
			background: hsla(var(--system-color-light-hsl), 0.5);
			color: var(--system-color-light-contrast);
			outline: none;

			&:focus {
				border-color: hsl(210, 100%, 50%);
			}
		}

		button {
			display: grid;
			place-items: center;
			width: 2.4rem;
			height: 2.4rem;
			border-radius: 50%;
			background: hsl(210, 100%, 50%);
			color: white;
			cursor: pointer;
			flex-shrink: 0;

			&:disabled {
				opacity: 0.5;
				cursor: not-allowed;
			}
		}
	}
</style>
