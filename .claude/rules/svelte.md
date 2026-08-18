---
paths:
  - "src/**/*.svelte"
  - "src/**/*.svelte.ts"
---

# Svelte 5 — rune desenleri

Bu repo Svelte **5.34** kullanır ve tamamen rune'lara geçmiştir. Store yok.

## Dosya uzantısı

Rune içeren her modül `.svelte.ts` uzantısı almalıdır. Sıradan `.ts` dosyasında
`$state` / `$effect` **derlenmez** ve hata mesajı doğrudan bunu söylemez —
"neden çalışmıyor" arayışının en sık nedeni budur.

## Repoya özgü yardımcılar — kendi versiyonunu yazma

| Yerine | Bunu kullan | Nerede |
|---|---|---|
| `$effect.root(...)` | `auto_destroy_effect_root(fn)` | `src/state/auto-destroy-effect-root.svelte.ts` |
| Elle `localStorage` okuma/yazma | `persisted(key, initial)` | `src/state/persisted.svelte.ts` |
| Elle `setInterval` | `create_interval(...)` | `src/state/interval.svelte.ts` |
| Elle animasyon değeri | `spring(...)` | `src/state/spring.svelte.ts` |

`auto_destroy_effect_root`, bileşen içinde çağrıldığında `onDestroy` ile kendini
temizler; bileşen dışında çağrılırsa dönen fonksiyonu **sen** çağırmak zorundasın.
Ham `$effect.root` kullanırsan bu temizlik kaybolur ve sızıntı olur.

`persisted()` ilkel değerler için `{ value }` sarmalayıcısı döner, nesneler için
nesnenin kendisini. Yani `persisted('x', 0).value` ama `persisted('y', {a:1}).a`.

## Kurallar

- `$state` yalnızca gerçekten değişen veri için. Türetilebilen her şey `$derived`.
- `$effect` içinde durum yazmaktan kaçın; hesaplama ise `$derived` olmalı.
  `$effect` yan etki içindir (DOM, localStorage, ağ).
- Bileşen prop'ları `$props()` ile alınır; `export let` kullanma.
- Yeni bir global durum eklerken `src/state/` altına kendi `.svelte.ts` dosyasını aç,
  bileşenin içine gömme.
- Adlandırma `snake_case` (bkz. CLAUDE.md). Bileşen dosyaları `PascalCase.svelte`.

## Yeni masaüstü uygulaması eklemek

Yalnızca bileşen yazmak yetmez — uygulama masaüstünde görünmez. Gereken üç adım:

1. `src/components/apps/<Ad>/` altına bileşen
2. `src/configs/apps/` içine kayıt (`create_app_config` yardımcısıyla)
3. Kullanıcıya görünen metinler `src/configs/i18n/dictionaries.ts` içine, **tüm dillerde**

`dictionaries.test.ts` diller arası anahtar tutarlılığını doğrular; eksik çeviri testi kırar.
