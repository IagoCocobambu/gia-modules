#!/usr/bin/env bash
# Gera o PDF de evidências a partir do HTML e confere que nenhum ID de merchant ficou no texto.
# Uso: gerar-pdf.sh <arquivo.html> [<id de merchant> ...]   → grava <arquivo>.pdf ao lado
#   Recusa: UUID logo depois de "merchants/" ou perto da palavra "merchant", e os IDs passados.
#   Outros UUIDs (x-ifood-request-id, id do pedido) podem ficar — são listados para conferência.
set -euo pipefail
[ $# -ge 1 ] || { sed -n '2,5p' "$0"; exit 1; }
html=$(realpath "$1"); shift; pdf="${html%.html}.pdf"
CHROME=${CHROME:-$(ls -d ~/.cache/ms-playwright/chromium-*/chrome-linux/chrome 2>/dev/null | tail -1)}
[ -x "$CHROME" ] || { echo "Chromium do playwright não encontrado (defina CHROME=...)" >&2; exit 1; }
uuid='[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}'
falha=0
if grep -n -o -i -E "(merchants/|merchant[^<]{0,40})$uuid" "$html" >&2; then falha=1; fi
for id in "$@"; do grep -n -o -i "$id" "$html" >&2 && falha=1; done
grep -q '{{' "$html" && { echo "ATENÇÃO: sobrou placeholder {{...}} no HTML" >&2; falha=1; }
[ $falha -eq 0 ] || { echo "ATENÇÃO: ID de merchant no HTML (acima). PDF não gerado." >&2; exit 2; }
"$CHROME" --headless --no-sandbox --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="$pdf" "file://$html" 2>&1 | grep -o '[0-9]* bytes written.*' || true
outros=$(grep -o -E "$uuid" "$html" | sort -u | wc -l)
paginas=$(grep -a -c '/Type /Page$' "$pdf" || true)
echo "ok: $pdf ($paginas página(s)); nenhum ID de merchant no texto; $outros outro(s) UUID (request-id, pedido) — confira. Prints à parte."
