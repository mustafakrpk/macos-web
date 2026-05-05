<script lang="ts">
	import { api, parse_string_array, type PublicProject } from '🍎/lib/api.ts';
	import GithubIcon from '~icons/mdi/github';
	import LinkIcon from '~icons/mdi/open-in-new';

	let projects = $state<PublicProject[]>([]);
	let loading = $state(true);
	let error_msg = $state<string | null>(null);

	$effect(() => {
		api
			.get<{ projects: PublicProject[] }>('/api/public/projects')
			.then((res) => {
				projects = res.projects.map((p) => ({ ...p, stack: parse_string_array(p.stack) }));
				loading = false;
			})
			.catch((err) => {
				error_msg = err.message ?? 'Yüklenemedi';
				loading = false;
			});
	});

	function external(node: HTMLAnchorElement) {
		node.rel = 'noopener noreferrer';
		node.target = '_blank';
	}
</script>

<section class="container">
	<header class="titlebar app-window-drag-handle">
		<span>Projelerim</span>
	</header>

	<div class="header">
		<h1>Projelerim</h1>
		<p>Üzerinde çalıştığım ve katkı sağladığım bazı projeler.</p>
	</div>

	{#if loading}
		<div class="state">Yükleniyor…</div>
	{:else if error_msg}
		<div class="state error">{error_msg}</div>
	{:else if projects.length === 0}
		<div class="state">Henüz proje eklenmemiş.</div>
	{:else}
		<div class="grid">
			{#each projects as project (project.id)}
				<article class="card">
					{#if project.image_url}
						<div class="cover cover-img" style:background-image={`url(${project.image_url})`}></div>
					{:else}
						<div class="cover" style:background={project.gradient}>
							<span class="emoji">{project.emoji}</span>
						</div>
					{/if}
					<div class="body">
						<h2>{project.title}</h2>
						<p>{project.description}</p>
						<div class="stack">
							{#each project.stack as tech}
								<span class="tag">{tech}</span>
							{/each}
						</div>
						<div class="actions">
							{#if project.github_url}
								<a href={project.github_url} use:external><GithubIcon /> GitHub</a>
							{/if}
							{#if project.live_url}
								<a href={project.live_url} use:external><LinkIcon /> Canlı</a>
							{/if}
						</div>
					</div>
				</article>
			{/each}
		</div>
	{/if}
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
		align-items: center;
		user-select: none;

		span {
			color: hsla(var(--system-color-dark-hsl), 0.8);
			font-weight: 500;
			font-size: 0.9rem;
			letter-spacing: 0.5px;
		}
	}

	.header {
		padding: 1.5rem 2rem 1rem;

		h1 {
			font-size: 2rem;
			margin: 0 0 0.3rem 0;
		}

		p {
			margin: 0;
			color: hsla(var(--system-color-dark-hsl), 0.6);
			font-size: 0.95rem;
		}
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 1.2rem;
		padding: 1rem 2rem 2rem;
	}

	.card {
		background-color: hsla(var(--system-color-dark-hsl), 0.04);
		border: 1px solid hsla(var(--system-color-dark-hsl), 0.08);
		border-radius: 0.8rem;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;

		&:hover {
			transform: translateY(-2px);
			box-shadow: 0 8px 24px hsla(0, 0%, 0%, 0.1);
		}
	}

	.cover {
		height: 110px;
		display: flex;
		align-items: center;
		justify-content: center;
		background-size: cover;
		background-position: center;

		.emoji {
			font-size: 3rem;
			filter: drop-shadow(0 4px 8px hsla(0, 0%, 0%, 0.2));
		}
	}

	.state {
		padding: 3rem 2rem;
		text-align: center;
		color: hsla(var(--system-color-dark-hsl), 0.55);

		&.error {
			color: hsl(0, 70%, 50%);
		}
	}

	.body {
		padding: 1rem 1.2rem 1.2rem;
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
		flex: 1;

		h2 {
			font-size: 1.05rem;
			margin: 0;
			font-weight: 600;
		}

		p {
			font-size: 0.85rem;
			line-height: 1.5;
			color: hsla(var(--system-color-dark-hsl), 0.7);
			margin: 0;
		}
	}

	.stack {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;

		.tag {
			font-size: 0.7rem;
			padding: 0.2rem 0.5rem;
			background-color: hsla(var(--system-color-dark-hsl), 0.08);
			border-radius: 0.3rem;
			font-weight: 500;
		}
	}

	.actions {
		display: flex;
		gap: 0.5rem;
		margin-top: auto;

		a {
			display: inline-flex;
			align-items: center;
			gap: 0.3rem;
			font-size: 0.8rem;
			color: hsla(var(--system-color-dark-hsl), 0.85);
			text-decoration: none;
			padding: 0.4rem 0.7rem;
			border-radius: 0.4rem;
			background-color: hsla(var(--system-color-dark-hsl), 0.06);

			&:hover {
				background-color: hsla(var(--system-color-dark-hsl), 0.12);
			}
		}
	}
</style>
