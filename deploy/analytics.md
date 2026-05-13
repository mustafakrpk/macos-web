# Self-Hosted Analytics — Umami Kurulumu

> **Bu opsiyoneldir.** Site içinde zaten bir analytics dashboard'ı var (`/admin/analytics`); bu dosya Umami gibi dış bir analytics platformunu kendi sunucuna kurmak içindir.
>
> Umami, Google Analytics'in KVKK uyumlu açık kaynak alternatifidir. Çerez kullanmaz, IP toplamaz.

## Neden Umami (Plausible yerine)?

- **Umami:** Ücretsiz self-host, hafif (~100 MB RAM), Docker ile basit, MIT lisansı
- **Plausible:** Açık kaynak ama ücretli kurulum desteği vardır, self-host için Elixir/Postgres gerek

Umami önerilir — sade ve yeterli.

---

## Kurulum (Docker Compose)

### 1. Subdomain ekle

Domain yöneticisinde **A kaydı** oluştur:
- Host: `analytics`
- Value: sunucunun IP'si

Bekleme süresi: 5-15 dakika.

### 2. docker-compose.yml hazırla

Sunucuda:

```bash
sudo mkdir -p /var/www/umami
cd /var/www/umami
sudo nano docker-compose.yml
```

İçerik:

```yaml
version: '3'
services:
  umami:
    image: ghcr.io/umami-software/umami:postgresql-latest
    ports:
      - "127.0.0.1:3001:3000"
    environment:
      DATABASE_URL: postgresql://umami:GUCLU_SIFRE@db:5432/umami
      DATABASE_TYPE: postgresql
      APP_SECRET: $(openssl rand -hex 32 ile üretilen değer)
    depends_on:
      - db
    restart: always

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: umami
      POSTGRES_USER: umami
      POSTGRES_PASSWORD: GUCLU_SIFRE
    volumes:
      - ./pgdata:/var/lib/postgresql/data
    restart: always
```

### 3. Docker'ı çalıştır

Docker yoksa kur:

```bash
curl -fsSL https://get.docker.com | sudo bash
sudo apt install -y docker-compose-plugin
```

Başlat:

```bash
cd /var/www/umami
sudo docker compose up -d
sudo docker compose ps   # umami ve db "Up" görünmeli
```

### 4. nginx reverse proxy

```bash
sudo nano /etc/nginx/sites-available/analytics
```

```nginx
server {
    listen 80;
    server_name analytics.mustafakırpık.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/analytics /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d analytics.mustafakırpık.com
```

### 5. İlk girişte

- Tarayıcıda `https://analytics.mustafakırpık.com` aç
- Varsayılan giriş: `admin / umami`
- **Şifreni hemen değiştir** (Settings → Profile)

### 6. Site ekle

- Umami panelinde: Settings → Websites → "Add website"
- Name: `Mustafa Kırpık Portfolyo`
- Domain: `mustafakırpık.com` (veya alt domain'in)
- Website ID kopyala

### 7. Site'ye script ekle

Portfolyo projesinde [index.html](../index.html)'in `</head>` etiketinden önce:

```html
<script
    defer
    src="https://analytics.mustafakırpık.com/script.js"
    data-website-id="UMAMI_WEBSITE_ID_BURAYA"
></script>
```

> ⚠️ Script `defer` ile yükleniyor; sayfa açılışını yavaşlatmaz.

Site'yi yeniden build et + deploy et:
```bash
cd /var/www/portfolio
git pull
pnpm build
sudo systemctl reload nginx
```

### 8. Doğrula

- Siteni aç ve gezin
- Umami panelinde 5-10 dakika içinde ziyaretler görünmeye başlar

---

## Yedekleme

PostgreSQL veritabanını günlük yedekle:

```bash
sudo nano /etc/cron.daily/umami-backup
```

```bash
#!/bin/bash
DATE=$(date +%F)
BACKUP_DIR=/var/backups/umami
mkdir -p $BACKUP_DIR
cd /var/www/umami
docker compose exec -T db pg_dump -U umami umami | gzip > $BACKUP_DIR/umami-$DATE.sql.gz
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete
```

```bash
sudo chmod +x /etc/cron.daily/umami-backup
```

---

## Site içi vs Umami — hangisini ne için?

| Site içi `/admin/analytics` | Umami |
|---|---|
| Uygulama açılışları (app_open) | Sayfa görüntülemeleri |
| Proje tıklamaları | Kaynak (referrer) detayı |
| KVKK uyumlu hash'li IP | Gelişmiş cihaz/tarayıcı kırılımı |
| Çok sade dashboard | Profesyonel rapor & filtre |

İkisi de paralel çalışır. Site içi dashboard, **kullanıcı davranışı** (hangi app/proje?) için; Umami **trafik analizi** için (nereden gelmiş, hangi sayfa?).

---

## Alternatifler

| Araç | Self-host | KVKK | Notlar |
|---|---|---|---|
| **Umami** | ✅ | ✅ | Önerilen |
| Plausible | ✅ | ✅ | Daha güzel UI, kurulum biraz daha iş |
| Matomo | ✅ | ✅ | Çok daha kapsamlı, ağır (PHP+MySQL) |
| Google Analytics 4 | ❌ | ⚠️ | KVKK için ek çaba gerekir |
