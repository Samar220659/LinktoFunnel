#!/bin/bash

##########################################################################
# 🚀 AUTONOMOUS POSTING SYSTEM - MASTER STARTER
# Startet alle Komponenten des autonomen Posting-Systems
#
# Components:
# 1. Telegram Bot (Command Interface)
# 2. Auto-Poster Worker (Automatic Posting)
# 3. Content Scheduler (3x Daily Generation)
# 4. Health Monitor (Auto-Recovery)
##########################################################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

GREEN='\033[1;32m'
CYAN='\033[1;36m'
YELLOW='\033[1;33m'
RED='\033[1;31m'
RESET='\033[0m'

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║           🚀 STARTING AUTONOMOUS POSTING SYSTEM                ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check environment
echo -e "${CYAN}🔍 Checking environment...${RESET}"

if [ ! -f "$PROJECT_DIR/.env.local" ]; then
    echo -e "${RED}❌ .env.local not found!${RESET}"
    echo ""
    echo "Please create .env.local with required variables:"
    echo "  - TELEGRAM_BOT_TOKEN"
    echo "  - TELEGRAM_CHAT_ID"
    echo "  - NEXT_PUBLIC_SUPABASE_URL"
    echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo ""
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not installed!${RESET}"
    exit 1
fi

echo -e "${GREEN}✅ Environment OK${RESET}"
echo ""

# Run tests first
echo -e "${CYAN}🧪 Running system tests...${RESET}"
echo ""

if node "$SCRIPT_DIR/test-autonomous-system.js"; then
    echo -e "${GREEN}✅ All tests passed!${RESET}"
else
    echo -e "${YELLOW}⚠️  Some tests failed, but continuing...${RESET}"
fi

echo ""
echo -e "${CYAN}🚀 Starting all services...${RESET}"
echo ""

# Create logs directory
mkdir -p "$PROJECT_DIR/logs"

# Option 1: Start with Health Monitor (RECOMMENDED)
# The health monitor will automatically start and manage all other processes
if [ "$1" = "--with-monitor" ] || [ "$1" = "" ]; then
    echo -e "${GREEN}Starting with Health Monitor (Auto-Recovery enabled)${RESET}"
    echo ""

    cd "$PROJECT_DIR"
    node ai-agent/workers/health-monitor.js

# Option 2: Start individually (for debugging)
elif [ "$1" = "--manual" ]; then
    echo -e "${YELLOW}Starting services manually (no auto-recovery)${RESET}"
    echo ""

    # Start Telegram Bot
    echo -e "${CYAN}▶️  Starting Telegram Bot...${RESET}"
    cd "$PROJECT_DIR"
    nohup node ai-agent/telegram-bot.js > logs/telegram-bot.log 2>&1 &
    BOT_PID=$!
    echo -e "${GREEN}✅ Telegram Bot started (PID: $BOT_PID)${RESET}"
    echo ""
    sleep 2

    # Start Auto-Poster
    echo -e "${CYAN}▶️  Starting Auto-Poster Worker...${RESET}"
    nohup node ai-agent/workers/auto-poster.js > logs/auto-poster.log 2>&1 &
    POSTER_PID=$!
    echo -e "${GREEN}✅ Auto-Poster started (PID: $POSTER_PID)${RESET}"
    echo ""
    sleep 2

    # Start Content Scheduler
    echo -e "${CYAN}▶️  Starting Content Scheduler...${RESET}"
    nohup node ai-agent/workers/content-scheduler.js > logs/content-scheduler.log 2>&1 &
    SCHEDULER_PID=$!
    echo -e "${GREEN}✅ Content Scheduler started (PID: $SCHEDULER_PID)${RESET}"
    echo ""

    # Save PIDs
    echo "$BOT_PID" > "$PROJECT_DIR/logs/bot.pid"
    echo "$POSTER_PID" > "$PROJECT_DIR/logs/poster.pid"
    echo "$SCHEDULER_PID" > "$PROJECT_DIR/logs/scheduler.pid"

    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
    echo -e "${GREEN}✅ ALL SERVICES STARTED!${RESET}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
    echo ""
    echo "📦 Services:"
    echo "   🤖 Telegram Bot (PID: $BOT_PID)"
    echo "   📤 Auto-Poster (PID: $POSTER_PID)"
    echo "   ⏰ Scheduler (PID: $SCHEDULER_PID)"
    echo ""
    echo "📁 Logs:"
    echo "   tail -f logs/telegram-bot.log"
    echo "   tail -f logs/auto-poster.log"
    echo "   tail -f logs/content-scheduler.log"
    echo ""
    echo "🛑 Stop all:"
    echo "   ./scripts/stop-autonomous-system.sh"
    echo ""

    # Keep script running
    echo -e "${CYAN}Press Ctrl+C to stop all services${RESET}"
    trap "echo ''; echo 'Stopping all services...'; kill $BOT_PID $POSTER_PID $SCHEDULER_PID 2>/dev/null; exit 0" INT TERM

    while true; do
        sleep 60
    done
fi
