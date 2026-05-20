#!/bin/bash
# setup.sh — One-command installer for Seedwork
# Usage: ./setup.sh
# Run this once after cloning the repo and filling in .env

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Status subcommand: ./setup.sh status — inspect without running setup
if [ "$1" = "status" ]; then
  source .env 2>/dev/null || true
  echo "=== Seedwork Setup Status ==="
  [ -f ./models/Qwen3.6-35B-A3B-UD-Q4_K_XL.gguf ] \
    && echo "  ✓ Model file present" \
    || echo "  ✗ Model file missing — run: bash scripts/download-model.sh"
  TABLES=$(psql "$DATABASE_URL" -tAc \
    "SELECT tablename FROM pg_tables WHERE schemaname='public'" 2>/dev/null)
  for t in cohorts founders ventures milestones mentors matches sessions \
            decisions events_log agent_performance schema_migrations; do
    echo "$TABLES" | grep -q "^${t}$" \
      && echo "  ✓ Table: $t" \
      || echo "  ✗ Table missing: $t"
  done
  COMPANY_ID=$(grep COMPANY_ID .ids 2>/dev/null | cut -d= -f2 || echo "")
  [ -n "$COMPANY_ID" ] \
    && echo "  ✓ Company: $COMPANY_ID" \
    || echo "  ✗ Company not created — run: ./setup.sh"
  CEO_ID=$(grep CEO_ID .ids 2>/dev/null | cut -d= -f2 || echo "")
  [ -n "$CEO_ID" ] \
    && echo "  ✓ Executive Director: $CEO_ID" \
    || echo "  ✗ Executive Director not created"
  curl -sf http://localhost:3100/health > /dev/null 2>&1 \
    && echo "  ✓ Paperclip running" \
    || echo "  ✗ Paperclip not reachable"
  curl -sf http://localhost:9874/health > /dev/null 2>&1 \
    && echo "  ✓ llama-server running" \
    || echo "  ✗ llama-server not reachable"
  exit 0
fi

echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════╗"
echo "║     Seedwork — Setup       ║"
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

# Hardware pre-flight: verify GPU VRAM and CUDA compute capability
echo "  Checking GPU hardware requirements..."
if ! command -v nvidia-smi &> /dev/null; then
  echo -e "${RED}Error: nvidia-smi not found. Install NVIDIA drivers first.${NC}"
  echo "  https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html"
  exit 1
fi
VRAM_MB=$(nvidia-smi --query-gpu=memory.total --format=csv,noheader,nounits | head -n1 | tr -d ' ')
VRAM_GB=$(( VRAM_MB / 1024 ))
if [ "$VRAM_GB" -lt 24 ]; then
  echo -e "${RED}Error: GPU has ${VRAM_GB}GB VRAM. Minimum required is 24GB.${NC}"
  echo "  qwen3.6:35b-a3b UD-Q4_K_XL requires ~22GB VRAM with --n-cpu-moe 17."
  exit 1
fi
COMPUTE=$(nvidia-smi --query-gpu=compute_cap --format=csv,noheader | head -n1 | tr -d ' ')
COMPUTE_MAJOR=$(echo "$COMPUTE" | cut -d'.' -f1)
if [ "$COMPUTE_MAJOR" -lt 8 ]; then
  echo -e "${YELLOW}Warning: GPU compute capability $COMPUTE detected. Flash Attention requires 8.0+.${NC}"
  echo "  Continuing — llama-server will run without Flash Attention."
fi
echo "  GPU: ${VRAM_GB}GB VRAM, compute $COMPUTE ✓"

# Validate org config and generate org-profile.md before starting services
if [ ! -f org.config.json ]; then
  echo -e "${YELLOW}org.config.json not found. Launching setup wizard...${NC}"
  python3 wizard.py
fi
python3 -c "import json; json.load(open('org.config.json'))" 2>/dev/null || {
  echo -e "${RED}Error: org.config.json is not valid JSON.${NC}"
  echo "Re-run: python3 wizard.py"
  exit 1
}
echo "  Generating org profile for agents..."
python3 scripts/generate-org-profile.py

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

echo -e "${YELLOW}[3/5] Waiting for llama-server to load model into VRAM (~60-90s)...${NC}"
# Model file must already exist locally — run scripts/download-model.sh first.
if [ ! -f ./models/Qwen3.6-35B-A3B-UD-Q4_K_XL.gguf ]; then
  echo -e "${RED}Error: ./models/Qwen3.6-35B-A3B-UD-Q4_K_XL.gguf not found.${NC}"
  echo "Run: bash scripts/download-model.sh   (one-time, ~20GB download)"
  exit 1
fi
for i in $(seq 1 24); do   # 24 × 5s = 120s
  sleep 5
  if curl -sf http://localhost:9874/health > /dev/null 2>&1; then
    echo "  llama-server ready."
    break
  fi
  if [ "$i" -eq 24 ]; then
    echo -e "${RED}Timeout waiting for llama-server. Check: docker compose logs llm${NC}"
    exit 1
  fi
  echo "  Loading model... ($((i*5))/120s)"
done

echo -e "${YELLOW}[4/5] Applying Phase 1 database migrations...${NC}"
python3 scripts/migrate.py 1

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
