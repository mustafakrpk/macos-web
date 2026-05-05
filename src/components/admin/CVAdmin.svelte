<script lang="ts">
	import { api, parse_string_array, type PublicCV } from '🍎/lib/api.ts';
	import FileUpload from './FileUpload.svelte';
	import Toast from './Toast.svelte';

	type Exp = { id?: number; title: string; company: string; period_start: string; period_end: string | null; description: string | null; display_order: number };
	type Edu = { id?: number; degree: string; school: string; period_start: string; period_end: string | null; display_order: number };
	type Skill = { id?: number; name: string; items: string[]; display_order: number };
	type Lang = { id?: number; name: string; level: string; display_order: number };

	let experiences = $state<Exp[]>([]);
	let education = $state<Edu[]>([]);
	let skill_categories = $state<(Skill & { items_str: string })[]>([]);
	let languages = $state<Lang[]>([]);
	let pdf_url = $state<string | null>(null);

	let loading = $state(true);
	let saving = $state(false);
	let toast_msg = $state('');
	let toast_kind = $state<'success' | 'error'>('success');

	$effect(() => {
		api
			.get<PublicCV>('/api/admin/cv')
			.then((res) => {
				experiences = res.experiences.map((e) => ({ ...e }));
				education = res.education.map((e) => ({ ...e }));
				skill_categories = res.skill_categories.map((s) => {
					const items = parse_string_array(s.items);
					return { ...s, items, items_str: items.join(', ') };
				});
				languages = res.languages.map((l) => ({ ...l }));
				pdf_url = res.cv_meta?.pdf_url ?? null;
				loading = false;
			})
			.catch(() => (loading = false));
	});

	function show_toast(kind: 'success' | 'error', msg: string) {
		toast_kind = kind;
		toast_msg = msg;
		setTimeout(() => (toast_msg = ''), 3000);
	}

	function add_exp() {
		experiences = [
			...experiences,
			{
				title: '',
				company: '',
				period_start: '',
				period_end: null,
				description: null,
				display_order: experiences.length,
			},
		];
	}
	function add_edu() {
		education = [
			...education,
			{ degree: '', school: '', period_start: '', period_end: null, display_order: education.length },
		];
	}
	function add_skill() {
		skill_categories = [
			...skill_categories,
			{ name: '', items: [], items_str: '', display_order: skill_categories.length },
		];
	}
	function add_lang() {
		languages = [...languages, { name: '', level: '', display_order: languages.length }];
	}

	async function save() {
		saving = true;
		try {
			const filtered_exp = experiences
				.filter((e) => e.title.trim() && e.company.trim() && e.period_start.trim())
				.map((e, i) => ({
					...e,
					period_end: e.period_end?.trim() || null,
					description: e.description?.trim() || null,
					display_order: i,
				}));

			const filtered_edu = education
				.filter((e) => e.degree.trim() && e.school.trim() && e.period_start.trim())
				.map((e, i) => ({
					...e,
					period_end: e.period_end?.trim() || null,
					display_order: i,
				}));

			const filtered_skills = skill_categories
				.filter((s) => s.name.trim() && s.items_str.trim())
				.map((s, i) => ({
					id: s.id,
					name: s.name.trim(),
					items: s.items_str
						.split(',')
						.map((x) => x.trim())
						.filter(Boolean),
					display_order: i,
				}));

			const filtered_langs = languages
				.filter((l) => l.name.trim() && l.level.trim())
				.map((l, i) => ({ ...l, display_order: i }));

			await api.put('/api/admin/cv', {
				experiences: filtered_exp,
				education: filtered_edu,
				skill_categories: filtered_skills,
				languages: filtered_langs,
				cv_meta: { pdf_url },
			});

			// State'i de filtrelenmiş haliyle güncelle (boş satırlar temizlensin)
			experiences = filtered_exp;
			education = filtered_edu;
			skill_categories = filtered_skills.map((s) => ({ ...s, items_str: s.items.join(', ') }));
			languages = filtered_langs;

			show_toast('success', 'Kaydedildi');
		} catch (err: any) {
			let msg = err.message ?? 'Kaydedilemedi';
			if (err.data?.issues?.fieldErrors) {
				const fields = Object.keys(err.data.issues.fieldErrors);
				if (fields.length > 0) {
					msg = `Doğrulama hatası: ${fields.join(', ')} alan(lar)ında eksik/hatalı bilgi var.`;
				}
			}
			show_toast('error', msg);
		} finally {
			saving = false;
		}
	}
</script>

<div class="admin-page">
	<div class="page-header">
		<h1>Özgeçmiş</h1>
		<button class="btn primary" onclick={save} disabled={saving}>
			{saving ? 'Kaydediliyor…' : 'Tümünü Kaydet'}
		</button>
	</div>

	{#if loading}
		<p>Yükleniyor…</p>
	{:else}
		<div class="section-card">
			<h3>
				PDF Dosyası
			</h3>
			<FileUpload current_url={pdf_url} accept="application/pdf" on_change={(url) => (pdf_url = url)} />
		</div>

		<div class="section-card">
			<h3>
				Deneyim
				<button class="btn small" onclick={add_exp}>+ Ekle</button>
			</h3>

			{#each experiences as exp, idx}
				<div class="row-card">
					<div class="grid-2">
						<input type="text" placeholder="Pozisyon" bind:value={exp.title} />
						<input type="text" placeholder="Şirket" bind:value={exp.company} />
					</div>
					<div class="grid-2">
						<input type="text" placeholder="Başlangıç (ör: 2021)" bind:value={exp.period_start} />
						<input type="text" placeholder="Bitiş (boş = günümüz)" bind:value={exp.period_end} />
					</div>
					<textarea placeholder="Açıklama" bind:value={exp.description} rows="2"></textarea>
					<div class="row-actions">
						<button class="btn small danger" onclick={() => (experiences = experiences.filter((_, i) => i !== idx))}>
							Sil
						</button>
					</div>
				</div>
			{/each}
		</div>

		<div class="section-card">
			<h3>
				Eğitim
				<button class="btn small" onclick={add_edu}>+ Ekle</button>
			</h3>

			{#each education as edu, idx}
				<div class="row-card">
					<div class="grid-2">
						<input type="text" placeholder="Derece / Bölüm" bind:value={edu.degree} />
						<input type="text" placeholder="Okul" bind:value={edu.school} />
					</div>
					<div class="grid-2">
						<input type="text" placeholder="Başlangıç" bind:value={edu.period_start} />
						<input type="text" placeholder="Bitiş" bind:value={edu.period_end} />
					</div>
					<div class="row-actions">
						<button class="btn small danger" onclick={() => (education = education.filter((_, i) => i !== idx))}>
							Sil
						</button>
					</div>
				</div>
			{/each}
		</div>

		<div class="section-card">
			<h3>
				Yetenek Kategorileri
				<button class="btn small" onclick={add_skill}>+ Ekle</button>
			</h3>

			{#each skill_categories as cat, idx}
				<div class="row-card">
					<input type="text" placeholder="Kategori (ör: Frontend)" bind:value={cat.name} />
					<input type="text" placeholder="Yetenekler (virgülle ayır)" bind:value={cat.items_str} />
					<div class="row-actions">
						<button class="btn small danger" onclick={() => (skill_categories = skill_categories.filter((_, i) => i !== idx))}>
							Sil
						</button>
					</div>
				</div>
			{/each}
		</div>

		<div class="section-card">
			<h3>
				Diller
				<button class="btn small" onclick={add_lang}>+ Ekle</button>
			</h3>

			{#each languages as lang, idx}
				<div class="row-card">
					<div class="grid-2">
						<input type="text" placeholder="Dil" bind:value={lang.name} />
						<input type="text" placeholder="Seviye" bind:value={lang.level} />
					</div>
					<div class="row-actions">
						<button class="btn small danger" onclick={() => (languages = languages.filter((_, i) => i !== idx))}>
							Sil
						</button>
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
</style>
