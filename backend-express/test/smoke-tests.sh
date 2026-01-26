#!/usr/bin/env bash
# Simple smoke tests for local Express scaffold (assumes server on localhost:8000)
set -euo pipefail
BASE=${BASE_URL:-http://127.0.0.1:8000}

echo "Health check"
curl -sS ${BASE}/health | jq

echo "Register user"
RESP=$(curl -sS -X POST ${BASE}/api/auth/register -H "Content-Type: application/json" -d '{"login":"alice","password":"password","name":"Alice"}')
echo "$RESP" | jq

TOKEN=$(curl -sS -X POST ${BASE}/api/auth/login -H "Content-Type: application/json" -d '{"login":"alice","password":"password"}' | jq -r '.access_token')
echo "Got token: ${TOKEN:0:20}..."

echo "Create church"
curl -sS -X POST ${BASE}/api/churches -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"name":"St Mary"}' | jq

echo "Create preacher"
curl -sS -X POST ${BASE}/api/preachers -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"name":"John Doe"}' | jq

echo "Create session"
curl -sS -X POST ${BASE}/api/sessions -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"preacher_id":null, "church_id":null, "service_type":"morning"}' | jq

echo "List sessions"
curl -sS ${BASE}/api/sessions | jq
