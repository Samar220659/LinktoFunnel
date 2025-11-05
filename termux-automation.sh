#!/data/data/com.termux/files/usr/bin/bash

##############################################################################
# 🤖 TERMUX AUTOMATION SCRIPT
# Vollautomatische Content-Generierung und Posting für Zero-Budget Affiliate
#
# Features:
# - Tägliche Content-Generierung
# - Optimale Posting-Zeiten
# - Telegram Benachrichtigungen
# - Analytics Tracking
# - Fehler-Handling
#
# Setup:
# 1. chmod +x termux-automation.sh
# 2. Cron einrichten: crontab -e
#    0 8 * * * ~/LinktoFunnel/termux-automation.sh generate
#    0 18 * * * ~/LinktoFunnel/termux-automation.sh post
##############################################################################

set -e

# Konfiguration
PROJECT_DIR="$HOME/LinktoFunnel"
LOG_DIR="$PROJECT_DIR/logs"
DATA_DIR="$PROJECT_DIR/data/generated-content"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
LOG_FILE="$LOG_DIR/automation_${TIMESTAMP}.log"

# Erstelle Verzeichnisse falls nicht vorhanden
mkdir -p "$LOG_DIR"
mkdir -p "$DATA_DIR"

# Logging Funktion
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Error Handler
error_exit() {
    log "❌ ERROR: $1"
    send_telegram_notification "🚨 Automation Error: $1"
    exit 1
}

# Telegram Notification
send_telegram_notification() {
    local message="$1"

    if [ -f "$PROJECT_DIR/.env.local" ]; then
        # Lese Telegram Config aus .env.local
        source "$PROJECT_DIR/.env.local"

        if [ -n "$TELEGRAM_BOT_TOKEN" ] && [ -n "$TELEGRAM_CHAT_ID" ]; then
            curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
                -d "chat_id=${TELEGRAM_CHAT_ID}" \
                -d "text=${message}" \
                -d "parse_mode=HTML" > /dev/null 2>&1 || true
        fi
    fi
}

# Prüfe Node.js Installation
check_node() {
    if ! command -v node &> /dev/null; then
        error_exit "Node.js nicht installiert! Installiere mit: pkg install nodejs"
    fi
    log "✓ Node.js $(node --version) gefunden"
}

# Prüfe Projekt Dependencies
check_dependencies() {
    cd "$PROJECT_DIR" || error_exit "Projekt-Verzeichnis nicht gefunden"

    if [ ! -d "node_modules" ]; then
        log "📦 Installiere Dependencies..."
        pnpm install || error_exit "pnpm install fehlgeschlagen"
    fi

    log "✓ Dependencies vorhanden"
}

# Generiere täglichen Content
generate_content() {
    log "🎨 Starte Content-Generierung..."

    cd "$PROJECT_DIR" || error_exit "CD fehlgeschlagen"

    # Lese Nische aus Config oder nutze Default
    NICHE=${CONTENT_NICHE:-"Online Geld verdienen"}

    log "  Nische: $NICHE"
    log "  Plattformen: TikTok, Instagram, YouTube, Pinterest"

    # Rufe Content Generator auf
    OUTPUT=$(node ai-agent/agents/content-generator.js "$NICHE" 2>&1) || error_exit "Content-Generator fehlgeschlagen"

    # Speichere Output
    OUTPUT_FILE="$DATA_DIR/content_${TIMESTAMP}.json"
    echo "$OUTPUT" > "$OUTPUT_FILE"

    log "✅ Content generiert: $OUTPUT_FILE"

    # Parse und zeige Preview
    if command -v jq &> /dev/null; then
        log "\n📝 Content Preview:"
        jq -r '.posts.tiktok.fullText' "$OUTPUT_FILE" 2>/dev/null | head -5 | tee -a "$LOG_FILE" || true
    fi

    send_telegram_notification "✅ Daily Content generiert!\n\nNische: $NICHE\nFile: content_${TIMESTAMP}.json"

    return 0
}

# Poste Content (manual review required)
post_content() {
    log "📤 Vorbereitung zum Posten..."

    # Finde neuesten Content
    LATEST_CONTENT=$(ls -t "$DATA_DIR"/content_*.json 2>/dev/null | head -1)

    if [ -z "$LATEST_CONTENT" ]; then
        error_exit "Kein Content zum Posten gefunden! Führe erst 'generate' aus."
    fi

    log "  Nutze Content: $(basename "$LATEST_CONTENT")"

    # In Phase 1: Nur Benachrichtigung senden
    # TODO: In Phase 2 automatisches Posten implementieren
    send_telegram_notification "📤 Content bereit zum Posten!\n\nBitte review und poste manuell:\n$(basename "$LATEST_CONTENT")"

    log "ℹ️  Automatisches Posten noch nicht implementiert"
    log "ℹ️  Bitte Content manuell reviewen und posten"

    return 0
}

# Analytics Tracking
track_analytics() {
    log "📊 Analytics Tracking..."

    # TODO: Implementiere Analytics Tracking
    # - Follower Wachstum
    # - Engagement Rate
    # - Affiliate Klicks
    # - Conversions

    log "ℹ️  Analytics Tracking coming soon..."

    return 0
}

# Content Kalender generieren
generate_calendar() {
    log "📅 Generiere 30-Tage Content-Kalender..."

    cd "$PROJECT_DIR" || error_exit "CD fehlgeschlagen"

    NICHE=${CONTENT_NICHE:-"Online Geld verdienen"}

    # Node Script für Kalender
    node -e "
        const { ContentGenerator } = require('./ai-agent/agents/content-generator.js');
        const generator = new ContentGenerator(process.env.GEMINI_API_KEY);

        (async () => {
            const calendar = await generator.generateMonthlyCalendar('$NICHE');
            console.log(JSON.stringify(calendar, null, 2));
        })();
    " > "$DATA_DIR/calendar_${TIMESTAMP}.json" || error_exit "Kalender-Generierung fehlgeschlagen"

    log "✅ Kalender erstellt: calendar_${TIMESTAMP}.json"

    send_telegram_notification "📅 30-Tage Content-Kalender erstellt!"

    return 0
}

# Hashtag Research
research_hashtags() {
    log "🔍 Hashtag Research..."

    cd "$PROJECT_DIR" || error_exit "CD fehlgeschlagen"

    NICHE=${CONTENT_NICHE:-"Online Geld verdienen"}

    node -e "
        const { ContentGenerator } = require('./ai-agent/agents/content-generator.js');
        const generator = new ContentGenerator(process.env.GEMINI_API_KEY);

        (async () => {
            const hashtags = await generator.researchHashtags('$NICHE', 30);
            console.log(JSON.stringify(hashtags, null, 2));
        })();
    " > "$DATA_DIR/hashtags_${TIMESTAMP}.json" || error_exit "Hashtag Research fehlgeschlagen"

    log "✅ Hashtags recherchiert: hashtags_${TIMESTAMP}.json"

    return 0
}

# Health Check
health_check() {
    log "🏥 System Health Check..."

    check_node
    check_dependencies

    # Prüfe Disk Space
    DISK_USAGE=$(df -h "$PROJECT_DIR" | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$DISK_USAGE" -gt 90 ]; then
        log "⚠️  Warnung: Disk Space bei ${DISK_USAGE}%"
    else
        log "✓ Disk Space OK (${DISK_USAGE}% genutzt)"
    fi

    # Prüfe Internet Verbindung
    if ping -c 1 google.com &> /dev/null; then
        log "✓ Internet Verbindung OK"
    else
        error_exit "Keine Internet Verbindung!"
    fi

    # Prüfe API Keys
    if [ -f "$PROJECT_DIR/.env.local" ]; then
        source "$PROJECT_DIR/.env.local"

        if [ -n "$GEMINI_API_KEY" ]; then
            log "✓ GEMINI_API_KEY vorhanden"
        else
            log "⚠️  GEMINI_API_KEY nicht gefunden"
        fi
    else
        log "⚠️  .env.local nicht gefunden"
    fi

    log "✅ Health Check abgeschlossen"

    return 0
}

# Daily Routine (Komplett-Workflow)
daily_routine() {
    log "🤖 Starte Daily Routine..."
    log "=" "50"

    health_check || error_exit "Health Check fehlgeschlagen"

    generate_content || error_exit "Content-Generierung fehlgeschlagen"

    track_analytics || true  # Nicht kritisch

    log "=" "50"
    log "✅ Daily Routine abgeschlossen!"

    send_telegram_notification "✅ Daily Automation abgeschlossen!\n\nChecke neue Content-Files zum Reviewen."

    return 0
}

# Status anzeigen
show_status() {
    log "📊 System Status"
    log "=" "50"

    log "Projekt: $PROJECT_DIR"
    log "Logs: $LOG_DIR"
    log "Content: $DATA_DIR"

    # Zähle generierte Files
    CONTENT_COUNT=$(ls -1 "$DATA_DIR"/content_*.json 2>/dev/null | wc -l)
    log "Generierte Contents: $CONTENT_COUNT"

    # Zeige letzte 5 Logs
    log "\nLetzte 5 Logs:"
    ls -t "$LOG_DIR"/automation_*.log 2>/dev/null | head -5 | while read -r logfile; do
        log "  - $(basename "$logfile")"
    done

    return 0
}

# Installiere Cron Jobs
install_cron() {
    log "⏰ Installiere Cron Jobs..."

    # Erstelle Cron-Jobs
    CRON_FILE="$PROJECT_DIR/termux-cron.txt"

    cat > "$CRON_FILE" << 'EOF'
# LinktoFunnel Automation Cron Jobs

# 🌌 GENESIS Autonomous Cycles (every 4 hours)
0 */4 * * * ~/LinktoFunnel/termux-automation.sh genesis

# Content-Generierung jeden Morgen um 8:00
0 8 * * * ~/LinktoFunnel/termux-automation.sh daily

# Health Check täglich um 12:00
0 12 * * * ~/LinktoFunnel/termux-automation.sh health

# Analytics Tracking jeden Abend um 22:00
0 22 * * * ~/LinktoFunnel/termux-automation.sh analytics

# Weekly: Content Kalender jeden Sonntag
0 10 * * 0 ~/LinktoFunnel/termux-automation.sh calendar

# Weekly: Hashtag Research jeden Montag
0 10 * * 1 ~/LinktoFunnel/termux-automation.sh hashtags
EOF

    log "✓ Cron Jobs definiert in: $CRON_FILE"
    log ""
    log "Um Cron Jobs zu aktivieren:"
    log "  1. pkg install cronie"
    log "  2. crontab $CRON_FILE"
    log "  3. crond"
    log ""

    return 0
}

# GENESIS System Integration
run_genesis() {
    log "🌌 Executing GENESIS autonomous cycle..."

    cd "$PROJECT_DIR" || error_exit "CD fehlgeschlagen"

    # Run GENESIS
    OUTPUT=$(node genesis-system.js 2>&1) || error_exit "GENESIS execution failed"

    log "✅ GENESIS cycle completed"

    # Send report
    send_telegram_notification "🌌 GENESIS cycle completed successfully"

    return 0
}

# Main Command Handler
main() {
    local command="${1:-help}"

    case "$command" in
        genesis)
            run_genesis
            ;;
        generate|gen)
            generate_content
            ;;
        post)
            post_content
            ;;
        analytics)
            track_analytics
            ;;
        calendar)
            generate_calendar
            ;;
        hashtags)
            research_hashtags
            ;;
        health)
            health_check
            ;;
        daily)
            daily_routine
            ;;
        status)
            show_status
            ;;
        install-cron)
            install_cron
            ;;
        help|--help|-h)
            cat << 'HELP'
🤖 LinktoFunnel Termux Automation

USAGE:
    ./termux-automation.sh [COMMAND]

COMMANDS:
    genesis             🌌 Run GENESIS autonomous cycle
    generate, gen       Generiere Daily Content
    post                Bereite Content zum Posten vor
    analytics           Tracke Analytics
    calendar            Generiere 30-Tage Content-Kalender
    hashtags            Recherchiere Hashtags
    health              System Health Check
    daily               Kompletter Daily Workflow
    status              Zeige System Status
    install-cron        Installiere Cron Jobs
    help                Zeige diese Hilfe

EXAMPLES:
    ./termux-automation.sh genesis        # GENESIS autonomous cycle
    ./termux-automation.sh daily          # Daily Routine ausführen
    ./termux-automation.sh generate       # Nur Content generieren
    ./termux-automation.sh calendar       # 30-Tage Kalender
    ./termux-automation.sh install-cron   # Cron Jobs einrichten

ENVIRONMENT:
    CONTENT_NICHE       Deine Content-Nische (default: "Online Geld verdienen")

SETUP:
    1. chmod +x termux-automation.sh
    2. ./termux-automation.sh health
    3. ./termux-automation.sh install-cron
    4. crontab termux-cron.txt

HELP
            ;;
        *)
            log "❌ Unbekanntes Command: $command"
            log "Nutze './termux-automation.sh help' für Hilfe"
            exit 1
            ;;
    esac
}

# Script starten
log "🚀 Termux Automation gestartet"
log "Command: ${1:-help}"

main "$@"

exit_code=$?
log "Script beendet mit Code: $exit_code"

exit $exit_code
