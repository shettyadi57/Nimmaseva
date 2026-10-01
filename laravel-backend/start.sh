#!/bin/bash
# ── Nimma Seva Laravel Backend — Docker Bootstrap Script ────────────────────
set -e

echo "🚀 Starting Nimma Seva Laravel Backend..."

# Copy env if not exists
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📋 Created .env from .env.example"
fi

# Start containers
docker compose up -d --build

echo "⏳ Waiting for MySQL to be ready..."
until docker compose exec -T mysql mysqladmin ping -h localhost -u nimmaseva -pnimmaseva_secret --silent 2>/dev/null; do
    sleep 2
done
echo "✅ MySQL is ready."

# Generate app key
docker compose exec app php artisan key:generate --ansi --no-interaction

# Run migrations
docker compose exec app php artisan migrate --force --no-interaction

# Seed database
docker compose exec app php artisan db:seed --no-interaction

# Clear and cache config
docker compose exec app php artisan config:cache
docker compose exec app php artisan route:cache

echo ""
echo "🎉 Nimma Seva Laravel Backend is running!"
echo ""
echo "  API Base:    http://localhost:8080/api"
echo "  Health:      http://localhost:8080/api/health"
echo "  WebSocket:   ws://localhost:6001"
echo "  MySQL:       localhost:3307 (nimmaseva/nimmaseva_secret)"
echo ""
echo "  Admin Login: admin@nimmaseva.in / Admin@123"
echo "  Operator:    operator@nimmaseva.in / Operator@123"
echo ""
echo "  Vite frontend: http://localhost:5173 (run separately)"
