#!/bin/bash
# 🔄 Update existierende Render App
# Für: ai-automation-blueprint.onrender.com

set -e

echo "🔄 RENDER APP UPDATE"
echo "================================"
echo ""

# API Key überprüfen
if [ -z "$RENDER_API_KEY" ]; then
    echo "📝 Render API Key benötigt!"
    echo "Hole deinen Key von: https://dashboard.render.com/account/api-keys"
    echo ""
    read -p "Gib deinen Render API Key ein: " RENDER_API_KEY

    if [ -z "$RENDER_API_KEY" ]; then
        echo "❌ Kein API Key eingegeben. Abbruch."
        exit 1
    fi
fi

echo "✅ API Key gefunden"
echo ""

# Service ID finden
echo "🔍 Suche nach deinem Service..."
echo ""

SERVICES=$(curl -s \
    -H "Authorization: Bearer $RENDER_API_KEY" \
    -H "Accept: application/json" \
    "https://api.render.com/v1/services")

# Service ID für ai-automation-blueprint finden
SERVICE_ID=$(echo "$SERVICES" | grep -o '"id":"srv-[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$SERVICE_ID" ]; then
    echo "❌ Service nicht gefunden!"
    echo ""
    echo "📋 Deine Services:"
    echo "$SERVICES" | python3 -m json.tool 2>/dev/null || echo "$SERVICES"
    echo ""
    echo "💡 Gehe manuell ins Dashboard:"
    echo "   https://dashboard.render.com/"
    echo "   → Wähle 'ai-automation-blueprint'"
    echo "   → Klicke 'Manual Deploy' → 'Deploy latest commit'"
    exit 1
fi

echo "✅ Service gefunden: $SERVICE_ID"
echo ""

# Redeploy triggern
echo "🚀 Triggere Redeploy..."
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    "https://api.render.com/v1/services/$SERVICE_ID/deploys" \
    -H "Authorization: Bearer $RENDER_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"clearCache": "do_not_clear"}')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 201 ] || [ "$HTTP_CODE" -eq 200 ]; then
    echo "✅ REDEPLOY GESTARTET!"
    echo ""
    echo "📦 Deploy Details:"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    echo ""
    echo "🌐 Deine App: https://ai-automation-blueprint.onrender.com"
    echo "📊 Dashboard: https://dashboard.render.com/web/$SERVICE_ID"
    echo ""
    echo "⏳ Deployment läuft... (2-5 Minuten)"
    echo "✅ Änderungen werden gleich live sein!"
else
    echo "❌ FEHLER beim Redeploy (Status: $HTTP_CODE)"
    echo "Response: $BODY"
    echo ""
    echo "💡 Alternative: Manuelles Redeploy"
    echo "   1. Gehe zu: https://dashboard.render.com/"
    echo "   2. Wähle: ai-automation-blueprint"
    echo "   3. Klicke: Manual Deploy → Deploy latest commit"
fi

echo ""
echo "🎉 FERTIG!"
