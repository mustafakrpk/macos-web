import { mount } from 'svelte';
import './css/global.css';

const target = document.getElementById('root');
if (!target) throw new Error('Root element not found');

if (window.location.pathname.startsWith('/admin')) {
	import('./components/admin/Admin.svelte').then(({ default: Admin }) => {
		mount(Admin, { target });
	});
} else {
	import('./components/Desktop/Desktop.svelte').then(({ default: Desktop }) => {
		mount(Desktop, { target });
	});
}
