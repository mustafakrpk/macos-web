<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	const {
		is_being_dragged,
	}: {
		is_being_dragged: boolean;
	} = $props();

	const STORAGE_KEY = 'mk_codepen_v1';

	const DEFAULT_HTML = `<div class="card">
  <h1>👋 Merhaba!</h1>
  <p>Bu canlı bir <strong>HTML/CSS/JS</strong> editörüdür.</p>
  <button id="btn">Bana tıkla</button>
  <p id="output"></p>
</div>`;

	const DEFAULT_CSS = `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  display: grid;
  place-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea, #764ba2);
}
.card {
  background: white;
  padding: 2rem 2.5rem;
  border-radius: 1rem;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  text-align: center;
}
h1 { margin-top: 0; }
button {
  padding: 0.6rem 1.2rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 0.4rem;
  cursor: pointer;
  font-size: 0.95rem;
}
button:hover { background: #5568d3; }
#output { color: #667eea; font-weight: 600; min-height: 1.5em; margin: 1rem 0 0; }`;

	const DEFAULT_JS = `const btn = document.getElementById('btn');
const output = document.getElementById('output');
let count = 0;

btn.addEventListener('click', () => {
  count++;
  output.textContent = \`\${count} kere tıkladın 🎉\`;
});`;

	type Tab = 'html' | 'css' | 'js';

	let html = $state(DEFAULT_HTML);
	let css = $state(DEFAULT_CSS);
	let js = $state(DEFAULT_JS);
	let active_tab = $state<Tab>('html');
	let auto_run = $state(true);
	let console_logs = $state<string[]>([]);

	// HTML/CSS/JS tag'leri Svelte preprocessor'ün karışmaması için \x3C ile yazılır
	const srcdoc = $derived(
		[
			'\x3C!DOCTYPE html>',
			'\x3Chtml lang="tr">\x3Chead>\x3Cmeta charset="UTF-8">',
			'\x3Cstyle>',
			css,
			'\x3C/style>\x3C/head>\x3Cbody>',
			html,
			'\x3Cscript>',
			'(function(){',
			'const _log=console.log;',
			'console.log=function(...args){_log.apply(console,args);try{parent.postMessage({type:"codepen-log",text:args.map(a=>typeof a==="object"?JSON.stringify(a):String(a)).join(" ")},"*");}catch(e){}};',
			'window.addEventListener("error",function(e){parent.postMessage({type:"codepen-log",text:"❌ "+e.message},"*");});',
			'try{',
			js,
			'}catch(err){parent.postMessage({type:"codepen-log",text:"❌ "+err.message},"*");}',
			'})();',
			'\x3C/script>\x3C/body>\x3C/html>',
		].join(''),
	);

	let run_timer = 0;
	function schedule_run() {
		if (!auto_run) return;
		clearTimeout(run_timer);
		run_timer = window.setTimeout(run, 500);
	}

	function run() {
		console_logs = [];
		// srcdoc otomatik güncelleneceği için ek bir şey yapmayız
	}

	function reset() {
		if (!confirm('Tüm kodu varsayılana sıfırlamak ister misin?')) return;
		html = DEFAULT_HTML;
		css = DEFAULT_CSS;
		js = DEFAULT_JS;
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch {
			// noop
		}
	}

	function on_keydown(e: KeyboardEvent) {
		// Tab tuşunu textarea içinde göm
		if (e.key === 'Tab') {
			e.preventDefault();
			const ta = e.currentTarget as HTMLTextAreaElement;
			const start = ta.selectionStart;
			const end = ta.selectionEnd;
			const value = ta.value;
			ta.value = value.substring(0, start) + '  ' + value.substring(end);
			ta.selectionStart = ta.selectionEnd = start + 2;
			// state'i güncelle
			if (active_tab === 'html') html = ta.value;
			else if (active_tab === 'css') css = ta.value;
			else js = ta.value;
		}
	}

	const current_value = $derived(active_tab === 'html' ? html : active_tab === 'css' ? css : js);

	function on_input(e: Event) {
		const v = (e.target as HTMLTextAreaElement).value;
		if (active_tab === 'html') html = v;
		else if (active_tab === 'css') css = v;
		else js = v;
		schedule_run();
	}

	function on_message(e: MessageEvent) {
		if (e.data?.type === 'codepen-log') {
			console_logs = [...console_logs, String(e.data.text)].slice(-50);
		}
	}

	onMount(() => {
		// localStorage'dan yükle
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) {
				const data = JSON.parse(saved);
				if (typeof data.html === 'string') html = data.html;
				if (typeof data.css === 'string') css = data.css;
				if (typeof data.js === 'string') js = data.js;
			}
		} catch {
			// noop
		}

		window.addEventListener('message', on_message);
	});

	// Her değişiklikte localStorage'a yaz
	$effect(() => {
		const data = { html, css, js };
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
		} catch {
			// noop
		}
	});

	onDestroy(() => {
		window.removeEventListener('message', on_message);
		clearTimeout(run_timer);
	});

	const tabs: { id: Tab; label: string; color: string }[] = [
		{ id: 'html', label: 'HTML', color: '#e44d26' },
		{ id: 'css', label: 'CSS', color: '#2965f1' },
		{ id: 'js', label: 'JS', color: '#f0db4f' },
	];
</script>

<section class="container">
	<header class="titlebar app-window-drag-handle">
		<span>Kod & Yetenekler — Canlı Editör</span>
	</header>

	<div class="layout">
		<div class="editor-pane">
			<div class="tabs">
				{#each tabs as t}
					<button
						class="tab"
						class:active={active_tab === t.id}
						onclick={() => (active_tab = t.id)}
					>
						<span class="dot" style:background={t.color}></span>
						{t.label}
					</button>
				{/each}

				<div class="spacer"></div>

				<label class="auto-run">
					<input type="checkbox" bind:checked={auto_run} />
					Otomatik
				</label>
				<button class="action-btn" onclick={run} title="Çalıştır (sağ panel yenilenir)">▶</button>
				<button class="action-btn" onclick={reset} title="Sıfırla">⟲</button>
			</div>

			<textarea
				value={current_value}
				oninput={on_input}
				onkeydown={on_keydown}
				spellcheck="false"
				autocomplete="off"
				autocapitalize="off"
			></textarea>

			{#if console_logs.length > 0}
				<div class="console">
					<div class="console-head">
						<span>Konsol</span>
						<button onclick={() => (console_logs = [])}>Temizle</button>
					</div>
					<div class="console-body">
						{#each console_logs as log}
							<div class="log-line">{log}</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<div class="preview-pane" class:dragging={is_being_dragged}>
			<div class="preview-head">Önizleme</div>
			<iframe
				{srcdoc}
				title="Canlı önizleme"
				sandbox="allow-scripts allow-modals"
			></iframe>
		</div>
	</div>
</section>

<style>
	.container {
		background: #1e1e1e;
		color: #d4d4d4;
		border-radius: inherit;
		overflow: hidden;
		height: 100%;
		display: flex;
		flex-direction: column;
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
	}

	.titlebar {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 0.65rem 1rem;
		background: #252526;
		border-bottom: 1px solid #1a1a1a;
		font-size: 0.78rem;
		color: rgba(255, 255, 255, 0.7);
		user-select: none;
		flex-shrink: 0;
	}

	.layout {
		display: grid;
		grid-template-columns: 1fr 1fr;
		flex: 1;
		min-height: 0;
	}

	@media (max-width: 700px) {
		.layout {
			grid-template-columns: 1fr;
			grid-template-rows: 1fr 1fr;
		}
	}

	.editor-pane {
		display: grid;
		grid-template-rows: auto 1fr auto;
		border-right: 1px solid #1a1a1a;
		min-height: 0;
		overflow: hidden;
	}

	.tabs {
		display: flex;
		align-items: center;
		gap: 0.2rem;
		padding: 0.3rem 0.4rem;
		background: #2d2d30;
		border-bottom: 1px solid #1a1a1a;
		flex-shrink: 0;
	}

	.tab {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.35rem 0.7rem;
		background: none;
		border: none;
		color: rgba(255, 255, 255, 0.55);
		font-size: 0.78rem;
		font-family: inherit;
		cursor: pointer;
		border-radius: 0.3rem;
		transition: background 0.1s;
	}

	.tab:hover {
		background: rgba(255, 255, 255, 0.05);
		color: rgba(255, 255, 255, 0.85);
	}

	.tab.active {
		background: #1e1e1e;
		color: #fff;
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}

	.spacer {
		flex: 1;
	}

	.auto-run {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.72rem;
		color: rgba(255, 255, 255, 0.6);
	}

	.auto-run input {
		width: 0.85rem;
		height: 0.85rem;
	}

	.action-btn {
		background: none;
		border: 1px solid #444;
		color: rgba(255, 255, 255, 0.7);
		padding: 0.2rem 0.5rem;
		border-radius: 0.25rem;
		cursor: pointer;
		font-size: 0.75rem;
	}

	.action-btn:hover {
		background: rgba(255, 255, 255, 0.08);
		color: white;
	}

	textarea {
		width: 100%;
		height: 100%;
		background: #1e1e1e;
		color: #d4d4d4;
		border: none;
		outline: none;
		resize: none;
		font-family: 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
		font-size: 0.82rem;
		line-height: 1.6;
		padding: 0.8rem 1rem;
		tab-size: 2;
	}

	.console {
		background: #181818;
		border-top: 1px solid #2a2a2a;
		max-height: 30%;
		display: flex;
		flex-direction: column;
	}

	.console-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.3rem 0.7rem;
		font-size: 0.7rem;
		color: rgba(255, 255, 255, 0.5);
		background: #1a1a1a;
	}

	.console-head button {
		background: none;
		border: none;
		color: rgba(255, 255, 255, 0.5);
		font-size: 0.7rem;
		cursor: pointer;
	}

	.console-head button:hover {
		color: white;
	}

	.console-body {
		overflow-y: auto;
		padding: 0.3rem 0.7rem 0.5rem;
	}

	.log-line {
		font-family: 'SF Mono', Menlo, monospace;
		font-size: 0.75rem;
		color: #b4d4f7;
		padding: 0.15rem 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.04);
		white-space: pre-wrap;
		word-break: break-word;
	}

	.preview-pane {
		display: grid;
		grid-template-rows: auto 1fr;
		min-height: 0;
		overflow: hidden;
	}

	.preview-head {
		padding: 0.4rem 0.8rem;
		background: #2d2d30;
		border-bottom: 1px solid #1a1a1a;
		font-size: 0.72rem;
		color: rgba(255, 255, 255, 0.55);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	iframe {
		width: 100%;
		height: 100%;
		border: none;
		background: white;
	}

	.preview-pane.dragging iframe {
		pointer-events: none;
	}
</style>
