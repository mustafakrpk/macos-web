<script lang="ts">
	const {
		message,
		kind = 'success',
	}: {
		message: string;
		kind?: 'success' | 'error' | 'info';
	} = $props();
</script>

{#if message}
	<div class="toast {kind}">{message}</div>
{/if}
