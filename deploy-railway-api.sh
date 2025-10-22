#!/data/data/com.termux/files/usr/bin/bash

# Railway API Deployment Script for Termux
# Uses curl instead of Railway CLI

echo "🚀 Railway API Deployment (Termux-Compatible)"
echo "=============================================="
echo ""

RAILWAY_TOKEN="d41b1d2b-d60e-42de-bfec-8593fb9c8ab1"
API_URL="https://backboard.railway.app/graphql/v2"

# Test connection
echo "🔐 Testing Railway API connection..."
RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Authorization: Bearer $RAILWAY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"query { me { id email name } }"}')

if echo "$RESPONSE" | grep -q '"me"'; then
  echo "✅ Successfully connected to Railway!"
  EMAIL=$(echo "$RESPONSE" | grep -o '"email":"[^"]*' | cut -d'"' -f4)
  echo "   Logged in as: $EMAIL"
else
  echo "❌ Failed to connect to Railway API"
  echo "   Response: $RESPONSE"
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  MANUAL DEPLOYMENT REQUIRED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Railway CLI is not available for Termux/Android."
echo "Please use the Railway Web Dashboard instead:"
echo ""
echo "📱 DEPLOYMENT STEPS:"
echo ""
echo "1. Open browser: https://railway.app"
echo "2. Login with GitHub"
echo "3. Click: 'New Project' → 'Deploy from GitHub repo'"
echo "4. Select: 'Samar220659/LinktoFunnel'"
echo "5. Branch: 'claude/dev-workflow-setup-011CUNKUQbhW3tnEnCj6cPRs'"
echo "6. Railway auto-detects railway.json ✅"
echo ""
echo "📋 ENVIRONMENT VARIABLES:"
echo ""
echo "Copy this into Railway Dashboard → Variables → Raw Editor:"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat << 'ENVVARS'
NEXT_PUBLIC_SUPABASE_URL=https://db.mkiliztwhxzwizwwjhqn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1raWxpenR3aHh6d2l6d3dqaHFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NjY1ODksImV4cCI6MjA3NjE0MjU4OX0.olvY21Ppazo8d9z76FPZ4KzeLOY2UVqk8nUpnr1Xc-w
GEMINI_API_KEY=AIzaSyCjmQnnPhLcj5cFG1r759jyX-C4xuwPzQE
TELEGRAM_BOT_TOKEN=7215449153:AAEZekOaNe1_j9kd0kEyytKh0L0ajrwqJqk
TELEGRAM_CHAT_ID=6982601388
OPENAI_API_KEY=sk-projMQv7HmrKmzlFGe2saHc8oH2k261KgffxRaLM
SCRAPINGBEE_API_KEY=ESUONFHKA4ZOVTT1LKTKPYIQJXMXQH3ZT8Z6TXCX1A4KRLTK6VUIRMD8VDN27WJ8W5KE2VC5778CI81Z
DIGISTORE24_API_KEY=1417598-BP9FgEF71a0Kpzh5wHMtaEr9w1k5qJyWHoHeS
GETRESPONSE_API_KEY=dmg18fztw7ecpfyhhfeallh6hdske13q
STRIPE_PUBLISHABLE_KEY=pk_live_51RXxMyG1aiMAOWbFsiDcEDL1f5Wk3ECOB6H7Av1VG2S6PhyAuDQsfnLvAIakjyGnS5y0va7v8zpAB1trCW5WmEFO00x81rRG8O
NODE_ENV=production
ENVVARS
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ After deployment, Railway will start 3 services:"
echo "   1. telegram-bot (24/7)"
echo "   2. super-automation (Daily 9:00 AM)"
echo "   3. api-server (Health check at /health)"
echo ""
echo "🤖 Test your bot in Telegram:"
echo "   /start"
echo "   /stats"
echo "   /generate"
echo ""
echo "🎉 Done! System runs 24/7 on Railway!"
