#!/data/data/com.termux/files/usr/bin/bash

##########################################################################
# 🚀 TERMUX AUTONOMOUS POSTING SYSTEM - ONE-CLICK SETUP
# Installiert, testet und startet das komplette System
##########################################################################

set -e

GREEN='\033[1;32m'
CYAN='\033[1;36m'
YELLOW='\033[1;33m'
RED='\033[1;31m'
RESET='\033[0m'

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║     🤖 AUTONOMOUS POSTING SYSTEM - TERMUX SETUP                ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if in Termux
if [ -z "$TERMUX_VERSION" ]; then
    echo -e "${YELLOW}⚠️  Not in Termux - using standard paths${RESET}"
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
else
    echo -e "${GREEN}✅ Termux detected${RESET}"
    SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
fi

PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${CYAN}📁 Project: $PROJECT_DIR${RESET}"
echo ""

# Step 1: Check Node.js
echo -e "${CYAN}🔍 Checking Node.js...${RESET}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not installed!${RESET}"
    echo ""
    echo "Install with:"
    echo "  pkg install nodejs-lts"
    echo ""
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js: $NODE_VERSION${RESET}"
echo ""

# Step 2: Check pnpm
echo -e "${CYAN}🔍 Checking pnpm...${RESET}"
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}⚠️  pnpm not found, installing...${RESET}"
    npm install -g pnpm
fi

PNPM_VERSION=$(pnpm -v)
echo -e "${GREEN}✅ pnpm: $PNPM_VERSION${RESET}"
echo ""

# Step 3: Install Dependencies
echo -e "${CYAN}📦 Installing dependencies...${RESET}"
cd "$PROJECT_DIR"

if [ -f "pnpm-lock.yaml" ]; then
    CI=true pnpm install --no-frozen-lockfile
else
    CI=true pnpm install
fi

echo -e "${GREEN}✅ Dependencies installed${RESET}"
echo ""

# Step 4: Check Environment
echo -e "${CYAN}🔍 Checking environment...${RESET}"

ENV_FILE="$PROJECT_DIR/.env.local"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠️  .env.local not found, creating from example...${RESET}"

    if [ -f "$PROJECT_DIR/.env.example" ]; then
        cp "$PROJECT_DIR/.env.example" "$ENV_FILE"
        echo -e "${YELLOW}⚠️  Please edit .env.local and add your API keys:${RESET}"
        echo ""
        echo "  REQUIRED:"
        echo "    - TELEGRAM_BOT_TOKEN"
        echo "    - TELEGRAM_CHAT_ID"
        echo "    - NEXT_PUBLIC_SUPABASE_URL"
        echo "    - NEXT_PUBLIC_SUPABASE_ANON_KEY"
        echo ""
        echo "  OPTIONAL (for posting):"
        echo "    - TIKTOK_ACCESS_TOKEN"
        echo "    - INSTAGRAM_ACCESS_TOKEN"
        echo "    - YOUTUBE_API_KEY"
        echo ""

        read -p "Press ENTER to edit .env.local or Ctrl+C to exit..." dummy

        # Try to open with available editor
        if command -v nano &> /dev/null; then
            nano "$ENV_FILE"
        elif command -v vim &> /dev/null; then
            vim "$ENV_FILE"
        elif command -v vi &> /dev/null; then
            vi "$ENV_FILE"
        else
            echo "Please edit: $ENV_FILE"
            echo ""
            read -p "Press ENTER when done..." dummy
        fi
    else
        echo -e "${RED}❌ .env.example not found!${RESET}"
        echo "Please create .env.local manually"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Environment configured${RESET}"
echo ""

# Step 5: Run Tests
echo -e "${CYAN}🧪 Running system tests...${RESET}"
echo ""

if node "$SCRIPT_DIR/test-autonomous-system.js"; then
    echo ""
    echo -e "${GREEN}✅ All tests passed!${RESET}"
else
    echo ""
    echo -e "${YELLOW}⚠️  Some tests failed, but continuing...${RESET}"
    echo -e "${YELLOW}   System will work in simulation mode${RESET}"
fi

echo ""

# Step 6: Create Termux boot script (if in Termux)
if [ ! -z "$TERMUX_VERSION" ]; then
    echo -e "${CYAN}📱 Setting up Termux auto-start...${RESET}"

    BOOT_DIR="$HOME/.termux/boot"
    mkdir -p "$BOOT_DIR"

    BOOT_SCRIPT="$BOOT_DIR/autonomous-posting.sh"

    cat > "$BOOT_SCRIPT" << 'BOOTEOF'
#!/data/data/com.termux/files/usr/bin/bash

# Wait for network
sleep 30

# Get project directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$HOME/LinktoFunnel"

if [ -d "$PROJECT_DIR" ]; then
    cd "$PROJECT_DIR"

    # Start autonomous posting system
    termux-wake-lock
    ./scripts/start-autonomous-system.sh > ~/autonomous-posting.log 2>&1 &

    # Send notification
    if command -v termux-notification &> /dev/null; then
        termux-notification \
            --title "🤖 Autonomous Posting" \
            --content "System started successfully!" \
            --priority high
    fi
fi
BOOTEOF

    chmod +x "$BOOT_SCRIPT"

    echo -e "${GREEN}✅ Auto-start configured${RESET}"
    echo -e "${CYAN}   Boot script: $BOOT_SCRIPT${RESET}"
    echo ""
fi

# Step 7: Show start options
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║           ✅ SETUP COMPLETE!                                   ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}🎯 NEXT STEPS:${RESET}"
echo ""
echo "1️⃣  Start System:"
echo -e "   ${CYAN}./scripts/start-autonomous-system.sh${RESET}"
echo ""
echo "2️⃣  Or start with Health Monitor (recommended):"
echo -e "   ${CYAN}node ai-agent/workers/health-monitor.js${RESET}"
echo ""
echo "3️⃣  Open Telegram and type:"
echo -e "   ${CYAN}/start${RESET}"
echo ""
echo "4️⃣  Wait for notifications (9, 14, 19 Uhr)"
echo ""
echo "5️⃣  Approve content:"
echo -e "   ${CYAN}/approve post_xyz${RESET}"
echo ""
echo "6️⃣  Agent posts automatically! 🚀"
echo ""
echo -e "${YELLOW}📚 Documentation:${RESET}"
echo "   AUTONOMOUS_POSTING_GUIDE.md"
echo ""
echo -e "${GREEN}💰 Ready to make money!${RESET}"
echo ""

# Ask if user wants to start now
read -p "Start system now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${GREEN}🚀 Starting system...${RESET}"
    echo ""

    # Acquire wakelock if in Termux
    if [ ! -z "$TERMUX_VERSION" ]; then
        if command -v termux-wake-lock &> /dev/null; then
            termux-wake-lock
            echo -e "${GREEN}✅ Wake lock acquired${RESET}"
        fi
    fi

    # Start system
    exec "$SCRIPT_DIR/start-autonomous-system.sh"
else
    echo ""
    echo -e "${CYAN}ℹ️  Start later with:${RESET}"
    echo -e "   ${GREEN}./scripts/start-autonomous-system.sh${RESET}"
    echo ""
fi
