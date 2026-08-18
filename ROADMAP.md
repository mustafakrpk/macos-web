# Yol Haritası — Sonraki Özellikler

> **Durum (18 Ağustos 2026):** Faz A, B ve C'nin neredeyse tamamı tamamlandı.
> Kalan iki boşluk aşağıda işaretli. Bu dosya koda karşı doğrulanarak güncellendi —
> kutular gerçeği yansıtır.
> **Strateji:** Hızlı kazanımlardan başla → konsept güçlendiriciler → büyük altyapı.

---

## 📊 Faz Özeti

| Faz | Konu | Tahmini süre | Etki |
|---|---|---|---|
| A | Hızlı kazanımlar | 1 gün | İlk izlenim, eksik temel |
| B | Yeni macOS app'leri | 2 gün | Konsept gücü, teknik vitrin |
| C | Büyük altyapı | 3+ gün | Profesyonel seviye, ölçeklenme |

---

## 🚀 Faz A — Hızlı Kazanımlar

### A1. Boot ses + welcome animasyonu
- Mevcut `BootupScreen.svelte` Apple logosuyla açılıyor; **MK** baş harfi + isim animasyonu yap
- `public/sounds/mac-startup-sound.mp3` var; ilk girişte oynat (autoplay policy için kullanıcı etkileşimi gerekirse fallback)
- localStorage'a "boot_seen" anahtarı koy, her ziyarette tekrar gösterme (sadece 24 saatte bir)

### A2. OG image + meta düzeltmeleri
- `index.html`'deki OG tagları zaten Mustafa'ya yönelik
- Eksik: gerçek `cover-image.png` (1200×630). Eski Puru'nun cover'ı silinmeli, yenisi konmalı
- Mustafa elle hazırlayacak (ekran görüntüsü + isim/başlık overlay)
- Twitter, LinkedIn handle'ları eklenebilir

### A3. PWA "Yükle" prompt'u
- `vite-plugin-pwa` zaten kurulu, manifest hazır
- `beforeinstallprompt` event yakalayıp dock'ta veya köşede "Uygulamayı yükle" butonu

### A4. Yeni mesaj → e-posta bildirimi
- `server/`'a `nodemailer` ekle
- `.env`'e `SMTP_*` (host, port, user, pass) veya Gmail App Password
- `/api/public/contact` endpoint'i mesajı DB'ye yazdıktan sonra Mustafa'ya mail at
- Mail içeriği: kim, e-posta, mesaj, admin paneline link

### A5. Sertifika / hızlı erişim güncellemeleri
- About sayfasına: "Şu an üzerinde çalıştığım" mini-banner
- Admin'de "current_status" alanı (kısa metin)

---

## 🎨 Faz B — Konsept Güçlendiriciler (Yeni macOS App'leri)

### B1. Spotlight (⌘K) araması
- Yeni component: `Spotlight.svelte` — ekran ortasında modal
- **Cmd+K** veya **Ctrl+K** ile aç
- Tüm app'leri + projeleri + CV bölümlerini arar
- Sonuca tıklanınca ilgili app açılır

### B2. Terminal app
- Yeni dock app — `Terminal.svelte`
- Komutlar:
  - `whoami` → "Mustafa Kırpık — Yazılım Geliştirici"
  - `cat about.txt` → about içeriği
  - `ls projects/` → projeleri listele
  - `cat projects/X.md` → tek proje detayı
  - `curl github.com/mustafakrpk` → GitHub stats
  - `clear`, `help`, `exit`
- Sahte tab tamamlama, geçmiş (yukarı/aşağı ok)
- Yeşil/beyaz prompt teması

### B3. Notes / Blog app
- DB şeması ekle: `posts (id, slug, title, content_md, published_at, is_published)`
- Admin'de `/admin/blog` — markdown editor + preview
- Public: dock'tan açılan `Notes.svelte` — yazı listesi + tıklayınca tam metin
- Markdown render için `marked` veya `markdown-it`

### B4. Photos / Galeri app
- DB: `photos (id, title, image_url, caption, display_order)`
- Admin: bulk upload + sıralama (drag-drop)
- Public: grid + tıklayınca büyütme (lightbox)
- (Opsiyonel — eğer paylaşacak görselin yoksa atla)

### B5. Açılış easter egg'i
- Konami kodu (↑↑↓↓←→←→BA) tuş dizisi yakalanırsa
- Bütün pencerelere "shake" animasyonu, ekran tersine döner, sonra geri
- Veya gizli bir terminal komutu: `sudo rm -rf /` → eğlenceli ekran

---

## 🏗️ Faz C — Büyük Altyapı

### C1. Admin analytics dashboard
- DB: `events (id, type, app_id, project_id, ip, user_agent, created_at)`
- Frontend her app açılışında `POST /api/public/event`
- Admin dashboard'da:
  - Toplam ziyaret
  - Her app için açılma sayısı (bar chart)
  - Hangi projeye en çok tıklandı
  - Saat bazlı grafik (en aktif zamanlar)
- Veri toplamada KVKK uyumu: IP'yi hash'le

### C2. i18n (TR + EN)
- DB tabloları çiftleştirilmeli: `about_tr`, `about_en` ya da JSON `content_translations` kolonu
- TopBar'a TR/EN switcher
- localStorage'a tercih kaydı
- Tüm metin alanları admin'de iki dil tab'ı

### C3. GitHub stats widget
- About sayfasında: son commit, popüler repo, total stars
- GitHub API (`api.github.com/users/mustafakrpk`) — public, auth gerekmiyor (rate limit 60/saat)
- Backend cache et (15 dakika TTL) ki rate limit'i geçme
- Yeni endpoint: `/api/public/github-stats`

### C4. Mobil zoom + swipe modu
- En zorlu özellik — şu an mobilde site neredeyse kullanılamaz
- `@media (max-width: 768px)` ile:
  - macOS arayüzü `scale(0.6)` küçült
  - Pencereler tam ekran açılır
  - Sağ/sol swipe ile pencere değişir
  - Alt swipe ile minimize
- Alternatif: mobilde tamamen ayrı, klasik scroll'lu görünüm

### C5. Self-hosted analytics (Plausible / Umami) rehberi
- Ubuntu VPS'te ikinci subdomain (`analytics.mustafakırpık.com`)
- Docker-compose ile Umami kurulumu (Plausible'dan hafif)
- Site'ye script ekle (`<script>` tag)
- `deploy/analytics.md` adlı yeni belge

---

## ✅ Durum — koda karşı doğrulandı

### Tamamlandı

- [x] **A1** Boot ekranı (`BootupScreen.svelte`) — *sesi hariç, aşağıya bak*
- [x] **A3** PWA install prompt (`beforeinstallprompt`)
- [x] **A4** E-posta bildirimi (`server/src/lib/mailer.ts`)
- [x] **B1** Spotlight (⌘K)
- [x] **B2** Terminal — neofetch, gh, ai, sudo easter egg, Tab tamamlama
- [x] **B3** Notes / Blog app
- [x] **B5** Easter egg
- [x] **C1** Admin analytics (`server/src/routes/analytics.ts`)
- [x] **C2** i18n TR + EN (`src/configs/i18n/`)
- [x] **C3** GitHub stats (`server/src/routes/github.ts`)
- [x] **C4** Mobil mod — iOS benzeri springboard + tam ekran uygulamalar
- [x] **C5** Self-hosted analytics rehberi (`deploy/analytics.md`)

### ROADMAP'te yoktu, sonradan eklendi

- [x] **AskMe** — Gemini ile grounded AI asistan
- [x] **Canlı imleçler + presence** (WebSocket)
- [x] **VSCode** app — canlı kod editörü
- [x] **AppStore** app
- [x] **CV import** + PDF indirme
- [x] **GitHub projeleri import** script'i
- [x] Test altyapısı + CI (GitHub Actions)

### Kalan

- [ ] **A1 açılış sesi** — `public/` altında hiç ses dosyası yok, kodda `Audio()`
      çağrısı da yok. Telifli Apple sesi kullanılamaz; ses dosyası dışarıdan sağlanmalı.
      Ayrıca tarayıcı autoplay politikası için kullanıcı etkileşimi fallback'i gerekir.
- [ ] **A2 OG cover** — `public/cover-image.png` mevcut; Mustafa'nın kendi görseliyle
      değiştirilip değiştirilmediği doğrulanmadı.
- [ ] **A5 "Şu an üzerinde çalıştığım" banner + admin `current_status` alanı**
- [ ] **B4 Photos / Galeri** — opsiyonel; paylaşılacak görsel yoksa atlanabilir

## 🛑 Atlanan / Düşürülen (en azından şimdilik)

- ❌ Music app (Spotify embed) — kişisel zevk değişken, profesyonel değer düşük
- ❌ iMessage tarzı chat — şirin ama içerik üretmek külfetli
- ❌ Calendar'a etkinlik bağlama — public açısından değeri sınırlı

---

## 📁 Plan dosyaları

- [PLAN.md](PLAN.md) — Backend ve admin paneli (tamamlandı)
- **[ROADMAP.md](ROADMAP.md)** — Yeni özellikler (bu dosya, 18 Ağustos 2026'da koda karşı doğrulandı)
- [deploy/README.md](deploy/README.md) — Sunucu kurulumu
