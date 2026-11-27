.PHONY: up down restart logs ps shell db-generate db-migrate db-push db-studio db-seed build clean backup help

# Default target
help:
	@echo "Available commands:"
	@echo "  up           - Start all services in the background"
	@echo "  down         - Stop all services"
	@echo "  restart      - Restart all services"
	@echo "  logs         - Show logs for all services"
	@echo "  ps           - Show status of all services"
	@echo "  shell        - Open a shell in the app container"
	@echo "  db-generate  - Generate Drizzle migrations based on schema"
	@echo "  db-migrate   - Apply Drizzle migrations to the database"
	@echo "  db-push      - Push schema changes directly (no migrations)"
	@echo "  db-studio    - Open Drizzle Studio"
	@echo "  db-seed      - Seed the database with initial data"
	@echo "  build        - Build or rebuild services"
	@echo "  clean        - Stop services and remove volumes"
	@echo "  backup       - Backup database + MinIO to ./backups/"

# Docker Compose Commands
up:
	docker compose up -d

down:
	docker compose down

local-up:
	docker compose --env-file .env.local up -d

local-down:
	docker compose --env-file .env.local down

restart:
	docker compose restart

logs:
	docker compose logs -f

ps:
	docker compose ps

shell:
	docker compose exec app sh

# Database & Drizzle Commands
db-generate:
	bun run db:generate

db-migrate:
	bun run db:migrate

db-push:
	bun run db:push

db-studio:
	bun run db:studio

db-seed:
	bun run db:seed

# Application Commands
build:
	docker compose build

rebuild:
	docker compose build --no-cache
	docker compose up -d --force-recreate

ui-rebuild:
	docker compose up -d --no-deps --build app
	docker compose restart nginx

ui-logs:
	docker compose logs -f app

clean:
	docker compose down -v

backup:
	bash scripts/backup.sh
