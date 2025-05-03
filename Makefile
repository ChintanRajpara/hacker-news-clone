run-dev:
	docker compose -f docker-compose.development.yml up --build
run-serve:
	docker compose -f docker-compose.production.yml up --build -d