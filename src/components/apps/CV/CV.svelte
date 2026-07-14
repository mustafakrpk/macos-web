<script lang="ts">
	import { api, parse_string_array, type PublicAbout, type PublicCV } from '🍎/lib/api.ts';
	import BriefcaseIcon from '~icons/mdi/briefcase-outline';
	import SchoolIcon from '~icons/mdi/school-outline';
	import StarIcon from '~icons/mdi/star-four-points-outline';
	import LanguageIcon from '~icons/mdi/translate';
	import DownloadIcon from '~icons/mdi/download';

	let cv = $state<PublicCV | null>(null);
	let about_data = $state<PublicAbout | null>(null);
	let loading = $state(true);
	let error_msg = $state<string | null>(null);

	$effect(() => {
		Promise.all([
			api.get<PublicCV>('/api/public/cv'),
			api.get<{ about: PublicAbout | null }>('/api/public/about'),
		])
			.then(([cv_res, about_res]) => {
				cv = {
					...cv_res,
					skill_categories: cv_res.skill_categories.map((s) => ({
						...s,
						items: parse_string_array(s.items),
					})),
				};
				about_data = about_res.about;
				loading = false;
			})
			.catch((err) => {
				error_msg = err.message ?? 'Yüklenemedi';
				loading = false;
			});
	});

	function format_period(start: string, end: string | null): string {
		if (!end) return `${start} - Günümüz`;
		if (start === end) return start;
		return `${start} - ${end}`;
	}
</script>

<section class="container">
	<header class="titlebar app-window-drag-handle">
		<span>Özgeçmiş</span>
	</header>

	{#if loading}
		<div class="state">Yükleniyor…</div>
	{:else if error_msg}
		<div class="state error">{error_msg}</div>
	{:else if cv}
		<div class="page">
			<div class="hero">
				<h1>{about_data?.full_name ?? 'Mustafa Kırpık'}</h1>
				<h2>{about_data?.title ?? 'Yazılım Geliştirici'}</h2>
				{#if cv.cv_meta?.pdf_url}
					<a class="download-btn" href={cv.cv_meta.pdf_url} download>
						<DownloadIcon /> PDF olarak indir
					</a>
				{/if}
			</div>

			{#if cv.experiences.length > 0}
				<section class="block">
					<h3><BriefcaseIcon /> Deneyim</h3>
					<div class="timeline">
						{#each cv.experiences as exp (exp.id)}
							<article class="timeline-item">
								<div class="dot"></div>
								<div class="meta">
									<div class="period">{format_period(exp.period_start, exp.period_end)}</div>
									<h4>{exp.title}</h4>
									<div class="company">{exp.company}</div>
									{#if exp.description}<p>{exp.description}</p>{/if}
								</div>
							</article>
						{/each}
					</div>
				</section>
			{/if}

			{#if cv.education.length > 0}
				<section class="block">
					<h3><SchoolIcon /> Eğitim</h3>
					<div class="timeline">
						{#each cv.education as edu (edu.id)}
							<article class="timeline-item">
								<div class="dot"></div>
								<div class="meta">
									<div class="period">{format_period(edu.period_start, edu.period_end)}</div>
									<h4>{edu.degree}</h4>
									<div class="company">{edu.school}</div>
								</div>
							</article>
						{/each}
					</div>
				</section>
			{/if}

			{#if cv.skill_categories.length > 0}
				<section class="block">
					<h3><StarIcon /> Yetenekler</h3>
					<div class="skills-grid">
						{#each cv.skill_categories as cat (cat.id)}
							<div class="skill-cat">
								<h4>{cat.name}</h4>
								<div class="tags">
									{#each cat.items as tag}
										<span class="tag">{tag}</span>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				</section>
			{/if}

			{#if cv.languages.length > 0}
				<section class="block">
					<h3><LanguageIcon /> Diller</h3>
					<div class="lang-list">
						{#each cv.languages as lang (lang.id)}
							<div class="lang-item">
								<strong>{lang.name}</strong>
								<span>{lang.level}</span>
							</div>
						{/each}
					</div>
				</section>
			{/if}
		</div>
	{/if}
</section>

<style>
	.container {
		background-color: var(--system-color-light);
		color: var(--system-color-light-contrast);
		border-radius: inherit;
		overflow-y: auto;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.titlebar {
		padding: 0.9rem 1rem;
		display: flex;
		justify-content: center;
		user-select: none;

		span {
			color: hsla(var(--system-color-dark-hsl), 0.8);
			font-weight: 500;
			font-size: 0.9rem;
			letter-spacing: 0.5px;
		}
	}

	.page {
		max-width: 720px;
		margin: 0 auto;
		padding: 1rem 2.5rem 3rem;
		width: 100%;
		box-sizing: border-box;
	}

	.hero {
		padding: 1rem 0 2rem;
		border-bottom: 1px solid hsla(var(--system-color-dark-hsl), 0.1);
		margin-bottom: 2rem;

		h1 {
			font-size: 2.4rem;
			margin: 0 0 0.2rem 0;
		}

		h2 {
			font-size: 1.1rem;
			font-weight: 400;
			color: hsla(var(--system-color-dark-hsl), 0.6);
			margin: 0 0 1.5rem 0;
		}
	}

	.download-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.6rem 1.1rem;
		background-color: hsl(210, 100%, 50%);
		color: white;
		border-radius: 0.4rem;
		font-size: 0.9rem;
		font-weight: 500;
		cursor: pointer;
		text-decoration: none;
		transition: background-color 0.15s ease;

		&:hover {
			background-color: hsl(210, 100%, 45%);
		}
	}

	.state {
		padding: 3rem 2rem;
		text-align: center;
		color: hsla(var(--system-color-dark-hsl), 0.55);

		&.error {
			color: hsl(0, 70%, 50%);
		}
	}

	.block {
		margin-bottom: 2.5rem;

		h3 {
			display: flex;
			align-items: center;
			gap: 0.5rem;
			font-size: 1.2rem;
			margin: 0 0 1.2rem 0;
			padding-bottom: 0.4rem;
			border-bottom: 1px solid hsla(var(--system-color-dark-hsl), 0.08);
		}
	}

	.timeline {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.timeline-item {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 1rem;
		position: relative;
	}

	.dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: linear-gradient(135deg, #667eea, #764ba2);
		margin-top: 0.45rem;
	}

	.meta {
		.period {
			font-size: 0.8rem;
			color: hsla(var(--system-color-dark-hsl), 0.55);
			margin-bottom: 0.2rem;
		}

		h4 {
			font-size: 1rem;
			margin: 0 0 0.2rem 0;
		}

		.company {
			font-size: 0.85rem;
			color: hsla(var(--system-color-dark-hsl), 0.7);
			margin-bottom: 0.5rem;
		}

		p {
			font-size: 0.88rem;
			line-height: 1.55;
			margin: 0;
			color: hsla(var(--system-color-dark-hsl), 0.75);
		}
	}

	.skills-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.2rem;
	}

	.skill-cat {
		h4 {
			font-size: 0.85rem;
			text-transform: uppercase;
			letter-spacing: 0.05em;
			color: hsla(var(--system-color-dark-hsl), 0.55);
			margin: 0 0 0.6rem 0;
		}
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
	}

	.tag {
		font-size: 0.78rem;
		padding: 0.25rem 0.6rem;
		background-color: hsla(var(--system-color-dark-hsl), 0.08);
		border-radius: 0.4rem;
	}

	.lang-list {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.lang-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.6rem 0.9rem;
		background-color: hsla(var(--system-color-dark-hsl), 0.04);
		border-radius: 0.4rem;
		font-size: 0.9rem;

		span {
			color: hsla(var(--system-color-dark-hsl), 0.6);
			font-size: 0.85rem;
		}
	}
</style>
