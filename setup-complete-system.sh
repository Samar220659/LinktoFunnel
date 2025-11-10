#!/bin/bash

###############################################################################
# 🚀 LINKTOFUNNEL - COMPLETE SYSTEM SETUP
# Sets up all components: Video Generation, Social Media APIs, AI Trinity, N8n
###############################################################################

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                                                                    ║"
echo "║       🚀 LINKTOFUNNEL COMPLETE SYSTEM SETUP                        ║"
echo "║                                                                    ║"
echo "║  ✅ Real Video Generation (GPT-4 + DALL-E 3 + TTS)                 ║"
echo "║  ✅ Social Media APIs (TikTok, Instagram, YouTube)                 ║"
echo "║  ✅ AI Trinity Bridge (Claude + Gemini + Claude Code)              ║"
echo "║  ✅ N8n Workflow Engine                                            ║"
echo "║  ✅ Automated Posting & Analytics                                  ║"
echo "║                                                                    ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# ===== STEP 1: DEPENDENCIES =====
echo "📦 Step 1/6: Installing dependencies..."
echo ""

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm first."
    exit 1
fi

echo "   Node version: $(node --version)"
echo "   npm version: $(npm --version)"
echo ""

# Install Node dependencies
npm install

echo "✅ Dependencies installed"
echo ""

# ===== STEP 2: CHECK FFMPEG =====
echo "🎬 Step 2/6: Checking video tools..."
echo ""

if ! command -v ffmpeg &> /dev/null; then
    echo "⚠️  ffmpeg not found. Video generation requires ffmpeg."
    echo "   Install it:"
    echo "   - macOS: brew install ffmpeg"
    echo "   - Ubuntu: sudo apt install ffmpeg"
    echo "   - Termux: pkg install ffmpeg"
    echo ""
    read -p "Continue without ffmpeg? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ ffmpeg found: $(ffmpeg -version | head -n 1)"
fi

echo ""

# ===== STEP 3: DIRECTORIES =====
echo "📁 Step 3/6: Creating directories..."
echo ""

mkdir -p outputs/videos/temp
mkdir -p outputs/claude-code
mkdir -p ai-trinity/queue/{inbox,processing,done,failed}
mkdir -p logs
mkdir -p data

echo "✅ Directories created"
echo ""

# ===== STEP 4: ENVIRONMENT =====
echo "⚙️  Step 4/6: Environment setup..."
echo ""

if [ ! -f .env.local ]; then
    echo "   Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "   ⚠️  IMPORTANT: Edit .env.local and add your API keys!"
else
    echo "   .env.local already exists"
fi

echo ""

# ===== STEP 5: API CHECK =====
echo "🔑 Step 5/6: Checking API keys..."
echo ""

source .env.local 2>/dev/null || true

check_var() {
    local var_name=$1
    local var_value=${!var_name}

    if [ -z "$var_value" ] || [ "$var_value" = "your_${var_name,,}_here" ]; then
        echo "   ❌ $var_name - NOT SET"
        return 1
    else
        echo "   ✅ $var_name - configured"
        return 0
    fi
}

REQUIRED_KEYS=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "GEMINI_API_KEY"
    "TELEGRAM_BOT_TOKEN"
)

OPTIONAL_KEYS=(
    "ANTHROPIC_API_KEY"
    "OPENAI_API_KEY"
    "TIKTOK_ACCESS_TOKEN"
    "INSTAGRAM_ACCESS_TOKEN"
    "YOUTUBE_API_KEY"
)

echo "Required keys:"
all_required=true
for key in "${REQUIRED_KEYS[@]}"; do
    if ! check_var "$key"; then
        all_required=false
    fi
done

echo ""
echo "Optional keys:"
for key in "${OPTIONAL_KEYS[@]}"; do
    check_var "$key" || true
done

echo ""

if [ "$all_required" = false ]; then
    echo "⚠️  Some required API keys are missing!"
    echo "   Please edit .env.local and add the missing keys."
    echo ""
fi

# ===== STEP 6: VERIFICATION =====
echo "🧪 Step 6/6: Running verification tests..."
echo ""

# Test Supabase connection
echo "   Testing Supabase connection..."
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
supabase.from('digistore_products').select('count').limit(1).then(() => {
    console.log('   ✅ Supabase connection OK');
}).catch(err => {
    console.log('   ❌ Supabase connection failed:', err.message);
});
" 2>/dev/null || echo "   ⚠️  Supabase test skipped (configure .env.local first)"

echo ""

# ===== SUMMARY =====
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                    ✅ SETUP COMPLETE!                              ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""
echo "📚 NEXT STEPS:"
echo ""
echo "1. Configure API Keys:"
echo "   nano .env.local"
echo ""
echo "2. Test Video Generation:"
echo "   npm run generate-video"
echo ""
echo "3. Start AI Trinity Bridge:"
echo "   npm run ai-trinity"
echo ""
echo "4. Run Complete Automation:"
echo "   npm run automation"
echo ""
echo "5. Deploy to Railway:"
echo "   git add ."
echo "   git commit -m 'feat: Complete system with real APIs'"
echo "   git push origin claude/check-n8n-webport-011CUWD8YkNPqAUEaJk2gF2d"
echo ""
echo "📖 Documentation:"
echo "   - Video Generation: lib/video-generator.js"
echo "   - Social Media APIs: lib/social-media/"
echo "   - AI Trinity: ai-trinity/"
echo "   - N8n Config: railway.json (n8n-workflow-engine service)"
echo ""
echo "🎯 N8n Web Interface:"
echo "   After Railway deployment, access N8n at:"
echo "   https://[your-n8n-service].up.railway.app:5678"
echo ""
echo "💰 Ready to generate passive income! 🚀"
echo ""
