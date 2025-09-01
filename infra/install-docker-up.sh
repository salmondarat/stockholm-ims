#!/usr/bin/env bash
set -euo pipefail

# Installs the local docker CLI plugin so `docker up` works.
# Usage: bash infra/install-docker-up.sh [--copy]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PLUGIN_SRC="$REPO_ROOT/bin/docker-up"

if [[ ! -f "$PLUGIN_SRC" ]]; then
  echo "Plugin not found: $PLUGIN_SRC" >&2
  exit 1
fi

DOCKER_CONFIG_DIR="${DOCKER_CONFIG:-$HOME/.docker}"
PLUGIN_DIR="$DOCKER_CONFIG_DIR/cli-plugins"
mkdir -p "$PLUGIN_DIR"

TARGET="$PLUGIN_DIR/docker-up"

if [[ "${1:-}" == "--copy" ]]; then
  cp -f "$PLUGIN_SRC" "$TARGET"
else
  ln -snf "$PLUGIN_SRC" "$TARGET"
fi

chmod +x "$TARGET"
echo "Installed docker CLI plugin: $TARGET"
echo "Try: docker up -d"

