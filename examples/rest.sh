#!/usr/bin/env bash
# ERX REST examples — curl calls against the public Egypt Research API.
# Usage: ./examples/rest.sh            (uses the hosted endpoint)
#        ERX_API_KEY=... ./examples/rest.sh                  (hosted: free key required)
#        ERX_BASE=http://localhost:8080 ./examples/rest.sh   (self-hosted)
#
# The hosted /api/v1 needs a free API key (sign up at https://egypt-research.marsaplatform.com/#signup).
# All endpoints are GET + JSON.
set -euo pipefail

BASE="${ERX_BASE:-https://egypt-research.marsaplatform.com}"
API="${BASE}/api/v1"
AUTH=()
if [[ -n "${ERX_API_KEY:-}" ]]; then AUTH=(-H "Authorization: Bearer ${ERX_API_KEY}"); fi

echo "== 1. Hybrid search: قانون العمل =="
curl -fsS "${AUTH[@]}" -G "${API}/search" \
  --data-urlencode "q=قانون العمل" \
  --data-urlencode "mode=hybrid" \
  --data-urlencode "limit=5"
echo

echo "== 2. Get one document (id=1) =="
curl -fsS "${AUTH[@]}" "${API}/documents/1"
echo

echo "== 3. Archive coverage + source health =="
curl -fsS "${AUTH[@]}" "${API}/coverage"
echo

echo "== 4. Live indicator: World Bank population, Egypt =="
curl -fsS "${AUTH[@]}" -G "${API}/live/data" \
  --data-urlencode "source=world-bank" \
  --data-urlencode "indicator=SP.POP.TOTL" \
  --data-urlencode "country=EGY"
echo

echo "== 5. Export references as RIS -> egypt-research.ris =="
curl -fsS "${AUTH[@]}" -G "${BASE}/export" \
  --data-urlencode "q=قانون العمل" \
  --data-urlencode "format=ris" \
  -o egypt-research.ris
echo "saved egypt-research.ris"

# Tip: pipe any JSON call through `jq` for readable output, e.g.
#   curl -fsS "${AUTH[@]}" "${API}/coverage" | jq .
