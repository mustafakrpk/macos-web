<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { elevation } from '🍎/actions';
	import { apps_config } from '🍎/configs/apps/apps-config.ts';
	import { apps, type AppID } from '🍎/state/apps.svelte.ts';
	import { api, type PublicProject } from '🍎/lib/api.ts';
	import SearchIcon from '~icons/mdi/magnify';

	type Result =
		| { kind: 'app'; app_id: AppID; title: string; subtitle: string }
		| { kind: 'project'; project: PublicProject };

	let open = $state(false);
	let query = $state('');
	let selected_index = $state(0);
	let input_el = $state<HTMLInputElement>();
	let projects = $state<PublicProject[]>([]);

	const app_results = $derived(
		Object.entries(apps_config).map(([app_id, cfg]) => ({
			kind: 'app' as const,
			app_id: app_id as AppID,
			title: cfg.title,
			subtitle: 'Uygulama',
		})),
	);

	const filtered_results = $derived.by((): Result[] => {
		const q = query.trim().toLowerCase();
		if (!q) return app_results.slice(0, 6);

		const matched_apps = app_results.filter(
			(r) => r.title.toLowerCase().includes(q) || r.subtitle.toLowerCase().includes(q),
		);

		const matched_projects: Result[] = projects
			.filter(
				(p) =>
					p.title.toLowerCase().includes(q) ||
					p.description.toLowerCase().includes(q) ||
					p.stack.some((s) => s.toLowerCase().includes(q)),
			)
			.map((p) => ({ kind: 'project' as const, project: p }));

		return [...matched_apps, ...matched_projects].slice(0, 8);
	});

	$effect(() => {
		filtered_results;
		selected_index = 0;
	});

	function on_key(e: KeyboardEvent) {
		const cmd_or_ctrl = e.metaKey || e.ctrlKey;
		if (cmd_or_ctrl && e.key.toLowerCase() === 'k') {
			e.preventDefault();
			open = !open;
			if (open) setTimeout(() => input_el?.focus(), 50);
			return;
		}

		if (!open) return;

		if (e.key === 'Escape') {
			e.preventDefault();
			close();
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			selected_index = Math.min(selected_index + 1, filtered_results.length - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			selected_index = Math.max(selected_index - 1, 0);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			const result = filtered_results[selected_index];
			if (result) activate(result);
		}
	}

	function close() {
		open = false;
		query = '';
		selected_index = 0;
	}

	function activate(result: Result) {
		if (result.kind === 'app') {
			const config = apps_config[result.app_id];
			if (config.should_open_window === false) {
				config.external_action?.(new MouseEvent('click'));
			} else {
				apps.open[result.app_id] = true;
				apps.active = result.app_id;
			}
		} else if (result.kind === 'project') {
			// Projects app'i aç
			apps.open.appstore = true;
			apps.active = 'appstore';
			// Belirli bir projeye scroll için ileride event yayımlanabilir
		}
		close();
	}

	onMount(() => {
		window.addEventListener('keydown', on_key);
		// Projeleri arka planda yükle
		api
			.get<{ projects: PublicProject[] }>('/api/public/projects')
			.then((res) => (projects = res.projects))
			.catch(() => {});
	});

	onDestroy(() => {
		window.removeEventListener('keydown', on_key);
	});
</script>

{#if open}
	<button
		class="backdrop"
		onclick={close}
		transition:fade={{ duration: 120 }}
		aria-label="Spotlight'ı kapat"
	></button>

	<div class="spotlight" use:elevation={'spotlight'} transition:scale={{ duration: 150, start: 0.95 }}>
		<div class="search-bar">
			<SearchIcon />
			<input
				bind:this={input_el}
				bind:value={query}
				type="text"
				placeholder="Spotlight Arama"
				spellcheck="false"
				autocomplete="off"
			/>
			<kbd>esc</kbd>
		</div>

		{#if filtered_results.length > 0}
			<ul class="results">
				{#each filtered_results as result, i (result.kind === 'app' ? `a-${result.app_id}` : `p-${result.project.id}`)}
					<li class:active={i === selected_index}>
						<button
							onclick={() => activate(result)}
							onmouseenter={() => (selected_index = i)}
						>
							{#if result.kind === 'app'}
								<img src="/app-icons/{result.app_id}/256.png" alt="" />
								<div class="meta">
									<strong>{result.title}</strong>
									<span>{result.subtitle}</span>
								</div>
							{:else}
								<div class="emoji-icon">{result.project.emoji}</div>
								<div class="meta">
									<strong>{result.project.title}</strong>
									<span>Proje · {result.project.stack.slice(0, 3).join(', ')}</span>
								</div>
							{/if}
						</button>
					</li>
				{/each}
			</ul>
		{:else if query.trim()}
			<div class="no-results">"{query}" için sonuç yok.</div>
		{/if}

		<div class="footer">
			<span><kbd>↑</kbd><kbd>↓</kbd> gezin</span>
			<span><kbd>⏎</kbd> aç</span>
			<span><kbd>⌘K</kbd> aç/kapat</span>
		</div>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		background: hsla(0, 0%, 0%, 0.25);
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
		z-index: calc(var(--system-z-index-spotlight) - 1);
		border: none;
		cursor: default;
	}

	.spotlight {
		position: fixed;
		top: 18vh;
		left: 50%;
		transform: translateX(-50%);

		width: min(640px, calc(100vw - 2rem));

		background: hsla(0, 0%, 18%, 0.85);
		backdrop-filter: blur(40px);
		-webkit-backdrop-filter: blur(40px);
		border-radius: 1rem;
		box-shadow:
			0 24px 60px hsla(0, 0%, 0%, 0.5),
			inset 0 0 0 1px hsla(0, 0%, 100%, 0.1);
		overflow: hidden;
		color: white;
	}

	.search-bar {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		padding: 1rem 1.2rem;
		border-bottom: 1px solid hsla(0, 0%, 100%, 0.08);

		:global(svg) {
			font-size: 1.4rem;
			color: hsla(0, 0%, 100%, 0.5);
			flex-shrink: 0;
		}

		input {
			flex: 1;
			background: none;
			border: none;
			color: white;
			font-size: 1.3rem;
			font-family: inherit;
			outline: none;
			padding: 0;
		}

		input::placeholder {
			color: hsla(0, 0%, 100%, 0.35);
		}
	}

	kbd {
		font-family: inherit;
		font-size: 0.7rem;
		padding: 0.15rem 0.4rem;
		background: hsla(0, 0%, 100%, 0.08);
		border-radius: 0.25rem;
		color: hsla(0, 0%, 100%, 0.6);
	}

	.results {
		list-style: none;
		margin: 0;
		padding: 0.4rem;
		max-height: 50vh;
		overflow-y: auto;
	}

	.results li {
		margin: 0;
	}

	.results li button {
		display: flex;
		align-items: center;
		gap: 0.8rem;
		width: 100%;
		padding: 0.55rem 0.8rem;
		background: none;
		border: none;
		border-radius: 0.5rem;
		color: white;
		text-align: left;
		cursor: pointer;
		font-family: inherit;
	}

	.results li.active button {
		background: hsla(232, 75%, 65%, 0.5);
	}

	.results li button img {
		width: 32px;
		height: 32px;
		flex-shrink: 0;
	}

	.emoji-icon {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.3rem;
		background: linear-gradient(135deg, hsla(232, 75%, 65%, 0.3), hsla(280, 60%, 50%, 0.3));
		border-radius: 0.4rem;
		flex-shrink: 0;
	}

	.meta {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		min-width: 0;
		flex: 1;

		strong {
			font-weight: 500;
			font-size: 0.95rem;
		}

		span {
			font-size: 0.78rem;
			color: hsla(0, 0%, 100%, 0.55);
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}

	.no-results {
		padding: 2rem;
		text-align: center;
		color: hsla(0, 0%, 100%, 0.5);
		font-size: 0.9rem;
	}

	.footer {
		display: flex;
		gap: 1rem;
		padding: 0.5rem 1rem;
		font-size: 0.72rem;
		color: hsla(0, 0%, 100%, 0.4);
		border-top: 1px solid hsla(0, 0%, 100%, 0.08);

		span {
			display: flex;
			align-items: center;
			gap: 0.3rem;
		}
	}
</style>
