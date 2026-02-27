#!/bin/bash
pkill cloudflared 2>/dev/null
cloudflared tunnel --url http://127.0.0.1:8787 > tunnel.log 2>&1 &
sleep 5
URL=$(grep -o 'https://[-a-zA-Z0-9]*\.trycloudflare\.com' tunnel.log | head -n 1)
if [ -z "$URL" ]; then echo "❌ Gagal. Cek tunnel.log"; else echo "✅ LINK LU: $URL"; fi
wait
