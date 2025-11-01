#!/data/data/com.termux/files/usr/bin/bash

################################################################################
# LINKTOFUNNEL - AUTOMATISCHER TÄGLICHER DURCHLAUF
# Dieses Script führt das komplette System automatisch aus
################################################################################

set -e  # Exit on error

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging
LOG_DIR="$HOME/LinktoFunnel/logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/auto-run-$(date +%Y-%m-%d).log"

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO:${NC} $1" | tee -a "$LOG_FILE"
}

################################################################################
# HAUPTPROGRAMM
################################################################################

log "=========================================="
log "🚀 LINKTOFUNNEL DAILY RUN STARTED"
log "=========================================="

# 1. Wechsle ins Projektverzeichnis
cd "$HOME/LinktoFunnel" || {
    error "Konnte nicht ins Projektverzeichnis wechseln!"
    exit 1
}

# 2. Git Pull (falls Updates vorhanden)
info "Checking for updates..."
git fetch origin claude/dev-workflow-setup-011CUNKUQbhW3tnEnCj6cPRs 2>/dev/null || warning "Git fetch failed (network issue?)"
git pull origin claude/dev-workflow-setup-011CUNKUQbhW3tnEnCj6cPRs 2>/dev/null || warning "Git pull failed (network issue?)"

# 3. Dependencies checken
if [ ! -d "node_modules" ]; then
    info "Installing dependencies..."
    pnpm install || npm install || {
        error "Dependency installation failed!"
        exit 1
    }
fi

# 4. Prüfe .env.local
if [ ! -f ".env.local" ]; then
    error ".env.local nicht gefunden! Bitte erstellen."
    exit 1
fi

# 5. Führe MASTER ORCHESTRATOR aus
log "Starting MASTER ORCHESTRATOR..."
echo "" | tee -a "$LOG_FILE"

# Versuche zuerst Production Mode (mit Supabase)
if node --env-file=.env.local ai-agent/MASTER_ORCHESTRATOR.js 2>&1 | tee -a "$LOG_FILE"; then
    log "✅ MASTER ORCHESTRATOR (Production) erfolgreich!"
else
    warning "Production Mode fehlgeschlagen. Starte TEST Mode..."

    # Fallback: Test Mode (Offline)
    if node --env-file=.env.local ai-agent/MASTER_ORCHESTRATOR_TEST.js 2>&1 | tee -a "$LOG_FILE"; then
        log "✅ MASTER ORCHESTRATOR (Test Mode) erfolgreich!"
    else
        error "Beide Modi fehlgeschlagen!"
        exit 1
    fi
fi

# 6. Cleanup alte Logs (älter als 7 Tage)
find "$LOG_DIR" -name "auto-run-*.log" -mtime +7 -delete 2>/dev/null || true

# 7. Fertig!
log "=========================================="
log "✅ LINKTOFUNNEL DAILY RUN COMPLETED"
log "=========================================="
log "📊 Log gespeichert: $LOG_FILE"
echo ""

# 8. Zeige Quick Summary
if [ -f "$LOG_FILE" ]; then
    info "📈 QUICK SUMMARY:"
    grep -E "(Profit|Revenue|ROI|Produkte|Videos|Kampagnen)" "$LOG_FILE" | tail -20 || true
fi

exit 0
