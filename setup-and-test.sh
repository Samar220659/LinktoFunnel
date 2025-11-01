#!/bin/bash

###############################################################################
# 🚀 LINKTOFUNNEL - KOMPLETTES SYSTEM-SETUP & TEST (TERMUX)
# Einmaliger kompakter Befehl für komplettes Setup
###############################################################################

echo "🚀 LinktoFunnel System wird eingerichtet..."
echo ""

# 1. Ins Projekt-Verzeichnis
cd ~/LinktoFunnel || { echo "❌ Projekt nicht gefunden!"; exit 1; }

# 2. Git Status prüfen
echo "📊 Git Status:"
git status --short

# 3. Neueste Changes pullen
echo ""
echo "⬇️  Pulling latest changes..."
git pull origin claude/dev-workflow-setup-011CUNKUQbhW3tnEnCj6cPRs

# 4. Dependencies prüfen
echo ""
echo "📦 Checking dependencies..."
[ ! -d "node_modules" ] && echo "⚠️  node_modules fehlt - bitte 'pnpm install' ausführen" || echo "✅ Dependencies OK"

# 5. Environment-Check
echo ""
echo "🔑 Environment Check:"
[ -f ".env.local" ] && echo "✅ .env.local vorhanden" || echo "❌ .env.local fehlt!"

# Zeige wichtige Keys (maskiert)
if [ -f ".env.local" ]; then
  echo ""
  echo "Konfigurierte Keys:"
  grep -E "^(GEMINI_API_KEY|DIGISTORE24_API_KEY|TELEGRAM_BOT_TOKEN|SUPABASE_SERVICE_ROLE_KEY)=" .env.local | sed 's/=.*/=***HIDDEN***/'
fi

# 6. Zeige verfügbare Test-Commands
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ SYSTEM BEREIT! Verfügbare Test-Commands:"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "1️⃣  KOMPLETTER WORKFLOW-TEST (Offline, mit 16 echten Produkten):"
echo "   node --env-file=.env.local ai-agent/MASTER_ORCHESTRATOR_TEST.js"
echo ""
echo "2️⃣  PRODUKT-SCOUT TEST (findet FreeCash + 15 weitere):"
echo "   node --env-file=.env.local ai-agent/agents/product-scout.js"
echo ""
echo "3️⃣  PRODUKTE IN SUPABASE EINFÜGEN (wenn Netzwerk + Service Key):"
echo "   node --env-file=.env.local scripts/insert-real-products.js"
echo ""
echo "4️⃣  ORIGINAL MASTER_ORCHESTRATOR (mit DB/Network):"
echo "   node --env-file=.env.local ai-agent/MASTER_ORCHESTRATOR.js"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "🔥 TOP-PRODUKT: FreeCash (Score 9.8) - https://freecash.com/r/937e03b9426f33c00365"
echo ""
echo "💡 EMPFEHLUNG: Starte mit Command 1️⃣  für kompletten Test!"
echo ""
