#!/bin/bash
# 🚀 Automatisches Render.com Deployment Script
# Deployment für LinktoFunnel via Render API

set -e

echo "🎯 RENDER AUTO-DEPLOY SCRIPT"
echo "================================"

# API Key überprüfen
if [ -z "$RENDER_API_KEY" ]; then
    echo ""
    echo "📝 Render API Key benötigt!"
    echo "Hole deinen Key von: https://dashboard.render.com/account/api-keys"
    echo ""
    read -p "Gib deinen Render API Key ein: " RENDER_API_KEY

    if [ -z "$RENDER_API_KEY" ]; then
        echo "❌ Kein API Key eingegeben. Abbruch."
        exit 1
    fi
fi

echo ""
echo "✅ API Key gefunden"
echo ""

# Service Name
SERVICE_NAME="linktofunnel-${RANDOM}"
REPO_URL="https://github.com/Samar220659/LinktoFunnel"
BRANCH="claude/direct-render-deploy-011CUix5eswUpHKaDqW9xr4n"

echo "🔧 Deployment Konfiguration:"
echo "  Service Name: $SERVICE_NAME"
echo "  Repository: $REPO_URL"
echo "  Branch: $BRANCH"
echo "  Region: Frankfurt"
echo "  Plan: Free"
echo ""

# JSON Payload erstellen
read -r -d '' PAYLOAD << EOF || true
{
  "type": "web_service",
  "name": "$SERVICE_NAME",
  "ownerId": "user",
  "repo": "$REPO_URL",
  "branch": "$BRANCH",
  "autoDeploy": "yes",
  "serviceDetails": {
    "env": "docker",
    "region": "frankfurt",
    "plan": "free",
    "dockerfilePath": "./Dockerfile",
    "envVars": [
      {
        "key": "NODE_ENV",
        "value": "production"
      },
      {
        "key": "PORT",
        "value": "3000"
      }
    ],
    "healthCheckPath": "/"
  }
}
EOF

echo "🚀 Starte Deployment..."
echo ""

# API Request
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "https://api.render.com/v1/services" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

# HTTP Status Code extrahieren
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "📊 Response Status: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" -eq 201 ] || [ "$HTTP_CODE" -eq 200 ]; then
    echo "✅ DEPLOYMENT ERFOLGREICH GESTARTET!"
    echo ""
    echo "📦 Service Details:"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    echo ""

    # Service ID und URL extrahieren
    SERVICE_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    SERVICE_URL=$(echo "$BODY" | grep -o '"url":"[^"]*"' | head -1 | cut -d'"' -f4)

    if [ ! -z "$SERVICE_URL" ]; then
        echo "🌐 Deine App URL: $SERVICE_URL"
    fi

    if [ ! -z "$SERVICE_ID" ]; then
        echo "🔑 Service ID: $SERVICE_ID"
        echo ""
        echo "📊 Status überwachen:"
        echo "   https://dashboard.render.com/web/$SERVICE_ID"
    fi

    echo ""
    echo "⏳ Deployment läuft... (dauert 2-5 Minuten)"
    echo "✅ Deine App wird gleich live sein!"

elif [ "$HTTP_CODE" -eq 401 ]; then
    echo "❌ FEHLER: Ungültiger API Key"
    echo "Überprüfe deinen Key auf: https://dashboard.render.com/account/api-keys"
    exit 1

elif [ "$HTTP_CODE" -eq 400 ]; then
    echo "❌ FEHLER: Ungültige Request-Daten"
    echo "Response:"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    exit 1

else
    echo "❌ FEHLER: Unerwarteter Status Code"
    echo "Response:"
    echo "$BODY"
    exit 1
fi

echo ""
echo "🎉 FERTIG! Öffne dein Render Dashboard:"
echo "   https://dashboard.render.com/"
