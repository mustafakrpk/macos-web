<script lang="ts">
	import GithubIcon from '~icons/mdi/github';
	import LinkedinIcon from '~icons/mdi/linkedin';
	import EmailIcon from '~icons/mdi/email-outline';
	import OpenIcon from '~icons/mdi/open-in-new';

	const links = [
		{
			name: 'GitHub',
			handle: '@mustafakrpk',
			url: 'https://github.com/mustafakrpk',
			color: '#24292e',
			icon: GithubIcon,
		},
		{
			name: 'LinkedIn',
			handle: 'krpkmustafa',
			url: 'https://www.linkedin.com/in/krpkmustafa/',
			color: '#0a66c2',
			icon: LinkedinIcon,
		},
		{
			name: 'E-posta',
			handle: 'muskirp42@gmail.com',
			url: 'mailto:muskirp42@gmail.com',
			color: '#ea4335',
			icon: EmailIcon,
		},
	];

	function external(node: HTMLAnchorElement) {
		node.rel = 'noopener noreferrer';
		node.target = '_blank';
	}
</script>

<section class="container">
	<header class="titlebar app-window-drag-handle">
		<span>Sosyal Medya</span>
	</header>

	<div class="content">
		<h1>Beni takip et</h1>
		<p class="subtitle">
			Aşağıdaki platformlardan birini seçerek bana ulaşabilir veya çalışmalarımı takip edebilirsin.
		</p>

		<div class="grid">
			{#each links as link}
				<a class="card" href={link.url} use:external style:--accent={link.color}>
					<div class="icon">
						<link.icon />
					</div>
					<div class="info">
						<div class="name">{link.name}</div>
						<div class="handle">{link.handle}</div>
					</div>
					<OpenIcon class="arrow" />
				</a>
			{/each}
		</div>
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

	.content {
		padding: 2rem 2.5rem;

		h1 {
			font-size: 2rem;
			margin: 0 0 0.4rem 0;
		}
	}

	.subtitle {
		color: hsla(var(--system-color-dark-hsl), 0.6);
		margin: 0 0 2rem 0;
		font-size: 0.95rem;
	}

	.grid {
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
	}

	.card {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem 1.2rem;
		background-color: hsla(var(--system-color-dark-hsl), 0.04);
		border: 1px solid hsla(var(--system-color-dark-hsl), 0.08);
		border-radius: 0.7rem;
		text-decoration: none;
		color: inherit;
		transition:
			transform 0.15s ease,
			background-color 0.15s ease;

		&:hover {
			background-color: hsla(var(--system-color-dark-hsl), 0.07);
			transform: translateX(2px);
		}
	}

	.icon {
		width: 44px;
		height: 44px;
		border-radius: 0.5rem;
		background-color: var(--accent);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.4rem;
		flex-shrink: 0;
	}

	.info {
		flex: 1;

		.name {
			font-weight: 600;
			font-size: 1rem;
			margin-bottom: 0.1rem;
		}

		.handle {
			font-size: 0.85rem;
			color: hsla(var(--system-color-dark-hsl), 0.6);
		}
	}

	:global(.arrow) {
		color: hsla(var(--system-color-dark-hsl), 0.4);
	}
</style>
