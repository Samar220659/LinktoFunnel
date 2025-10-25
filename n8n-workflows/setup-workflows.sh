#!/bin/bash

# Script zum Vorbereiten der Workflows mit Ihren Daten

echo "🔧 N8N Workflows vorbereiten"
echo "=============================="
echo ""

# Ihre Daten (ANPASSEN wenn nötig!)
TELEGRAM_CHAT_ID="6982601388"
GEMINI_API_KEY="AIzaSyCjmQnnPhLcj5cFG1r759jyX-C4xuwPzQE"
TELEGRAM_TOKEN="7215449153:AAEZekOaNe1_j9kd0kEyytKh0L0ajrwqJqk"
DIGISTORE_API_KEY="1417598-BP9FgEF71a0Kpzh5wHMtaEr9w1k5qJyWHoHeS"
SUPABASE_URL="https://mkiliztwhxzwizwwjhqn.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1raWxpenR3aHh6d2l6d3dqaHFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NjY1ODksImV4cCI6MjA3NjE0MjU4OX0.olvY21Ppazo8d9z76FPZ4KzeLOY2UVqk8nUpnr1Xc-w"

# Google Sheet ID
echo "Bitte geben Sie Ihre Google Sheet ID ein:"
echo "(Kopieren Sie aus der URL: https://docs.google.com/spreadsheets/d/[DIESE-ID]/edit)"
echo ""
read -p "Google Sheet ID: " GOOGLE_SHEET_ID

if [ -z "$GOOGLE_SHEET_ID" ]; then
    echo "❌ Fehler: Sheet ID erforderlich!"
    exit 1
fi

# Erstelle ready-to-import Verzeichnis
mkdir -p ready-to-import

echo ""
echo "Bereite Workflows vor..."

# Workflow 1: Master Orchestrator
echo "  ✓ Master Orchestrator..."
sed -e "s/YOUR_GOOGLE_SHEET_ID/$GOOGLE_SHEET_ID/g" \
    -e "s/YOUR_TELEGRAM_CHAT_ID/$TELEGRAM_CHAT_ID/g" \
    1-master-orchestrator.json > ready-to-import/1-master-orchestrator.json

# Workflow 2: Traffic Scaling
echo "  ✓ Traffic Scaling..."
sed -e "s/YOUR_GOOGLE_SHEET_ID/$GOOGLE_SHEET_ID/g" \
    -e "s/YOUR_TELEGRAM_CHAT_ID/$TELEGRAM_CHAT_ID/g" \
    2-traffic-scaling.json > ready-to-import/2-traffic-scaling.json

# Workflow 3: Lead & Sales
echo "  ✓ Lead & Sales Process..."
sed -e "s/YOUR_GOOGLE_SHEET_ID/$GOOGLE_SHEET_ID/g" \
    -e "s/YOUR_TELEGRAM_CHAT_ID/$TELEGRAM_CHAT_ID/g" \
    3-lead-sales-process.json > ready-to-import/3-lead-sales-process.json

# Workflow 4: Payout & Reporting
echo "  ✓ Payout & Reporting..."
sed -e "s/YOUR_GOOGLE_SHEET_ID/$GOOGLE_SHEET_ID/g" \
    -e "s/YOUR_TELEGRAM_CHAT_ID/$TELEGRAM_CHAT_ID/g" \
    4-payout-reporting.json > ready-to-import/4-payout-reporting.json

# Erstelle Credentials Datei
cat > ready-to-import/CREDENTIALS.txt << EOF
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
   Header Value: $GEMINI_API_KEY

3. TELEGRAM BOT
   Name: telegram-bot
   Type: Telegram API
   Access Token: $TELEGRAM_TOKEN

4. DIGISTORE24
   Name: digistore24-api
   Type: HTTP Header Auth
   Header Name: X-DS-API-Key
   Header Value: $DIGISTORE_API_KEY

5. SUPABASE
   Name: supabase-api
   Type: HTTP Header Auth
   Header Name: apikey
   Header Value: $SUPABASE_KEY

6. GETRESPONSE (Optional)
   Name: getresponse-api
   Type: HTTP Header Auth
   Header Name: X-Auth-Token
   Header Value: dmg18fztw7ecpfyhhfeallh6hdske13q

7. NETLIFY (Optional)
   Name: netlify-api
   Type: HTTP Header Auth
   Header Name: Authorization
   Header Value: Bearer [IHR_NETLIFY_TOKEN]

EOF

# Erstelle Import-Anleitung
cat > ready-to-import/IMPORT.txt << EOF
IMPORT ANLEITUNG
================

Die Workflows sind fertig konfiguriert!

SCHRITT 1: Credentials einrichten
----------------------------------
Öffnen Sie in n8n:
Settings → Credentials → New Credential

Folgen Sie: CREDENTIALS.txt

SCHRITT 2: Workflows importieren
---------------------------------
Für jeden Workflow:

1. Klicken: "+ Add workflow"
2. Klicken: "⋮" (3 Punkte) → "Import from File"
3. Wählen Sie:
   - 1-master-orchestrator.json
   - 2-traffic-scaling.json
   - 3-lead-sales-process.json
   - 4-payout-reporting.json

SCHRITT 3: Aktivieren
----------------------
Toggle auf "Active" stellen:
   ✓ Workflow 2
   ✓ Workflow 3
   ✓ Workflow 4
   ✓ Workflow 1 (zuletzt!)

FERTIG! 🎉
----------
Telegram öffnen → Erste Nachricht kommt in 5 Minuten!

EOF

echo ""
echo "✅ FERTIG!"
echo ""
echo "Ihre Workflows sind bereit in:"
echo "  📁 ready-to-import/"
echo ""
echo "Dateien:"
ls -1 ready-to-import/
echo ""
echo "Nächster Schritt:"
echo "1. Öffnen: https://n8n.io (oder Ihr n8n)"
echo "2. Lesen: ready-to-import/IMPORT.txt"
echo "3. Workflows importieren"
echo ""
echo "🚀 Viel Erfolg!"
