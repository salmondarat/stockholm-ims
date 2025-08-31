MinIO Setup Helper
==================

This folder includes a small script to configure MinIO for local development:

- Creates/updates an alias
- Ensures the bucket exists
- Applies CORS for browser uploads
- Grants anonymous read for `uploads/` and `items/` prefixes

Prerequisites
- MinIO server running (see `infra/docker-compose.dev.yml`)
- MinIO client `mc` installed and on your PATH

Quick Start
- Run:
  bash infra/setup-minio.sh \
    --endpoint http://localhost:9000 \
    --access-key minio \
    --secret-key minio12345 \
    --bucket stockholm \
    --origin http://localhost:3000 \
    --alias local

Notes
- Args default from your `.env` if present (`S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `APP_ORIGIN`).
- If you keep the bucket private, remove the anonymous read calls and serve images via a proxy route or signed GETs.

