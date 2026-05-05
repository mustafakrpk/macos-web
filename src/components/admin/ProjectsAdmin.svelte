<script lang="ts">
	import { api, parse_string_array, type PublicProject } from '🍎/lib/api.ts';
	import FileUpload from './FileUpload.svelte';
	import Toast from './Toast.svelte';

	type AdminProject = PublicProject & { is_published: boolean };

	let projects = $state<AdminProject[]>([]);
	let loading = $state(true);
	let saving = $state(false);
	let toast_msg = $state('');
	let toast_kind = $state<'success' | 'error'>('success');

	let editing = $state<Partial<AdminProject> | null>(null);
	let editing_stack_str = $state('');

	const default_gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

	function refresh() {
		loading = true;
		api
			.get<{ projects: AdminProject[] }>('/api/admin/projects')
			.then((res) => {
				projects = res.projects.map((p) => ({ ...p, stack: parse_string_array(p.stack) }));
				loading = false;
			})
			.catch(() => (loading = false));
	}

	$effect(refresh);

	function start_new() {
		editing = {
			title: '',
			description: '',
			stack: [],
			github_url: null,
			live_url: null,
			image_url: null,
			gradient: default_gradient,
			emoji: '🚀',
			display_order: projects.length,
			is_published: true,
		};
		editing_stack_str = '';
	}

	function start_edit(p: AdminProject) {
		const stack = parse_string_array(p.stack);
		editing = { ...p, stack };
		editing_stack_str = stack.join(', ');
	}

	function cancel() {
		editing = null;
		editing_stack_str = '';
	}

	function show_toast(kind: 'success' | 'error', msg: string) {
		toast_kind = kind;
		toast_msg = msg;
		setTimeout(() => (toast_msg = ''), 3000);
	}

	async function save() {
		if (!editing) return;
		saving = true;
		const stack = editing_stack_str
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
		const payload = { ...editing, stack };
		try {
			if ('id' in editing && editing.id) {
				await api.patch(`/api/admin/projects/${editing.id}`, payload);
			} else {
				await api.post('/api/admin/projects', payload);
			}
			editing = null;
			editing_stack_str = '';
			refresh();
			show_toast('success', 'Kaydedildi');
		} catch (err: any) {
			show_toast('error', err.message ?? 'Kaydedilemedi');
		} finally {
			saving = false;
		}
	}

	async function remove(id: number) {
		if (!confirm('Bu projeyi silmek istediğinden emin misin?')) return;
		try {
			await api.delete(`/api/admin/projects/${id}`);
			refresh();
			show_toast('success', 'Silindi');
		} catch (err: any) {
			show_toast('error', err.message ?? 'Silinemedi');
		}
	}
</script>

<div class="admin-page">
	<div class="page-header">
		<h1>Projeler</h1>
		{#if !editing}
			<button class="btn primary" onclick={start_new}>+ Yeni Proje</button>
		{/if}
	</div>

	{#if editing}
		<form class="admin-form" onsubmit={(e) => { e.preventDefault(); save(); }}>
			<div class="grid-2">
				<label>
					Başlık
					<input type="text" bind:value={editing.title} required maxlength="255" />
				</label>
				<label>
					Emoji (kapak için)
					<input type="text" bind:value={editing.emoji} maxlength="8" required />
				</label>
			</div>

			<label>
				Açıklama
				<textarea bind:value={editing.description} rows="4" required></textarea>
			</label>

			<label>
				Teknolojiler
				<input type="text" bind:value={editing_stack_str} placeholder="Svelte, TypeScript, …" />
				<span class="helper">Virgülle ayırarak yaz.</span>
			</label>

			<label>
				Kapak Görseli
				<FileUpload
					current_url={editing.image_url}
					accept="image/*"
					on_change={(url) => (editing!.image_url = url)}
				/>
				<span class="helper">Görsel yoksa gradient + emoji gösterilir.</span>
			</label>

			<div class="grid-2">
				<label>
					GitHub URL
					<input type="url" bind:value={editing.github_url} maxlength="512" />
				</label>
				<label>
					Canlı Demo URL
					<input type="url" bind:value={editing.live_url} maxlength="512" />
				</label>
			</div>

			<label>
				Gradient (CSS)
				<input type="text" bind:value={editing.gradient} maxlength="255" />
			</label>

			<div class="grid-2">
				<label>
					Sıra
					<input type="number" bind:value={editing.display_order} />
				</label>
				<label style="flex-direction: row; align-items: center; gap: 0.5rem;">
					<input type="checkbox" bind:checked={editing.is_published} />
					Yayında
				</label>
			</div>

			<div class="admin-actions">
				<button type="submit" class="btn primary" disabled={saving}>
					{saving ? 'Kaydediliyor…' : 'Kaydet'}
				</button>
				<button type="button" class="btn" onclick={cancel}>İptal</button>
			</div>
		</form>
	{:else if loading}
		<p>Yükleniyor…</p>
	{:else if projects.length === 0}
		<p>Henüz proje yok. Yeni bir tane ekleyebilirsin.</p>
	{:else}
		<div class="list-card">
			{#each projects as p (p.id)}
				<div class="list-row">
					<div>
						<div class="row-title">
							<span class="emoji">{p.emoji}</span>
							<strong>{p.title}</strong>
							{#if !p.is_published}
								<span class="badge">Taslak</span>
							{/if}
						</div>
						<div class="meta">
							{p.stack.join(', ') || 'Stack belirtilmemiş'}
						</div>
					</div>
					<div class="row-actions">
						<button class="btn small" onclick={() => start_edit(p)}>Düzenle</button>
						<button class="btn small danger" onclick={() => remove(p.id)}>Sil</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<Toast message={toast_msg} kind={toast_kind} />

<style>
	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1.2rem;
	}

	.page-header h1 {
		margin: 0;
	}

	.row-title {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.2rem;
	}

	.row-title .emoji {
		font-size: 1.2rem;
	}

	.meta {
		font-size: 0.82rem;
		color: #6e6e73;
	}

	.badge {
		font-size: 0.7rem;
		padding: 0.15rem 0.45rem;
		background: #f5d76e;
		color: #4d3b00;
		border-radius: 0.25rem;
	}

	.row-actions {
		display: flex;
		gap: 0.4rem;
	}
</style>
