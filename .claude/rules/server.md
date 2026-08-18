---
paths:
  - "server/src/**/*.ts"
  - "server/drizzle.config.ts"
---

# Backend — Hono + Drizzle + MySQL

`server/` bağımsız bir pakettir. Kurulum daima `pnpm install --ignore-workspace`.

## İçe aktarma uzantısı `.js` — `.ts` değil

Kaynak dosyalar `.ts`, ama import'lar **`.js`** yazar:

```ts
import { get_session_user } from '../lib/session.js';   // doğru
import { get_session_user } from '../lib/session.ts';   // ÇALIŞMAZ
import { get_session_user } from '../lib/session';      // ÇALIŞMAZ
```

ESM/NodeNext çözümlemesi budur. Frontend'de durum farklıdır (orada `🍎/` takma adı
ve `.ts` uzantısı kullanılır) — iki tarafı karıştırma.

## Ortam değişkenleri

`process.env`'e **doğrudan erişme.** Tümü `src/lib/env.ts` içinde zod ile doğrulanır;
şemada olmayan bir değişken kullanmak istiyorsan önce oraya ekle.

Varsayılanı olmayan, yani **zorunlu** olanlar: `PUBLIC_BASE_URL`, `DATABASE_URL`,
`ADMIN_GITHUB_USERNAME`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_REDIRECT_URL`.
Biri eksikse süreç ayağa kalkmaz.

## Veritabanı

- Şemayı `src/db/schema.ts` içinde değiştir, sonra `pnpm db:generate`.
- `src/db/migrations/` altındaki üretilmiş SQL **elle düzenlenmez**.
- `pnpm db:migrate` ve `pnpm db:seed` gerçek veritabanına yazar — çalıştırmadan önce sor.

## Kimlik ve yetki

- Korumalı uçlar `require_auth` middleware'ini kullanır (`src/middleware/auth.ts`).
  Kendi çerez/oturum kontrolünü yazma.
- Yetki modeli tek katmanlıdır: giriş yapan GitHub kullanıcı adı `ADMIN_GITHUB_USERNAME`
  ile eşleşiyorsa admin, değilse değil. Rol tablosu yok.
- Oturum çerezi `SESSION_COOKIE` sabitinden okunur (`src/lib/session.ts`).

## Rate limit

`src/index.ts` içinde uç bazında tanımlıdır — genel `/api/*` için dakikada 120,
`contact` için 5, `chat` için 15, GitHub OAuth callback için 10. Yeni bir maliyetli
veya kötüye kullanılabilir uç eklerken kendi limitini de ekle.

## Adlandırma

Backend'de de `snake_case`: `require_auth`, `get_session_user`, `admin_routes`,
`rate_limit`. Tipler `PascalCase` (`AuthVars`, `User`).
