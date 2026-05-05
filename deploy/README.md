# Deploy Talimatları — Ubuntu 22.04 VDS

> Hedef: nginx + MySQL + systemd üzerinde çalışan tek-sunucu kurulumu.
> Tahmini süre: ~30 dakika.

## 0. Ön gereksinimler

- Ubuntu 22.04 sunucu, root veya sudo erişimi.
- Bir alan adı (`senin-domain.com`) sunucuya yönlendirilmiş (A kaydı).
- GitHub'ta bir OAuth App. (Aşağıda nasıl oluşturulacağı var.)

---

## 1. Sistem paketleri

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx mysql-server git curl ca-certificates ufw

# Node.js 22.x (NodeSource)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# pnpm
sudo npm install -g pnpm@10.12.3

# (Opsiyonel) Firewall
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

---

## 2. MySQL kurulumu

```bash
sudo mysql_secure_installation   # interaktif; root şifresi belirle, anonymous/test sil
sudo mysql
```

MySQL prompt'ta:

```sql
CREATE DATABASE portfolio_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'portfolio_user'@'localhost' IDENTIFIED BY 'GUCLU_BIR_SIFRE';
GRANT ALL PRIVILEGES ON portfolio_db.* TO 'portfolio_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 3. GitHub OAuth App

1. https://github.com/settings/developers → **New OAuth App**
2. Doldur:
   - **Application name:** Mustafa Kirpik Portfolio
   - **Homepage URL:** `https://senin-domain.com`
   - **Authorization callback URL:** `https://senin-domain.com/api/auth/github/callback`
3. **Register application** → karşına `Client ID` çıkar.
4. **Generate a new client secret** → secret'i kaydet (bir kez gösterilir).

---

## 4. Repo deploy

```bash
sudo mkdir -p /var/www/portfolio
sudo chown -R $USER:$USER /var/www/portfolio
cd /var/www
git clone <REPO_URL> portfolio
cd portfolio
```

### 4a. Frontend build

```bash
pnpm install
pnpm build       # → dist/ klasörü oluşur
```

### 4b. Backend kurulum + .env

```bash
cd server
pnpm install --ignore-workspace
cp .env.example .env
nano .env
```

`.env` içeriği — production değerleri:

```bash
PORT=3000
NODE_ENV=production
PUBLIC_BASE_URL=https://senin-domain.com

DATABASE_URL=mysql://portfolio_user:GUCLU_BIR_SIFRE@localhost:3306/portfolio_db

SESSION_COOKIE_NAME=mk_portfolio_session
SESSION_LIFETIME_DAYS=30
ADMIN_GITHUB_USERNAME=mustafakrpk

GITHUB_CLIENT_ID=4. adımdaki client id
GITHUB_CLIENT_SECRET=4. adımdaki secret
GITHUB_REDIRECT_URL=https://senin-domain.com/api/auth/github/callback

UPLOAD_DIR=/var/www/portfolio/uploads
UPLOAD_PUBLIC_URL=/uploads
MAX_UPLOAD_MB=5
```

### 4c. Migration + seed

```bash
pnpm db:migrate
pnpm db:seed       # ilk veri (örnek hakkımda + projeler)
```

### 4d. Uploads klasörü ve izinler

```bash
sudo mkdir -p /var/www/portfolio/uploads
sudo chown -R www-data:www-data /var/www/portfolio/uploads /var/www/portfolio/server
```

---

## 5. systemd servisi

```bash
sudo cp /var/www/portfolio/deploy/portfolio.service /etc/systemd/system/portfolio.service
sudo systemctl daemon-reload
sudo systemctl enable --now portfolio
sudo systemctl status portfolio   # active görmeli
```

Logları izlemek için:

```bash
sudo journalctl -u portfolio -f
```

---

## 6. nginx

```bash
sudo cp /var/www/portfolio/deploy/nginx.conf.example /etc/nginx/sites-available/portfolio
sudo nano /etc/nginx/sites-available/portfolio   # senin-domain.com → gerçek domain
sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/portfolio
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

Test: `http://senin-domain.com` açıldığında portfolyo görünmeli.
`http://senin-domain.com/api/ping` → `{"ok": true, ...}` dönmeli.

---

## 7. HTTPS (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d senin-domain.com -d www.senin-domain.com
```

certbot otomatik olarak nginx config'ine HTTPS ekler ve redirect kurar.
Yenileme cron olarak gelir (`sudo systemctl status certbot.timer`).

---

## 8. İlk admin girişi

1. Tarayıcıda `https://senin-domain.com/admin/login` aç.
2. **GitHub ile Giriş Yap** → GitHub yetkilendirme → callback.
3. `mustafakrpk` GitHub kullanıcı adıyla giriş yapıyorsan `/admin` dashboard açılır.
4. **Hakkımda → Projeler → Özgeçmiş** sayfalarından içerikleri kendi bilgilerinle doldur.

---

## 9. Güncelleme rutini

```bash
cd /var/www/portfolio
git pull

# frontend değiştiyse
pnpm install
pnpm build

# backend değiştiyse
cd server
pnpm install --ignore-workspace
pnpm db:migrate    # şema değiştiyse
sudo systemctl restart portfolio
```

---

## 10. Yedekleme

### Veritabanı (günlük)

```bash
sudo nano /etc/cron.daily/portfolio-backup
```

İçerik:

```bash
#!/bin/bash
DATE=$(date +%F)
BACKUP_DIR=/var/backups/portfolio
mkdir -p $BACKUP_DIR

mysqldump -u portfolio_user -pGUCLU_BIR_SIFRE portfolio_db | gzip > $BACKUP_DIR/db-$DATE.sql.gz
tar -czf $BACKUP_DIR/uploads-$DATE.tar.gz -C /var/www/portfolio uploads

# 30 günden eski yedekleri sil
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete
```

```bash
sudo chmod +x /etc/cron.daily/portfolio-backup
```

---

## Sorun giderme

| Belirti | Çözüm |
|---|---|
| `502 Bad Gateway` | `sudo systemctl status portfolio` — Node servisi çökmüş olabilir. `journalctl -u portfolio -n 50` ile logları gör. |
| `403 forbidden` admin'de | `.env`'deki `ADMIN_GITHUB_USERNAME` ile giriş yapan GitHub username eşleşmiyor. |
| Upload `EACCES` | `/var/www/portfolio/uploads` izinleri www-data'da değil. `sudo chown -R www-data:www-data uploads/`. |
| Cookie set olmuyor | HTTPS kullanmıyorsun ama `NODE_ENV=production` set; cookie `secure` flag'i ile gönderiliyor, HTTP'de tarayıcı reddediyor. HTTPS'e geç. |
| `Access-Control` hatası | `PUBLIC_BASE_URL` `.env`'de domain'le tam eşleşmeli (`https://` dahil). |

---

## Mimari özet

```
İnternet :443
   │
   ▼
nginx → / → /var/www/portfolio/dist/   (Vite build)
       → /api/* → 127.0.0.1:3000        (systemd: portfolio)
       → /uploads/* → uploads/           (statik)

         ▲
         ▼
       MySQL :3306 (portfolio_db)
```
