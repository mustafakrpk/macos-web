<script lang="ts">
	import { marked } from 'marked';
	import { api } from '🍎/lib/api.ts';
	import Toast from './Toast.svelte';

	type Post = {
		id: number;
		slug: string;
		title: string;
		excerpt: string | null;
		content_md: string;
		is_published: boolean;
		published_at: string | null;
		created_at: string;
		updated_at: string;
	};

	let posts = $state<Post[]>([]);
	let loading = $state(true);
	let saving = $state(false);
	let editing = $state<Partial<Post> | null>(null);
	let preview_mode = $state(false);
	let toast_msg = $state('');
	let toast_kind = $state<'success' | 'error'>('success');

	function refresh() {
		loading = true;
		api
			.get<{ posts: Post[] }>('/api/admin/posts')
			.then((res) => {
				posts = res.posts;
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

	function slugify(s: string): string {
		return s
			.toLowerCase()
			.replace(/ı/g, 'i')
			.replace(/ğ/g, 'g')
			.replace(/ü/g, 'u')
			.replace(/ş/g, 's')
			.replace(/ö/g, 'o')
			.replace(/ç/g, 'c')
			.normalize('NFD')
			.replace(/[̀-ͯ]/g, '')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
			.slice(0, 128);
	}

	function start_new() {
		editing = {
			slug: '',
			title: '',
			excerpt: '',
			content_md: '',
			is_published: true,
		};
		preview_mode = false;
	}

	function start_edit(p: Post) {
		editing = { ...p };
		preview_mode = false;
	}

	function cancel() {
		editing = null;
	}

	function on_title_blur() {
		if (editing && !editing.slug && editing.title) {
			editing.slug = slugify(editing.title);
		}
	}

	async function save() {
		if (!editing) return;
		saving = true;
		try {
			const payload = {
				slug: editing.slug,
				title: editing.title,
				excerpt: editing.excerpt || null,
				content_md: editing.content_md,
				is_published: editing.is_published ?? true,
			};
			if (editing.id) {
				await api.patch(`/api/admin/posts/${editing.id}`, payload);
			} else {
				await api.post('/api/admin/posts', payload);
			}
			editing = null;
			refresh();
			show_toast('success', 'Kaydedildi');
		} catch (err: any) {
			show_toast('error', err.message ?? 'Kaydedilemedi');
		} finally {
			saving = false;
		}
	}

	async function remove(id: number) {
		if (!confirm('Bu yazıyı silmek istediğinden emin misin?')) return;
		try {
			await api.delete(`/api/admin/posts/${id}`);
			refresh();
			show_toast('success', 'Silindi');
		} catch (err: any) {
			show_toast('error', err.message ?? 'Silinemedi');
		}
	}

	const preview_html = $derived(
		editing?.content_md ? (marked.parse(editing.content_md, { async: false }) as string) : '',
	);

	function format_date(s: string | null): string {
		if (!s) return '—';
		return new Date(s).toLocaleString('tr-TR');
	}
</script>

<div class="admin-page">
	<div class="page-header">
		<h1>Blog & Notlar</h1>
		{#if !editing}
			<button class="btn primary" onclick={start_new}>+ Yeni Yazı</button>
		{/if}
	</div>

	{#if editing}
		<form class="admin-form" onsubmit={(e) => { e.preventDefault(); save(); }}>
			<div class="grid-2">
				<label>
					Başlık
					<input
						type="text"
						bind:value={editing.title}
						onblur={on_title_blur}
						required
						maxlength="255"
					/>
				</label>
				<label>
					Slug
					<input
						type="text"
						bind:value={editing.slug}
						required
						maxlength="128"
						pattern="[a-z0-9-]+"
					/>
					<span class="helper">URL'de görünür. Sadece a-z, 0-9, tire.</span>
				</label>
			</div>

			<label>
				Özet (opsiyonel — listede gösterilir)
				<input type="text" bind:value={editing.excerpt} maxlength="500" />
			</label>

			<label>
				İçerik (Markdown)
				<div class="md-toolbar">
					<button
						type="button"
						class:active={!preview_mode}
						onclick={() => (preview_mode = false)}
					>
						Yaz
					</button>
					<button
						type="button"
						class:active={preview_mode}
						onclick={() => (preview_mode = true)}
					>
						Önizle
					</button>
				</div>
				{#if preview_mode}
					<div class="preview">{@html preview_html}</div>
				{:else}
					<textarea bind:value={editing.content_md} rows="18" required></textarea>
				{/if}
				<span class="helper">
					## H2, ### H3, **bold**, *italic*, [link](url), `kod`, ```kod blokları```, > alıntı, - liste
				</span>
			</label>

			<label style="flex-direction: row; align-items: center; gap: 0.5rem;">
				<input type="checkbox" bind:checked={editing.is_published} />
				Yayında
			</label>

			<div class="admin-actions">
				<button type="submit" class="btn primary" disabled={saving}>
					{saving ? 'Kaydediliyor…' : 'Kaydet'}
				</button>
				<button type="button" class="btn" onclick={cancel}>İptal</button>
			</div>
		</form>
	{:else if loading}
		<p>Yükleniyor…</p>
	{:else if posts.length === 0}
		<p>Henüz yazı yok. Yeni bir tane ekle.</p>
	{:else}
		<div class="list-card">
			{#each posts as p (p.id)}
				<div class="list-row">
					<div>
						<div class="row-title">
							<strong>{p.title}</strong>
							{#if !p.is_published}<span class="badge">Taslak</span>{/if}
						</div>
						<div class="meta">/{p.slug} · {format_date(p.published_at ?? p.created_at)}</div>
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

	.md-toolbar {
		display: flex;
		gap: 0.3rem;
		margin-bottom: 0.4rem;

		button {
			padding: 0.35rem 0.8rem;
			background: white;
			border: 1px solid #d2d2d7;
			border-radius: 0.35rem;
			font-size: 0.82rem;
			cursor: pointer;
		}

		button.active {
			background: #1d1d1f;
			color: white;
			border-color: #1d1d1f;
		}
	}

	.preview {
		min-height: 350px;
		max-height: 500px;
		overflow-y: auto;
		padding: 1rem 1.2rem;
		border: 1px solid #d2d2d7;
		border-radius: 0.4rem;
		background: #fafafa;
		line-height: 1.6;

		:global(h1) {
			font-size: 1.8rem;
			margin: 1rem 0 0.5rem;
		}
		:global(h2) {
			font-size: 1.4rem;
			margin: 1rem 0 0.5rem;
		}
		:global(h3) {
			font-size: 1.15rem;
			margin: 0.8rem 0 0.4rem;
		}
		:global(p) {
			margin: 0 0 0.8rem;
		}
		:global(code) {
			font-family: 'SF Mono', Menlo, monospace;
			font-size: 0.85em;
			padding: 0.1rem 0.3rem;
			background: rgba(0, 0, 0, 0.06);
			border-radius: 0.25rem;
		}
		:global(pre) {
			background: rgba(0, 0, 0, 0.05);
			padding: 0.9rem;
			border-radius: 0.4rem;
			overflow-x: auto;
		}
		:global(pre code) {
			background: none;
			padding: 0;
		}
	}

	.row-title {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.2rem;
	}

	.meta {
		font-size: 0.8rem;
		color: #6e6e73;
	}

	.badge {
		font-size: 0.7rem;
		padding: 0.15rem 0.45rem;
		background: #f5d76e;
		color: #4d3b00;
		border-radius: 0.25rem;
	}
</style>
