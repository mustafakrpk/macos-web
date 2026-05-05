<script lang="ts">
	import { onMount } from 'svelte';
	import { api } from '🍎/lib/api.ts';
	import './admin.css';
	import LoginPage from './LoginPage.svelte';
	import AdminLayout from './AdminLayout.svelte';
	import Dashboard from './Dashboard.svelte';
	import AboutAdmin from './AboutAdmin.svelte';
	import ProjectsAdmin from './ProjectsAdmin.svelte';
	import CVAdmin from './CVAdmin.svelte';
	import MessagesAdmin from './MessagesAdmin.svelte';

	type Me = { id: number; username: string; avatar_url: string | null };

	let me = $state<Me | null>(null);
	let auth_loading = $state(true);
	let path = $state(window.location.pathname);

	onMount(() => {
		const handle_pop = () => (path = window.location.pathname);
		window.addEventListener('popstate', handle_pop);
		return () => window.removeEventListener('popstate', handle_pop);
	});

	$effect(() => {
		api
			.get<{ user: Me | null }>('/api/auth/me')
			.then((res) => {
				me = res.user;
				auth_loading = false;
			})
			.catch(() => {
				me = null;
				auth_loading = false;
			});
	});

	export function navigate(to: string) {
		window.history.pushState({}, '', to);
		path = to;
	}

	async function logout() {
		await api.post('/api/auth/logout');
		me = null;
		navigate('/admin/login');
	}
</script>

{#if auth_loading}
	<div class="loading">Kontrol ediliyor…</div>
{:else if !me}
	<LoginPage />
{:else}
	<AdminLayout user={me} {path} on_logout={logout} on_navigate={navigate}>
		{#if path === '/admin' || path === '/admin/'}
			<Dashboard {navigate} />
		{:else if path.startsWith('/admin/about')}
			<AboutAdmin />
		{:else if path.startsWith('/admin/projects')}
			<ProjectsAdmin />
		{:else if path.startsWith('/admin/cv')}
			<CVAdmin />
		{:else if path.startsWith('/admin/messages')}
			<MessagesAdmin />
		{:else}
			<div class="empty">Sayfa bulunamadı.</div>
		{/if}
	</AdminLayout>
{/if}

<style>
	/* Admin sayfasında masaüstü stillerini override et — scroll çalışsın */
	:global(html),
	:global(body) {
		height: auto !important;
		overflow: auto !important;
	}

	:global(body) {
		margin: 0;
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		background-color: #f5f5f7;
		color: #1d1d1f;
		cursor: auto;
	}

	:global(#root) {
		height: auto;
	}

	.loading,
	.empty {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		color: #6e6e73;
	}
</style>
