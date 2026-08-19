#!/usr/bin/env bash
# Stop hook — kaynak dosya değiştiyse testler geçmeden tur bitmez.
#
# exit 0 → tur biter.  exit 2 → tur bitmez, stderr modele geri verilir.
#
# Üç koruma:
#  1. stop_hook_active → hook'un kendi tetiklediği turda tekrar koşmaz (sonsuz döngü).
#  2. Kaynak dosya değişmediyse hiç test koşmaz (sohbet turlarını yavaşlatmaz).
#  3. Yalnızca vitest koşar (~0.4 sn). svelte-check ve build yavaş olduğu için
#     burada değil, /hazir-mi içinde — push öncesi.
set -uo pipefail

input=$(cat)

# Teşhis kaydı: hook'un Claude Code tarafından gerçekten çağrıldığını doğrular.
# .claude/gate.log gitignore'ludur. Kaldırmak zararsızdır.
printf '%s tetiklendi\n' "$(date -Is)" >> "$(dirname "${BASH_SOURCE[0]}")/../gate.log" 2>/dev/null

printf '%s' "$input" | grep -q '"stop_hook_active"[[:space:]]*:[[:space:]]*true' && exit 0

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$root" || exit 0
command -v pnpm >/dev/null 2>&1 || exit 0

changed_front=$(git status --porcelain -- src 2>/dev/null | grep -cE '\.(ts|svelte)$')
changed_back=$(git status --porcelain -- server/src 2>/dev/null | grep -cE '\.ts$')

[ "$changed_front" -eq 0 ] && [ "$changed_back" -eq 0 ] && exit 0

fail() {
  echo "$1" >&2
  echo "" >&2
  echo "Testleri geçirmeden turu bitirme. Testi değiştirerek yeşile boyama;" >&2
  echo "kök nedeni bul ve düzelt. Takıldıysan dur ve kullanıcıya sor." >&2
  exit 2
}

if [ "$changed_front" -gt 0 ]; then
  if ! out=$(pnpm test 2>&1); then
    fail "Frontend testleri KIRMIZI (pnpm test):

$(printf '%s' "$out" | tail -25)"
  fi
fi

if [ "$changed_back" -gt 0 ]; then
  if ! out=$(cd server && pnpm test 2>&1); then
    fail "Backend testleri KIRMIZI (server: pnpm test):

$(printf '%s' "$out" | tail -25)"
  fi
fi

exit 0
