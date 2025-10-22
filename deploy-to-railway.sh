#!/bin/bash

# Railway Deployment Script
# This script deploys LinktoFunnel to Railway with all required configuration

echo "🚀 Railway Deployment Script"
echo "=============================="
echo ""

# Set Railway API Token
export RAILWAY_TOKEN="d41b1d2b-d60e-42de-bfec-8593fb9c8ab1"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
else
    echo "✅ Railway CLI already installed"
fi

echo ""
echo "🔐 Logging in to Railway..."
railway whoami

echo ""
echo "📂 Current directory: $(pwd)"
echo "📦 Current branch: $(git branch --show-current)"

echo ""
echo "🎯 Creating/Linking Railway project..."
# Try to link existing project or create new one
railway link || railway init

echo ""
echo "⚙️  Setting environment variables..."

# Required variables
railway variables set NEXT_PUBLIC_SUPABASE_URL="https://db.mkiliztwhxzwizwwjhqn.supabase.co"
railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1raWxpenR3aHh6d2l6d3dqaHFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NjY1ODksImV4cCI6MjA3NjE0MjU4OX0.olvY21Ppazo8d9z76FPZ4KzeLOY2UVqk8nUpnr1Xc-w"
railway variables set GEMINI_API_KEY="AIzaSyCjmQnnPhLcj5cFG1r759jyX-C4xuwPzQE"
railway variables set TELEGRAM_BOT_TOKEN="7215449153:AAEZekOaNe1_j9kd0kEyytKh0L0ajrwqJqk"
railway variables set TELEGRAM_CHAT_ID="6982601388"

# Optional variables (uncomment if needed)
railway variables set OPENAI_API_KEY="sk-projMQv7HmrKmzlFGe2saHc8oH2k261KgffxRaLM"
railway variables set SCRAPINGBEE_API_KEY="ESUONFHKA4ZOVTT1LKTKPYIQJXMXQH3ZT8Z6TXCX1A4KRLTK6VUIRMD8VDN27WJ8W5KE2VC5778CI81Z"
railway variables set DIGISTORE24_API_KEY="1417598-BP9FgEF71a0Kpzh5wHMtaEr9w1k5qJyWHoHeS"
railway variables set GETRESPONSE_API_KEY="dmg18fztw7ecpfyhhfeallh6hdske13q"
railway variables set STRIPE_PUBLISHABLE_KEY="pk_live_51RXxMyG1aiMAOWbFsiDcEDL1f5Wk3ECOB6H7Av1VG2S6PhyAuDQsfnLvAIakjyGnS5y0va7v8zpAB1trCW5WmEFO00x81rRG8O"
railway variables set NODE_ENV="production"

echo ""
echo "✅ Environment variables set!"

echo ""
echo "🚀 Deploying to Railway..."
railway up

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 View your deployment:"
railway open

echo ""
echo "📝 View logs:"
echo "   railway logs"
echo ""
echo "🤖 Test your Telegram Bot:"
echo "   1. Open Telegram"
echo "   2. Find your bot"
echo "   3. Send: /start"
echo ""
echo "✅ Done! Your system is now running 24/7 on Railway!"
