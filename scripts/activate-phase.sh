#!/bin/bash
# scripts/activate-phase.sh — Activates Phase 2 or Phase 3 migrations
# Usage: bash scripts/activate-phase.sh 2
# Requires DATABASE_URL in environment (sources .env if present)

set -e

PHASE=${1:-2}

if [ -f .env ]; then
  # shellcheck source=/dev/null
  source .env
fi

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL not set. Source .env or set it manually."
  exit 1
fi

if [ ! -d "migrations/phase${PHASE}" ]; then
  echo "Error: migrations/phase${PHASE} directory not found."
  exit 1
fi

echo "Applying Phase $PHASE migrations..."
python3 scripts/migrate.py "$PHASE"

echo ""
echo "Phase $PHASE migrations applied."
echo ""
echo "In Paperclip, prompt the Executive Director:"
echo "  'Phase $PHASE is ready. Please request Phase $PHASE director hires.'"
