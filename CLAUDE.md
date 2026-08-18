# CLAUDE.md — macos-web

Dil, kanıt ve git kuralları `~/.claude/CLAUDE.md` ve `~/krpk/CLAUDE.md` içinde — burada tekrarlanmaz.

## Proje

Mustafa Kırpık'ın **kişisel portfolyosu**, macOS masaüstü taklidi bir arayüz olarak.
`PuruVJ/macos-web` projesinden fork'landı, sonra üzerine portfolyo backend'i ve admin
paneli eklendi. Ziyaretçi statik SPA'yı görür; içerik (Hakkımda / Projeler / CV /
İletişim / Sosyal) backend API'sinden gelir ve admin panelinden yönetilir.

**İki ayrı paket:**

| | Yol | Yığın |
|---|---|---|
| Frontend | kök | Svelte **5** (runes) + Vite + TypeScript, SPA |
| Backend | `server/` | Hono + Drizzle ORM + MySQL |

> ⚠️ **`README.md` yanıltıcıdır** — upstream fork'tan kalmadır, hâlâ "Component Library:
> None, Styling: SCSS" der ve backend'den hiç bahsetmez. Proje gerçeğini öğrenmek için
> `PLAN.md` (backend/admin mimarisi), `ROADMAP.md` (sıradaki işler) ve
> `deploy/README.md` (üretim mimarisi) oku. README'yi kaynak olarak kullanma.

## Komutlar

**Paket yöneticisi yalnızca pnpm** — sürüm `package.json` içinde `packageManager` ile
`pnpm@10.12.3`'e sabitlenmiş. npm / yarn / bun kullanma; ikinci bir lockfile
üretirsen CI `--frozen-lockfile` ile kırılır.

### Frontend (kök)

| İş | Komut |
|---|---|
| Geliştirme | `pnpm dev` (Vite) |
| Tip + Svelte kontrolü | `pnpm check` — svelte-check |
| Test | `pnpm test` · izleyerek: `pnpm test:watch` |
| Build | `pnpm build` → `dist/` |
| Build önizleme | `pnpm serve` |

### Backend (`server/`)

| İş | Komut |
|---|---|
| Kurulum | `pnpm install --ignore-workspace` ← **bayrak zorunlu** |
| Geliştirme | `pnpm dev` (tsx watch, `.env` okur) |
| Test | `pnpm test` |
| Build | `pnpm build` (tsc) |
| Migration üret | `pnpm db:generate` |
| Migration uygula | `pnpm db:migrate` |
| Seed | `pnpm db:seed` |
| DB arayüzü | `pnpm db:studio` |

**`--ignore-workspace` neden zorunlu:** kökteki `pnpm-workspace.yaml` yalnızca
`onlyBuiltDependencies` tanımlar, `packages:` listesi **yoktur**. Yani `server/`
bir workspace üyesi değil, kendi `pnpm-lock.yaml`'ı olan bağımsız bir pakettir.
Bayrağı unutursan pnpm kökün lockfile'ıyla çözmeye çalışır. CI de bu bayrağı kullanır.

Tam geliştirme için **iki terminal** gerekir: `server/` içinde `pnpm dev` (→ :3000)
ve kökte `pnpm dev` (Vite). Vite `/api` isteklerini `http://localhost:3000`'e proxy'ler
(`vite.config.ts` → `server.proxy`), bu yüzden geliştirmede CORS sorunu çıkmaz —
üretimde bu işi nginx yapar.

**Yok:** `lint` script'i. Biçimlendirici **prettier**'dır (`.prettierrc`):
sekme girintisi, tek tırnak, satır genişliği 100, `.svelte` için `prettier-plugin-svelte`.
Bunları elle değiştirme; `.claude/hooks/format.sh` düzenleme sonrası otomatik uygular.

## Doğrulama

CI (`.github/workflows/ci.yml`, Node 20 + pnpm 10.12.3) iki işi paralel koşar:

- **frontend:** `pnpm check` → `pnpm test` → `pnpm build`
- **backend:** (`server/` içinde) `pnpm test` → `pnpm build`

Push'tan önce aynısını yerelde koştur: `/hazir-mi`.

Bilinen temel durum: `pnpm check` **0 hata, 3 uyarı** (kullanılmayan CSS seçicileri)
verir. Uyarı sayısı artıyorsa senin değişikliğindendir.

## Kod stili — varsayılandan sapanlar

- **Fonksiyon ve değişken adları `snake_case`.** Bu repoda istisnasız uygulanır
  (`auto_destroy_effect_root`, `get_display_days`, `container_el`); dışa aktarılan
  fonksiyonlarda tek bir camelCase örneği yok. Svelte/TS geleneğine uymuyor —
  yine de deseni bozma. Tip ve bileşen adları `PascalCase` kalır.
- Girinti **sekme**, tırnak **tek**, satır genişliği 100 — `.prettierrc` zorlar.
- UI kütüphanesi bilinçli olarak yok; bileşenler elde yazılır.
- **Yol takma adı `🍎/` → `src/`** (`tsconfig.json` + `vite.config.ts`, 53 dosyada
  kullanılıyor). Yeni import'ları `'🍎/state/apps.svelte.ts'` biçiminde yaz;
  uzun göreli yollara (`../../`) dönme. İçe aktarmalarda dosya uzantısı yazılır.

## Mimari

### Frontend

| Katman | Yer | Kural |
|---|---|---|
| Durum | `src/state/*.svelte.ts` | Svelte 5 **rune**'ları. `.svelte.ts` uzantısı zorunlu — rune'lar sıradan `.ts` dosyasında derlenmez. |
| API | `src/lib/api.ts` | **Tek** veri erişim noktası. Bileşene `fetch` dağıtma. |
| Uygulamalar | `src/components/apps/<Ad>/` | Masaüstündeki her uygulama kendi klasöründe |
| Kabuk | `src/components/{Desktop,Dock,TopBar,SystemUI}` | Masaüstü kabuğu |
| Yapılandırma | `src/configs/` | Uygulama kaydı, menü, tema, duvar kâğıdı, i18n |
| Yardımcı | `src/helpers/` | Saf fonksiyonlar |

- **Svelte 5, Svelte 4 değil.** `$state` / `$derived` / `$props` kullanılır;
  `writable`/`readable` store'lara dönme. Emin değilsen mevcut bir `src/state/*.svelte.ts`
  dosyasına bak, deseni oradan al.
- Yeni uygulama eklerken `src/helpers/create-app-config.ts` ve `src/configs/apps/`
  kaydını atlama — yalnızca bileşen yazmak yetmez, uygulama masaüstünde görünmez.
- Kullanıcıya görünen metinler `src/configs/i18n/dictionaries.ts` üzerinden geçer;
  yeni anahtar eklerken tüm diller birlikte güncellenir (`dictionaries.test.ts` bunu doğrular).
- API hataları `src/lib/api.ts` içinde `ApiError`'a çevrilir ve `status` taşır;
  bileşende ham `res.status` kontrolü yazma.

### Backend (`server/src/`)

| Katman | Dizin | Sorumluluk |
|---|---|---|
| Route | `routes/` | HTTP uçları: `public`, `admin`, `auth`, `github`, `uploads`, `analytics`, `chat` |
| Middleware | `middleware/` | `auth.ts` (oturum), `rate-limit.ts` |
| Kütüphane | `lib/` | `session`, `github-oauth`, `mailer`, `upload`, `presence`, `env` |
| Veri | `db/` | `schema.ts` (Drizzle), `migrations/`, seed ve import script'leri |

- Şema değişikliği **elle migration yazarak yapılmaz**: `schema.ts`'i düzenle,
  sonra `pnpm db:generate`. Üretilen dosyayı elle düzeltme.
- Ortam değişkenleri `lib/env.ts` üzerinden okunur ve zod ile doğrulanır;
  `process.env`'e doğrudan erişme.
- Admin yetkisi `.env`'deki `ADMIN_GITHUB_USERNAME` ile GitHub kullanıcı adının
  eşleşmesine dayanır — başka bir rol sistemi yok.

## Üretim

`deploy/README.md` tam kurulumu anlatır. Kod yazarken bilinmesi gerekenler:

```
nginx :443 → /          → dist/            (Vite build, statik)
            → /api/*    → 127.0.0.1:3000   (systemd servisi: portfolio)
            → /uploads/*→ uploads/          (statik)
                              ↓
                          MySQL :3306
```

- Oturum çerezi üretimde `secure` bayrağıyla gider — `NODE_ENV=production` iken
  HTTP üzerinden test edersen tarayıcı çerezi sessizce reddeder, giriş "çalışmıyor" görünür.
- `PUBLIC_BASE_URL` domain ile birebir eşleşmeli (`https://` dahil), yoksa CORS kırılır.
- Yüklemeler `uploads/` altında ve sahibi `www-data`; yol `.env`'den gelir, koda gömülmez.

## Tuzaklar

- **`server/.env` gerçek üretim sırlarını içerir** (DB parolası, GitHub OAuth secret).
  Okuma, yazdırma, log'a düşürme. `.env.example` güncel tutulur.
- `pnpm-lock.yaml` iki tane vardır (kök ve `server/`). İkisi ayrı yönetilir;
  birini diğerine kopyalama.
- `dist/`, `node_modules/`, `server/uploads/*` sürüm kontrolünde değil — üretilen
  çıktıyı commit'leme.
- PLAN.md içindeki yollar Windows'tan kalma (`C:\Users\...`). Bu makine Linux;
  o komutları birebir kopyalama.

## Yapılmayacaklar

Gelirse önce karar alınmalı:

- Yeni bağımlılık eklemek (paket sayısı bilinçli olarak düşük tutuluyor, UI kütüphanesi yok)
- Svelte 4 store'larına veya başka bir durum yönetimi kütüphanesine geçmek
- Frontend'i SvelteKit'e taşımak (şu an saf Vite SPA; nginx yapılandırması buna bağlı)
- `ADMIN_GITHUB_USERNAME` dışında bir yetkilendirme modeli kurmak
