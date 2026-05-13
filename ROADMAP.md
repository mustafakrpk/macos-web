# Yol Haritası — Sonraki Özellikler

> **Hedef:** Backend + admin paneli temel kuruldu. Şimdi siteyi "ziyaretçi etkilenip ayrılmıyor" seviyesine taşıyacak özellikler.
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

## ✅ Tamamlama sırası (bugünden itibaren)

### Bugün
- [x] ROADMAP.md
- [ ] **A1** Boot ses + welcome
- [ ] **A2** OG meta + favicon
- [ ] **A3** PWA install prompt
- [ ] **A4** E-posta bildirimi

### Yarın
- [ ] **B1** Spotlight (⌘K)
- [ ] **B2** Terminal app
- [ ] **A5** Current status banner

### Sonraki günler
- [ ] **B3** Notes / Blog app
- [ ] **C1** Admin analytics
- [ ] **C3** GitHub stats widget
- [ ] **B4** Photos (opsiyonel)
- [ ] **B5** Easter egg
- [ ] **C2** i18n TR + EN
- [ ] **C4** Mobil mod
- [ ] **C5** Self-hosted analytics

---

## 🛑 Atlanan / Düşürülen (en azından şimdilik)

- ❌ Music app (Spotify embed) — kişisel zevk değişken, profesyonel değer düşük
- ❌ iMessage tarzı chat — şirin ama içerik üretmek külfetli
- ❌ Calendar'a etkinlik bağlama — public açısından değeri sınırlı

---

## 📁 Plan dosyaları

- [PLAN.md](PLAN.md) — Backend ve admin paneli (tamamlandı)
- **[ROADMAP.md](ROADMAP.md)** — Yeni özellikler (bu dosya)
- [deploy/README.md](deploy/README.md) — Sunucu kurulumu
