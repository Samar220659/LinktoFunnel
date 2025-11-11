#!/bin/bash

##########################################################################
# 🛑 STOP AUTONOMOUS POSTING SYSTEM
# Stoppt alle laufenden Komponenten sauber
##########################################################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

GREEN='\033[1;32m'
RED='\033[1;31m'
RESET='\033[0m'

echo ""
echo "🛑 Stopping Autonomous Posting System..."
echo ""

# Read PIDs if they exist
if [ -f "$PROJECT_DIR/logs/bot.pid" ]; then
    BOT_PID=$(cat "$PROJECT_DIR/logs/bot.pid")
    echo "Stopping Telegram Bot (PID: $BOT_PID)..."
    kill $BOT_PID 2>/dev/null || true
    rm "$PROJECT_DIR/logs/bot.pid"
fi

if [ -f "$PROJECT_DIR/logs/poster.pid" ]; then
    POSTER_PID=$(cat "$PROJECT_DIR/logs/poster.pid")
    echo "Stopping Auto-Poster (PID: $POSTER_PID)..."
    kill $POSTER_PID 2>/dev/null || true
    rm "$PROJECT_DIR/logs/poster.pid"
fi

if [ -f "$PROJECT_DIR/logs/scheduler.pid" ]; then
    SCHEDULER_PID=$(cat "$PROJECT_DIR/logs/scheduler.pid")
    echo "Stopping Content Scheduler (PID: $SCHEDULER_PID)..."
    kill $SCHEDULER_PID 2>/dev/null || true
    rm "$PROJECT_DIR/logs/scheduler.pid"
fi

# Also kill by process name (in case PID files don't exist)
pkill -f "telegram-bot.js" 2>/dev/null || true
pkill -f "auto-poster.js" 2>/dev/null || true
pkill -f "content-scheduler.js" 2>/dev/null || true
pkill -f "health-monitor.js" 2>/dev/null || true

echo ""
echo -e "${GREEN}✅ All services stopped!${RESET}"
echo ""
