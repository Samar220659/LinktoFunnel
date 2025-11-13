#!/bin/bash
# 🚀 Jules Backend - Quick Start Script

set -e

echo "🚀 ========================================="
echo "   JULES BACKEND - QUICK START"
echo "========================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "📋 Copying .env.example to .env..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and fill in your API keys!"
    echo "   Required:"
    echo "   - GEMINI_API_KEY"
    echo "   - STRIPE_SECRET_KEY"
    echo "   - GMAIL_APP_PASSWORD"
    echo "   - TELEGRAM_BOT_TOKEN"
    echo ""
    read -p "Press ENTER when you've configured .env..."
fi

# Install dependencies
echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt --break-system-packages || pip3 install -r requirements.txt

echo ""
echo "✅ Dependencies installed!"
echo ""

# Create directories
echo "📁 Creating directories..."
mkdir -p digital_products
mkdir -p landing_pages

echo "✅ Directories created!"
echo ""

# Test configuration
echo "🧪 Testing configuration..."
python3 -c "from config import config; config.validate(); print('✅ Configuration valid!')"

echo ""
echo "🎉 ========================================="
echo "   SETUP COMPLETE!"
echo "========================================="
echo ""
echo "📝 Next steps:"
echo ""
echo "1️⃣  Start Jules Backend:"
echo "   python3 jules_backend.py"
echo ""
echo "2️⃣  In another terminal, start Landing Page server:"
echo "   cd landing_pages && python3 -m http.server 8080"
echo ""
echo "3️⃣  Test the system:"
echo "   Visit: http://localhost:8080/ai-blueprint-2025.html"
echo ""
echo "4️⃣  For Stripe webhooks (local testing):"
echo "   - Install ngrok: https://ngrok.com"
echo "   - Run: ngrok http 5001"
echo "   - Configure Stripe webhook with ngrok URL"
echo ""
echo "🚀 Ready to launch!"
