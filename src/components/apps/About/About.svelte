<script lang="ts">
	import { preferences } from '🍎/state/preferences.svelte.ts';
	import GithubIcon from '~icons/mdi/github';
	import LinkedinIcon from '~icons/mdi/linkedin';
	import EmailIcon from '~icons/mdi/email-outline';
	import LocationIcon from '~icons/mdi/map-marker-outline';
	import CodeIcon from '~icons/mdi/code-tags';

	function external(node: HTMLAnchorElement) {
		node.rel = 'noopener noreferrer';
		node.target = '_blank';
	}
</script>

<section class="container">
	<header class="titlebar app-window-drag-handle">
		<span>Hakkımda</span>
	</header>

	<aside class:light={preferences.theme.scheme === 'light'}>
		<nav>
			<a href="https://github.com/mustafakrpk" use:external> <GithubIcon /> GitHub </a>
			<a href="https://www.linkedin.com/in/krpkmustafa/" use:external>
				<LinkedinIcon /> LinkedIn
			</a>
			<a href="mailto:e.turgut@erkpa.com.tr" use:external> <EmailIcon /> E-posta </a>

			<hr />

			<div class="info-row"><LocationIcon /> Türkiye</div>
			<div class="info-row"><CodeIcon /> Yazılım Geliştirici</div>
		</nav>
	</aside>

	<section class="content">
		<div class="avatar">MK</div>

		<h1>Merhaba, ben Mustafa 👋</h1>

		<h2>Yazılım geliştirici</h2>

		<p>
			Modern web teknolojileriyle kullanıcı dostu, performanslı ve estetik arayüzler geliştiriyorum.
			Frontend tarafında <strong>Svelte</strong>, <strong>React</strong> ve <strong>TypeScript</strong>
			ile çalışmayı seviyorum.
		</p>

		<p>
			Backend tarafında <strong>Node.js</strong> ile API'ler yazıyor, veritabanı tasarımı ve
			DevOps süreçleriyle ilgileniyorum. Yeni teknolojileri öğrenip projelerime entegre etmek
			beni heyecanlandırıyor.
		</p>

		<p>
			Bu site, klasik bir portfolyo yerine sana <strong>macOS masaüstü deneyimi</strong>
			yaşatıyor. Dock'tan veya masaüstündeki klasörlerden istediğin uygulamayı açabilir,
			projelerime ve özgeçmişime göz atabilirsin.
		</p>
	</section>
</section>

<style>
	.container {
		--color: var(--system-color-light-hsl);

		display: grid;
		grid-template-columns: 14rem 1fr;
		grid-template-rows: 3rem 1fr;

		border-radius: inherit;
		overflow: hidden;

		background-image: linear-gradient(
			to right,
			hsla(var(--color), 0.7) 14rem,
			hsla(var(--color), 1) 14rem 100%
		);

		transition: --color 200ms ease-in;

		color: var(--system-color-dark);
	}

	.titlebar {
		grid-area: 1 / 1 / span 1 / span 2;

		display: flex;
		justify-content: center;
		align-items: center;

		z-index: 1;

		padding: 0.9rem 1rem;

		width: 100%;

		border-top-left-radius: inherit;
		border-top-right-radius: inherit;

		user-select: none;

		span {
			color: hsla(var(--system-color-dark-hsl), 0.8);
			font-weight: 500;
			font-size: 0.9rem;
			letter-spacing: 0.5px;
		}
	}

	aside {
		grid-area: 1 / 1 / span 2 / span 1;

		transform: translateZ(0);

		height: calc(100% - 2.7px);
		width: calc(14rem - 2.27px);

		margin: 1.8px 0 0 1.8px;

		border-top-left-radius: 0.5rem;
		border-bottom-left-radius: inherit;

		&::before {
			content: '';
			width: inherit;
			height: inherit;
			border-radius: inherit;
			position: fixed;
			left: 0;
			top: 0;
			z-index: -1;
			backdrop-filter: blur(12px);
		}

		nav {
			display: flex;
			flex-direction: column;
			gap: 0.2rem;
			margin: 4rem 0.6rem;

			hr {
				display: block;
				width: 100%;
				height: 1px;
				background-color: hsla(var(--system-color-dark-hsl), 0.2);
				border: none;
				margin: 0.6rem 0;
			}

			a,
			.info-row {
				display: flex;
				gap: 0.5rem;
				align-items: center;
				color: hsla(var(--system-color-dark-hsl), 0.9);
				text-decoration: none;
				font-weight: 400;
				padding: 0.5rem 0.5rem;
				border-radius: 0.4rem;
				font-size: 0.9rem;
			}

			a {
				transition: background-color 100ms ease;

				&:hover {
					background-color: hsla(var(--system-color-dark-hsl), 0.15);
				}
			}

			.info-row {
				color: hsla(var(--system-color-dark-hsl), 0.65);
				font-size: 0.85rem;
			}
		}
	}

	.content {
		grid-area: 2 / 2 / span 1 / span 1;

		display: flex;
		flex-direction: column;
		align-items: flex-start;

		padding: 2rem 2.5rem;
		overflow-y: auto;
	}

	.avatar {
		width: 7rem;
		height: 7rem;
		border-radius: 50%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2.5rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		margin-bottom: 1.2rem;
		box-shadow: 0 8px 24px hsla(0, 0%, 0%, 0.15);
	}

	h1 {
		font-size: 2.2rem;
		line-height: 1.2;
		margin: 0 0 0.3rem 0;
	}

	h2 {
		font-size: 1.1rem;
		line-height: 1.2;
		font-weight: 400;
		color: hsla(var(--system-color-dark-hsl), 0.65);
		margin: 0 0 1.5rem 0;
	}

	p {
		line-height: 1.6;
		margin: 0 0 1rem 0;
		font-size: 0.95rem;

		strong {
			font-weight: 600;
			color: hsla(var(--system-color-dark-hsl), 1);
		}
	}
</style>
