<script lang="ts">
	import FinderIcon from '~icons/mdi/folder-multiple-outline';
	import AboutIcon from '~icons/mdi/account-circle-outline';
	import ProjectsIcon from '~icons/mdi/rocket-launch-outline';
	import NotesIcon from '~icons/mdi/file-document-outline';
	import MailIcon from '~icons/mdi/email-outline';
	import SafariIcon from '~icons/mdi/share-variant-outline';
	import CodeIcon from '~icons/mdi/code-tags';
	import TerminalIcon from '~icons/mdi/console';
	import BlogIcon from '~icons/mdi/post-outline';
	import CalendarIcon from '~icons/mdi/calendar-blank-outline';
	import CalculatorIcon from '~icons/mdi/calculator';
	import WallpaperIcon from '~icons/mdi/image-multiple-outline';
	import GithubIcon from '~icons/mdi/github';
	import LinkedinIcon from '~icons/mdi/linkedin';
	import HelpIcon from '~icons/mdi/help-circle-outline';

	import type { AppID } from '🍎/state/apps.svelte.ts';

	const {
		app_id,
		size = 56,
	}: {
		app_id: AppID | string;
		size?: number | string;
	} = $props();

	type IconConfig = {
		icon: any;
		gradient: string;
	};

	const config: Record<string, IconConfig> = {
		finder: {
			icon: FinderIcon,
			gradient: 'linear-gradient(135deg, #5fb6ff 0%, #2e7dde 100%)',
		},
		'purus-twitter': {
			icon: AboutIcon,
			gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
		},
		appstore: {
			icon: ProjectsIcon,
			gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
		},
		notes: {
			icon: NotesIcon,
			gradient: 'linear-gradient(135deg, #fce38a 0%, #f38181 100%)',
		},
		mail: {
			icon: MailIcon,
			gradient: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
		},
		safari: {
			icon: SafariIcon,
			gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
		},
		vscode: {
			icon: CodeIcon,
			gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
		},
		terminal: {
			icon: TerminalIcon,
			gradient: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
		},
		messages: {
			icon: BlogIcon,
			gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
		},
		calendar: {
			icon: CalendarIcon,
			gradient: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
		},
		calculator: {
			icon: CalculatorIcon,
			gradient: 'linear-gradient(135deg, #4b4b4b 0%, #1a1a1a 100%)',
		},
		wallpapers: {
			icon: WallpaperIcon,
			gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
		},
		'view-source': {
			icon: GithubIcon,
			gradient: 'linear-gradient(135deg, #2d2d2d 0%, #000000 100%)',
		},
		vercel: {
			icon: LinkedinIcon,
			gradient: 'linear-gradient(135deg, #0a66c2 0%, #004182 100%)',
		},
	};

	const entry = $derived(config[app_id] ?? { icon: HelpIcon, gradient: 'linear-gradient(135deg, #888, #555)' });

	const px_size = $derived(typeof size === 'number' ? `${size}px` : size);
</script>

<div
	class="app-icon"
	style:width={px_size}
	style:height={px_size}
	style:background={entry.gradient}
>
	<entry.icon />
</div>

<style>
	.app-icon {
		border-radius: 22%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		flex-shrink: 0;
		box-shadow:
			0 2px 4px hsla(0, 0%, 0%, 0.1),
			inset 0 0 0 0.5px hsla(0, 0%, 100%, 0.15);
	}

	.app-icon :global(svg) {
		width: 58%;
		height: 58%;
		filter: drop-shadow(0 1px 1px hsla(0, 0%, 0%, 0.15));
	}
</style>
