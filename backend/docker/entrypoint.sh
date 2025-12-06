#!/usr/bin/env sh
set -e

: "${PORT:=8000}"
: "${RUN_SEED:=false}"

# Run migrations before starting the app
php artisan migrate --force || true

# Optionally run seeds (disabled by default to avoid duplicate key errors)
if [ "$RUN_SEED" = "true" ]; then
	php artisan db:seed --force || true
fi

exec php artisan serve --host=0.0.0.0 --port="8000"
