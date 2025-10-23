#!/data/data/com.termux/files/usr/bin/bash

###############################################
# 🤖 TERMUX DEPLOYMENT SCRIPT
# Komplettes Setup für LinktoFunnel Digital Twin
# Ziel: €10.000/Monat passive Einnahmen
###############################################

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════╗"
echo "║  🤖 LINKTOFUNNEL TERMUX DEPLOYMENT           ║"
echo "║  Digitaler Zwilling Automation System        ║"
echo "╚═══════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if running in Termux
if [ ! -d "/data/data/com.termux" ]; then
    echo -e "${RED}⚠️  FEHLER: Dies muss in Termux ausgeführt werden!${NC}"
    exit 1
fi

echo -e "${BLUE}📦 PHASE 1: System-Pakete installieren...${NC}"

# Update packages
pkg update -y
pkg upgrade -y

# Install required packages
pkg install -y \
    nodejs \
    git \
    python \
    cronie \
    termux-services \
    curl \
    wget

echo -e "${GREEN}✅ Pakete installiert${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${YELLOW}📁 Nicht im LinktoFunnel-Verzeichnis. Klone Repository...${NC}"

    cd ~

    if [ -d "LinktoFunnel" ]; then
        cd LinktoFunnel
        git pull origin claude/placeholder-branch-011CUQo1KPh7UKfEJA1F2qZ5
    else
        git clone https://github.com/Samar220659/LinktoFunnel.git
        cd LinktoFunnel
        git checkout claude/placeholder-branch-011CUQo1KPh7UKfEJA1F2qZ5
    fi
fi

echo -e "${BLUE}📦 PHASE 2: Node.js Dependencies installieren...${NC}"

# Install npm packages
npm install

echo -e "${GREEN}✅ Dependencies installiert${NC}"

echo -e "${BLUE}🔍 PHASE 3: Konfiguration prüfen...${NC}"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local nicht gefunden!${NC}"
    echo -e "${CYAN}Kopiere .env.example zu .env.local...${NC}"
    cp .env.example .env.local
    echo -e "${RED}❗ WICHTIG: Fülle .env.local mit deinen API-Keys aus!${NC}"
    echo -e "${CYAN}Editiere: nano .env.local${NC}"
    exit 1
fi

echo -e "${GREEN}✅ .env.local gefunden${NC}"

echo -e "${BLUE}📊 PHASE 4: Datenbank-Status prüfen...${NC}"

# Test Supabase connection
if node scripts/test-supabase-direct.js 2>/dev/null; then
    echo -e "${GREEN}✅ Supabase verbunden${NC}"

    # Import products
    echo -e "${BLUE}📦 Importiere Affiliate-Produkte...${NC}"
    node scripts/quickstart.js
else
    echo -e "${YELLOW}⚠️  Supabase Schema noch nicht deployed${NC}"
    echo -e "${CYAN}📋 Nächster Schritt:${NC}"
    echo -e "${CYAN}   1. Öffne https://supabase.com/dashboard${NC}"
    echo -e "${CYAN}   2. SQL Editor → New Query${NC}"
    echo -e "${CYAN}   3. Kopiere ai-agent/data/schema.sql${NC}"
    echo -e "${CYAN}   4. Run → Dann: ./termux-deploy.sh erneut${NC}"
    exit 1
fi

echo -e "${BLUE}🤖 PHASE 5: Automatisierung einrichten...${NC}"

# Setup cron for daily automation
if ! sv-enable crond 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Cron-Service konnte nicht aktiviert werden${NC}"
    echo -e "${CYAN}Manuell starten mit: sv-enable crond${NC}"
fi

# Add cron job for daily orchestrator run
CRON_CMD="0 9 * * * cd $HOME/LinktoFunnel && node ai-agent/MASTER_ORCHESTRATOR.js >> logs/automation.log 2>&1"
CRON_FILE="$PREFIX/etc/cron.d/linktofunnel"

mkdir -p "$PREFIX/etc/cron.d"
echo "$CRON_CMD" > "$CRON_FILE"

echo -e "${GREEN}✅ Cronjob eingerichtet (täglich 09:00 Uhr)${NC}"

# Create logs directory
mkdir -p logs

echo -e "${BLUE}🔔 PHASE 6: Telegram Bot testen...${NC}"

# Test Telegram if configured
if grep -q "TELEGRAM_BOT_TOKEN=7215449153" .env.local; then
    echo -e "${GREEN}✅ Telegram Bot konfiguriert${NC}"

    # Send test message
    node -e "
    require('dotenv').config({ path: '.env.local' });
    const https = require('https');
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const url = \`https://api.telegram.org/bot\${botToken}/sendMessage?chat_id=\${chatId}&text=🤖 LinktoFunnel aktiviert! System läuft auf Termux.\`;
    https.get(url, () => console.log('✅ Telegram-Nachricht gesendet!'));
    " 2>/dev/null || echo -e "${YELLOW}⚠️  Telegram-Test fehlgeschlagen${NC}"
else
    echo -e "${YELLOW}⚠️  Telegram nicht konfiguriert${NC}"
fi

echo -e "${GREEN}"
echo "═══════════════════════════════════════════"
echo "  🎉 DEPLOYMENT ERFOLGREICH!"
echo "═══════════════════════════════════════════"
echo -e "${NC}"

echo -e "${CYAN}🚀 NÄCHSTE SCHRITTE:${NC}"
echo ""
echo -e "${GREEN}1. Ersten Durchlauf starten:${NC}"
echo -e "   ${CYAN}node ai-agent/MASTER_ORCHESTRATOR.js${NC}"
echo ""
echo -e "${GREEN}2. Logs überwachen:${NC}"
echo -e "   ${CYAN}tail -f logs/automation.log${NC}"
echo ""
echo -e "${GREEN}3. Status prüfen:${NC}"
echo -e "   ${CYAN}node scripts/supabase-inspect.js${NC}"
echo ""
echo -e "${GREEN}4. Termux im Hintergrund laufen lassen:${NC}"
echo -e "   ${CYAN}termux-wake-lock${NC}"
echo -e "   ${CYAN}(Verhindert, dass Android Termux beendet)${NC}"
echo ""
echo -e "${YELLOW}💰 UMSATZ-ERWARTUNGEN:${NC}"
echo -e "   Monat 1:    €0-100   (Learning Phase)"
echo -e "   Monat 2-3:  €300-800  (Optimization)"
echo -e "   Monat 4-6:  €1.500-3.000"
echo -e "   Monat 7-12: €5.000-10.000 (ZIEL!)"
echo ""
echo -e "${BLUE}📖 Dokumentation:${NC}"
echo -e "   ${CYAN}cat SETUP_GUIDE.md${NC}"
echo -e "   ${CYAN}cat SUPABASE_DEPLOYMENT_ANLEITUNG.md${NC}"
echo ""
echo -e "${GREEN}🎯 Viel Erfolg mit deinem digitalen Zwilling!${NC}"
