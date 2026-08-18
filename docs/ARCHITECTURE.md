# Mimari — macos-web

> Yeni katılan birine anlatır gibi yazıldı. Koda karşı doğrulandı: **18 Ağustos 2026**.
> Emin olunamayan yerler `DOĞRULANMADI` diye işaretli.
>
> Bu dosya CLAUDE.md'ye **içe aktarılmaz** — her oturuma yüklenmemesi için kasıtlı.
> Mimari sorusu geldiğinde okunur.

## 1. Bir isteğin izlediği yol

### Ziyaretçi sayfayı açtığında

```
tarayıcı → nginx :443
              ├── /            → dist/index.html  (statik, Vite build)
              ├── /api/*       → 127.0.0.1:3000   (Hono, systemd: portfolio)
              └── /uploads/*   → uploads/          (statik)
```

`index.html` içinde tek bir `<div id="root">` var. `src/main.ts` yolu okur ve
**iki farklı uygulamadan birini** mount eder:

| Yol | Mount edilen |
|---|---|
| `/admin...` | `src/components/admin/Admin.svelte` |
| diğer her şey | `src/components/Desktop/Desktop.svelte` |

İkisi de dinamik `import()` ile gelir, yani ziyaretçi admin paketini indirmez.

### Veri çekildiğinde

```
bileşen → src/lib/api.ts (tek giriş) → fetch('/api/...') → nginx (üretim)
                                                          veya Vite proxy (geliştirme)
                                                              ↓
                              Hono :3000 → middleware → route → db → MySQL
```

`src/lib/api.ts` tek veri erişim noktasıdır: `credentials: 'include'` ekler,
JSON header'ını gerektiğinde koyar, hata gövdesini `ApiError`'a çevirip
`status` ile birlikte fırlatır. Bileşenler ham `fetch` çağırmaz.

### Backend'de sıra (`server/src/index.ts`)

1. `logger()` — tüm istekler
2. `secureHeaders()` — `X-Frame-Options: SAMEORIGIN`, `nosniff`, referrer policy.
   CSP kasıtlı olarak burada değil, nginx'e bırakılmış.
3. `cors()` — yalnızca `/api/*`, origin `env.PUBLIC_BASE_URL`, `credentials: true`.
   Bu yüzden `PUBLIC_BASE_URL` domain ile birebir eşleşmezse CORS kırılır.
4. `rate_limit` — genel `/api/*` 120/dk; `contact` 5/dk, `chat` 15/dk,
   OAuth callback 10/dk
5. Route eşleşmesi
6. `notFound` → `{error:'not_found'}` 404
7. `onError` → üretimde `internal_error`, geliştirmede gerçek mesaj

## 2. Katman sınırları

### Frontend

| Katman | Dizin | İçe aktarabildiği |
|---|---|---|
| Uygulamalar | `src/components/apps/<Ad>/` | state, lib, helpers, configs |
| Kabuk | `src/components/{Desktop,Dock,TopBar,SystemUI}` | aynısı |
| Admin | `src/components/admin/` | aynısı |
| Durum | `src/state/*.svelte.ts` | helpers, lib |
| API | `src/lib/api.ts` | — (yaprak) |
| Yardımcı | `src/helpers/` | — (saf fonksiyonlar) |

Kural: **veri erişimi yalnızca `src/lib/api.ts` üzerinden.** Bileşene `fetch` dağıtılmaz.

### Backend

```
routes/ → lib/ → db/
   ↑
middleware/
```

`routes/` HTTP'yi bilir, `lib/` iş mantığını, `db/` veriyi. Ters yönde import yok.

## 3. Bu kod tabanına özgü kararlar

**1. `server/` bir pnpm workspace üyesi değil.** Kökteki `pnpm-workspace.yaml`
yalnızca `onlyBuiltDependencies` tanımlar, `packages:` listesi yoktur. Ayrı
lockfile'ı vardır ve kurulumu `pnpm install --ignore-workspace` ister. CI de öyle yapar.
*Neden:* frontend ve backend bağımlılıkları birbirine karışmasın; sunucuda yalnızca
backend kurulabilsin.

**2. İçe aktarma uzantısı iki tarafta farklı.** Backend ESM/NodeNext kullanır ve
`.js` yazar (dosya `.ts` olsa bile). Frontend `🍎/` takma adı ve `.ts` kullanır.
*Neden:* Node'un ESM çözümlemesi ile Vite'ınki farklı; ikisi de kendi doğal biçiminde.

**3. Adlandırma `snake_case`.** Dışa aktarılan fonksiyonlarda tek camelCase örneği yok.
*Neden:* DOĞRULANMADI — upstream projeden (PuruVJ) miras olabilir.

**4. SPA, SvelteKit değil.** Saf Vite + `mount()`. Yönlendirme `main.ts` içinde
tek bir `pathname` kontrolüyle yapılır.
*Neden:* nginx yapılandırması buna bağlı; SSR'a gerek yok, içerik zaten API'den geliyor.

**5. Yetki modeli tek katmanlı.** Rol tablosu yok; giriş yapan GitHub kullanıcı adı
`ADMIN_GITHUB_USERNAME` ile eşleşiyorsa admin.
*Neden:* tek kullanıcılı bir portfolyo; rol sistemi gereksiz karmaşıklık.

## 4. Yeni bir şey eklemek — şablon

### Yeni masaüstü uygulaması

1. `src/components/apps/<Ad>/<Ad>.svelte`
2. `src/configs/apps/apps-config.ts` içine `create_app_config({...})` kaydı
3. Görünen metinler `src/configs/i18n/dictionaries.ts` — **tüm dillerde**
   (`dictionaries.test.ts` tutarlılığı doğrular)

Kayıt olmadan uygulama masaüstünde görünmez.

### Yeni API ucu

1. `server/src/routes/<alan>.ts` içine handler
2. Gerekiyorsa `server/src/db/schema.ts` + `pnpm db:generate`
3. `server/src/index.ts` içinde `app.route(...)` ile montaj
4. Maliyetli/kötüye kullanılabilir bir uçsa kendi `rate_limit`'i
5. Frontend tarafı `src/lib/api.ts` içine fonksiyon
6. Test: `server/src/**/*.test.ts`

## 5. En tehlikeli üç tuzak

1. **`server/.env` gerçek üretim sırlarını taşır** — DB parolası, GitHub OAuth secret,
   SMTP bilgileri. Okunmaz, yazdırılmaz, log'a düşürülmez.
2. **Üretimde çerez `secure` bayrağıyla gider.** `NODE_ENV=production` iken HTTP
   üzerinden test edersen tarayıcı çerezi sessizce reddeder; "giriş çalışmıyor" gibi görünür.
3. **`README.md` upstream fork'tan kalma** ve projeyi anlatmıyor. Doğru kaynaklar:
   bu dosya, `PLAN.md`, `ROADMAP.md`, `deploy/README.md`.
