<script lang="ts">
	import { marked } from 'marked';
	import { api, type PublicPost, type PublicPostSummary } from '🍎/lib/api.ts';

	let posts = $state<PublicPostSummary[]>([]);
	let active_post = $state<PublicPost | null>(null);
	let active_slug = $state<string | null>(null);
	let loading_list = $state(true);
	let loading_post = $state(false);
	let error_msg = $state<string | null>(null);

	$effect(() => {
		api
			.get<{ posts: PublicPostSummary[] }>('/api/public/posts')
			.then((res) => {
				posts = res.posts;
				loading_list = false;
				if (res.posts.length > 0) open_post(res.posts[0].slug);
			})
			.catch((err) => {
				error_msg = err.message ?? 'Yüklenemedi';
				loading_list = false;
			});
	});

	async function open_post(slug: string) {
		if (slug === active_slug) return;
		active_slug = slug;
		loading_post = true;
		active_post = null;
		try {
			const res = await api.get<{ post: PublicPost }>(`/api/public/posts/${slug}`);
			active_post = res.post;
		} catch (err: any) {
			error_msg = err.message ?? 'Yüklenemedi';
		} finally {
			loading_post = false;
		}
	}

	function format_date(s: string | null): string {
		if (!s) return '';
		return new Date(s).toLocaleDateString('tr-TR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	}

	function render_md(md: string): string {
		return marked.parse(md, { async: false }) as string;
	}
</script>

<section class="container">
	<header class="titlebar app-window-drag-handle">
		<span>Blog & Notlar</span>
	</header>

	<div class="layout">
		<aside class="sidebar">
			<h2>Yazılar</h2>
			{#if loading_list}
				<p class="state">Yükleniyor…</p>
			{:else if error_msg}
				<p class="state error">{error_msg}</p>
			{:else if posts.length === 0}
				<p class="state">Henüz yazı yok.</p>
			{:else}
				<ul>
					{#each posts as p (p.id)}
						<li>
							<button
								class:active={p.slug === active_slug}
								onclick={() => open_post(p.slug)}
							>
								<strong>{p.title}</strong>
								{#if p.published_at}
									<span class="date">{format_date(p.published_at)}</span>
								{/if}
								{#if p.excerpt}
									<span class="excerpt">{p.excerpt}</span>
								{/if}
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</aside>

		<main class="content">
			{#if loading_post}
				<p class="state">Yükleniyor…</p>
			{:else if active_post}
				<article>
					<h1>{active_post.title}</h1>
					{#if active_post.published_at}
						<time>{format_date(active_post.published_at)}</time>
					{/if}
					<div class="md">{@html render_md(active_post.content_md)}</div>
				</article>
			{:else if !loading_list && posts.length === 0}
				<div class="empty">
					<p>Henüz yazı yayınlanmamış.</p>
					<small>İçerikler eklendikçe burada görünür.</small>
				</div>
			{/if}
		</main>
	</div>
</section>

<style>
	.container {
		background-color: var(--system-color-light);
		color: var(--system-color-light-contrast);
		border-radius: inherit;
		overflow: hidden;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.titlebar {
		padding: 0.9rem 1rem;
		display: flex;
		justify-content: center;
		user-select: none;
		flex-shrink: 0;

		span {
			color: hsla(var(--system-color-dark-hsl), 0.8);
			font-weight: 500;
			font-size: 0.9rem;
			letter-spacing: 0.5px;
		}
	}

	.layout {
		display: grid;
		grid-template-columns: 280px 1fr;
		flex: 1;
		overflow: hidden;

		@media (max-width: 700px) {
			grid-template-columns: 1fr;
		}
	}

	.sidebar {
		background-color: hsla(var(--system-color-dark-hsl), 0.03);
		border-right: 1px solid hsla(var(--system-color-dark-hsl), 0.08);
		overflow-y: auto;
		padding: 1rem;

		h2 {
			font-size: 0.78rem;
			text-transform: uppercase;
			letter-spacing: 0.06em;
			color: hsla(var(--system-color-dark-hsl), 0.5);
			margin: 0 0 0.8rem 0.3rem;
		}

		ul {
			list-style: none;
			margin: 0;
			padding: 0;
		}

		li button {
			width: 100%;
			text-align: left;
			background: none;
			border: none;
			padding: 0.7rem 0.8rem;
			border-radius: 0.5rem;
			cursor: pointer;
			display: flex;
			flex-direction: column;
			gap: 0.15rem;
			color: inherit;
			font-family: inherit;
			margin-bottom: 0.25rem;
			transition: background 0.1s;
		}

		li button:hover {
			background: hsla(var(--system-color-dark-hsl), 0.05);
		}

		li button.active {
			background: hsla(232, 75%, 65%, 0.15);
		}

		strong {
			font-weight: 500;
			font-size: 0.9rem;
		}

		.date {
			font-size: 0.72rem;
			color: hsla(var(--system-color-dark-hsl), 0.5);
		}

		.excerpt {
			font-size: 0.78rem;
			color: hsla(var(--system-color-dark-hsl), 0.6);
			margin-top: 0.15rem;
			overflow: hidden;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			line-clamp: 2;
			-webkit-box-orient: vertical;
		}
	}

	.content {
		overflow-y: auto;
		padding: 2rem 2.5rem;
	}

	article h1 {
		font-size: 1.8rem;
		margin: 0 0 0.3rem 0;
	}

	article time {
		display: block;
		font-size: 0.85rem;
		color: hsla(var(--system-color-dark-hsl), 0.55);
		margin-bottom: 1.5rem;
	}

	.md {
		line-height: 1.7;
		font-size: 0.95rem;

		:global(h2) {
			font-size: 1.3rem;
			margin: 1.8rem 0 0.6rem;
		}

		:global(h3) {
			font-size: 1.1rem;
			margin: 1.4rem 0 0.5rem;
		}

		:global(p) {
			margin: 0 0 1rem 0;
		}

		:global(code) {
			font-family: 'SF Mono', Menlo, Consolas, monospace;
			font-size: 0.85em;
			padding: 0.1rem 0.35rem;
			background: hsla(var(--system-color-dark-hsl), 0.08);
			border-radius: 0.25rem;
		}

		:global(pre) {
			background: hsla(var(--system-color-dark-hsl), 0.06);
			padding: 1rem;
			border-radius: 0.5rem;
			overflow-x: auto;
			margin: 1rem 0;
		}

		:global(pre code) {
			background: none;
			padding: 0;
		}

		:global(a) {
			color: hsl(232, 75%, 55%);
		}

		:global(blockquote) {
			border-left: 3px solid hsla(232, 75%, 65%, 0.5);
			padding: 0.4rem 1rem;
			margin: 1rem 0;
			color: hsla(var(--system-color-dark-hsl), 0.75);
			font-style: italic;
		}

		:global(ul),
		:global(ol) {
			padding-left: 1.4rem;
			margin: 0.5rem 0 1rem;
		}
	}

	.state {
		color: hsla(var(--system-color-dark-hsl), 0.55);
		padding: 1rem 0.3rem;
		font-size: 0.9rem;
	}

	.state.error {
		color: hsl(0, 70%, 50%);
	}

	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: hsla(var(--system-color-dark-hsl), 0.55);
		text-align: center;
		gap: 0.4rem;
	}
</style>
