<script lang="ts">
	import { api } from '🍎/lib/api.ts';
	import { apps_config } from '🍎/configs/apps/apps-config.ts';

	type Summary = {
		total: number;
		last_24h: number;
		last_7d: number;
		unique_visitors_7d: number;
		top_apps: Array<{ app_id: string; n: number }>;
		top_projects: Array<{ project_id: number; n: number }>;
		daily: Array<{ day: string; n: number }>;
	};

	let summary = $state<Summary | null>(null);
	let projects = $state<Array<{ id: number; title: string }>>([]);
	let loading = $state(true);

	$effect(() => {
		Promise.all([
			api.get<Summary>('/api/admin/analytics/summary').catch(() => null),
			api
				.get<{ projects: any[] }>('/api/admin/projects')
				.then((r) => r.projects.map((p: any) => ({ id: p.id, title: p.title })))
				.catch(() => []),
		]).then(([s, p]) => {
			summary = s;
			projects = p;
			loading = false;
		});
	});

	const app_title = (id: string) =>
		(apps_config as Record<string, { title: string }>)[id]?.title ?? id;
	const project_title = (id: number) =>
		projects.find((p) => p.id === id)?.title ?? `Proje #${id}`;

	const max_daily = $derived(
		summary?.daily.length ? Math.max(...summary.daily.map((d) => d.n), 1) : 1,
	);

	function format_day(s: string): string {
		try {
			return new Date(s).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
		} catch {
			return s;
		}
	}
</script>

<div class="admin-page">
	<h1>İstatistikler</h1>

	{#if loading}
		<p>Yükleniyor…</p>
	{:else if !summary}
		<p>Veri çekilemedi.</p>
	{:else}
		<div class="kpis">
			<div class="kpi">
				<span class="value">{summary.total}</span>
				<span class="label">Toplam Etkinlik</span>
			</div>
			<div class="kpi">
				<span class="value">{summary.last_24h}</span>
				<span class="label">Son 24 saat</span>
			</div>
			<div class="kpi">
				<span class="value">{summary.last_7d}</span>
				<span class="label">Son 7 gün</span>
			</div>
			<div class="kpi">
				<span class="value">{summary.unique_visitors_7d}</span>
				<span class="label">Tekil ziyaretçi (7g)</span>
			</div>
		</div>

		<section class="section-card">
			<h3>Günlük etkinlik (son 7 gün)</h3>
			{#if summary.daily.length === 0}
				<p class="empty">Henüz veri yok.</p>
			{:else}
				<div class="chart">
					{#each summary.daily as d}
						<div class="bar-col">
							<div class="bar" style:height="{(d.n / max_daily) * 100}%" title={`${d.n} etkinlik`}>
								<span>{d.n}</span>
							</div>
							<small>{format_day(d.day)}</small>
						</div>
					{/each}
				</div>
			{/if}
		</section>

		<div class="grid-2">
			<section class="section-card">
				<h3>En çok açılan uygulamalar</h3>
				{#if summary.top_apps.length === 0}
					<p class="empty">Henüz veri yok.</p>
				{:else}
					<ul class="bar-list">
						{#each summary.top_apps as item, i}
							{@const max = summary.top_apps[0].n}
							<li>
								<span class="bar-label">{app_title(item.app_id)}</span>
								<div class="hbar">
									<div class="hbar-fill" style:width="{(item.n / max) * 100}%"></div>
									<span class="hbar-num">{item.n}</span>
								</div>
							</li>
						{/each}
					</ul>
				{/if}
			</section>

			<section class="section-card">
				<h3>En çok tıklanan projeler</h3>
				{#if summary.top_projects.length === 0}
					<p class="empty">Henüz veri yok.</p>
				{:else}
					<ul class="bar-list">
						{#each summary.top_projects as item}
							{@const max = summary.top_projects[0].n}
							<li>
								<span class="bar-label">{project_title(item.project_id)}</span>
								<div class="hbar">
									<div class="hbar-fill" style:width="{(item.n / max) * 100}%"></div>
									<span class="hbar-num">{item.n}</span>
								</div>
							</li>
						{/each}
					</ul>
				{/if}
			</section>
		</div>

		<p class="note">
			IP adresleri günlük tuzla hash'lenir; ham IP saklanmaz. KVKK uyumlu.
		</p>
	{/if}
</div>

<style>
	.kpis {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.kpi {
		background: white;
		border: 1px solid #e5e5e7;
		border-radius: 0.7rem;
		padding: 1.1rem 1.3rem;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;

		.value {
			font-size: 1.8rem;
			font-weight: 600;
		}

		.label {
			font-size: 0.8rem;
			color: #6e6e73;
		}
	}

	.section-card h3 {
		margin: 0 0 1rem 0;
	}

	.chart {
		display: flex;
		align-items: flex-end;
		gap: 0.5rem;
		height: 160px;
		padding: 1rem 0;
	}

	.bar-col {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.4rem;
		height: 100%;

		small {
			font-size: 0.72rem;
			color: #6e6e73;
		}
	}

	.bar {
		width: 100%;
		max-width: 32px;
		background: linear-gradient(180deg, #667eea, #764ba2);
		border-radius: 0.3rem 0.3rem 0 0;
		min-height: 4px;
		display: flex;
		justify-content: center;
		position: relative;
		transition: filter 0.15s;

		span {
			position: absolute;
			top: -1.2rem;
			font-size: 0.72rem;
			color: #6e6e73;
		}

		&:hover {
			filter: brightness(1.1);
		}
	}

	.bar-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.bar-list li {
		display: grid;
		grid-template-columns: 1fr 2fr;
		gap: 0.8rem;
		align-items: center;
	}

	.bar-label {
		font-size: 0.85rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.hbar {
		position: relative;
		height: 20px;
		background: #f0f0f2;
		border-radius: 0.3rem;
		overflow: hidden;
	}

	.hbar-fill {
		height: 100%;
		background: linear-gradient(90deg, #667eea, #764ba2);
		border-radius: inherit;
		transition: width 0.2s ease;
	}

	.hbar-num {
		position: absolute;
		right: 0.5rem;
		top: 50%;
		transform: translateY(-50%);
		font-size: 0.78rem;
		font-weight: 500;
		color: #1d1d1f;
	}

	.empty {
		color: #6e6e73;
		font-size: 0.9rem;
		margin: 0;
	}

	.note {
		font-size: 0.78rem;
		color: #6e6e73;
		margin-top: 1.5rem;
		text-align: center;
	}
</style>
