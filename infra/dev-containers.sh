#!/usr/bin/env bash
set -euo pipefail

# Simple helper to manage all dev containers.
# Usage:
#   infra/dev-containers.sh            # up (default)
#   infra/dev-containers.sh up         # up -d
#   infra/dev-containers.sh down       # down -v
#   infra/dev-containers.sh stop       # stop
#   infra/dev-containers.sh start      # start
#   infra/dev-containers.sh restart    # restart
#   infra/dev-containers.sh ps         # show status
#   infra/dev-containers.sh logs [svc] # tail logs (optional service)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.dev.yml"

usage() {
  echo "Usage: $0 [up|down|stop|start|restart|ps|logs]"
  exit 1
}

cmd="${1:-up}"
shift || true

case "$cmd" in
  up)
    docker compose -f "$COMPOSE_FILE" up -d
    docker compose -f "$COMPOSE_FILE" ps
    ;;
  down)
    docker compose -f "$COMPOSE_FILE" down -v
    ;;
  stop)
    docker compose -f "$COMPOSE_FILE" stop
    ;;
  start)
    docker compose -f "$COMPOSE_FILE" start
    docker compose -f "$COMPOSE_FILE" ps
    ;;
  restart)
    docker compose -f "$COMPOSE_FILE" down
    docker compose -f "$COMPOSE_FILE" up -d --remove-orphans
    docker compose -f "$COMPOSE_FILE" ps
    ;;
  ps)
    docker compose -f "$COMPOSE_FILE" ps
    ;;
  logs)
    docker compose -f "$COMPOSE_FILE" logs -f "$@"
    ;;
  *)
    usage
    ;;
esac

