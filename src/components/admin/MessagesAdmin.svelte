<script lang="ts">
	import { api } from '🍎/lib/api.ts';
	import Toast from './Toast.svelte';

	type Message = {
		id: number;
		name: string;
		email: string;
		message: string;
		is_read: boolean;
		ip: string | null;
		created_at: string;
	};

	let messages = $state<Message[]>([]);
	let loading = $state(true);
	let toast_msg = $state('');
	let toast_kind = $state<'success' | 'error'>('success');

	function refresh() {
		loading = true;
		api
			.get<{ messages: Message[] }>('/api/admin/messages')
			.then((res) => {
				messages = res.messages;
				loading = false;
			})
			.catch(() => (loading = false));
	}

	$effect(refresh);

	function show_toast(kind: 'success' | 'error', msg: string) {
		toast_kind = kind;
		toast_msg = msg;
		setTimeout(() => (toast_msg = ''), 3000);
	}

	async function toggle_read(m: Message) {
		try {
			await api.patch(`/api/admin/messages/${m.id}`, { is_read: !m.is_read });
			messages = messages.map((x) => (x.id === m.id ? { ...x, is_read: !m.is_read } : x));
		} catch (err: any) {
			show_toast('error', err.message ?? 'Hata');
		}
	}

	async function remove(id: number) {
		if (!confirm('Bu mesajı silmek istediğinden emin misin?')) return;
		try {
			await api.delete(`/api/admin/messages/${id}`);
			messages = messages.filter((m) => m.id !== id);
			show_toast('success', 'Silindi');
		} catch (err: any) {
			show_toast('error', err.message ?? 'Silinemedi');
		}
	}

	function format_date(s: string): string {
		const d = new Date(s);
		return d.toLocaleString('tr-TR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	}
</script>

<div class="admin-page">
	<h1>Mesajlar</h1>

	{#if loading}
		<p>Yükleniyor…</p>
	{:else if messages.length === 0}
		<p>Henüz mesaj yok.</p>
	{:else}
		<div class="list">
			{#each messages as m (m.id)}
				<article class="msg" class:unread={!m.is_read}>
					<header>
						<div class="from">
							<strong>{m.name}</strong>
							<a href={`mailto:${m.email}`}>{m.email}</a>
						</div>
						<div class="date">{format_date(m.created_at)}</div>
					</header>
					<p>{m.message}</p>
					<footer>
						{#if m.ip}<span class="meta">IP: {m.ip}</span>{/if}
						<button class="btn small" onclick={() => toggle_read(m)}>
							{m.is_read ? 'Okunmadı işaretle' : 'Okundu işaretle'}
						</button>
						<button class="btn small danger" onclick={() => remove(m.id)}>Sil</button>
					</footer>
				</article>
			{/each}
		</div>
	{/if}
</div>

<Toast message={toast_msg} kind={toast_kind} />

<style>
	.list {
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
	}

	.msg {
		background: white;
		border: 1px solid #e5e5e7;
		border-radius: 0.7rem;
		padding: 1.2rem 1.4rem;
	}

	.msg.unread {
		border-color: #667eea;
		box-shadow: 0 0 0 1px hsla(232, 75%, 65%, 0.2);
	}

	header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 0.7rem;
	}

	.from {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;

		a {
			color: #6e6e73;
			font-size: 0.85rem;
			text-decoration: none;
		}

		a:hover {
			color: #667eea;
		}
	}

	.date {
		font-size: 0.78rem;
		color: #6e6e73;
		white-space: nowrap;
	}

	p {
		margin: 0 0 1rem;
		line-height: 1.5;
		white-space: pre-wrap;
	}

	footer {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		flex-wrap: wrap;
	}

	.meta {
		font-size: 0.75rem;
		color: #999;
		margin-right: auto;
	}
</style>
