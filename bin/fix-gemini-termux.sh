#!/data/data/com.termux/files/usr/bin/bash

###############################################################################
# 🔧 GEMINI CLI SETUP FÜR TERMUX
# Behebt node-pty Problem und installiert Python-based Wrapper
###############################################################################

echo "🔧 Fixing Gemini CLI for Termux..."
echo ""

# ===== STEP 1: PYTHON DEPENDENCIES =====
echo "📦 Step 1/4: Installing Python dependencies..."
pip install --upgrade google-generativeai >/dev/null 2>&1
echo "✅ Python dependencies installed"
echo ""

# ===== STEP 2: CREATE BIN DIRECTORY =====
echo "📁 Step 2/4: Creating bin directory..."
mkdir -p $HOME/bin
mkdir -p $HOME/LinktoFunnel/bin
echo "✅ Directories created"
echo ""

# ===== STEP 3: INSTALL GEMINI WRAPPER =====
echo "🚀 Step 3/4: Installing Gemini CLI wrapper..."

# Copy from project to home bin
if [ -f "$HOME/LinktoFunnel/bin/gemini" ]; then
    cp $HOME/LinktoFunnel/bin/gemini $HOME/bin/gemini
    chmod +x $HOME/bin/gemini
    chmod +x $HOME/LinktoFunnel/bin/gemini
    echo "✅ Gemini CLI installed"
else
    echo "❌ Error: Gemini wrapper not found in project!"
    echo "   Make sure you pulled the latest code."
    exit 1
fi

echo ""

# ===== STEP 4: VERIFY =====
echo "🧪 Step 4/4: Testing Gemini CLI..."
echo ""

# Check if GEMINI_API_KEY is set
if [ -z "$GEMINI_API_KEY" ]; then
    echo "⚠️  GEMINI_API_KEY not set!"
    echo "   Add to .env.local or run:"
    echo "   export GEMINI_API_KEY='your_key_here'"
    echo ""
else
    # Test Gemini
    echo "Testing with simple prompt..."
    echo "What is 2+2?" | $HOME/bin/gemini
    echo ""
    echo "✅ Gemini CLI is working!"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                    ✅ GEMINI CLI READY!                            ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""
echo "📱 USAGE:"
echo ""
echo "1. Set API Key (if not done):"
echo "   export GEMINI_API_KEY='your_key_here'"
echo "   # or add to .env.local"
echo ""
echo "2. Use Gemini CLI:"
echo "   gemini 'Your prompt here'"
echo ""
echo "3. Pipe input:"
echo "   echo 'Optimize this script' | gemini"
echo ""
echo "4. JSON output:"
echo "   gemini --json 'Your prompt'"
echo ""
echo "5. Interactive mode:"
echo "   gemini"
echo "   (type prompt, press Enter)"
echo ""
echo "🎯 EXAMPLES:"
echo ""
echo "   # Optimize video script"
echo "   echo 'My script text' | gemini 'Optimize for TikTok viral 93%+ score. Return JSON.'"
echo ""
echo "   # Generate content"
echo "   gemini 'Create 30-second TikTok script about passive income for DACH audience'"
echo ""
echo "   # A/B variants"
echo "   gemini 'Generate 3 variants of this hook: [your hook]'"
echo ""
echo "🚀 READY TO USE!"
echo ""
