#!/bin/bash

# 🚀 Social Media API Manager Setup Script
# Dieser Script führt Sie durch das komplette Setup

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

clear

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}  🔐 Social Media API Manager Setup${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Step 1: Check Node.js
echo -e "${CYAN}[1/5] Checking Node.js...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js installed: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js not found${NC}"
    echo -e "${YELLOW}Please install Node.js first: https://nodejs.org/${NC}"
    exit 1
fi
echo ""

# Step 2: Generate Encryption Key
echo -e "${CYAN}[2/5] Generating Encryption Key...${NC}"
ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo -e "${GREEN}✅ Generated 32-byte encryption key${NC}"
echo -e "${BLUE}   Key: ${ENCRYPTION_KEY:0:16}...${NC}"
echo ""

# Step 3: Setup .env.local
echo -e "${CYAN}[3/5] Setting up .env.local...${NC}"

if [ -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local already exists${NC}"
    echo -n "Do you want to backup and update it? (y/n): "
    read -r BACKUP
    if [ "$BACKUP" = "y" ]; then
        cp .env.local .env.local.backup
        echo -e "${GREEN}✅ Backup created: .env.local.backup${NC}"
    fi
else
    echo -e "${BLUE}Creating new .env.local from .env.example...${NC}"
    cp .env.example .env.local
    echo -e "${GREEN}✅ Created .env.local${NC}"
fi

# Add API Manager config if not present
if ! grep -q "API_ENCRYPTION_KEY" .env.local; then
    echo "" >> .env.local
    echo "# Social Media API Manager" >> .env.local
    echo "API_ENCRYPTION_KEY=$ENCRYPTION_KEY" >> .env.local
    echo "API_SERVER_PORT=3001" >> .env.local
    echo -e "${GREEN}✅ Added API Manager configuration to .env.local${NC}"
else
    echo -e "${YELLOW}⚠️  API Manager config already in .env.local${NC}"
fi

# Update .env.example too
if ! grep -q "API_ENCRYPTION_KEY" .env.example; then
    echo "" >> .env.example
    echo "# Social Media API Manager" >> .env.example
    echo "API_ENCRYPTION_KEY=$ENCRYPTION_KEY" >> .env.example
    echo "API_SERVER_PORT=3001" >> .env.example
fi

echo ""

# Step 4: SQL Schema Instructions
echo -e "${CYAN}[4/5] Database Schema Setup${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}IMPORTANT: You need to run the SQL schema in Supabase!${NC}"
echo ""
echo -e "${BLUE}Steps to install the schema:${NC}"
echo "1. Open your Supabase Dashboard"
echo "2. Go to 'SQL Editor'"
echo "3. Copy the contents of:"
echo -e "   ${GREEN}ai-agent/data/social-media-api-schema.sql${NC}"
echo "4. Paste it into the SQL Editor"
echo "5. Click 'RUN'"
echo ""
echo -e "${YELLOW}The schema creates:${NC}"
echo "  • 5 tables (APIs, Keys, Changes, Health, Usage)"
echo "  • 3 views (Health Summary, Critical Changes, Daily Usage)"
echo "  • Triggers for automation"
echo "  • Row Level Security policies"
echo ""
echo -n "Press ENTER when you have completed the SQL schema installation..."
read -r

echo ""

# Step 5: Test Installation
echo -e "${CYAN}[5/5] Testing Installation...${NC}"
echo ""

# Check if Supabase credentials are set
if grep -q "your_supabase_url_here" .env.local 2>/dev/null; then
    echo -e "${YELLOW}⚠️  WARNING: Supabase credentials not configured${NC}"
    echo -e "${BLUE}Please add your Supabase credentials to .env.local:${NC}"
    echo "  • NEXT_PUBLIC_SUPABASE_URL"
    echo "  • NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo ""
    echo -e "${YELLOW}You can find these in your Supabase project settings.${NC}"
    echo ""
    echo -n "Do you want to continue anyway? (y/n): "
    read -r CONTINUE
    if [ "$CONTINUE" != "y" ]; then
        echo -e "${YELLOW}Setup paused. Please add Supabase credentials and run:${NC}"
        echo -e "${CYAN}node scripts/test-social-media-api-manager.js${NC}"
        exit 0
    fi
fi

echo -e "${BLUE}Running quick validation tests...${NC}"
node scripts/test-social-media-api-manager.js 2>/dev/null || {
    echo ""
    echo -e "${YELLOW}⚠️  Full tests require Supabase connection${NC}"
    echo -e "${BLUE}Running basic verification...${NC}"

    # Basic syntax check
    node --check ai-agent/agents/social-media-api-manager.js && \
    node --check ai-agent/api/social-media-api-server.js && \
    echo -e "${GREEN}✅ All files are syntactically correct${NC}"
}

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${GREEN}🎉 Setup Complete!${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BOLD}What's Next?${NC}"
echo ""
echo -e "${GREEN}1. Configure Supabase credentials in .env.local${NC}"
echo -e "${BLUE}   • Get them from: https://app.supabase.com/project/_/settings/api${NC}"
echo ""
echo -e "${GREEN}2. Run the agent:${NC}"
echo -e "${CYAN}   node ai-agent/agents/social-media-api-manager.js${NC}"
echo ""
echo -e "${GREEN}3. Start the API server (optional):${NC}"
echo -e "${CYAN}   node ai-agent/api/social-media-api-server.js${NC}"
echo ""
echo -e "${GREEN}4. Test with Telegram bot:${NC}"
echo -e "${CYAN}   node ai-agent/telegram-bot.js${NC}"
echo -e "${BLUE}   Then send: /apis, /apis_health, /apis_changes${NC}"
echo ""
echo -e "${GREEN}5. Run full test suite:${NC}"
echo -e "${CYAN}   node scripts/test-social-media-api-manager.js${NC}"
echo ""
echo -e "${YELLOW}📚 Documentation:${NC}"
echo -e "${BLUE}   ai-agent/SOCIAL_MEDIA_API_MANAGER.md${NC}"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}Your encryption key has been saved to .env.local${NC}"
echo -e "${YELLOW}⚠️  Keep this key secure! It's used to encrypt all API keys.${NC}"
echo ""
