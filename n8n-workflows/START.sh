#!/bin/bash

# ONE-CLICK N8N SETUP FÜR TERMUX
# Einfach ausführen: ./START.sh

clear

cat << "EOF"
╔═══════════════════════════════════════╗
║   🚀 N8N PASSIVE INCOME SYSTEM        ║
║   One-Click Setup                     ║
╚═══════════════════════════════════════╝
EOF

echo ""
echo "Wählen Sie Ihre Setup-Option:"
echo ""
echo "1) 🏃 SCHNELL-SETUP (10 Min)"
echo "   → Workflows vorbereiten mit Ihren Daten"
echo "   → Fertig zum Import in n8n Cloud"
echo ""
echo "2) 🐳 DOCKER SETUP (Self-Hosted)"
echo "   → n8n lokal auf Ihrem Server starten"
echo "   → Komplett kostenlos!"
echo ""
echo "3) 📖 ANLEITUNG ANZEIGEN"
echo "   → Quick Start Guide lesen"
echo ""
echo "4) ❌ ABBRECHEN"
echo ""

read -p "Ihre Wahl (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🏃 SCHNELL-SETUP wird gestartet..."
        echo ""
        sleep 1

        # Google Sheet ID fragen
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "SCHRITT 1: Google Sheet"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "Haben Sie bereits ein Google Sheet erstellt?"
        echo ""
        read -p "(j/n): " has_sheet

        if [ "$has_sheet" != "j" ] && [ "$has_sheet" != "J" ]; then
            echo ""
            echo "❗ WICHTIG: Erstellen Sie zuerst ein Google Sheet!"
            echo ""
            echo "1. Öffnen Sie auf Ihrem Handy: https://sheets.google.com"
            echo "2. Erstellen Sie ein neues Sheet"
            echo "3. Name: 'ZZ Lobby Elite Dashboard'"
            echo "4. Erstellen Sie 7 Tabs:"
            echo "   - KPIs"
            echo "   - Products"
            echo "   - Health_Log"
            echo "   - Content_Schedule"
            echo "   - Ad_Campaigns"
            echo "   - Sales_Log"
            echo "   - Daily_Reports"
            echo ""
            read -p "Drücken Sie Enter wenn fertig..."
        fi

        echo ""
        echo "Kopieren Sie Ihre Google Sheet ID:"
        echo ""
        echo "So finden Sie die ID:"
        echo "1. Öffnen Sie Ihr Sheet"
        echo "2. URL: https://docs.google.com/spreadsheets/d/ABC123XYZ/edit"
        echo "3. Kopieren Sie: ABC123XYZ (zwischen /d/ und /edit)"
        echo ""
        read -p "Sheet ID: " SHEET_ID

        if [ -z "$SHEET_ID" ]; then
            echo "❌ Fehler: Sheet ID erforderlich!"
            exit 1
        fi

        echo ""
        echo "✅ Sheet ID gespeichert: $SHEET_ID"
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "SCHRITT 2: Workflows vorbereiten"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""

        # Erstelle ready-to-import Verzeichnis
        mkdir -p ready-to-import

        TELEGRAM_CHAT_ID="6982601388"

        echo "Bereite Workflows vor..."

        # Workflows anpassen
        for workflow in 1-master-orchestrator.json 2-traffic-scaling.json 3-lead-sales-process.json 4-payout-reporting.json; do
            if [ -f "$workflow" ]; then
                echo "  ✓ $workflow"
                sed -e "s/YOUR_GOOGLE_SHEET_ID/$SHEET_ID/g" \
                    -e "s/YOUR_TELEGRAM_CHAT_ID/$TELEGRAM_CHAT_ID/g" \
                    "$workflow" > "ready-to-import/$workflow"
            fi
        done

        # Credentials Datei
        cat > ready-to-import/CREDENTIALS.txt << 'CRED_EOF'
N8N CREDENTIALS SETUP
=====================

Richten Sie diese Credentials in n8n ein:

1. GOOGLE SHEETS
   Name: google-sheets
   Type: Google Sheets OAuth2 API
   → Sign in with Google

2. GEMINI AI
   Name: gemini-api
   Type: HTTP Header Auth
   Header Name: x-goog-api-key
   Header Value: AIzaSyCjmQnnPhLcj5cFG1r759jyX-C4xuwPzQE

3. TELEGRAM BOT
   Name: telegram-bot
   Type: Telegram API
   Access Token: 7215449153:AAEZekOaNe1_j9kd0kEyytKh0L0ajrwqJqk

4. DIGISTORE24
   Name: digistore24-api
   Type: HTTP Header Auth
   Header Name: X-DS-API-Key
   Header Value: 1417598-BP9FgEF71a0Kpzh5wHMtaEr9w1k5qJyWHoHeS

5. SUPABASE
   Name: supabase-api
   Type: HTTP Header Auth
   Header Name: apikey
   Header Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1raWxpenR3aHh6d2l6d3dqaHFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NjY1ODksImV4cCI6MjA3NjE0MjU4OX0.olvY21Ppazo8d9z76FPZ4KzeLOY2UVqk8nUpnr1Xc-w

CRED_EOF

        # Import Anleitung
        cat > ready-to-import/IMPORT.txt << 'IMPORT_EOF'
IMPORT ANLEITUNG
================

✅ Die Workflows sind fertig konfiguriert!

NÄCHSTE SCHRITTE:

1. Öffnen Sie: https://n8n.io
   → Falls kein Account: Registrieren Sie sich (14 Tage kostenlos)

2. Für jeden Workflow importieren:
   - Klicken: "+ Add workflow"
   - Klicken: "⋮" (3 Punkte)
   - Wählen: "Import from File"
   - Importieren:
     * 1-master-orchestrator.json
     * 2-traffic-scaling.json
     * 3-lead-sales-process.json
     * 4-payout-reporting.json

3. Credentials einrichten:
   - Settings → Credentials
   - Siehe: CREDENTIALS.txt

4. Workflows aktivieren:
   - Toggle auf "Active":
     ✓ Workflow 2
     ✓ Workflow 3
     ✓ Workflow 4
     ✓ Workflow 1 (zuletzt!)

FERTIG! 🎉

In 5 Minuten kommt die erste Telegram Nachricht!

IMPORT_EOF

        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "✅ SETUP ABGESCHLOSSEN!"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "Ihre Workflows sind bereit in:"
        echo "  📁 ready-to-import/"
        echo ""
        echo "Dateien:"
        ls -1 ready-to-import/
        echo ""
        echo "NÄCHSTE SCHRITTE:"
        echo ""
        echo "1. Lesen Sie: ready-to-import/IMPORT.txt"
        echo "2. Öffnen Sie: https://n8n.io"
        echo "3. Importieren Sie die 4 Workflows"
        echo "4. Richten Sie Credentials ein (siehe CREDENTIALS.txt)"
        echo "5. Aktivieren Sie die Workflows"
        echo ""
        echo "📱 Öffnen Sie die Dateien in Termux:"
        echo "   cat ready-to-import/IMPORT.txt"
        echo "   cat ready-to-import/CREDENTIALS.txt"
        echo ""
        echo "🚀 Viel Erfolg mit Ihrem passiven Einkommen!"
        ;;

    2)
        echo ""
        echo "🐳 DOCKER SETUP"
        echo ""

        # Check if Docker is installed
        if ! command -v docker &> /dev/null; then
            echo "❌ Docker ist nicht installiert!"
            echo ""
            echo "Docker Installation:"
            echo "  curl -fsSL https://get.docker.com -o get-docker.sh"
            echo "  sh get-docker.sh"
            echo ""
            echo "Dann führen Sie dieses Script erneut aus."
            exit 1
        fi

        echo "✅ Docker gefunden"
        echo ""
        echo "Starte n8n..."

        docker-compose up -d

        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "✅ N8N LÄUFT!"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "Öffnen Sie in Ihrem Browser:"
        echo "  http://localhost:5678"
        echo ""
        echo "Login:"
        echo "  Username: admin"
        echo "  Password: ZZLobby2025!"
        echo ""
        echo "Dann importieren Sie die 4 Workflows."
        echo ""
        echo "Docker Befehle:"
        echo "  Status: docker ps"
        echo "  Logs: docker logs n8n-zz-lobby"
        echo "  Stoppen: docker-compose down"
        echo "  Neu starten: docker-compose restart"
        ;;

    3)
        echo ""
        if [ -f "QUICK_START.md" ]; then
            cat QUICK_START.md
        else
            cat README.md
        fi
        ;;

    4)
        echo ""
        echo "Abgebrochen."
        exit 0
        ;;

    *)
        echo ""
        echo "❌ Ungültige Auswahl!"
        exit 1
        ;;
esac
