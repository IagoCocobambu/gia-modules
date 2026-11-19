#!/usr/bin/env bash
# Mostra uma região do print ampliada 2x, com régua a cada 10 px, para achar x/y da tarja.
# Uso: recorte.sh <print.png> <x> <y> [saida.png]   (região de 350x60 a partir de x,y)
# As marcas da régua mostram a coordenada real na imagem original.
set -euo pipefail
[ $# -ge 3 ] || { sed -n '2,4p' "$0"; exit 1; }
img=$(realpath "$1"); x=$2; y=$3; saida=$(realpath -m "${4:-/tmp/recorte-$$.png}")
CHROME=${CHROME:-$(ls -d ~/.cache/ms-playwright/chromium-*/chrome-linux/chrome 2>/dev/null | tail -1)}
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
cp "$img" "$tmp/in.png"
regua=""
for i in $(seq 0 10 350); do
  cor=$([ $((i % 50)) -eq 0 ] && echo red || echo '#999')
  rot=$([ $((i % 50)) -eq 0 ] && echo "<span style='position:absolute;top:2px;left:2px;font:9px sans-serif;color:red'>$((x + i))</span>" || true)
  regua+="<div style='position:absolute;left:$((i * 2))px;top:0;width:1px;height:140px;background:$cor'>$rot</div>"
done
cat >"$tmp/p.html" <<EOF
<html><body style="margin:0;overflow:hidden;background:#fff"><div style="position:relative;width:700px;height:140px;overflow:hidden">
<div style="position:absolute;top:14px;left:0;width:350px;height:60px;overflow:hidden;transform:scale(2);transform-origin:0 0">
<img src="in.png" style="position:absolute;left:-${x}px;top:-${y}px"></div>$regua</div></body></html>
EOF
"$CHROME" --headless --no-sandbox --disable-gpu --allow-file-access-from-files --hide-scrollbars \
  --window-size=700,300 --screenshot="$saida" "file://$tmp/p.html" >/dev/null 2>&1
echo "$saida"
