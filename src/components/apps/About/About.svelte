<script lang="ts">
	import { preferences } from '🍎/state/preferences.svelte.ts';
	import { api, type PublicAbout } from '🍎/lib/api.ts';
	import GithubIcon from '~icons/mdi/github';
	import LinkedinIcon from '~icons/mdi/linkedin';
	import EmailIcon from '~icons/mdi/email-outline';
	import LocationIcon from '~icons/mdi/map-marker-outline';
	import CodeIcon from '~icons/mdi/code-tags';

	let data = $state<PublicAbout | null>(null);
	let loading = $state(true);
	let error_msg = $state<string | null>(null);

	$effect(() => {
		api
			.get<{ about: PublicAbout | null }>('/api/public/about')
			.then((res) => {
				data = res.about;
				loading = false;
			})
			.catch((err) => {
				error_msg = err.message ?? 'Yüklenemedi';
				loading = false;
			});
	});

	const initials = $derived(
		data?.full_name
			?.split(' ')
			.map((p) => p[0])
			.join('')
			.slice(0, 2)
			.toUpperCase() ?? 'MK',
	);

	const paragraphs = $derived(
		(data?.intro_md ?? '')
			.split(/\n{2,}/)
			.map((p) => p.trim())
			.filter(Boolean),
	);

	function format_md(s: string): string {
		// Sadece **bold** desteği — düz textarea + minimal formatlama
		return s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
	}

	function external(node: HTMLAnchorElement) {
		node.rel = 'noopener noreferrer';
		node.target = '_blank';
	}
</script>

<section class="container">
	<header class="titlebar app-window-drag-handle">
		<span>Hakkımda</span>
	</header>

	<aside class:light={preferences.theme.scheme === 'light'}>
		<nav>
			{#if data?.github_url}
				<a href={data.github_url} use:external> <GithubIcon /> GitHub </a>
			{/if}
			{#if data?.linkedin_url}
				<a href={data.linkedin_url} use:external> <LinkedinIcon /> LinkedIn </a>
			{/if}
			{#if data?.email}
				<a href={`mailto:${data.email}`} use:external> <EmailIcon /> E-posta </a>
			{/if}

			<hr />

			{#if data?.location}
				<div class="info-row"><LocationIcon /> {data.location}</div>
			{/if}
			{#if data?.title}
				<div class="info-row"><CodeIcon /> {data.title}</div>
			{/if}
		</nav>
	</aside>

	<section class="content">
		{#if loading}
			<div class="state">Yükleniyor…</div>
		{:else if error_msg}
			<div class="state error">{error_msg}</div>
		{:else if data}
			{#if data.avatar_url}
				<img class="avatar avatar-img" src={data.avatar_url} alt={data.full_name} />
			{:else}
				<div class="avatar">{initials}</div>
			{/if}

			<h1>Merhaba, ben {data.full_name.split(' ')[0]} 👋</h1>

			<h2>{data.title}</h2>

			{#each paragraphs as para}
				<p>{@html format_md(para)}</p>
			{/each}
		{/if}
	</section>
</section>

<style>
	.container {
		--color: var(--system-color-light-hsl);

		display: grid;
		grid-template-columns: 14rem 1fr;
		grid-template-rows: 3rem 1fr;

		border-radius: inherit;
		overflow: hidden;

		background-image: linear-gradient(
			to right,
			hsla(var(--color), 0.7) 14rem,
			hsla(var(--color), 1) 14rem 100%
		);

		transition: --color 200ms ease-in;

		color: var(--system-color-dark);
	}

	.titlebar {
		grid-area: 1 / 1 / span 1 / span 2;

		display: flex;
		justify-content: center;
		align-items: center;

		z-index: 1;

		padding: 0.9rem 1rem;

		width: 100%;

		border-top-left-radius: inherit;
		border-top-right-radius: inherit;

		user-select: none;

		span {
			color: hsla(var(--system-color-dark-hsl), 0.8);
			font-weight: 500;
			font-size: 0.9rem;
			letter-spacing: 0.5px;
		}
	}

	aside {
		grid-area: 1 / 1 / span 2 / span 1;

		transform: translateZ(0);

		height: calc(100% - 2.7px);
		width: calc(14rem - 2.27px);

		margin: 1.8px 0 0 1.8px;

		border-top-left-radius: 0.5rem;
		border-bottom-left-radius: inherit;

		&::before {
			content: '';
			width: inherit;
			height: inherit;
			border-radius: inherit;
			position: fixed;
			left: 0;
			top: 0;
			z-index: -1;
			backdrop-filter: blur(12px);
		}

		nav {
			display: flex;
			flex-direction: column;
			gap: 0.2rem;
			margin: 4rem 0.6rem;

			hr {
				display: block;
				width: 100%;
				height: 1px;
				background-color: hsla(var(--system-color-dark-hsl), 0.2);
				border: none;
				margin: 0.6rem 0;
			}

			a,
			.info-row {
				display: flex;
				gap: 0.5rem;
				align-items: center;
				color: hsla(var(--system-color-dark-hsl), 0.9);
				text-decoration: none;
				font-weight: 400;
				padding: 0.5rem 0.5rem;
				border-radius: 0.4rem;
				font-size: 0.9rem;
			}

			a {
				transition: background-color 100ms ease;

				&:hover {
					background-color: hsla(var(--system-color-dark-hsl), 0.15);
				}
			}

			.info-row {
				color: hsla(var(--system-color-dark-hsl), 0.65);
				font-size: 0.85rem;
			}
		}
	}

	.content {
		grid-area: 2 / 2 / span 1 / span 1;

		display: flex;
		flex-direction: column;
		align-items: flex-start;

		padding: 2rem 2.5rem;
		overflow-y: auto;
	}

	.avatar {
		width: 7rem;
		height: 7rem;
		border-radius: 50%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2.5rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		margin-bottom: 1.2rem;
		box-shadow: 0 8px 24px hsla(0, 0%, 0%, 0.15);
	}

	.avatar-img {
		object-fit: cover;
		background: none;
	}

	.state {
		padding: 2rem;
		color: hsla(var(--system-color-dark-hsl), 0.6);

		&.error {
			color: hsl(0, 70%, 50%);
		}
	}

	h1 {
		font-size: 2.2rem;
		line-height: 1.2;
		margin: 0 0 0.3rem 0;
	}

	h2 {
		font-size: 1.1rem;
		line-height: 1.2;
		font-weight: 400;
		color: hsla(var(--system-color-dark-hsl), 0.65);
		margin: 0 0 1.5rem 0;
	}

	p {
		line-height: 1.6;
		margin: 0 0 1rem 0;
		font-size: 0.95rem;

		strong {
			font-weight: 600;
			color: hsla(var(--system-color-dark-hsl), 1);
		}
	}
</style>
