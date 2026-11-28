#!/bin/sh

set -e

echo "[Startup] Applying database migrations..."

npm run migrate -- up

echo "[Startup] Starting Academic Hub API..."

exec node dist/server.js
