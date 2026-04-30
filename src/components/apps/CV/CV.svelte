<script lang="ts">
	import BriefcaseIcon from '~icons/mdi/briefcase-outline';
	import SchoolIcon from '~icons/mdi/school-outline';
	import StarIcon from '~icons/mdi/star-four-points-outline';
	import LanguageIcon from '~icons/mdi/translate';
	import DownloadIcon from '~icons/mdi/download';

	type Experience = {
		title: string;
		company: string;
		period: string;
		description: string;
	};

	type Education = {
		degree: string;
		school: string;
		period: string;
	};

	const experiences: Experience[] = [
		{
			title: 'Yazılım Geliştirici',
			company: 'Şirket Adı',
			period: '2023 - Günümüz',
			description:
				'Modern web uygulamaları geliştirme, frontend mimarisi tasarımı ve performans optimizasyonu üzerine çalışmalar.',
		},
		{
			title: 'Junior Developer',
			company: 'Önceki Şirket',
			period: '2021 - 2023',
			description:
				'React ve Node.js tabanlı projelerde aktif rol aldım. REST API tasarımı ve uygulaması.',
		},
	];

	const education: Education[] = [
		{
			degree: 'Lisans — Bilgisayar Mühendisliği',
			school: 'Üniversite Adı',
			period: '2017 - 2021',
		},
	];

	const skills = {
		Frontend: ['Svelte', 'React', 'Vue', 'TypeScript', 'HTML/CSS', 'Tailwind'],
		Backend: ['Node.js', 'Express', 'REST API', 'PostgreSQL', 'MongoDB'],
		Araçlar: ['Git', 'Docker', 'Vite', 'Webpack', 'Linux', 'CI/CD'],
	};

	const languages = [
		{ name: 'Türkçe', level: 'Anadil' },
		{ name: 'İngilizce', level: 'İleri Düzey' },
	];
</script>

<section class="container">
	<header class="titlebar app-window-drag-handle">
		<span>Özgeçmiş</span>
	</header>

	<div class="page">
		<div class="hero">
			<h1>Mustafa Kırpık</h1>
			<h2>Yazılım Geliştirici</h2>
			<button class="download-btn">
				<DownloadIcon /> PDF olarak indir
			</button>
		</div>

		<section class="block">
			<h3><BriefcaseIcon /> Deneyim</h3>
			<div class="timeline">
				{#each experiences as exp}
					<article class="timeline-item">
						<div class="dot"></div>
						<div class="meta">
							<div class="period">{exp.period}</div>
							<h4>{exp.title}</h4>
							<div class="company">{exp.company}</div>
							<p>{exp.description}</p>
						</div>
					</article>
				{/each}
			</div>
		</section>

		<section class="block">
			<h3><SchoolIcon /> Eğitim</h3>
			<div class="timeline">
				{#each education as edu}
					<article class="timeline-item">
						<div class="dot"></div>
						<div class="meta">
							<div class="period">{edu.period}</div>
							<h4>{edu.degree}</h4>
							<div class="company">{edu.school}</div>
						</div>
					</article>
				{/each}
			</div>
		</section>

		<section class="block">
			<h3><StarIcon /> Yetenekler</h3>
			<div class="skills-grid">
				{#each Object.entries(skills) as [category, items]}
					<div class="skill-cat">
						<h4>{category}</h4>
						<div class="tags">
							{#each items as tag}
								<span class="tag">{tag}</span>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</section>

		<section class="block">
			<h3><LanguageIcon /> Diller</h3>
			<div class="lang-list">
				{#each languages as lang}
					<div class="lang-item">
						<strong>{lang.name}</strong>
						<span>{lang.level}</span>
					</div>
				{/each}
			</div>
		</section>
	</div>
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
		transition: background-color 0.15s ease;

		&:hover {
			background-color: hsl(210, 100%, 45%);
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
