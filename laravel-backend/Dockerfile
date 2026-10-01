FROM php:8.3-fpm-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libjpeg-turbo-dev \
    libwebp-dev \
    freetype-dev \
    libzip-dev \
    zip \
    unzip \
    oniguruma-dev \
    linux-headers \
    icu-dev \
    libxml2-dev \
    zlib-dev

# Install PHP extensions
RUN docker-php-ext-configure gd \
        --with-freetype \
        --with-jpeg \
        --with-webp \
    && docker-php-ext-install \
        pdo \
        pdo_mysql \
        mbstring \
        exif \
        pcntl \
        bcmath \
        gd \
        zip \
        intl \
        xml \
        sockets

# Install Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Install Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy composer files first (layer caching)
COPY composer.json composer.lock* ./
RUN composer install --no-scripts --no-autoloader --no-dev --prefer-dist

# Copy application
COPY . .

# Finalise autoloader
RUN composer dump-autoload --optimize --no-dev

# Permissions
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# ── Queue worker stage ─────────────────────────────────────────────────────────
FROM base AS worker
CMD ["php", "artisan", "queue:work", "--sleep=3", "--tries=3", "--timeout=90"]

# ── Scheduler stage ───────────────────────────────────────────────────────────
FROM base AS scheduler
CMD ["/bin/sh", "-c", "while true; do php /var/www/artisan schedule:run --no-interaction; sleep 60; done"]

# ── Default: php-fpm ──────────────────────────────────────────────────────────
FROM base AS app
EXPOSE 9000
CMD ["php-fpm"]
