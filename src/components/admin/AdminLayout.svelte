<script lang="ts">
	import type { Snippet } from 'svelte';
	import HomeIcon from '~icons/mdi/view-dashboard-outline';
	import AboutIcon from '~icons/mdi/account-outline';
	import ProjectsIcon from '~icons/mdi/folder-multiple-outline';
	import CVIcon from '~icons/mdi/file-document-outline';
	import MessagesIcon from '~icons/mdi/email-outline';
	import LogoutIcon from '~icons/mdi/logout';
	import OpenIcon from '~icons/mdi/open-in-new';

	type User = { id: number; username: string; avatar_url: string | null };

	const {
		user,
		path,
		on_logout,
		on_navigate,
		children,
	}: {
		user: User;
		path: string;
		on_logout: () => void;
		on_navigate: (to: string) => void;
		children: Snippet;
	} = $props();

	const items = [
		{ to: '/admin', label: 'Genel Bakış', icon: HomeIcon, exact: true },
		{ to: '/admin/about', label: 'Hakkımda', icon: AboutIcon },
		{ to: '/admin/projects', label: 'Projeler', icon: ProjectsIcon },
		{ to: '/admin/cv', label: 'Özgeçmiş', icon: CVIcon },
		{ to: '/admin/messages', label: 'Mesajlar', icon: MessagesIcon },
	];

	function is_active(item: (typeof items)[number]): boolean {
		if (item.exact) return path === item.to || path === item.to + '/';
		return path.startsWith(item.to);
	}

	function nav(e: MouseEvent, to: string) {
		e.preventDefault();
		on_navigate(to);
	}
</script>

<div class="shell">
	<aside class="sidebar">
		<div class="brand">Yönetim</div>

		<nav>
			{#each items as item}
				<a
					href={item.to}
					class="nav-link"
					class:active={is_active(item)}
					onclick={(e) => nav(e, item.to)}
				>
					<item.icon /> {item.label}
				</a>
			{/each}
		</nav>

		<div class="bottom">
			<a href="/" class="nav-link" target="_blank" rel="noopener"><OpenIcon /> Siteyi gör</a>

			<div class="user">
				{#if user.avatar_url}
					<img src={user.avatar_url} alt={user.username} />
				{/if}
				<span>{user.username}</span>
			</div>

			<button class="logout" onclick={on_logout}><LogoutIcon /> Çıkış</button>
		</div>
	</aside>

	<main class="content">
		{@render children()}
	</main>
</div>

<style>
	.shell {
		display: grid;
		grid-template-columns: 240px 1fr;
		min-height: 100vh;
	}

	.sidebar {
		background: white;
		border-right: 1px solid #e5e5e7;
		padding: 1.5rem 0.8rem;
		display: flex;
		flex-direction: column;
		position: sticky;
		top: 0;
		height: 100vh;
		align-self: start;
	}

	.brand {
		font-size: 0.95rem;
		font-weight: 700;
		color: #6e6e73;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 0 0.8rem;
		margin-bottom: 1.5rem;
	}

	nav {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.nav-link {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		padding: 0.6rem 0.8rem;
		border-radius: 0.4rem;
		color: #1d1d1f;
		text-decoration: none;
		font-size: 0.92rem;
		transition: background 0.1s;
	}

	.nav-link:hover {
		background: #f5f5f7;
	}

	.nav-link.active {
		background: linear-gradient(135deg, #667eea, #764ba2);
		color: white;
	}

	.bottom {
		margin-top: auto;
		padding-top: 1rem;
		border-top: 1px solid #e5e5e7;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.user {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.5rem 0.8rem;
		font-size: 0.85rem;
		color: #6e6e73;
	}

	.user img {
		width: 1.8rem;
		height: 1.8rem;
		border-radius: 50%;
	}

	.logout {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.55rem 0.8rem;
		background: none;
		border: 1px solid #e5e5e7;
		border-radius: 0.4rem;
		color: #1d1d1f;
		font-size: 0.85rem;
		cursor: pointer;
	}

	.logout:hover {
		background: #f5f5f7;
	}

	.content {
		padding: 2rem 2.5rem;
		max-width: 1100px;
		width: 100%;
		box-sizing: border-box;
	}
</style>
