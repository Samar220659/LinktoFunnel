#!/bin/bash
# 🚀 Jules Backend - Termux Installation Script

set -e

echo "🚀 ========================================="
echo "   JULES BACKEND - TERMUX INSTALLATION"
echo "========================================="
echo ""

# Create backend directory
echo "📁 Creating backend directory..."
cd ~
mkdir -p jules-backend
cd jules-backend

# Create requirements.txt
echo "📦 Creating requirements.txt..."
cat > requirements.txt << 'REQUIREMENTS'
flask==3.0.0
flask-cors==4.0.0
stripe==7.8.0
python-dotenv==1.0.0
fpdf2==2.7.6
google-generativeai==0.3.1
pyjwt==2.8.0
requests==2.31.0
REQUIREMENTS

# Create .env.example
echo "📝 Creating .env.example..."
cat > .env.example << 'ENVEXAMPLE'
# Gemini API
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE

# Stripe
STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=YOUR_STRIPE_WEBHOOK_SECRET_HERE

# Email (Gmail SMTP)
GMAIL_EMAIL=samar220659@gmail.com
GMAIL_APP_PASSWORD=YOUR_GMAIL_APP_PASSWORD_HERE

# Telegram
TELEGRAM_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN_HERE
TELEGRAM_CHAT_ID=6982601388

# Security
JWT_SECRET=YOUR_RANDOM_SECRET_KEY_HERE

# URLs
BACKEND_BASE_URL=http://localhost:5001
LANDING_PAGE_BASE_URL=http://localhost:8080
FRONTEND_URL=http://localhost:3000
ENVEXAMPLE

# Copy to .env
cp .env.example .env

echo ""
echo "✅ Basic setup complete!"
echo ""
echo "⚠️  WICHTIG: Editiere jetzt die .env Datei!"
echo "   nano .env"
echo ""
echo "📋 Du brauchst:"
echo "   - GEMINI_API_KEY (von Google AI Studio)"
echo "   - STRIPE_SECRET_KEY (von Stripe Dashboard)"
echo "   - GMAIL_APP_PASSWORD (Google App Password)"
echo "   - TELEGRAM_BOT_TOKEN (von @BotFather)"
echo ""
read -p "Drücke ENTER wenn du .env konfiguriert hast..."

# Install dependencies
echo ""
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt --break-system-packages || pip install -r requirements.txt

# Create directories
echo "📁 Creating directories..."
mkdir -p digital_products
mkdir -p landing_pages
mkdir -p templates

echo ""
echo "✅ Installation complete!"
echo ""
echo "📝 Nächste Schritte:"
echo "   1. Lade die Jules Backend Files herunter"
echo "   2. Kopiere sie in ~/jules-backend/"
echo "   3. Starte: python jules_backend.py"
echo ""
echo "🚀 Ready to launch!"
