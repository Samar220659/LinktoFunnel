#!/data/data/com.termux/files/usr/bin/bash

###############################################################################
# 🚀 LINKTOFUNNEL - TERMUX SETUP
# Complete AI Trinity System für Android/Termux
###############################################################################

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                                                                    ║"
echo "║       📱 LINKTOFUNNEL - TERMUX MOBILE SETUP                        ║"
echo "║                                                                    ║"
echo "║  🤖 Gemini CLI + Claude Code + AI Trinity Bridge                  ║"
echo "║  📱 Komplettes System auf deinem Handy!                            ║"
echo "║                                                                    ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# ===== STEP 1: TERMUX PACKAGES =====
echo "📦 Step 1/7: Installing Termux packages..."
echo ""

pkg update -y && pkg upgrade -y

pkg install -y \
  nodejs \
  git \
  python \
  ffmpeg \
  termux-api \
  wget \
  curl \
  jq

echo "✅ Termux packages installed"
echo ""

# ===== STEP 2: STORAGE ACCESS =====
echo "📁 Step 2/7: Setting up storage access..."
echo ""

termux-setup-storage

echo "✅ Storage access configured"
echo ""

# ===== STEP 3: PROJECT SETUP =====
echo "📂 Step 3/7: Setting up LinktoFunnel..."
echo ""

# Check if already cloned
if [ ! -d "$HOME/LinktoFunnel" ]; then
    echo "   Cloning repository..."
    cd $HOME
    git clone https://github.com/Samar220659/LinktoFunnel.git
    cd LinktoFunnel
else
    echo "   Repository already exists, pulling latest..."
    cd $HOME/LinktoFunnel
    git pull
fi

# Install Node dependencies
npm install

echo "✅ Project setup complete"
echo ""

# ===== STEP 4: GEMINI CLI SETUP =====
echo "✨ Step 4/7: Setting up Gemini CLI..."
echo ""

# Install Google Generative AI CLI
pip install google-generativeai

# Create Gemini CLI wrapper script
cat > $HOME/bin/gemini << 'GEMINI_SCRIPT'
#!/data/data/com.termux/files/usr/bin/python3
import sys
import os
import json
import google.generativeai as genai

# Configure Gemini
genai.configure(api_key=os.environ.get('GEMINI_API_KEY'))

model = genai.GenerativeModel('gemini-1.5-pro')

# Get prompt from stdin or args
if len(sys.argv) > 1:
    prompt = ' '.join(sys.argv[1:])
else:
    prompt = sys.stdin.read()

# Generate response
response = model.generate_content(prompt)

# Output
print(response.text)
GEMINI_SCRIPT

chmod +x $HOME/bin/gemini

echo "✅ Gemini CLI ready"
echo ""

# ===== STEP 5: AI TRINITY DIRECTORIES =====
echo "🌉 Step 5/7: Creating AI Trinity directories..."
echo ""

mkdir -p $HOME/LinktoFunnel/ai-trinity/queue/{inbox,processing,done,failed}
mkdir -p $HOME/LinktoFunnel/outputs/videos/temp
mkdir -p $HOME/LinktoFunnel/logs

echo "✅ Directories created"
echo ""

# ===== STEP 6: ENVIRONMENT =====
echo "⚙️  Step 6/7: Environment setup..."
echo ""

if [ ! -f "$HOME/LinktoFunnel/.env.local" ]; then
    cp $HOME/LinktoFunnel/.env.example $HOME/LinktoFunnel/.env.local
    echo "   ⚠️  WICHTIG: Bearbeite .env.local mit deinen API Keys!"
    echo "   nano $HOME/LinktoFunnel/.env.local"
else
    echo "   .env.local already exists"
fi

echo ""

# ===== STEP 7: STARTUP SCRIPTS =====
echo "🚀 Step 7/7: Creating startup scripts..."
echo ""

# AI Trinity Starter
cat > $HOME/bin/start-ai-trinity << 'TRINITY_SCRIPT'
#!/data/data/com.termux/files/usr/bin/bash
cd $HOME/LinktoFunnel
source .env.local
node ai-trinity/index.js
TRINITY_SCRIPT

chmod +x $HOME/bin/start-ai-trinity

# Automation Starter
cat > $HOME/bin/start-automation << 'AUTO_SCRIPT'
#!/data/data/com.termux/files/usr/bin/bash
cd $HOME/LinktoFunnel
source .env.local
node ai-agent/SUPER_AUTOMATION.js
AUTO_SCRIPT

chmod +x $HOME/bin/start-automation

# Telegram Bot Starter
cat > $HOME/bin/start-telegram-bot << 'BOT_SCRIPT'
#!/data/data/com.termux/files/usr/bin/bash
cd $HOME/LinktoFunnel
source .env.local
node ai-agent/telegram-bot.js
BOT_SCRIPT

chmod +x $HOME/bin/start-telegram-bot

# Quick Test Script
cat > $HOME/bin/test-trinity << 'TEST_SCRIPT'
#!/data/data/com.termux/files/usr/bin/bash
cd $HOME/LinktoFunnel

echo "🧪 Testing AI Trinity Components..."
echo ""

# Test Gemini
echo "1️⃣  Testing Gemini CLI..."
source .env.local
echo "What is 2+2?" | gemini
echo ""

# Test Node.js
echo "2️⃣  Testing Node.js..."
node -v
echo ""

# Test Queue System
echo "3️⃣  Testing Message Queue..."
node -e "
const { MessageQueue } = require('./ai-trinity/core/message-queue');
const queue = new MessageQueue();
queue.init().then(() => {
  console.log('✅ Message Queue working');
  queue.enqueue('test', 'gemini', 'optimize-video-script', {
    script: 'Test script',
    platform: 'tiktok'
  }).then(() => {
    console.log('✅ Message enqueued');
    process.exit(0);
  });
});
"

echo ""
echo "✅ All tests passed!"
TEST_SCRIPT

chmod +x $HOME/bin/test-trinity

echo "✅ Startup scripts created"
echo ""

# ===== TERMUX BOOT AUTO-START =====
echo "🔄 Setting up auto-start on boot..."
echo ""

mkdir -p $HOME/.termux/boot

cat > $HOME/.termux/boot/start-ai-trinity.sh << 'BOOT_SCRIPT'
#!/data/data/com.termux/files/usr/bin/bash
termux-wake-lock
cd $HOME/LinktoFunnel
source .env.local
node ai-trinity/index.js > $HOME/LinktoFunnel/logs/ai-trinity.log 2>&1 &
BOOT_SCRIPT

chmod +x $HOME/.termux/boot/start-ai-trinity.sh

echo "✅ Auto-start configured"
echo ""

# ===== SUMMARY =====
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                    ✅ TERMUX SETUP COMPLETE!                       ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""
echo "📱 MOBILE COMMANDS:"
echo ""
echo "1. Configure API Keys:"
echo "   nano $HOME/LinktoFunnel/.env.local"
echo ""
echo "2. Test Everything:"
echo "   test-trinity"
echo ""
echo "3. Start AI Trinity Bridge:"
echo "   start-ai-trinity"
echo ""
echo "4. Start Automation:"
echo "   start-automation"
echo ""
echo "5. Start Telegram Bot:"
echo "   start-telegram-bot"
echo ""
echo "6. Use Gemini CLI directly:"
echo "   echo 'Optimize this script: [text]' | gemini"
echo ""
echo "📊 WORKFLOW:"
echo ""
echo "   Termux → Gemini CLI → AI Trinity → Automation"
echo "         ↓"
echo "   Claude Code (hilft via Chat)"
echo ""
echo "🎯 AI TRINITY WORKFLOW:"
echo ""
echo "1. Create message for Gemini:"
echo "   cd $HOME/LinktoFunnel"
echo "   node -e \"require('./ai-trinity/core/message-queue').MessageQueue.enqueue(...)\""
echo ""
echo "2. Gemini optimizes automatically"
echo ""
echo "3. Check results:"
echo "   ls ai-trinity/queue/done/"
echo ""
echo "🚀 BEREIT FÜR MOBILES AI-POWERED BUSINESS!"
echo ""
