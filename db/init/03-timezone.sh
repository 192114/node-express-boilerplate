#!/bin/bash
set -e

echo "==> Setting timezone..."

# 默认 Asia/Shanghai，可改成你的时区
TZ_VALUE=${POSTGRES_TIMEZONE:-'Asia/Shanghai'}

psql -v ON_ERROR_STOP=1 -U "$POSTGRES_OWNER_USER" -d "$POSTGRES_DB" <<EOSQL
  ALTER DATABASE "${POSTGRES_DB}" SET timezone TO '${TZ_VALUE}';
  ALTER ROLE "${POSTGRES_OWNER_USER}" SET timezone TO '${TZ_VALUE}';
  ALTER ROLE "${POSTGRES_APP_USER}" SET timezone TO '${TZ_VALUE}';
EOSQL