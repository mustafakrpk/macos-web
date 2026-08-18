---
name: hazir-mi
description: Push öncesi CI'ın yaptığının aynısını yerelde koşturur - frontend check/test/build ve backend test/build. Sonucu kanıtla raporlar.
disable-model-invocation: true
---

`.github/workflows/ci.yml` ile **birebir aynı** adımları yerelde çalıştır.
Amaç: CI'ın kırılacağını push'tan önce öğrenmek.

## Frontend (depo kökü)

```bash
pnpm check
pnpm test
pnpm build
```

## Backend (`server/`)

```bash
cd server
pnpm test
pnpm build
```

## Raporlama

Her adım için **gerçek çıktıyı göster** — "geçti" demen kanıt değil.

Sonunda tek satırlık özet ver:

```
check: 0 hata / N uyarı · frontend test: N geçti · build: OK
server test: N geçti · server build: OK
```

## Değerlendirme

- **Bilinen temel durum:** `pnpm check` 0 hata ve 1 uyarı verir (`About.svelte`
  içindeki kullanılmayan `p strong` seçicisi). Uyarı sayısı 1'den fazlaysa,
  fazlası bu değişiklikten gelmiştir — söyle.
- Herhangi bir adım kırmızıysa **dur**, kalan adımları koşturma, neyin kırıldığını
  ve hangi dosyadan geldiğini bildir.
- Testi veya kontrolü geçirmek için testi/yapılandırmayı gevşetme.

Bir şeyi düzeltmen istenmediyse yalnızca raporla; kendiliğinden düzeltmeye başlama.
