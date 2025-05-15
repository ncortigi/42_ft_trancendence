build:
	docker compose up --build

clear-docker:
	docker rm -f $(shell docker ps -a -q)
	docker volume rm $(shell docker volume ls -q)
	docker network rm $(shell docker network ls --format '{{.ID}} {{.Name}}' | grep -vE '^(bridge|host|none)$$' | awk '{print $$1}')

run-db:
	docker compose up -d postgres

run-backend:
	docker compose up backend

run-frontend:
	docker compose up frontend

re: clear-docker & 2>/dev/null
	docker compose up --build