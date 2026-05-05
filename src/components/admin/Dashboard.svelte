<script lang="ts">
	import { api } from '🍎/lib/api.ts';

	const { navigate }: { navigate: (to: string) => void } = $props();

	let stats = $state({
		projects: 0,
		messages_total: 0,
		messages_unread: 0,
	});

	$effect(() => {
		Promise.all([
			api.get<{ projects: any[] }>('/api/admin/projects').catch(() => ({ projects: [] })),
			api.get<{ messages: any[] }>('/api/admin/messages').catch(() => ({ messages: [] })),
		]).then(([p, m]) => {
			stats = {
				projects: p.projects.length,
				messages_total: m.messages.length,
				messages_unread: m.messages.filter((x: any) => !x.is_read).length,
			};
		});
	});

	const cards = [
		{ label: 'Hakkımda', to: '/admin/about', desc: 'Profil bilgilerini düzenle' },
		{ label: 'Projeler', to: '/admin/projects', desc: 'Projelerini ekle, düzenle, sil' },
		{ label: 'Özgeçmiş', to: '/admin/cv', desc: 'Deneyim, eğitim, yetenekler' },
		{ label: 'Mesajlar', to: '/admin/messages', desc: 'Gelen iletişim formları' },
	];
</script>

<div class="page">
	<h1>Genel Bakış</h1>

	<div class="stats">
		<div class="stat"><span class="num">{stats.projects}</span><span>Proje</span></div>
		<div class="stat">
			<span class="num">{stats.messages_total}</span><span>Toplam Mesaj</span>
		</div>
		<div class="stat">
			<span class="num">{stats.messages_unread}</span><span>Okunmamış Mesaj</span>
		</div>
	</div>

	<h2>Hızlı Erişim</h2>

	<div class="grid">
		{#each cards as card}
			<button class="card" onclick={() => navigate(card.to)}>
				<strong>{card.label}</strong>
				<span>{card.desc}</span>
			</button>
		{/each}
	</div>
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	h1 {
		font-size: 2rem;
		margin: 0;
	}

	h2 {
		font-size: 1.1rem;
		margin: 1rem 0 0;
		color: #6e6e73;
		font-weight: 500;
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 1rem;
	}

	.stat {
		background: white;
		border: 1px solid #e5e5e7;
		border-radius: 0.7rem;
		padding: 1.2rem 1.4rem;
		display: flex;
		flex-direction: column;
		gap: 0.3rem;

		.num {
			font-size: 1.8rem;
			font-weight: 600;
		}

		span:last-child {
			color: #6e6e73;
			font-size: 0.85rem;
		}
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 1rem;
	}

	.card {
		background: white;
		border: 1px solid #e5e5e7;
		border-radius: 0.7rem;
		padding: 1.2rem 1.4rem;
		text-align: left;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		transition: all 0.15s;

		&:hover {
			border-color: #667eea;
			transform: translateY(-1px);
		}

		strong {
			font-size: 1rem;
		}

		span {
			color: #6e6e73;
			font-size: 0.85rem;
		}
	}
</style>
