#!/bin/bash
# setup.sh — One-command installer for Nonprofit Incubator/Accelerator OS
# Usage: ./setup.sh
# Run this once after cloning the repo and filling in .env

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║     Nonprofit Incubator/Accelerator OS — Setup       ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"

if [ ! -f .env ]; then
  echo -e "${RED}Error: .env not found.${NC}"
  echo "Run: cp .env.example .env  then fill in your values."
  exit 1
fi

# shellcheck source=/dev/null
source .env

for var in PAPERCLIP_API_KEY DATABASE_URL; do
  if [ -z "${!var}" ]; then
    echo -e "${RED}Error: $var not set in .env${NC}"
    exit 1
  fi
done

echo -e "${YELLOW}[1/5] Starting Docker services...${NC}"
docker compose up -d

echo -e "${YELLOW}[2/5] Waiting for services to be ready...${NC}"
for i in $(seq 1 30); do
  sleep 2
  if docker compose exec -T paperclip wget -qO- http://localhost:3100/health > /dev/null 2>&1; then
    echo "  Paperclip ready."
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo -e "${RED}Timeout waiting for Paperclip. Check: docker compose logs paperclip${NC}"
    exit 1
  fi
  echo "  Waiting... ($((i*2))/60s)"
done

echo -e "${YELLOW}[3/5] Waiting for llama-server (may take 3-5 min to load model)...${NC}"
for i in $(seq 1 72); do
  sleep 5
  if curl -sf http://localhost:9874/health > /dev/null 2>&1; then
    echo "  llama-server ready."
    break
  fi
  if [ "$i" -eq 72 ]; then
    echo -e "${RED}Timeout waiting for llama-server. Check: docker compose logs llm${NC}"
    exit 1
  fi
  echo "  Loading model... ($((i*5))/360s)"
done

echo -e "${YELLOW}[4/5] Applying Phase 1 database migrations...${NC}"
for f in migrations/phase1/*.sql; do
  psql "$DATABASE_URL" -f "$f" > /dev/null && echo "  ✓ $f"
done

echo -e "${YELLOW}[5/5] Creating company and Executive Director...${NC}"
bash setup/init-company.sh

echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║                Setup Complete! ✓                     ║"
echo "╚══════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo "  Paperclip dashboard:  http://localhost:3100"
echo "  Staff UI:             http://localhost:80"
echo ""
echo "Next steps:"
echo "  1. Open Paperclip and approve the Executive Director strategy"
echo "  2. Approve director hire requests as they appear"
echo "  3. Open Staff UI → DataEntry to seed initial data (mentors, compliance items, etc.)"
echo "  4. Your org builds itself from here"
echo ""
echo "Phase 2 when ready:  bash scripts/activate-phase.sh 2"
echo "n8n bridge:          docker compose -f docker-compose.yml -f docker-compose.n8n.yml up -d"
