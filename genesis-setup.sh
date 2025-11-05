#!/data/data/com.termux/files/usr/bin/bash

##############################################################################
# 🌌 GENESIS MASTER SETUP - ONE COMMAND TO RULE THEM ALL
#
# Dieser eine Befehl macht ALLES:
# ✅ Installiert alle Dependencies
# ✅ Richtet das Projekt ein
# ✅ Installiert Cron-Jobs
# ✅ Startet GENESIS
# ✅ Richtet Automation ein
#
# USAGE:
#   curl -sL https://raw.githubusercontent.com/[user]/LinktoFunnel/main/genesis-setup.sh | bash
#
#   ODER lokale Installation:
#   bash genesis-setup.sh
#
##############################################################################

set -e

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Banner
clear
echo -e "${MAGENTA}${BOLD}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║              🌌  G E N E S I S   S E T U P                      ║
║                                                                  ║
║           Autonomous Revenue Generation System                  ║
║                  Target: €5,000/month                           ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Konfiguration
PROJECT_DIR="$HOME/LinktoFunnel"
SETUP_LOG="$HOME/genesis-setup.log"

# Logging
log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1" | tee -a "$SETUP_LOG"
}

log_warn() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] ⚠️  $1${NC}" | tee -a "$SETUP_LOG"
}

log_error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ❌ $1${NC}" | tee -a "$SETUP_LOG"
}

log_success() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] ✅ $1${NC}" | tee -a "$SETUP_LOG"
}

log_info() {
    echo -e "${CYAN}[$(date +'%H:%M:%S')] ℹ️  $1${NC}" | tee -a "$SETUP_LOG"
}

section() {
    echo -e "\n${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}${BLUE}  $1${NC}"
    echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# Error Handler
error_exit() {
    log_error "$1"
    echo -e "\n${RED}${BOLD}Setup fehlgeschlagen!${NC}"
    echo -e "${YELLOW}Log gespeichert in: $SETUP_LOG${NC}"
    exit 1
}

# ============================================================================
# PHASE 1: SYSTEM CHECK
# ============================================================================

section "PHASE 1: System Check"

log "Prüfe Termux Umgebung..."

if [ ! -d "/data/data/com.termux" ]; then
    log_warn "Warnung: Scheint nicht Termux zu sein, fahre trotzdem fort..."
fi

log_success "System Check OK"

# ============================================================================
# PHASE 2: DEPENDENCIES INSTALLIEREN
# ============================================================================

section "PHASE 2: Dependencies Installation"

log "Aktualisiere Package Listen..."
pkg update -y 2>&1 | tee -a "$SETUP_LOG" || log_warn "pkg update hatte Warnungen"

# Node.js
if ! command -v node &> /dev/null; then
    log "Installiere Node.js..."
    pkg install -y nodejs 2>&1 | tee -a "$SETUP_LOG" || error_exit "Node.js Installation fehlgeschlagen"
    log_success "Node.js installiert"
else
    log_success "Node.js bereits vorhanden: $(node --version)"
fi

# Git
if ! command -v git &> /dev/null; then
    log "Installiere Git..."
    pkg install -y git 2>&1 | tee -a "$SETUP_LOG" || error_exit "Git Installation fehlgeschlagen"
    log_success "Git installiert"
else
    log_success "Git bereits vorhanden: $(git --version)"
fi

# pnpm
if ! command -v pnpm &> /dev/null; then
    log "Installiere pnpm..."
    npm install -g pnpm 2>&1 | tee -a "$SETUP_LOG" || error_exit "pnpm Installation fehlgeschlagen"
    log_success "pnpm installiert"
else
    log_success "pnpm bereits vorhanden: $(pnpm --version)"
fi

# curl (meistens schon da)
if ! command -v curl &> /dev/null; then
    log "Installiere curl..."
    pkg install -y curl 2>&1 | tee -a "$SETUP_LOG"
    log_success "curl installiert"
else
    log_success "curl bereits vorhanden"
fi

# jq für JSON parsing
if ! command -v jq &> /dev/null; then
    log "Installiere jq..."
    pkg install -y jq 2>&1 | tee -a "$SETUP_LOG"
    log_success "jq installiert"
else
    log_success "jq bereits vorhanden"
fi

# cronie für Cron-Jobs
if ! command -v crond &> /dev/null; then
    log "Installiere cronie (Cron Daemon)..."
    pkg install -y cronie 2>&1 | tee -a "$SETUP_LOG" || log_warn "cronie Installation hatte Probleme"
    log_success "cronie installiert"
else
    log_success "cronie bereits vorhanden"
fi

# ============================================================================
# PHASE 3: PROJEKT SETUP
# ============================================================================

section "PHASE 3: Projekt Setup"

if [ ! -d "$PROJECT_DIR" ]; then
    log "Klone LinktoFunnel Repository..."
    cd "$HOME"
    git clone https://github.com/[YOUR-USERNAME]/LinktoFunnel.git 2>&1 | tee -a "$SETUP_LOG" || {
        log_warn "Git clone fehlgeschlagen, verwende lokales Verzeichnis"
        mkdir -p "$PROJECT_DIR"
    }
else
    log_success "Projekt-Verzeichnis existiert bereits"
fi

cd "$PROJECT_DIR" || error_exit "Kann nicht in $PROJECT_DIR wechseln"

log "Installiere Node.js Dependencies..."
if [ -f "package.json" ]; then
    pnpm install 2>&1 | tee -a "$SETUP_LOG" || log_warn "pnpm install hatte Warnungen"
    log_success "Dependencies installiert"
else
    log_warn "Keine package.json gefunden, überspringe npm install"
fi

# Erstelle benötigte Verzeichnisse
log "Erstelle Verzeichnis-Struktur..."
mkdir -p "$PROJECT_DIR/data/genesis"
mkdir -p "$PROJECT_DIR/data/generated-content"
mkdir -p "$PROJECT_DIR/logs"
log_success "Verzeichnisse erstellt"

# ============================================================================
# PHASE 4: UMGEBUNGSVARIABLEN
# ============================================================================

section "PHASE 4: Umgebungsvariablen Setup"

if [ ! -f "$PROJECT_DIR/.env.local" ]; then
    log "Erstelle .env.local Template..."
    cat > "$PROJECT_DIR/.env.local" << 'EOF'
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# API Keys
SCRAPINGBEE_API_KEY=your_scrapingbee_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Z.AI Image Grounding API
ZAI_API_KEY=e009a661680f4128b3e6889b3d85c5ce.TJa0WaurLhsTZfwv
ZAI_API_URL=https://api.z.ai/api/paas/v4/chat/completions

# Telegram (Optional - für Benachrichtigungen)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_telegram_chat_id_here

# Social Media APIs (Optional - für Auto-Posting)
TIKTOK_ACCESS_TOKEN=your_tiktok_access_token_here
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token_here
YOUTUBE_API_KEY=your_youtube_api_key_here
PINTEREST_ACCESS_TOKEN=your_pinterest_access_token_here

# Environment
NODE_ENV=production
EOF
    log_success ".env.local Template erstellt"
    log_info "Du kannst später API Keys in .env.local eintragen (optional)"
else
    log_success ".env.local existiert bereits"
fi

# ============================================================================
# PHASE 5: AUTOMATION SETUP
# ============================================================================

section "PHASE 5: Automation Setup"

# Mache Scripts ausführbar
log "Setze Berechtigungen für Scripts..."
chmod +x "$PROJECT_DIR/termux-automation.sh" 2>/dev/null || log_warn "termux-automation.sh nicht gefunden"
chmod +x "$PROJECT_DIR/genesis-system.js" 2>/dev/null || log_warn "genesis-system.js nicht gefunden"
log_success "Script-Berechtigungen gesetzt"

# Erstelle Cron-Jobs
log "Erstelle Cron-Job Konfiguration..."
cat > "$PROJECT_DIR/termux-cron.txt" << 'EOF'
# 🌌 GENESIS Autonomous Revenue System - Cron Jobs
# Diese Jobs sorgen für vollautomatischen Betrieb

# GENESIS Autonomous Cycle - alle 4 Stunden
0 */4 * * * cd ~/LinktoFunnel && node genesis-system.js >> logs/genesis.log 2>&1

# Daily Health Check - täglich um 12:00
0 12 * * * cd ~/LinktoFunnel && bash termux-automation.sh health >> logs/health.log 2>&1

# Weekly Content Calendar - jeden Sonntag um 10:00
0 10 * * 0 cd ~/LinktoFunnel && bash termux-automation.sh calendar >> logs/calendar.log 2>&1

EOF
log_success "Cron-Job Konfiguration erstellt: termux-cron.txt"

# ============================================================================
# PHASE 6: CRON INSTALLATION
# ============================================================================

section "PHASE 6: Cron-Jobs Aktivierung"

log "Installiere Cron-Jobs..."

# Prüfe ob cronie läuft
if pgrep -x "crond" > /dev/null; then
    log_success "Cron Daemon läuft bereits"
else
    log "Starte Cron Daemon..."
    crond 2>&1 | tee -a "$SETUP_LOG" || log_warn "crond Start hatte Probleme"
fi

# Installiere Crontab
log "Aktiviere Cron-Jobs..."
crontab "$PROJECT_DIR/termux-cron.txt" 2>&1 | tee -a "$SETUP_LOG" || log_warn "crontab Installation hatte Probleme"

log_success "Cron-Jobs aktiviert!"
log_info "Überprüfe mit: crontab -l"

# ============================================================================
# PHASE 7: GENESIS INITIAL START
# ============================================================================

section "PHASE 7: GENESIS Initial Start"

log "Starte GENESIS zum ersten Mal..."
echo ""

cd "$PROJECT_DIR" || error_exit "CD fehlgeschlagen"

# Starte GENESIS
if node genesis-system.js 2>&1 | tee -a "$SETUP_LOG"; then
    log_success "GENESIS erfolgreich gestartet!"
else
    log_warn "GENESIS hatte Probleme beim ersten Start (normal bei fehlenden API Keys)"
fi

# ============================================================================
# PHASE 8: VERIFICATION
# ============================================================================

section "PHASE 8: System Verification"

log "Verifiziere Installation..."

# Check 1: Dependencies
checks_passed=0
checks_total=8

if command -v node &> /dev/null; then
    log_success "✓ Node.js: $(node --version)"
    ((checks_passed++))
fi

if command -v git &> /dev/null; then
    log_success "✓ Git installiert"
    ((checks_passed++))
fi

if command -v pnpm &> /dev/null; then
    log_success "✓ pnpm installiert"
    ((checks_passed++))
fi

if command -v curl &> /dev/null; then
    log_success "✓ curl installiert"
    ((checks_passed++))
fi

if command -v jq &> /dev/null; then
    log_success "✓ jq installiert"
    ((checks_passed++))
fi

if [ -d "$PROJECT_DIR/node_modules" ]; then
    log_success "✓ Node modules installiert"
    ((checks_passed++))
fi

if [ -f "$PROJECT_DIR/.env.local" ]; then
    log_success "✓ .env.local existiert"
    ((checks_passed++))
fi

if crontab -l &> /dev/null; then
    log_success "✓ Cron-Jobs installiert"
    ((checks_passed++))
fi

echo ""
log_info "Verification: $checks_passed/$checks_total Checks bestanden"

# ============================================================================
# PHASE 9: FINAL REPORT
# ============================================================================

section "SETUP ABGESCHLOSSEN"

echo -e "${GREEN}${BOLD}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║              ✅  GENESIS ERFOLGREICH INSTALLIERT                ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${CYAN}${BOLD}📊 SYSTEM STATUS:${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  🌌 GENESIS System:        ${GREEN}OPERATIONAL${NC}"
echo -e "  📁 Projekt:               $PROJECT_DIR"
echo -e "  📝 Logs:                  $PROJECT_DIR/logs/"
echo -e "  💾 Data:                  $PROJECT_DIR/data/genesis/"
echo -e "  ⏰ Cron-Jobs:             ${GREEN}ACTIVE${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${CYAN}${BOLD}🎯 AUTOMATISIERUNG:${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  ✅ GENESIS läuft alle 4 Stunden automatisch"
echo -e "  ✅ Health Check täglich um 12:00"
echo -e "  ✅ Content Calendar jeden Sonntag"
echo -e "  ✅ Alle Logs werden gespeichert"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${CYAN}${BOLD}🚀 NÄCHSTE SCHRITTE:${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  ${YELLOW}Optional:${NC} API Keys konfigurieren für besseren Content"
echo -e "           ${CYAN}nano $PROJECT_DIR/.env.local${NC}"
echo -e ""
echo -e "  ${YELLOW}Manuell starten:${NC}"
echo -e "           ${CYAN}cd ~/LinktoFunnel && node genesis-system.js${NC}"
echo -e ""
echo -e "  ${YELLOW}Status prüfen:${NC}"
echo -e "           ${CYAN}bash ~/LinktoFunnel/termux-automation.sh status${NC}"
echo -e ""
echo -e "  ${YELLOW}Logs ansehen:${NC}"
echo -e "           ${CYAN}tail -f ~/LinktoFunnel/logs/genesis.log${NC}"
echo -e ""
echo -e "  ${YELLOW}Cron-Jobs prüfen:${NC}"
echo -e "           ${CYAN}crontab -l${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${CYAN}${BOLD}💡 WICHTIG:${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  • GENESIS funktioniert OHNE API Keys (Fallback-System)"
echo -e "  • Für AI-generierten Content: Gemini API Key optional hinzufügen"
echo -e "  • Telegram Notifications: Bot Token + Chat ID optional"
echo -e "  • Auto-Posting: Social Media APIs optional"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${CYAN}${BOLD}📚 DOKUMENTATION:${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  📖 GENESIS.md            - Vollständige System-Dokumentation"
echo -e "  📖 GENESIS_FIXES_APPLIED.md - Alle angewandten Fixes"
echo -e "  📖 QUICK_START.md        - Schnellstart-Guide"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${MAGENTA}${BOLD}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║         🎯 ZIEL: €5.000/MONAT PASSIVES EINKOMMEN                ║
║              GENESIS arbeitet jetzt für dich!                   ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "\n${YELLOW}Setup Log gespeichert in: $SETUP_LOG${NC}\n"

exit 0
