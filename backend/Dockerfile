# Lightweight Laravel backend Dockerfile
# Runs PHP-FPM with artisan serve for simplicity

FROM php:8.2-cli

# Install system dependencies and PHP extensions commonly needed by Laravel
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       git unzip libzip-dev libpq-dev libicu-dev libonig-dev \
    && docker-php-ext-install \
       pdo pdo_mysql \
    && docker-php-ext-configure intl \
    && docker-php-ext-install intl zip \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy only Composer files first for better layer caching
COPY composer.json composer.lock* ./

# Install PHP dependencies (no dev by default, can be toggled by build arg)
ARG COMPOSER_NO_DEV=1
RUN composer install --no-interaction --prefer-dist --no-progress $( [ "$COMPOSER_NO_DEV" = "1" ] && echo "--no-dev" )

# Copy the rest of the application code
COPY . .

# Ensure storage and bootstrap cache directories exist and are writable
RUN mkdir -p storage bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Expose application port
EXPOSE 8000

# Environment variables (override at runtime as needed)
ENV APP_ENV=production \
    APP_DEBUG=false \
    APP_URL=http://localhost:8000

# Generate optimized autoload files
RUN composer dump-autoload --optimize

# Default command: serve the Laravel app
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
