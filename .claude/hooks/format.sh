#!/usr/bin/env bash
# Düzenlenen dosyaya prettier uygular (.prettierrc: sekme, tek tırnak, 100 sütun).
# server/ altındaki dosyalar da kökteki prettier ile biçimlendirilir — orada ayrı kurulum yok.
# Biçimlendirici yoksa sessizce geçer; hook ASLA işi bloklamaz (her durumda exit 0).
set -uo pipefail

input=$(cat)
file=$(printf '%s' "$input" | grep -oP '"file_path"\s*:\s*"\K[^"]+' | head -1)

[ -z "${file:-}" ] && exit 0
[ -f "$file" ] || exit 0

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
prettier="$root/node_modules/.bin/prettier"

[ -x "$prettier" ] || exit 0

case "$file" in
  *.svelte|*.ts|*.js|*.mjs|*.css|*.scss|*.json|*.md)
    "$prettier" --write "$file" >/dev/null 2>&1
    ;;
esac

exit 0
