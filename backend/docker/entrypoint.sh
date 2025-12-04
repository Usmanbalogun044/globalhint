#!/usr/bin/env sh
set -e

: "${PORT:=8000}"

# Run migrations and seeds before starting the app
php artisan migrate --force
php artisan db:seed --force

exec php artisan serve --host=0.0.0.0 --port="$PORT"
