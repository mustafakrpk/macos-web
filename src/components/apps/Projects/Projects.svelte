<script lang="ts">
	import GithubIcon from '~icons/mdi/github';
	import LinkIcon from '~icons/mdi/open-in-new';

	type Project = {
		title: string;
		description: string;
		stack: string[];
		github?: string;
		live?: string;
		gradient: string;
		emoji: string;
	};

	const projects: Project[] = [
		{
			title: 'Kişisel Portfolyo',
			description:
				'macOS masaüstü deneyimi sunan kişisel portfolyo sitesi. Svelte 5 runes, TypeScript ve Vite kullanılarak geliştirildi.',
			stack: ['Svelte 5', 'TypeScript', 'Vite', 'PWA'],
			github: 'https://github.com/mustafakrpk',
			gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
			emoji: '🍎',
		},
		{
			title: 'Proje 2',
			description:
				'Açıklama buraya gelecek. Bu kart için kendi proje bilgilerini doldurabilirsin.',
			stack: ['React', 'Node.js', 'PostgreSQL'],
			github: 'https://github.com/mustafakrpk',
			gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
			emoji: '🚀',
		},
		{
			title: 'Proje 3',
			description:
				'Açıklama buraya gelecek. Bu kart için kendi proje bilgilerini doldurabilirsin.',
			stack: ['Next.js', 'Tailwind', 'Prisma'],
			github: 'https://github.com/mustafakrpk',
			gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
			emoji: '⚡',
		},
		{
			title: 'Proje 4',
			description:
				'Açıklama buraya gelecek. Bu kart için kendi proje bilgilerini doldurabilirsin.',
			stack: ['Vue 3', 'Pinia', 'Supabase'],
			github: 'https://github.com/mustafakrpk',
			gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
			emoji: '🌱',
		},
	];

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

	<div class="grid">
		{#each projects as project}
			<article class="card">
				<div class="cover" style:background={project.gradient}>
					<span class="emoji">{project.emoji}</span>
				</div>
				<div class="body">
					<h2>{project.title}</h2>
					<p>{project.description}</p>
					<div class="stack">
						{#each project.stack as tech}
							<span class="tag">{tech}</span>
						{/each}
					</div>
					<div class="actions">
						{#if project.github}
							<a href={project.github} use:external><GithubIcon /> GitHub</a>
						{/if}
						{#if project.live}
							<a href={project.live} use:external><LinkIcon /> Canlı</a>
						{/if}
					</div>
				</div>
			</article>
		{/each}
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

		.emoji {
			font-size: 3rem;
			filter: drop-shadow(0 4px 8px hsla(0, 0%, 0%, 0.2));
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
