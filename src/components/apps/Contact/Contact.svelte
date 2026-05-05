<script lang="ts">
	import { api, type PublicAbout } from '🍎/lib/api.ts';
	import EmailIcon from '~icons/mdi/email-outline';
	import GithubIcon from '~icons/mdi/github';
	import LinkedinIcon from '~icons/mdi/linkedin';
	import LocationIcon from '~icons/mdi/map-marker-outline';
	import SendIcon from '~icons/mdi/send';

	let name = $state('');
	let email = $state('');
	let message = $state('');
	let submitting = $state(false);
	let status = $state<'idle' | 'success' | 'error'>('idle');
	let status_msg = $state<string>('');

	let about_data = $state<PublicAbout | null>(null);

	$effect(() => {
		api
			.get<{ about: PublicAbout | null }>('/api/public/about')
			.then((res) => (about_data = res.about))
			.catch(() => {});
	});

	async function handle_submit(e: Event) {
		e.preventDefault();
		if (submitting) return;
		submitting = true;
		status = 'idle';

		try {
			await api.post('/api/public/contact', { name, email, message });
			status = 'success';
			status_msg = 'Mesajın gönderildi, teşekkürler!';
			name = email = message = '';
		} catch (err: any) {
			status = 'error';
			status_msg = err.message ?? 'Gönderilemedi';
		} finally {
			submitting = false;
		}
	}

	function external(node: HTMLAnchorElement) {
		node.rel = 'noopener noreferrer';
		node.target = '_blank';
	}
</script>

<section class="container">
	<header class="titlebar app-window-drag-handle">
		<span>İletişim</span>
	</header>

	<div class="content">
		<aside>
			<h2>Bana ulaş</h2>
			<p>Birlikte çalışmak, sohbet etmek veya proje önerilerin için iletişime geçebilirsin.</p>

			<div class="links">
				{#if about_data?.email}
					<a href={`mailto:${about_data.email}`}><EmailIcon /> {about_data.email}</a>
				{/if}
				{#if about_data?.github_url}
					<a href={about_data.github_url} use:external>
						<GithubIcon /> {about_data.github_url.replace(/^https?:\/\//, '')}
					</a>
				{/if}
				{#if about_data?.linkedin_url}
					<a href={about_data.linkedin_url} use:external>
						<LinkedinIcon /> {about_data.linkedin_url.replace(/^https?:\/\//, '')}
					</a>
				{/if}
				{#if about_data?.location}
					<div class="info"><LocationIcon /> {about_data.location}</div>
				{/if}
			</div>
		</aside>

		<form onsubmit={handle_submit}>
			<label>
				<span>Ad Soyad</span>
				<input type="text" bind:value={name} placeholder="Adınız" required />
			</label>

			<label>
				<span>E-posta</span>
				<input type="email" bind:value={email} placeholder="ornek@mail.com" required />
			</label>

			<label>
				<span>Mesaj</span>
				<textarea bind:value={message} placeholder="Mesajınızı yazın..." rows="6" required
				></textarea>
			</label>

			<button type="submit" disabled={submitting}>
				<SendIcon />
				{submitting ? 'Gönderiliyor…' : 'Gönder'}
			</button>

			{#if status === 'success'}
				<div class="status success">{status_msg}</div>
			{:else if status === 'error'}
				<div class="status error">{status_msg}</div>
			{/if}
		</form>
	</div>
</section>

<style>
	.container {
		background-color: var(--system-color-light);
		color: var(--system-color-light-contrast);
		border-radius: inherit;
		overflow-y: auto;
		height: 100%;
		display: flex;
		flex-direction: column;
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

	.content {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
		padding: 2rem 2.5rem;
		flex: 1;

		@media (max-width: 700px) {
			grid-template-columns: 1fr;
		}
	}

	aside {
		h2 {
			font-size: 1.6rem;
			margin: 0 0 0.5rem 0;
		}

		p {
			color: hsla(var(--system-color-dark-hsl), 0.65);
			margin: 0 0 1.5rem 0;
			font-size: 0.92rem;
			line-height: 1.5;
		}
	}

	.links {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;

		a,
		.info {
			display: flex;
			align-items: center;
			gap: 0.6rem;
			padding: 0.6rem 0.8rem;
			background-color: hsla(var(--system-color-dark-hsl), 0.05);
			border-radius: 0.5rem;
			text-decoration: none;
			color: hsla(var(--system-color-dark-hsl), 0.85);
			font-size: 0.88rem;
			transition: background-color 0.15s ease;
		}

		a:hover {
			background-color: hsla(var(--system-color-dark-hsl), 0.1);
		}

		.info {
			color: hsla(var(--system-color-dark-hsl), 0.6);
			cursor: default;
		}
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		font-size: 0.85rem;

		span {
			color: hsla(var(--system-color-dark-hsl), 0.7);
			font-weight: 500;
		}
	}

	input,
	textarea {
		font-family: inherit;
		font-size: 0.9rem;
		padding: 0.6rem 0.8rem;
		border: 1px solid hsla(var(--system-color-dark-hsl), 0.15);
		border-radius: 0.4rem;
		background-color: hsla(var(--system-color-light-hsl), 0.5);
		color: var(--system-color-light-contrast);
		outline: none;
		transition: border-color 0.15s ease;

		&:focus {
			border-color: hsl(210, 100%, 50%);
		}
	}

	textarea {
		resize: vertical;
		min-height: 120px;
	}

	button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		padding: 0.7rem 1.2rem;
		background-color: hsl(210, 100%, 50%);
		color: white;
		border-radius: 0.4rem;
		font-size: 0.9rem;
		font-weight: 500;
		cursor: pointer;
		margin-top: 0.3rem;
		transition: background-color 0.15s ease;

		&:hover {
			background-color: hsl(210, 100%, 45%);
		}

		&:disabled {
			opacity: 0.6;
			cursor: not-allowed;
		}
	}

	.status {
		margin-top: 0.5rem;
		padding: 0.6rem 0.8rem;
		border-radius: 0.4rem;
		font-size: 0.85rem;

		&.success {
			background-color: hsla(140, 60%, 50%, 0.15);
			color: hsl(140, 60%, 30%);
		}

		&.error {
			background-color: hsla(0, 70%, 50%, 0.12);
			color: hsl(0, 70%, 45%);
		}
	}
</style>
