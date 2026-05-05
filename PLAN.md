# Portfolyo Backend & Admin Panel — Uygulama Planı

> **Sahibi:** Mustafa Kırpık
> **Frontend:** mevcut macOS-web Svelte 5 + Vite SPA (değişmiyor, üzerine ekleniyor)
> **Hedef:** Sitedeki tüm içerik (Hakkımda / Projeler / CV / İletişim / Sosyal) bir admin panelinden yönetilecek; ziyaretçi statik SPA'yı görür, içerik backend API'den çekilir.

## npx pnpm@10.12.3 dev

npx pnpm@10.12.3 dev

## 1. Teknoloji Yığını (sabit)

| Katman            | Seçim                              | Sebep                                            |
| ----------------- | ---------------------------------- | ------------------------------------------------ |
| Sunucu            | Ubuntu 22.04 VDS                   | Kullanıcının mevcut altyapısı                    |
| Backend dili      | **TypeScript**                     | Frontend ile aynı dil                            |
| Backend framework | **Hono**                           | Hafif, TS-native, Express'ten modern             |
| ORM               | **Drizzle ORM**                    | TS-first, MySQL destekli, migration'lar otomatik |
| Veritabanı        | **MySQL 8**                        | Kullanıcı tercihi                                |
| Validasyon        | **Zod**                            | Endpoint girdileri için tip güvenli şema         |
| Auth              | **GitHub OAuth**                   | Tek kullanıcı (sadece `mustafakrpk` whitelisted) |
| Session           | httpOnly cookie + DB session token | Library'siz, basit                               |
| Dosya yükleme     | **Multer** + **Sharp**             | Sharp zaten kurulu, görsel resize                |
| Admin UI          | Svelte 5 `/admin` rotası           | Klasik admin paneli (mevcut SPA içinde)          |
| Process manager   | **systemd**                        | Auto-start, log = journalctl                     |
| Reverse proxy     | **nginx**                          | Static + /api proxy                              |

---

## 2. Mimari

```
İnternet
   │
   ▼
nginx :80/:443
   ├── /             → /var/www/portfolio/dist  (Vite build çıktısı)
   ├── /api/*        → http://127.0.0.1:3000    (Node + Hono)
   └── /uploads/*    → /var/www/portfolio/uploads/  (statik dosyalar)

           ▲
           │ kullanır
           ▼
   MySQL :3306 (localhost)
```

- Frontend hâlâ tek SPA olarak build alır.
- Admin paneli aynı SPA içinde `/admin/*` rotalarında — login olmadan görünmüyor.
- Backend ayrı bir Node prosesi, sadece JSON API döndürüyor.

---

## 3. Klasör Yapısı (eklenecek)

```
macos-web/
├── src/                           ← mevcut frontend (değişmiyor)
│   ├── components/
│   │   └── admin/                 ← YENİ: admin paneli bileşenleri
│   │       ├── AdminLayout.svelte
│   │       ├── LoginPage.svelte
│   │       ├── Dashboard.svelte
│   │       ├── ProjectsAdmin.svelte
│   │       ├── AboutAdmin.svelte
│   │       ├── CVAdmin.svelte
│   │       └── MessagesAdmin.svelte
│   ├── lib/
│   │   └── api.ts                 ← YENİ: fetch wrapper'lar
│   └── routes.ts                  ← YENİ: /admin/* rotası eklenecek
│
├── server/                        ← YENİ: backend
│   ├── package.json
│   ├── tsconfig.json
│   ├── drizzle.config.ts
│   ├── .env.example
│   ├── src/
│   │   ├── index.ts               ← Hono app entry
│   │   ├── db/
│   │   │   ├── schema.ts          ← Drizzle schema
│   │   │   ├── migrations/
│   │   │   └── seed.ts            ← İlk veri (örnek projeler)
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── projects.ts
│   │   │   ├── about.ts
│   │   │   ├── cv.ts
│   │   │   ├── contact.ts
│   │   │   ├── uploads.ts
│   │   │   └── public.ts          ← read-only public endpoints
│   │   ├── middleware/
│   │   │   ├── auth.ts            ← session doğrulama
│   │   │   └── error.ts
│   │   ├── lib/
│   │   │   ├── github-oauth.ts
│   │   │   ├── upload.ts          ← multer + sharp
│   │   │   └── env.ts             ← env vars
│   │   └── types.ts
│   └── uploads/                   ← yüklenen dosyalar (gitignore)
│
├── deploy/                        ← YENİ: deploy yardımcıları
│   ├── nginx.conf.example
│   ├── portfolio.service          ← systemd unit
│   └── README.md                  ← kurulum talimatları
│
└── PLAN.md                        ← bu dosya
```

---

## 4. Veritabanı Şeması (MySQL)

```sql
-- Tek admin kullanıcı (GitHub'tan gelir)
users (
  id              INT PK AUTO_INCREMENT,
  github_id       VARCHAR(64) UNIQUE,
  username        VARCHAR(64),
  avatar_url      TEXT,
  created_at      DATETIME
)

-- Cookie session token'ları
sessions (
  id              VARCHAR(128) PK,         -- random token
  user_id         INT FK→users
  expires_at      DATETIME,
  created_at      DATETIME
)

-- Hakkımda (singleton — tek kayıt)
about (
  id              INT PK,                  -- daima 1
  full_name       VARCHAR(128),
  title           VARCHAR(255),            -- "Yazılım Geliştirici"
  intro_md        TEXT,                    -- markdown içerik
  avatar_url      VARCHAR(512),
  email           VARCHAR(255),
  github_url      VARCHAR(512),
  linkedin_url    VARCHAR(512),
  location        VARCHAR(128),
  updated_at      DATETIME
)

-- Projeler
projects (
  id              INT PK AUTO_INCREMENT,
  title           VARCHAR(255),
  description     TEXT,
  stack           JSON,                    -- string array
  github_url      VARCHAR(512) NULL,
  live_url        VARCHAR(512) NULL,
  image_url       VARCHAR(512) NULL,       -- /uploads/...
  gradient        VARCHAR(255),            -- CSS gradient
  emoji           VARCHAR(8),
  display_order   INT DEFAULT 0,
  is_published    BOOLEAN DEFAULT TRUE,
  created_at      DATETIME,
  updated_at      DATETIME
)

-- CV: deneyim
experiences (
  id              INT PK AUTO_INCREMENT,
  title           VARCHAR(255),
  company         VARCHAR(255),
  period_start    VARCHAR(32),             -- "2023-01" gibi serbest
  period_end      VARCHAR(32),             -- NULL = günümüz
  description     TEXT,
  display_order   INT
)

-- CV: eğitim
education (
  id              INT PK AUTO_INCREMENT,
  degree          VARCHAR(255),
  school          VARCHAR(255),
  period_start    VARCHAR(32),
  period_end      VARCHAR(32),
  display_order   INT
)

-- CV: yetenekler (kategori bazlı)
skill_categories (
  id              INT PK AUTO_INCREMENT,
  name            VARCHAR(64),             -- "Frontend", "Backend"
  items           JSON,                    -- ["Svelte","React",…]
  display_order   INT
)

-- CV: diller
languages (
  id              INT PK AUTO_INCREMENT,
  name            VARCHAR(64),             -- "Türkçe"
  level           VARCHAR(64),             -- "Anadil"
  display_order   INT
)

-- CV PDF dosyası (singleton)
cv_meta (
  id              INT PK,                  -- daima 1
  pdf_url         VARCHAR(512) NULL        -- /uploads/cv.pdf
)

-- İletişim formundan gelen mesajlar
contact_messages (
  id              INT PK AUTO_INCREMENT,
  name            VARCHAR(255),
  email           VARCHAR(255),
  message         TEXT,
  is_read         BOOLEAN DEFAULT FALSE,
  ip              VARCHAR(64),
  created_at      DATETIME
)

-- Yüklenen dosyalar (kayıt için)
uploads (
  id              INT PK AUTO_INCREMENT,
  filename        VARCHAR(255),
  path            VARCHAR(512),
  mimetype        VARCHAR(128),
  size_bytes      INT,
  created_at      DATETIME
)
```

---

## 5. API Endpoint'leri

### Public (auth gerekmez)

| Method | Path                   | Açıklama                                       |
| ------ | ---------------------- | ---------------------------------------------- |
| GET    | `/api/public/about`    | Hakkımda içeriği                               |
| GET    | `/api/public/projects` | Yayınlanmış projeler                           |
| GET    | `/api/public/cv`       | Tüm CV verisi (deneyim+eğitim+yetenek+dil+pdf) |
| POST   | `/api/public/contact`  | İletişim formu gönderimi (rate-limited)        |

### Auth

| Method | Path                        | Açıklama                                       |
| ------ | --------------------------- | ---------------------------------------------- |
| GET    | `/api/auth/github`          | GitHub OAuth başlat                            |
| GET    | `/api/auth/github/callback` | OAuth callback, session set, /admin'e redirect |
| GET    | `/api/auth/me`              | Mevcut session sahibini döndür                 |
| POST   | `/api/auth/logout`          | Session sil                                    |

### Admin (cookie session zorunlu)

| Method         | Path                      | Açıklama                             |
| -------------- | ------------------------- | ------------------------------------ |
| GET / PUT      | `/api/admin/about`        | Hakkımda görüntüle / güncelle        |
| GET / POST     | `/api/admin/projects`     | Liste / oluştur                      |
| PATCH / DELETE | `/api/admin/projects/:id` | Güncelle / sil                       |
| GET / PUT      | `/api/admin/cv`           | CV (tüm alt tablolar tek payload'da) |
| GET / DELETE   | `/api/admin/messages`     | Mesajlar listesi / sil               |
| PATCH          | `/api/admin/messages/:id` | Okundu işareti                       |
| POST           | `/api/admin/uploads`      | Dosya yükleme — `{ url, id }` döner  |
| DELETE         | `/api/admin/uploads/:id`  | Sil                                  |

---

## 6. Auth Akışı (GitHub OAuth)

1. Mustafa `/admin` rotasına gider → giriş yapmamışsa `/admin/login` görünür.
2. "GitHub ile Giriş" butonuna basar → `GET /api/auth/github` → GitHub'a redirect.
3. GitHub kullanıcıyı yetkilendirir, `code` ile callback'e döner.
4. Backend `code` ile access_token alır, GitHub'tan profil çeker.
5. **Whitelist kontrolü:** kullanıcı adı `mustafakrpk` değilse `403 Forbidden`.
6. Veritabanında user upsert, yeni session oluştur, **httpOnly cookie**'ye token yaz.
7. Tarayıcıyı `/admin`'e yönlendir.
8. Sonraki tüm `/api/admin/*` istekleri cookie ile authenticated.

> Whitelist `.env`'de `ADMIN_GITHUB_USERNAME=mustafakrpk` olarak tutulur — değiştirmek için sadece env değişir.

---

## 7. Admin Panel UI (Svelte içinde `/admin/*`)

| Rota                  | İçerik                                                      |
| --------------------- | ----------------------------------------------------------- |
| `/admin/login`        | GitHub OAuth butonu                                         |
| `/admin`              | Dashboard — proje sayısı, okunmamış mesaj, son aktivite     |
| `/admin/about`        | Tek formda Hakkımda alanları + avatar yükleme               |
| `/admin/projects`     | Liste + yeni ekle modal + her satırda düzenle/sil           |
| `/admin/projects/:id` | Tek proje düzenleme formu (gradient picker, görsel yükleme) |
| `/admin/cv`           | Sekmeli: Deneyim / Eğitim / Yetenekler / Diller / CV PDF    |
| `/admin/messages`     | Gelen iletişim formu mesajları, okundu işareti, sil         |
| `/admin/uploads`      | Yüklenen dosyaların galerisi                                |

> Admin'in tasarımı **basit ve fonksiyonel**, macOS temasından bağımsız (klasik dashboard görünümü).

---

## 8. Frontend (Public) Değişiklikleri

Mevcut hard-coded içerik API'den çekilecek:

| Dosya                                          | Değişiklik                                     |
| ---------------------------------------------- | ---------------------------------------------- |
| `src/components/apps/About/About.svelte`       | `onMount` → `fetch('/api/public/about')`       |
| `src/components/apps/Projects/Projects.svelte` | Hard-coded array yerine API                    |
| `src/components/apps/CV/CV.svelte`             | Tüm alt veri API'den                           |
| `src/components/apps/Contact/Contact.svelte`   | `mailto:` yerine `POST /api/public/contact`    |
| `src/components/apps/Social/Social.svelte`     | İstersen sabit kalır, istersen About'tan gelir |

`src/lib/api.ts` — fetch wrapper, base URL ve hata yönetimi merkezde.

---

## 9. Dosya Yükleme

- Sadece `image/*` ve `application/pdf` izinli, max 5 MB.
- Multer ile bellekte tut → Sharp ile resize (büyük versiyon: 1280px, thumb: 256px) → diske yaz.
- Dosya adı: `{nanoid}.{ext}` — orijinal isim çakışma yapmasın diye.
- Kayıt `uploads` tablosuna düşer.
- nginx `/uploads/*` direkt diskten servis eder (Node bypass).

---

## 10. Çevre Değişkenleri (`server/.env`)

```bash
# Server
PORT=3000
NODE_ENV=production
PUBLIC_BASE_URL=https://senin-domain.com

# Database
DATABASE_URL=mysql://portfolio_user:strong_password@localhost:3306/portfolio_db

# Auth
SESSION_COOKIE_NAME=mk_portfolio_session
SESSION_LIFETIME_DAYS=30
ADMIN_GITHUB_USERNAME=mustafakrpk

# GitHub OAuth (https://github.com/settings/developers)
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_REDIRECT_URL=https://senin-domain.com/api/auth/github/callback

# Uploads
UPLOAD_DIR=/var/www/portfolio/uploads
UPLOAD_PUBLIC_URL=/uploads
MAX_UPLOAD_MB=5
```

---

## 11. Deploy Adımları (sunucuda)

> Kod, talimatlar `deploy/README.md`'de detaylı olacak. Özet:

1. **Sunucu hazırlığı**

   ```bash
   sudo apt update && sudo apt install -y nginx mysql-server
   curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
   sudo apt install -y nodejs
   sudo npm install -g pnpm
   ```

2. **MySQL kurulumu**

   ```sql
   CREATE DATABASE portfolio_db CHARACTER SET utf8mb4;
   CREATE USER 'portfolio_user'@'localhost' IDENTIFIED BY 'strong_password';
   GRANT ALL ON portfolio_db.* TO 'portfolio_user'@'localhost';
   ```

3. **GitHub OAuth App** — `https://github.com/settings/developers` üzerinden yeni OAuth App, callback URL = `https://senin-domain.com/api/auth/github/callback`

4. **Repo deploy**

   ```bash
   cd /var/www && git clone <repo>
   cd portfolio/server && pnpm i && pnpm migrate && pnpm seed
   cd .. && pnpm i && pnpm build
   ```

5. **systemd servisi** (`deploy/portfolio.service` → `/etc/systemd/system/`)

   ```bash
   sudo systemctl enable --now portfolio
   ```

6. **nginx** (`deploy/nginx.conf.example` → `/etc/nginx/sites-available/portfolio`)

   ```bash
   sudo ln -s ... && sudo nginx -t && sudo systemctl reload nginx
   ```

7. **HTTPS** — `sudo certbot --nginx -d senin-domain.com`

---

## 12. Aşamalar (yapılacaklar — sırayla)

### Faz 1 — Backend iskeleti (½ gün)

- [ ] `server/` klasörü, `pnpm init`, TypeScript ayarları
- [ ] Hono + Drizzle + mysql2 + Zod kurulumu
- [ ] `.env` ve `lib/env.ts` (validated config)
- [ ] DB şeması (`schema.ts`) ve ilk migration
- [ ] Health check `GET /api/ping`

### Faz 2 — Auth (½ gün)

- [ ] GitHub OAuth flow (start + callback)
- [ ] Session table + cookie set/clear
- [ ] `auth` middleware (admin endpoint koruması)
- [ ] `/api/auth/me` ve `/api/auth/logout`

### Faz 3 — Public read API (½ gün)

- [ ] `GET /api/public/about`
- [ ] `GET /api/public/projects`
- [ ] `GET /api/public/cv`
- [ ] Seed script — şu anki hard-coded içerikleri DB'ye taşı

### Faz 4 — Frontend public bağlantısı (½ gün)

- [ ] `src/lib/api.ts` wrapper
- [ ] About / Projects / CV / Contact bileşenlerini API'ye bağla
- [ ] Loading + error state'leri ekle

### Faz 5 — Admin CRUD endpoints (1 gün)

- [ ] Projects CRUD
- [ ] About PUT
- [ ] CV PUT (alt tablolar tek payload)
- [ ] Messages list/delete/mark-read
- [ ] Tüm endpoint'lere Zod validation

### Faz 6 — Admin panel UI (1-1.5 gün)

- [ ] `/admin` rotası (mevcut SPA içinde route guard)
- [ ] Login sayfası
- [ ] Layout + sidebar + dashboard
- [ ] About / Projects / CV / Messages formları
- [ ] Form validation + toast bildirimleri

### Faz 7 — Dosya yükleme (½ gün)

- [ ] `POST /api/admin/uploads` (Multer + Sharp)
- [ ] Admin tarafında image picker + drag-drop
- [ ] Avatar / proje görseli / CV PDF yükleme akışları

### Faz 8 — Deploy hazırlığı (½ gün)

- [ ] `nginx.conf.example`
- [ ] `systemd` unit dosyası
- [ ] `deploy/README.md` adım adım kurulum
- [ ] Production build script

### Faz 9 — Sertleştirme (½ gün)

- [ ] Rate limit (özellikle `/api/public/contact`)
- [ ] CORS ayarları
- [ ] Helmet benzeri güvenlik header'ları
- [ ] Log dosyası rotation
- [ ] Yedekleme talimatı (mysqldump cron)

> **Toplam tahmini süre:** ~5-6 günlük çalışma (yarı günler birleştirilirse).

---

## 13. Henüz Açık Olan Sorular

Plan ilerlerken karara bağlanacak şeyler:

1. **Domain & subdomain:** API ana domain'le aynı path altında mı (`/api/`) yoksa `api.domain.com` mı? — _Plan: aynı domain, `/api/`_
2. **Yedekleme:** Otomatik mysqldump cron + uploads tar yedeği? — _Plan: deploy README'de talimat_
3. **Markdown editör:** About / proje açıklaması için zengin metin editörü gerekli mi yoksa düz textarea + markdown yeterli mi? — _Karar gerek_
4. **i18n:** Site şu an Türkçe; ileride İngilizce versiyon olacak mı? — _Plan: şimdilik tek dil, şema TR_
5. **Analytics:** Plausible/Umami self-host eklenecek mi? — _Bonus, fazlardan sonra_

---

## 14. Sonraki Adım

Sen onay verince **Faz 1**'den başlayacağım: `server/` klasörünü kurup Hono + Drizzle + MySQL bağlantısını çalışır duruma getireceğim. Adım adım gideceğim, her fazın sonunda küçük bir demo/checkpoint yapacağız.

Eğer plan üzerinde değiştirmek istediğin bir şey varsa (örn. Drizzle yerine başka ORM, faz sırası, ek özellik) önce orayı netleştirip sonra başlayalım.
