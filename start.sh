#!/data/data/com.termux/files/usr/bin/bash

################################################################################
# LINKTOFUNNEL - ONE-COMMAND STARTER
# Der einfachste Weg, LinktoFunnel zu starten!
################################################################################

clear

# Farben
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# ASCII Art Banner
echo -e "${CYAN}"
cat << "EOF"
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   ██╗     ██╗███╗   ██╗██╗  ██╗████████╗ ██████╗        ║
║   ██║     ██║████╗  ██║██║ ██╔╝╚══██╔══╝██╔═══██╗       ║
║   ██║     ██║██╔██╗ ██║█████╔╝    ██║   ██║   ██║       ║
║   ██║     ██║██║╚██╗██║██╔═██╗    ██║   ██║   ██║       ║
║   ███████╗██║██║ ╚████║██║  ██╗   ██║   ╚██████╔╝       ║
║   ╚══════╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝   ╚═╝    ╚═════╝        ║
║                                                          ║
║              🤖 PASSIVES EINKOMMEN SYSTEM 🚀             ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Wechsle ins Verzeichnis
cd "$HOME/LinktoFunnel" || exit 1

echo -e "${BLUE}📍 Verzeichnis: ${PWD}${NC}"
echo ""

# Zeige Menü
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   WAS MÖCHTEST DU TUN?${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}1)${NC} 🚀 System JETZT ausführen (einmalig)"
echo -e "${YELLOW}2)${NC} ⏰ Automatische tägliche Ausführung einrichten"
echo -e "${YELLOW}3)${NC} 📊 Letzten Log anzeigen"
echo -e "${YELLOW}4)${NC} 🔧 System-Status prüfen"
echo -e "${YELLOW}5)${NC} 📦 Dependencies installieren"
echo -e "${YELLOW}6)${NC} 🔄 Git Pull (Updates holen)"
echo -e "${YELLOW}7)${NC} ❌ Beenden"
echo ""
echo -ne "${CYAN}Wähle (1-7): ${NC}"
read -r choice

echo ""

case $choice in
    1)
        echo -e "${GREEN}🚀 Starte System...${NC}"
        echo ""
        bash auto-run-daily.sh
        ;;
    2)
        echo -e "${GREEN}⏰ Richte automatische Ausführung ein...${NC}"
        echo ""
        bash setup-cron.sh
        ;;
    3)
        echo -e "${GREEN}📊 Letzter Log:${NC}"
        echo ""
        LAST_LOG=$(ls -t logs/auto-run-*.log 2>/dev/null | head -1)
        if [ -n "$LAST_LOG" ]; then
            tail -50 "$LAST_LOG"
        else
            echo -e "${YELLOW}Noch keine Logs vorhanden.${NC}"
        fi
        ;;
    4)
        echo -e "${GREEN}🔧 System-Status:${NC}"
        echo ""
        echo -e "${BLUE}Git Status:${NC}"
        git status
        echo ""
        echo -e "${BLUE}Node Version:${NC}"
        node --version
        echo ""
        echo -e "${BLUE}Dependencies:${NC}"
        if [ -d "node_modules" ]; then
            echo -e "${GREEN}✅ Installiert${NC}"
        else
            echo -e "${YELLOW}⚠️  Nicht installiert (Option 5 wählen)${NC}"
        fi
        echo ""
        echo -e "${BLUE}.env.local:${NC}"
        if [ -f ".env.local" ]; then
            echo -e "${GREEN}✅ Vorhanden${NC}"
        else
            echo -e "${YELLOW}⚠️  Fehlt!${NC}"
        fi
        ;;
    5)
        echo -e "${GREEN}📦 Installiere Dependencies...${NC}"
        echo ""
        if command -v pnpm &> /dev/null; then
            pnpm install
        else
            npm install
        fi
        ;;
    6)
        echo -e "${GREEN}🔄 Hole Updates von Git...${NC}"
        echo ""
        git fetch origin claude/dev-workflow-setup-011CUNKUQbhW3tnEnCj6cPRs
        git pull origin claude/dev-workflow-setup-011CUNKUQbhW3tnEnCj6cPRs
        ;;
    7)
        echo -e "${GREEN}👋 Bis bald!${NC}"
        exit 0
        ;;
    *)
        echo -e "${YELLOW}❌ Ungültige Auswahl${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Fertig!${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo ""

# Zurück zum Menü?
echo -ne "${CYAN}Zurück zum Menü? (j/n): ${NC}"
read -r again

if [[ "$again" == "j" || "$again" == "J" || "$again" == "y" || "$again" == "Y" ]]; then
    exec "$0"
fi

exit 0
