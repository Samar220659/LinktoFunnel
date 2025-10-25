#!/bin/bash

# N8N Automatisches Setup Script
# Dieses Script richtet Ihre kompletten n8n Workflows automatisch ein

set -e

echo "🚀 N8N AUTOMATISCHES SETUP"
echo "================================"
echo ""

# Farben
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Schritt 1: n8n Account Check
echo -e "${BLUE}SCHRITT 1: N8N Account${NC}"
echo "Haben Sie bereits einen n8n Account?"
echo ""
echo "Falls NEIN:"
echo "1. Öffnen Sie: https://n8n.io"
echo "2. Klicken Sie: 'Start for Free'"
echo "3. Wählen Sie: 'n8n Cloud'"
echo "4. Registrieren Sie sich"
echo "5. Kommen Sie dann zurück zu diesem Script"
echo ""
read -p "Haben Sie einen n8n Account? (j/n): " has_account

if [ "$has_account" != "j" ] && [ "$has_account" != "J" ]; then
    echo ""
    echo -e "${YELLOW}Bitte erstellen Sie zuerst einen Account auf:${NC}"
    echo "https://n8n.io"
    echo ""
    echo "Dann führen Sie dieses Script erneut aus."
    exit 0
fi

echo -e "${GREEN}✓ Account vorhanden${NC}"
echo ""

# Schritt 2: API Key
echo -e "${BLUE}SCHRITT 2: N8N API Key${NC}"
echo "So bekommen Sie Ihren API Key:"
echo "1. Login auf https://app.n8n.cloud"
echo "2. Klicken Sie auf Ihr Profil (oben rechts)"
echo "3. Settings → API"
echo "4. 'Create API Key'"
echo "5. Kopieren Sie den Key"
echo ""
read -p "Fügen Sie Ihren n8n API Key ein: " N8N_API_KEY

if [ -z "$N8N_API_KEY" ]; then
    echo -e "${RED}Fehler: API Key ist erforderlich${NC}"
    exit 1
fi

echo -e "${GREEN}✓ API Key gespeichert${NC}"
echo ""

# Schritt 3: n8n Instance URL
echo -e "${BLUE}SCHRITT 3: N8N Instance URL${NC}"
echo "Wie lautet Ihre n8n URL?"
echo "Beispiel: https://IHRE-INSTANZ.app.n8n.cloud"
echo ""
read -p "n8n URL: " N8N_URL

if [ -z "$N8N_URL" ]; then
    echo -e "${YELLOW}Keine URL angegeben, verwende Standard...${NC}"
    N8N_URL="https://app.n8n.cloud"
fi

echo -e "${GREEN}✓ URL gespeichert${NC}"
echo ""

# Schritt 4: Google Sheet ID
echo -e "${BLUE}SCHRITT 4: Google Sheets Setup${NC}"
echo ""
echo "Haben Sie bereits ein Google Sheet erstellt?"
read -p "(j/n): " has_sheet

if [ "$has_sheet" != "j" ] && [ "$has_sheet" != "J" ]; then
    echo ""
    echo -e "${YELLOW}Google Sheet wird benötigt!${NC}"
    echo ""
    echo "So erstellen Sie es:"
    echo "1. Öffnen: https://sheets.google.com"
    echo "2. Neues Sheet erstellen"
    echo "3. Name: 'ZZ Lobby Elite Dashboard'"
    echo "4. 7 Tabs erstellen:"
    echo "   - KPIs"
    echo "   - Products"
    echo "   - Health_Log"
    echo "   - Content_Schedule"
    echo "   - Ad_Campaigns"
    echo "   - Sales_Log"
    echo "   - Daily_Reports"
    echo ""
    read -p "Sheet erstellt? Drücken Sie Enter zum Fortfahren..."
fi

echo ""
echo "Kopieren Sie Ihre Google Sheet ID:"
echo "URL: https://docs.google.com/spreadsheets/d/[DIESE-TEIL-KOPIEREN]/edit"
echo ""
read -p "Google Sheet ID: " GOOGLE_SHEET_ID

if [ -z "$GOOGLE_SHEET_ID" ]; then
    echo -e "${RED}Fehler: Sheet ID ist erforderlich${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Google Sheet ID gespeichert${NC}"
echo ""

# Schritt 5: API Keys sammeln
echo -e "${BLUE}SCHRITT 5: API Keys${NC}"
echo ""

# Telegram
echo "Telegram Bot Token:"
echo "(Standard: 7215449153:AAEZekOaNe1_j9kd0kEyytKh0L0ajrwqJqk)"
read -p "Telegram Bot Token [Enter für Standard]: " TELEGRAM_TOKEN
TELEGRAM_TOKEN=${TELEGRAM_TOKEN:-"7215449153:AAEZekOaNe1_j9kd0kEyytKh0L0ajrwqJqk"}

echo "Telegram Chat ID:"
echo "(Standard: 6982601388)"
read -p "Telegram Chat ID [Enter für Standard]: " TELEGRAM_CHAT_ID
TELEGRAM_CHAT_ID=${TELEGRAM_CHAT_ID:-"6982601388"}

echo ""
echo "Gemini API Key:"
echo "(Erstellen auf: https://makersuite.google.com/app/apikey)"
read -p "Gemini API Key: " GEMINI_API_KEY

echo ""
echo "DigiStore24 API Key:"
read -p "DigiStore24 API Key: " DIGISTORE_API_KEY

echo ""
echo "Supabase URL:"
echo "(Standard: https://mkiliztwhxzwizwwjhqn.supabase.co)"
read -p "Supabase URL [Enter für Standard]: " SUPABASE_URL
SUPABASE_URL=${SUPABASE_URL:-"https://mkiliztwhxzwizwwjhqn.supabase.co"}

echo ""
echo "Supabase API Key:"
echo "(Standard: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)"
read -p "Supabase Key [Enter für Standard]: " SUPABASE_KEY
SUPABASE_KEY=${SUPABASE_KEY:-"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1raWxpenR3aHh6d2l6d3dqaHFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NjY1ODksImV4cCI6MjA3NjE0MjU4OX0.olvY21Ppazo8d9z76FPZ4KzeLOY2UVqk8nUpnr1Xc-w"}

echo -e "${GREEN}✓ Alle API Keys gesammelt${NC}"
echo ""

# Schritt 6: Workflows vorbereiten
echo -e "${BLUE}SCHRITT 6: Workflows vorbereiten${NC}"
echo "Workflows werden angepasst..."

# Erstelle temp Verzeichnis
mkdir -p /tmp/n8n-setup

# Workflows anpassen
for workflow in 1-master-orchestrator.json 2-traffic-scaling.json 3-lead-sales-process.json 4-payout-reporting.json; do
    if [ -f "$workflow" ]; then
        echo "  Bereite vor: $workflow"

        # Ersetze Platzhalter
        sed -e "s/YOUR_GOOGLE_SHEET_ID/$GOOGLE_SHEET_ID/g" \
            -e "s/YOUR_TELEGRAM_CHAT_ID/$TELEGRAM_CHAT_ID/g" \
            "$workflow" > "/tmp/n8n-setup/$workflow"
    fi
done

echo -e "${GREEN}✓ Workflows angepasst${NC}"
echo ""

# Schritt 7: Zu n8n hochladen
echo -e "${BLUE}SCHRITT 7: Workflows hochladen${NC}"
echo ""
echo -e "${YELLOW}WICHTIG:${NC} Die n8n Cloud API unterstützt keinen automatischen Import."
echo ""
echo "Sie müssen die Workflows manuell importieren:"
echo ""
echo "1. Öffnen Sie: $N8N_URL"
echo "2. Für jeden Workflow:"
echo "   - Klicken: '+ Add workflow'"
echo "   - Klicken: '⋮' → 'Import from File'"
echo "   - Wählen Sie:"
echo ""

for workflow in 1-master-orchestrator.json 2-traffic-scaling.json 3-lead-sales-process.json 4-payout-reporting.json; do
    echo "     ✓ /tmp/n8n-setup/$workflow"
done

echo ""
echo "Die Workflows wurden bereits für Sie vorbereitet mit:"
echo "  ✓ Google Sheet ID: $GOOGLE_SHEET_ID"
echo "  ✓ Telegram Chat ID: $TELEGRAM_CHAT_ID"
echo ""

# Schritt 8: Credentials Setup-Hilfe
echo -e "${BLUE}SCHRITT 8: Credentials einrichten${NC}"
echo ""
echo "Nachdem Sie die Workflows importiert haben:"
echo ""

cat > /tmp/n8n-setup/CREDENTIALS.txt << EOF
N8N CREDENTIALS SETUP
=====================

1. GOOGLE SHEETS
   - Type: Google Sheets OAuth2 API
   - Name: google-sheets
   - → Sign in with Google

2. GEMINI AI
   - Type: HTTP Header Auth
   - Name: gemini-api
   - Header Name: x-goog-api-key
   - Header Value: $GEMINI_API_KEY

3. TELEGRAM BOT
   - Type: Telegram API
   - Name: telegram-bot
   - Access Token: $TELEGRAM_TOKEN

4. DIGISTORE24
   - Type: HTTP Header Auth
   - Name: digistore24-api
   - Header Name: X-DS-API-Key
   - Header Value: $DIGISTORE_API_KEY

5. SUPABASE
   - Type: HTTP Header Auth
   - Name: supabase-api
   - Header Name: apikey
   - Header Value: $SUPABASE_KEY

Speicherort: /tmp/n8n-setup/CREDENTIALS.txt
EOF

echo -e "${GREEN}✓ Credential-Anleitung gespeichert${NC}"
echo ""

# Zusammenfassung
echo ""
echo "================================"
echo -e "${GREEN}✅ SETUP VORBEREITET!${NC}"
echo "================================"
echo ""
echo "Nächste Schritte:"
echo ""
echo "1. Öffnen Sie: $N8N_URL"
echo ""
echo "2. Importieren Sie die 4 Workflows aus:"
echo "   /tmp/n8n-setup/"
echo ""
echo "3. Richten Sie die Credentials ein (siehe):"
echo "   /tmp/n8n-setup/CREDENTIALS.txt"
echo ""
echo "4. Aktivieren Sie die Workflows:"
echo "   - Workflow 2 ✓"
echo "   - Workflow 3 ✓"
echo "   - Workflow 4 ✓"
echo "   - Workflow 1 ✓ (zuletzt!)"
echo ""
echo -e "${YELLOW}💡 Tipp:${NC} Die Workflows sind bereits mit Ihren Daten konfiguriert!"
echo ""
echo "Vorbereitet Dateien:"
ls -lh /tmp/n8n-setup/
echo ""
echo -e "${GREEN}Viel Erfolg! 🚀💰${NC}"
