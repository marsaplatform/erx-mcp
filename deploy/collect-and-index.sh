#!/bin/sh
set -eu

node /app/dist/cli.js backup --output "/backups/research-$(date -u +%Y%m%dT%H%M%SZ).db"
ingest_status=0
node /app/dist/cli.js ingest --channel auto --full-text --max-urls 200 --html-max-urls 20 || ingest_status=$?
node /app/dist/cli.js index --provider local

# مصدر بيفشل في صمت مابيوقفش الزحف، فلازم فحص منفصل يفشل المهمة ويبان في systemd
health_status=0
node /app/dist/cli.js health --json --max-failures 3 || health_status=$?

if [ "$ingest_status" -ne 0 ]; then exit "$ingest_status"; fi
exit "$health_status"
