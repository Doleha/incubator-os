#!/bin/bash
# setup/init-company.sh — Creates Company + Executive Director in Paperclip
# Called by setup.sh. Requires PAPERCLIP_API_URL and PAPERCLIP_API_KEY in environment.

set -e

PAPERCLIP_URL=${PAPERCLIP_API_URL:-http://localhost:3100}

echo "  Creating company..."
COMPANY=$(curl -sf -X POST "$PAPERCLIP_URL/api/companies" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nonprofit Incubator & Accelerator",
    "description": "AI-powered operations platform for nonprofit incubator and accelerator programs.",
    "goal": "Run full-cycle Incubator and Accelerator programs serving founders from underserved communities — from intake through graduation and alumni success."
  }')
COMPANY_ID=$(echo "$COMPANY" | python3 -c "import sys,json;print(json.load(sys.stdin)['id'])")
echo "  Company: $COMPANY_ID"

echo "  Creating Executive Director..."
CEO=$(curl -sf -X POST "$PAPERCLIP_URL/api/companies/$COMPANY_ID/agents" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Executive Director\",
    \"role\": \"ceo\",
    \"title\": \"Executive Director\",
    \"capabilities\": \"Strategic leadership of a nonprofit incubator and accelerator. Builds the org through sequential director hires approved by the Board.\",
    \"adapterType\": \"local_llm\",
    \"adapterConfig\": {
      \"instructionsFilePath\": \"executive-director.md\",
      \"initialDelaySeconds\": $(( RANDOM % 300 ))
    },
    \"runtimeConfig\": {
      \"schedule\": { \"enabled\": true, \"intervalSec\": 86400, \"maxConcurrentRuns\": 1 },
      \"contextMode\": \"fat\"
    },
    \"budgetMonthlyCents\": 0
  }")
CEO_ID=$(echo "$CEO" | python3 -c "import sys,json;print(json.load(sys.stdin)['id'])")
echo "  Executive Director: $CEO_ID"

# Save IDs for reference
echo "COMPANY_ID=$COMPANY_ID" > .ids
echo "CEO_ID=$CEO_ID" >> .ids
echo "  IDs saved to .ids"
