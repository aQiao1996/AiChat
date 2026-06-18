#!/bin/sh
set -e

cd /app

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "Running database migrations..."
  npm run migration:run:prod
fi

exec "$@"
