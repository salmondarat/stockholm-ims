#!/usr/bin/env bash
set -euo pipefail

# Small helper to configure MinIO for this project.
# - Creates/updates an alias
# - Ensures bucket exists
# - Applies CORS for browser PUT/GET
# - Grants anonymous read to uploads/ and items/ prefixes
#
# Usage:
#   bash infra/setup-minio.sh \
#     --endpoint http://localhost:9000 \
#     --access-key minio \
#     --secret-key minio12345 \
#     --bucket stockholm \
#     --origin http://localhost:3000 \
#     [--alias local]

ALIAS="local"
ENDPOINT=${S3_ENDPOINT:-http://localhost:9000}
ACCESS_KEY=${S3_ACCESS_KEY_ID:-minio}
SECRET_KEY=${S3_SECRET_ACCESS_KEY:-minio12345}
BUCKET=${S3_BUCKET:-stockholm}
ORIGIN=${APP_ORIGIN:-http://localhost:3000}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --alias) ALIAS=$2; shift 2 ;;
    --endpoint) ENDPOINT=$2; shift 2 ;;
    --access-key) ACCESS_KEY=$2; shift 2 ;;
    --secret-key) SECRET_KEY=$2; shift 2 ;;
    --bucket) BUCKET=$2; shift 2 ;;
    --origin) ORIGIN=$2; shift 2 ;;
    -h|--help)
      grep '^#' "$0" | sed -e 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

if ! command -v mc >/dev/null 2>&1; then
  echo "Error: MinIO client 'mc' not found on PATH" >&2
  echo "Install from https://min.io/download or 'brew install minio/stable/mc' (macOS)" >&2
  exit 1
fi

echo "==> Setting alias '$ALIAS' -> $ENDPOINT"
mc alias set "$ALIAS" "$ENDPOINT" "$ACCESS_KEY" "$SECRET_KEY" 1>/dev/null

echo "==> Ensuring bucket '$BUCKET' exists"
mc mb --ignore-existing "$ALIAS/$BUCKET" 1>/dev/null || true

echo "==> Applying CORS for origin $ORIGIN"
tmp_cors=$(mktemp)
cat > "$tmp_cors" <<JSON
{
  "CORSConfiguration": {
    "CORSRules": [
      {
        "AllowedOrigins": ["$ORIGIN"],
        "AllowedMethods": ["PUT", "GET", "HEAD"],
        "AllowedHeaders": ["*"],
        "ExposeHeaders": ["ETag", "x-amz-request-id"],
        "MaxAgeSeconds": 3000
      }
    ]
  }
}
JSON
mc cors set "$ALIAS/$BUCKET" "$tmp_cors" 1>/dev/null
rm -f "$tmp_cors"

grant_download_prefix() {
  local path="$1"
  echo "==> Granting anonymous read to $path"
  if mc anonymous set download "$path" 1>/dev/null 2>&1; then
    return 0
  fi
  # Fallback for older mc versions
  mc policy set download "$path" 1>/dev/null
}

grant_download_prefix "$ALIAS/$BUCKET/uploads"
grant_download_prefix "$ALIAS/$BUCKET/items"

echo "✅ MinIO configured. Test listing: mc ls $ALIAS/$BUCKET"

