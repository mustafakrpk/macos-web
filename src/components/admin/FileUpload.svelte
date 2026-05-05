<script lang="ts">
	import { api } from '🍎/lib/api.ts';

	const {
		current_url = null,
		accept = 'image/*',
		on_change,
	}: {
		current_url?: string | null;
		accept?: string;
		on_change: (url: string) => void;
	} = $props();

	let uploading = $state(false);
	let error_msg = $state<string | null>(null);

	let input_el = $state<HTMLInputElement>();

	async function handle_pick(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		error_msg = null;
		uploading = true;
		try {
			const fd = new FormData();
			fd.append('file', file);
			const res = await api.post<{ upload: { url: string } }>('/api/admin/uploads', fd);
			on_change(res.upload.url);
		} catch (err: any) {
			error_msg = err.message ?? 'Yüklenemedi';
		} finally {
			uploading = false;
			if (target) target.value = '';
		}
	}
</script>

<div class="upload">
	{#if current_url}
		{#if accept.includes('image')}
			<img src={current_url} alt="Yüklenen dosya" />
		{:else}
			<a href={current_url} target="_blank" rel="noopener" class="file-link">
				📄 {current_url.split('/').pop()}
			</a>
		{/if}
	{/if}

	<button
		type="button"
		class="btn small"
		onclick={() => input_el?.click()}
		disabled={uploading}
	>
		{uploading ? 'Yükleniyor…' : current_url ? 'Değiştir' : 'Dosya Seç'}
	</button>

	<input
		bind:this={input_el}
		type="file"
		{accept}
		onchange={handle_pick}
		style="display: none"
	/>

	{#if error_msg}<span class="err">{error_msg}</span>{/if}
</div>

<style>
	.upload {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		flex-wrap: wrap;
	}

	img {
		width: 80px;
		height: 80px;
		object-fit: cover;
		border-radius: 0.5rem;
		border: 1px solid #e5e5e7;
	}

	.file-link {
		font-size: 0.85rem;
		color: #1d1d1f;
		text-decoration: none;
		padding: 0.4rem 0.7rem;
		background: #f5f5f7;
		border-radius: 0.4rem;
	}

	.err {
		color: #d63031;
		font-size: 0.82rem;
	}
</style>
