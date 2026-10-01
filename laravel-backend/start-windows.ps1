# Nimma Seva — Laravel 11 Backend Boot Commands (Windows PowerShell)
# Run these from inside: laravel-backend\

# ── Step 1: First-time setup ─────────────────────────────────────────────────
Copy-Item .env.example .env

docker compose up -d --build

# Wait ~20s for MySQL to be ready, then:
docker compose exec app php artisan key:generate --ansi
docker compose exec app php artisan migrate --force
docker compose exec app php artisan db:seed --force
docker compose exec app php artisan config:cache
docker compose exec app php artisan route:cache

# ── Step 2: Day-to-day start ─────────────────────────────────────────────────
docker compose up -d

# ── Step 3: Stop ─────────────────────────────────────────────────────────────
docker compose down

# ── Step 4: View logs ────────────────────────────────────────────────────────
docker compose logs -f app
docker compose logs -f worker

# ── Step 5: Run artisan commands ─────────────────────────────────────────────
docker compose exec app php artisan <command>

# ── Endpoints after startup ───────────────────────────────────────────────────
# API Base URL  : http://localhost:8080/api
# Health Check  : http://localhost:8080/api/health
# WebSocket     : ws://localhost:6001
# MySQL Port    : localhost:3307
# Redis Port    : localhost:6380
