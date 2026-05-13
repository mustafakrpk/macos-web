<script lang="ts">
	import { preferences } from '🍎/state/preferences.svelte.ts';
	import { api, type GithubStats, type PublicAbout } from '🍎/lib/api.ts';
	import GithubIcon from '~icons/mdi/github';
	import LinkedinIcon from '~icons/mdi/linkedin';
	import EmailIcon from '~icons/mdi/email-outline';
	import LocationIcon from '~icons/mdi/map-marker-outline';
	import CodeIcon from '~icons/mdi/code-tags';
	import StarIcon from '~icons/mdi/star';
	import RepoIcon from '~icons/mdi/source-branch';
	import UsersIcon from '~icons/mdi/account-group-outline';

	let data = $state<PublicAbout | null>(null);
	let gh_stats = $state<GithubStats | null>(null);
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

		// GitHub stats arka planda — başarısız olursa sessizce atla
		api
			.get<{ stats: GithubStats }>('/api/public/github/stats')
			.then((res) => (gh_stats = res.stats))
			.catch(() => {});
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

			{#if data.current_status}
				<div class="status-banner">
					<span class="dot"></span>
					<span>{data.current_status}</span>
				</div>
			{/if}

			{#each paragraphs as para}
				<p>{@html format_md(para)}</p>
			{/each}

			{#if gh_stats}
				<div class="gh-card">
					<div class="gh-header">
						<GithubIcon />
						<a href={`https://github.com/${gh_stats.username}`} use:external>
							@{gh_stats.username}
						</a>
					</div>
					<div class="gh-stats">
						<div><RepoIcon /> {gh_stats.public_repos} repo</div>
						<div><UsersIcon /> {gh_stats.followers} takipçi</div>
					</div>
					{#if gh_stats.top_repos.length > 0}
						<div class="gh-repos">
							{#each gh_stats.top_repos.slice(0, 3) as repo}
								<a href={repo.url} use:external class="gh-repo">
									<strong>{repo.name}</strong>
									{#if repo.description}<span>{repo.description}</span>{/if}
									<div class="gh-repo-meta">
										{#if repo.language}<span class="lang">{repo.language}</span>{/if}
										<span><StarIcon /> {repo.stars}</span>
									</div>
								</a>
							{/each}
						</div>
					{/if}
				</div>
			{/if}
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

	.gh-card {
		width: 100%;
		max-width: 32rem;
		margin-top: 1.5rem;
		padding: 1.2rem 1.3rem;
		border: 1px solid hsla(var(--system-color-dark-hsl), 0.1);
		border-radius: 0.7rem;
		background: hsla(var(--system-color-dark-hsl), 0.03);
	}

	.gh-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.8rem;
		font-size: 0.95rem;

		a {
			color: hsla(var(--system-color-dark-hsl), 0.9);
			text-decoration: none;
			font-weight: 500;
		}

		a:hover {
			color: hsl(232, 75%, 55%);
		}
	}

	.gh-stats {
		display: flex;
		gap: 1rem;
		font-size: 0.85rem;
		color: hsla(var(--system-color-dark-hsl), 0.7);
		margin-bottom: 1rem;

		div {
			display: flex;
			align-items: center;
			gap: 0.3rem;
		}
	}

	.gh-repos {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.gh-repo {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		padding: 0.6rem 0.8rem;
		background: white;
		border: 1px solid hsla(var(--system-color-dark-hsl), 0.08);
		border-radius: 0.4rem;
		text-decoration: none;
		color: inherit;
		font-size: 0.85rem;
		transition: border-color 0.1s;

		&:hover {
			border-color: hsl(232, 75%, 65%);
		}

		strong {
			font-weight: 500;
			color: hsl(232, 75%, 55%);
		}

		span {
			color: hsla(var(--system-color-dark-hsl), 0.65);
			font-size: 0.78rem;
		}
	}

	.gh-repo-meta {
		display: flex;
		gap: 0.7rem;
		margin-top: 0.2rem;

		span {
			display: flex;
			align-items: center;
			gap: 0.2rem;
			font-size: 0.75rem;
		}

		.lang {
			color: hsla(var(--system-color-dark-hsl), 0.55);
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

	.status-banner {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.45rem 0.9rem;
		margin: 0 0 1.5rem 0;
		background: hsla(140, 60%, 50%, 0.12);
		border-radius: 999px;
		font-size: 0.82rem;
		color: hsl(140, 50%, 30%);
	}

	.status-banner .dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: hsl(140, 70%, 45%);
		box-shadow: 0 0 0 3px hsla(140, 70%, 45%, 0.2);
		animation: pulse 2s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.55; }
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
