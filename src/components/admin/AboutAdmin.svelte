<script lang="ts">
	import { api, type PublicAbout } from '🍎/lib/api.ts';
	import FileUpload from './FileUpload.svelte';
	import Toast from './Toast.svelte';

	let form = $state({
		full_name: '',
		title: '',
		intro_md: '',
		avatar_url: null as string | null,
		email: null as string | null,
		github_url: null as string | null,
		linkedin_url: null as string | null,
		location: null as string | null,
	});

	let loading = $state(true);
	let saving = $state(false);
	let toast_msg = $state('');
	let toast_kind = $state<'success' | 'error'>('success');

	$effect(() => {
		api
			.get<{ about: PublicAbout | null }>('/api/admin/about')
			.then((res) => {
				if (res.about) {
					form = {
						full_name: res.about.full_name,
						title: res.about.title,
						intro_md: res.about.intro_md,
						avatar_url: res.about.avatar_url,
						email: res.about.email,
						github_url: res.about.github_url,
						linkedin_url: res.about.linkedin_url,
						location: res.about.location,
					};
				}
				loading = false;
			})
			.catch(() => (loading = false));
	});

	async function save() {
		saving = true;
		toast_msg = '';
		try {
			await api.put('/api/admin/about', form);
			toast_kind = 'success';
			toast_msg = 'Kaydedildi';
		} catch (err: any) {
			toast_kind = 'error';
			toast_msg = err.message ?? 'Kaydedilemedi';
		} finally {
			saving = false;
			setTimeout(() => (toast_msg = ''), 3000);
		}
	}
</script>

<div class="admin-page">
	<h1>Hakkımda</h1>

	{#if loading}
		<p>Yükleniyor…</p>
	{:else}
		<form class="admin-form" onsubmit={(e) => { e.preventDefault(); save(); }}>
			<div class="grid-2">
				<label>
					Ad Soyad
					<input type="text" bind:value={form.full_name} required maxlength="128" />
				</label>
				<label>
					Unvan
					<input type="text" bind:value={form.title} required maxlength="255" />
				</label>
			</div>

			<label>
				Tanıtım Yazısı
				<textarea bind:value={form.intro_md} rows="8" required></textarea>
				<span class="helper">**bold** desteği var. Paragraflar arasına boş satır bırak.</span>
			</label>

			<label>
				Profil Görseli
				<FileUpload
					current_url={form.avatar_url}
					accept="image/*"
					on_change={(url) => (form.avatar_url = url)}
				/>
			</label>

			<div class="grid-2">
				<label>
					E-posta
					<input type="email" bind:value={form.email} maxlength="255" />
				</label>
				<label>
					Konum
					<input type="text" bind:value={form.location} maxlength="128" />
				</label>
			</div>

			<div class="grid-2">
				<label>
					GitHub URL
					<input type="url" bind:value={form.github_url} maxlength="512" />
				</label>
				<label>
					LinkedIn URL
					<input type="url" bind:value={form.linkedin_url} maxlength="512" />
				</label>
			</div>

			<div class="admin-actions">
				<button type="submit" class="btn primary" disabled={saving}>
					{saving ? 'Kaydediliyor…' : 'Kaydet'}
				</button>
			</div>
		</form>
	{/if}
</div>

<Toast message={toast_msg} kind={toast_kind} />
