#!/bin/sh
if [ ! -f /app/data/db.sqlite ]; then
    cp db.sqlite /app/data/db.sqlite
fi
node /app/.output/server/index.mjs
