#!/usr/bin/env bash
# Tapa áreas de um print (ex.: ID do merchant) com uma tarja escrita na própria imagem.
# Uso: tarja.sh <entrada.png> <saida.png> "x,y,largura,altura[,corDeFundo[,texto]]" [...]
#   corDeFundo: padrão #1b1b1b (tema escuro). texto: padrão "[merchant oculto]".
# A tarja é gravada nos pixels do PNG de saída: o dado tapado não fica na imagem.
# Para achar x/y: recorte.sh <print.png> <x> <y> mostra a região ampliada.
set -euo pipefail
[ $# -ge 3 ] || { sed -n '2,6p' "$0"; exit 1; }
entrada=$(realpath "$1"); saida=$(realpath -m "$2"); shift 2
CHROME=${CHROME:-$(ls -d ~/.cache/ms-playwright/chromium-*/chrome-linux/chrome 2>/dev/null | tail -1)}
[ -x "$CHROME" ] || { echo "Chromium do playwright não encontrado (defina CHROME=...)" >&2; exit 1; }
read -r W H < <(file "$entrada" | sed -E 's/.*, ([0-9]+) x ([0-9]+),.*/\1 \2/')
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
cp "$entrada" "$tmp/in.png"
caixas=""
for a in "$@"; do
  IFS=, read -r x y w h cor texto <<<"$a"
  cor=${cor:-#1b1b1b}; texto=${texto:-[merchant oculto]}
  caixas+="<div style=\"position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:${cor};display:flex;align-items:center;padding-left:4px;font:13px monospace;color:#9aa3ad;overflow:hidden;white-space:nowrap\">${texto}</div>"
done
cat >"$tmp/p.html" <<EOF
<html><body style="margin:0;overflow:hidden"><div style="position:relative"><img src="in.png" style="display:block">$caixas</div></body></html>
EOF
"$CHROME" --headless --no-sandbox --disable-gpu --allow-file-access-from-files --hide-scrollbars \
  --window-size="$W,$H" --screenshot="$saida" "file://$tmp/p.html" >/dev/null 2>&1
echo "tarja aplicada: $saida (${W}x${H})"
