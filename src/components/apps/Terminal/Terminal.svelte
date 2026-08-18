<script lang="ts">
	import { onMount, tick } from 'svelte';
	import {
		api,
		parse_string_array,
		type GithubStats,
		type PublicAbout,
		type PublicCV,
		type PublicProject,
	} from '🍎/lib/api.ts';
	import { apps } from '🍎/state/apps.svelte.ts';

	type Line = { kind: 'cmd' | 'out' | 'err' | 'info'; text: string };

	let lines = $state<Line[]>([]);
	let current = $state('');
	let history = $state<string[]>([]);
	let history_idx = $state(-1);
	let scroll_el = $state<HTMLElement>();
	let input_el = $state<HTMLInputElement>();

	let about_data = $state<PublicAbout | null>(null);
	let projects = $state<PublicProject[]>([]);
	let cv = $state<PublicCV | null>(null);
	let gh_stats = $state<GithubStats | null>(null);

	const prompt = 'mustafa@portfolyo:~$';

	const commands: Record<
		string,
		{ desc: string; run: (args: string[]) => string | Promise<string> | void }
	> = {
		help: {
			desc: 'Tüm komutları listele',
			run: () => {
				const max = Math.max(...Object.keys(commands).map((k) => k.length));
				return Object.entries(commands)
					.map(([k, v]) => `  ${k.padEnd(max + 2)}${v.desc}`)
					.join('\n');
			},
		},
		whoami: {
			desc: 'Sahibinin kim olduğunu söyler',
			run: () =>
				about_data
					? `${about_data.full_name} — ${about_data.title}\n📍 ${about_data.location ?? '?'}`
					: 'Mustafa Kırpık — Yazılım Geliştirici',
		},
		about: {
			desc: 'Hakkımda yazısı',
			run: () => about_data?.intro_md.replace(/\*\*(.+?)\*\*/g, '$1') ?? 'Yükleniyor…',
		},
		projects: {
			desc: 'Projeleri listeler — "projects <indeks>" ile detay',
			run: (args) => {
				if (projects.length === 0) return 'Henüz proje yok.';
				if (args[0]) {
					const idx = Number(args[0]) - 1;
					const p = projects[idx];
					if (!p) return `Proje #${args[0]} bulunamadı.`;
					const stack = parse_string_array(p.stack).join(', ');
					return [
						`${p.emoji}  ${p.title}`,
						'─'.repeat(40),
						p.description,
						'',
						`Stack:  ${stack}`,
						p.github_url ? `GitHub: ${p.github_url}` : '',
						p.live_url ? `Live:   ${p.live_url}` : '',
					]
						.filter(Boolean)
						.join('\n');
				}
				return projects
					.map((p, i) => {
						const stack = parse_string_array(p.stack).slice(0, 3).join(', ');
						return `  ${String(i + 1).padStart(2)}. ${p.emoji} ${p.title.padEnd(30)} [${stack}]`;
					})
					.join('\n');
			},
		},
		skills: {
			desc: 'Yetenekleri kategori bazında listeler',
			run: () => {
				if (!cv || cv.skill_categories.length === 0) return 'Yetenek listesi boş.';
				return cv.skill_categories
					.map((c) => `  ${c.name}: ${parse_string_array(c.items).join(', ')}`)
					.join('\n');
			},
		},
		exp: {
			desc: 'İş deneyimi geçmişi',
			run: () => {
				if (!cv || cv.experiences.length === 0) return 'Deneyim listesi boş.';
				return cv.experiences
					.map((e) => {
						const end = e.period_end ?? 'günümüz';
						return `  ${e.period_start} → ${end}  |  ${e.title} @ ${e.company}`;
					})
					.join('\n');
			},
		},
		contact: {
			desc: 'İletişim bilgileri',
			run: () => {
				if (!about_data) return 'Yükleniyor…';
				const rows = [
					about_data.email ? `  📧 ${about_data.email}` : '',
					about_data.github_url ? `  🐙 ${about_data.github_url}` : '',
					about_data.linkedin_url ? `  💼 ${about_data.linkedin_url}` : '',
				].filter(Boolean);
				return rows.join('\n');
			},
		},
		github: {
			desc: 'GitHub profilini açar',
			run: () => {
				window.open('https://github.com/mustafakrpk', '_blank');
				return '→ https://github.com/mustafakrpk açıldı';
			},
		},
		gh: {
			desc: 'Canlı GitHub istatistikleri',
			run: async () => {
				if (!gh_stats) {
					try {
						const res = await api.get<{ stats: GithubStats }>('/api/public/github/stats');
						gh_stats = res.stats;
					} catch {
						return 'GitHub istatistikleri alınamadı.';
					}
				}
				const s = gh_stats;
				if (!s) return 'GitHub istatistikleri alınamadı.';
				const top = s.top_repos
					.slice(0, 5)
					.map(
						(r) =>
							`  ★ ${String(r.stars).padStart(3)}  ${r.name}${r.language ? ` (${r.language})` : ''}`,
					)
					.join('\n');
				return [
					`@${s.username}${s.bio ? ` — ${s.bio}` : ''}`,
					`Repolar: ${s.public_repos}  ·  Takipçi: ${s.followers}  ·  Takip: ${s.following}`,
					'',
					'En popüler repolar:',
					top || '  (yok)',
				].join('\n');
			},
		},
		ai: {
			desc: 'AI asistana soru sor (örn: ai deneyimlerin neler?)',
			run: async (args) => {
				const q = args.join(' ').trim();
				if (!q) return 'Kullanım: ai <soru>   (örn: ai hangi teknolojileri biliyorsun?)';
				try {
					const res = await api.post<{ reply: string }>('/api/public/chat', {
						messages: [{ role: 'user', content: q }],
					});
					return `🤖 ${res.reply}`;
				} catch (err: any) {
					if (err?.status === 503) return 'AI asistan şu an devre dışı.';
					return 'Asistan yanıt veremedi, biraz sonra dene.';
				}
			},
		},
		neofetch: {
			desc: 'Sistem bilgi kartı',
			run: () => {
				const art = [
					'     #####     ',
					'   #########   ',
					'  ###########  ',
					'  ###########  ',
					'  ###########  ',
					'   #########   ',
					'     #   #     ',
				];
				const skills_flat = cv?.skill_categories.flatMap((c) => parse_string_array(c.items)) ?? [];
				const info = [
					`${about_data?.full_name ?? 'Mustafa Kırpık'}@portfolyo`,
					'─────────────────────',
					'OS:       PortfolioOS 13.0',
					'Host:     macos-web · Svelte 5',
					'Kernel:   Hono + Drizzle + MySQL',
					'Shell:    mk-term',
					`Rol:      ${about_data?.title ?? '—'}`,
					`Konum:    ${about_data?.location ?? '—'}`,
					`Projeler: ${projects.length}`,
					`Yetenek:  ${skills_flat.slice(0, 4).join(', ')}${skills_flat.length > 4 ? '…' : ''}`,
				];
				const rows = Math.max(art.length, info.length);
				const out: string[] = [];
				for (let i = 0; i < rows; i++) {
					out.push(`${(art[i] ?? '').padEnd(16)}  ${info[i] ?? ''}`);
				}
				return out.join('\n');
			},
		},
		ls: {
			desc: 'Dosyaları listeler',
			run: (args) => {
				if (args[0] === 'projects' || args[0] === 'projeler') {
					return commands.projects.run([]) as string;
				}
				return 'about.txt   cv.txt   projects/   skills/   experience/   contact.txt';
			},
		},
		cat: {
			desc: 'Dosya içeriğini gösterir (örn: cat about.txt)',
			run: (args) => {
				const f = (args[0] ?? '').toLowerCase().replace(/\.txt$/, '');
				const map: Record<string, string> = {
					about: 'about',
					hakkimda: 'about',
					cv: 'exp',
					ozgecmis: 'exp',
					skills: 'skills',
					yetenekler: 'skills',
					contact: 'contact',
					iletisim: 'contact',
				};
				const target = map[f];
				if (!target) return `cat: ${args[0] ?? ''}: böyle bir dosya yok`;
				return commands[target].run([]) as string;
			},
		},
		sudo: {
			desc: 'Yönetici komutu çalıştırır 😏',
			run: (args) => {
				const sub = args.join(' ').toLowerCase();
				if (sub === 'hire-me' || sub === 'hire me') {
					return [
						'🎉 İşe alım süreci başlatılıyor...',
						'[####################] 100%',
						'',
						'✓ Backend: Laravel, CodeIgniter4, RESTful API, Multi-tenant',
						'✓ Frontend: React, Next.js, TypeScript, Svelte',
						'✓ Hızlı öğrenen, üretken, takım oyuncusu',
						'',
						'Karar: Mustafa işe alınmalı! 🚀',
						"→ İletişim için 'contact' yaz.",
					].join('\n');
				}
				if (sub.startsWith('rm -rf')) {
					return [
						'rm: "/" siliniyor...',
						'[##########----------] 50% ... 🫣',
						'',
						'Şaka şaka 😄 Hiçbir şey silinmedi — burası bir portfolyo.',
					].join('\n');
				}
				if (!sub) return 'Kullanım: sudo <komut>   (ipucu: sudo hire-me)';
				return `[sudo] parola: ***\nYetkin yok 😎 ama denemen hoştu: "${sub}"`;
			},
		},
		open: {
			desc: 'Bir uygulamayı açar (örn: open projects)',
			run: (args) => {
				const id_map: Record<string, keyof typeof apps.open> = {
					about: 'purus-twitter',
					hakkimda: 'purus-twitter',
					projects: 'appstore',
					projeler: 'appstore',
					cv: 'notes',
					ozgecmis: 'notes',
					contact: 'mail',
					iletisim: 'mail',
					social: 'safari',
					calc: 'calculator',
					calendar: 'calendar',
					takvim: 'calendar',
				};
				const key = args[0]?.toLowerCase();
				if (!key) return 'Kullanım: open <about|projects|cv|contact|social|calc|calendar>';
				const target = id_map[key];
				if (!target) return `"${key}" diye bir uygulama yok.`;
				apps.open[target] = true;
				apps.active = target;
				return `→ ${key} açıldı`;
			},
		},
		date: {
			desc: 'Tarihi göster',
			run: () => new Date().toLocaleString('tr-TR'),
		},
		echo: {
			desc: 'Yazıyı geri yansıtır',
			run: (args) => args.join(' '),
		},
		clear: {
			desc: 'Ekranı temizler',
			run: () => {
				lines = [];
				return;
			},
		},
		exit: {
			desc: 'Terminali kapatır',
			run: () => {
				apps.open.terminal = false;
				return;
			},
		},
	};

	async function run_command(raw: string) {
		const trimmed = raw.trim();
		lines = [...lines, { kind: 'cmd', text: `${prompt} ${trimmed}` }];

		if (!trimmed) return;
		history = [...history, trimmed];
		history_idx = -1;

		const [name, ...args] = trimmed.split(/\s+/);
		const cmd = commands[name.toLowerCase()];

		if (!cmd) {
			lines = [
				...lines,
				{
					kind: 'err',
					text: `komut bulunamadı: ${name}\n"help" yazarak komutları görebilirsin.`,
				},
			];
			return;
		}

		try {
			const out = await cmd.run(args);
			if (typeof out === 'string' && out !== '') {
				lines = [...lines, { kind: 'out', text: out }];
			}
		} catch (err: any) {
			lines = [...lines, { kind: 'err', text: err?.message ?? 'Hata.' }];
		}

		await tick();
		scroll_el?.scrollTo({ top: scroll_el.scrollHeight });
	}

	function on_key(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			run_command(current);
			current = '';
		} else if (e.key === 'Tab') {
			e.preventDefault();
			const parts = current.split(/\s+/);
			if (parts.length === 1 && parts[0]) {
				const matches = Object.keys(commands).filter((k) => k.startsWith(parts[0].toLowerCase()));
				if (matches.length === 1) {
					current = `${matches[0]} `;
				} else if (matches.length > 1) {
					lines = [...lines, { kind: 'info', text: matches.join('  ') }];
				}
			}
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (history.length === 0) return;
			history_idx = history_idx < 0 ? history.length - 1 : Math.max(0, history_idx - 1);
			current = history[history_idx];
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (history_idx < 0) return;
			history_idx++;
			if (history_idx >= history.length) {
				history_idx = -1;
				current = '';
			} else {
				current = history[history_idx];
			}
		}
	}

	onMount(() => {
		Promise.all([
			api.get<{ about: PublicAbout | null }>('/api/public/about').catch(() => ({ about: null })),
			api
				.get<{ projects: PublicProject[] }>('/api/public/projects')
				.catch(() => ({ projects: [] })),
			api.get<PublicCV>('/api/public/cv').catch(() => null as PublicCV | null),
		]).then(([a, p, c]) => {
			about_data = a.about;
			projects = p.projects;
			cv = c;
		});

		lines = [
			{ kind: 'info', text: 'Mustafa Kırpık — Portfolyo Terminal  (mk-term)' },
			{
				kind: 'info',
				text: '"help" ile tüm komutlar · dene: neofetch · gh · ai <soru> · sudo hire-me',
			},
			{ kind: 'info', text: 'İpucu: Tab ile tamamla, ↑/↓ ile geçmiş.' },
			{ kind: 'info', text: '' },
		];

		setTimeout(() => input_el?.focus(), 100);
	});

	function focus_input() {
		input_el?.focus();
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
<section class="container" onclick={focus_input}>
	<header class="titlebar app-window-drag-handle">
		<span>Terminal — mustafa@portfolyo</span>
	</header>

	<div class="scroll" bind:this={scroll_el}>
		{#each lines as line}
			<pre class="line {line.kind}">{line.text}</pre>
		{/each}

		<div class="input-line">
			<span class="prompt">{prompt}</span>
			<input
				bind:this={input_el}
				bind:value={current}
				onkeydown={on_key}
				type="text"
				autocomplete="off"
				autocorrect="off"
				autocapitalize="off"
				spellcheck="false"
			/>
		</div>
	</div>
</section>

<style>
	.container {
		background: #0d0d0d;
		color: #e4e4e7;
		border-radius: inherit;
		overflow: hidden;
		height: 100%;
		display: flex;
		flex-direction: column;
		font-family: 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
		cursor: text;
	}

	.titlebar {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 0.6rem 1rem;
		background: linear-gradient(180deg, #2a2a2c, #1d1d1f);
		color: hsla(0, 0%, 100%, 0.7);
		font-size: 0.78rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
		user-select: none;
		flex-shrink: 0;
	}

	.scroll {
		flex: 1;
		overflow-y: auto;
		padding: 0.8rem 1.1rem;
		font-size: 0.85rem;
		line-height: 1.45;
	}

	.line {
		margin: 0;
		white-space: pre-wrap;
		word-break: break-word;
		font-family: inherit;
	}

	.line.cmd {
		color: #fafafa;
	}

	.line.out {
		color: #b4d4f7;
	}

	.line.err {
		color: #ff6b6b;
	}

	.line.info {
		color: hsla(0, 0%, 100%, 0.5);
	}

	.input-line {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		margin-top: 0.2rem;
	}

	.prompt {
		color: #4ade80;
		flex-shrink: 0;
	}

	input {
		flex: 1;
		background: none;
		border: none;
		color: inherit;
		font-family: inherit;
		font-size: inherit;
		outline: none;
		padding: 0;
		caret-color: #4ade80;
	}
</style>
