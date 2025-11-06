#!/data/data/com.termux/files/usr/bin/bash

##############################################################################
# 🚀 AUTO-POSTING SCRIPT
#
# Automatisches Posting nach optimalem Schedule
# Nutzt GENESIS generierten Content und posted zur besten Zeit
#
# USAGE:
#   ./auto-post.sh              # Poste alles auf allen Plattformen
#   ./auto-post.sh tiktok       # Nur TikTok
#   ./auto-post.sh instagram    # Nur Instagram
#   ./auto-post.sh youtube      # Nur YouTube
#   ./auto-post.sh pinterest    # Nur Pinterest
#   ./auto-post.sh schedule     # Check ob jetzt Posting-Zeit ist
#
##############################################################################

set -e

# Farben
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

# Konfiguration
PROJECT_DIR="$HOME/LinktoFunnel"
LOG_DIR="$PROJECT_DIR/logs"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
LOG_FILE="$LOG_DIR/auto-post_${TIMESTAMP}.log"

# Erstelle Log-Verzeichnis
mkdir -p "$LOG_DIR"

# Logging
log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_warn() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] ⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ❌ $1${NC}" | tee -a "$LOG_FILE"
}

log_cyan() {
    echo -e "${CYAN}[$(date +'%H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

# Banner
show_banner() {
    echo -e "${CYAN}"
    cat << "EOF"
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║              🚀  A U T O - P O S T E R                          ║
║                                                                  ║
║         Automated Social Media Content Publishing              ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

# Prüfe optimale Posting-Zeit
check_posting_time() {
    local hour=$(date +%H)
    local current_time=$(date +%H:%M)

    log_cyan "Aktuell Zeit: $current_time"

    # Optimale Posting-Zeiten
    local optimal_times=(
        "06:30:pinterest"
        "07:30:instagram"
        "11:30:instagram"
        "12:30:youtube"
        "18:00:tiktok"
        "19:00:instagram"
        "20:00:pinterest"
        "21:30:youtube"
    )

    # Prüfe ob wir in einer optimalen Zeit sind (+/- 15 Min)
    for time_platform in "${optimal_times[@]}"; do
        local optimal_time="${time_platform%:*}"
        local platform="${time_platform##*:}"

        # Toleranz: 15 Minuten
        if [[ "$current_time" > "$(date -d "$optimal_time - 15 minutes" +%H:%M)" ]] && \
           [[ "$current_time" < "$(date -d "$optimal_time + 15 minutes" +%H:%M)" ]]; then
            log "✅ Optimale Posting-Zeit für: ${platform}"
            echo "$platform"
            return 0
        fi
    done

    log_warn "Keine optimale Posting-Zeit, aber poste trotzdem..."
    echo "all"
}

# Poste auf allen Plattformen
post_all() {
    log "🚀 Starte Auto-Posting auf allen Plattformen..."

    cd "$PROJECT_DIR" || exit 1

    # Führe Social Media Poster aus
    node ai-agent/integrations/social-media-poster.js all 2>&1 | tee -a "$LOG_FILE"

    local exit_code=${PIPESTATUS[0]}

    if [ $exit_code -eq 0 ]; then
        log "✅ Auto-Posting abgeschlossen!"
        return 0
    else
        log_error "Auto-Posting fehlgeschlagen!"
        return 1
    fi
}

# Poste auf einzelner Plattform
post_single() {
    local platform="$1"

    log "🚀 Starte Posting auf ${platform}..."

    cd "$PROJECT_DIR" || exit 1

    node ai-agent/integrations/social-media-poster.js "$platform" 2>&1 | tee -a "$LOG_FILE"

    local exit_code=${PIPESTATUS[0]}

    if [ $exit_code -eq 0 ]; then
        log "✅ ${platform} Posting abgeschlossen!"
        return 0
    else
        log_error "${platform} Posting fehlgeschlagen!"
        return 1
    fi
}

# Schedule-basiertes Posting
post_scheduled() {
    log "⏰ Prüfe ob jetzt optimale Posting-Zeit ist..."

    local optimal_platform=$(check_posting_time)

    if [ "$optimal_platform" = "all" ]; then
        post_all
    else
        post_single "$optimal_platform"
    fi
}

# Zeige Status
show_status() {
    log_cyan "📊 Auto-Posting Status"
    echo ""

    # Zähle geposteten Content
    if [ -f "$PROJECT_DIR/data/posted-content.json" ]; then
        local posted_count=$(cat "$PROJECT_DIR/data/posted-content.json" | jq 'length' 2>/dev/null || echo "0")
        log "📝 Gepostete Contents: $posted_count"

        # Zeige letzte 5
        log "\n📋 Letzte 5 Posts:"
        cat "$PROJECT_DIR/data/posted-content.json" | jq -r '.[-5:] | .[] | "  • \(.platform): \(.hook | .[0:50])..."' 2>/dev/null || log_warn "Keine Posts gefunden"
    else
        log_warn "Noch keine Posts veröffentlicht"
    fi

    echo ""

    # Prüfe API Keys
    log "🔑 API Key Status:"

    if [ -f "$PROJECT_DIR/.env.local" ]; then
        source "$PROJECT_DIR/.env.local"

        check_key() {
            local key_name="$1"
            local key_value="${!key_name}"

            if [ -n "$key_value" ] && [ "$key_value" != "your_${key_name,,}_here" ]; then
                log "  ✅ $key_name konfiguriert"
            else
                log_warn "  ⚠️  $key_name fehlt (manuelles Posting erforderlich)"
            fi
        }

        check_key "TIKTOK_ACCESS_TOKEN"
        check_key "INSTAGRAM_ACCESS_TOKEN"
        check_key "YOUTUBE_API_KEY"
        check_key "PINTEREST_ACCESS_TOKEN"
    else
        log_warn "  ⚠️  .env.local nicht gefunden"
    fi

    echo ""
}

# Test-Modus
test_posting() {
    log "🧪 Test-Modus: Zeige was gepostet werden würde..."

    cd "$PROJECT_DIR" || exit 1

    # Lade neuesten Content
    local latest_content=$(ls -t data/genesis/content_*.json 2>/dev/null | head -1)

    if [ -z "$latest_content" ]; then
        log_error "Kein Content gefunden!"
        return 1
    fi

    log "📂 Content-File: $(basename "$latest_content")"
    echo ""

    # Zeige Preview
    cat "$latest_content" | jq -r '.[] | "📱 \(.platform | ascii_upcase):\n   Hook: \(.content.hook)\n   Hashtags: \(.content.hashtags[0:3] | join(", "))\n"' || log_error "Fehler beim Lesen"

    echo ""
    log "💡 Zum Posten: ./auto-post.sh all"
}

# Installiere Cron-Jobs für Schedule
install_cron() {
    log "⏰ Installiere Posting-Schedule Cron-Jobs..."

    # Erstelle Cron-File
    cat > "$PROJECT_DIR/auto-post-cron.txt" << 'EOF'
# 🚀 Auto-Posting Schedule (optimale Zeiten)

# TikTok Prime Time - 18:00 Uhr
0 18 * * * ~/LinktoFunnel/auto-post.sh tiktok >> ~/LinktoFunnel/logs/auto-post.log 2>&1

# Instagram - 11:30 & 19:00 Uhr
30 11 * * * ~/LinktoFunnel/auto-post.sh instagram >> ~/LinktoFunnel/logs/auto-post.log 2>&1
0 19 * * * ~/LinktoFunnel/auto-post.sh instagram >> ~/LinktoFunnel/logs/auto-post.log 2>&1

# YouTube - 12:30 & 21:30 Uhr
30 12 * * * ~/LinktoFunnel/auto-post.sh youtube >> ~/LinktoFunnel/logs/auto-post.log 2>&1
30 21 * * * ~/LinktoFunnel/auto-post.sh youtube >> ~/LinktoFunnel/logs/auto-post.log 2>&1

# Pinterest - 6:30 & 20:00 Uhr
30 6 * * * ~/LinktoFunnel/auto-post.sh pinterest >> ~/LinktoFunnel/logs/auto-post.log 2>&1
0 20 * * * ~/LinktoFunnel/auto-post.sh pinterest >> ~/LinktoFunnel/logs/auto-post.log 2>&1

EOF

    log "✓ Cron-File erstellt: auto-post-cron.txt"
    echo ""
    log "Um zu aktivieren:"
    log "  1. crontab -e"
    log "  2. Füge Zeilen aus auto-post-cron.txt hinzu"
    log "  3. ODER: cat auto-post-cron.txt >> crontab-temp && crontab crontab-temp"
    echo ""
}

# Main Command Handler
main() {
    local command="${1:-help}"

    case "$command" in
        all)
            show_banner
            post_all
            ;;
        tiktok|instagram|youtube|pinterest)
            show_banner
            post_single "$command"
            ;;
        schedule)
            show_banner
            post_scheduled
            ;;
        status)
            show_banner
            show_status
            ;;
        test)
            show_banner
            test_posting
            ;;
        install-cron)
            show_banner
            install_cron
            ;;
        help|--help|-h)
            show_banner
            cat << 'HELP'
🚀 Auto-Posting Script - Automatisches Social Media Posting

USAGE:
    ./auto-post.sh [COMMAND]

COMMANDS:
    all                 Poste auf allen Plattformen
    tiktok              Poste nur auf TikTok
    instagram           Poste nur auf Instagram
    youtube             Poste nur auf YouTube
    pinterest           Poste nur auf Pinterest
    schedule            Poste basierend auf optimalem Schedule
    status              Zeige Posting-Status
    test                Test-Modus (zeige Preview)
    install-cron        Installiere Cron-Jobs
    help                Zeige diese Hilfe

EXAMPLES:
    ./auto-post.sh all              # Poste alles
    ./auto-post.sh tiktok           # Nur TikTok
    ./auto-post.sh schedule         # Schedule-basiert
    ./auto-post.sh test             # Nur Preview
    ./auto-post.sh status           # Status checken

OPTIMALE ZEITEN:
    06:30 - Pinterest (Morning Browsing)
    07:30 - Instagram (Commute Time)
    11:30 - Instagram (Lunch Break)
    12:30 - YouTube (Lunch Entertainment)
    18:00 - TikTok 🔥 (PRIME TIME!)
    19:00 - Instagram (Evening Scroll)
    20:00 - Pinterest (Evening Planning)
    21:30 - YouTube (Couch Time)

SETUP:
    1. chmod +x auto-post.sh
    2. ./auto-post.sh test
    3. ./auto-post.sh install-cron
    4. Fertig!

HELP
            ;;
        *)
            log_error "Unbekanntes Command: $command"
            log "Nutze './auto-post.sh help' für Hilfe"
            exit 1
            ;;
    esac
}

# Script starten
main "$@"

exit_code=$?
log "Script beendet mit Code: $exit_code"

exit $exit_code
