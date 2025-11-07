#!/bin/bash

# 🚀 DEPLOY TO RENDER.COM
# Automated deployment script for LinktoFunnel

set -e  # Exit on error

echo ""
echo "╔═══════════════════════════════════════════════╗"
echo "║   🚀 DEPLOYING TO RENDER.COM                  ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if render CLI is installed
check_render_cli() {
    if ! command -v render &> /dev/null; then
        print_error "Render CLI not found!"
        echo ""
        echo "Install it with:"
        echo "  npm install -g @render/cli"
        echo ""
        echo "Or deploy manually:"
        echo "  1. Push to GitHub"
        echo "  2. Go to https://dashboard.render.com"
        echo "  3. Click 'New' → 'Blueprint'"
        echo "  4. Connect your GitHub repo"
        echo "  5. Render will detect render.yaml automatically"
        echo ""
        exit 1
    fi
}

# Check if we're in the right directory
check_directory() {
    if [ ! -f "render.yaml" ]; then
        print_error "render.yaml not found! Are you in the project root?"
        exit 1
    fi
}

# Check if git repo is clean
check_git_status() {
    if [ -n "$(git status --porcelain)" ]; then
        print_warning "You have uncommitted changes!"
        read -p "Continue anyway? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Pre-deployment checks
pre_deploy_checks() {
    print_step "Running pre-deployment checks..."

    # Check if API keys are configured
    if [ ! -f ".env.local" ] && [ ! -f ".api-keys.encrypted" ]; then
        print_warning "No API keys found locally"
        echo "  Make sure to configure them in Render dashboard:"
        echo "  https://dashboard.render.com → Your Service → Environment"
    fi

    # Check Node version
    NODE_VERSION=$(node --version)
    print_success "Node.js version: $NODE_VERSION"

    # Check package.json
    if [ ! -f "package.json" ]; then
        print_error "package.json not found!"
        exit 1
    fi
    print_success "package.json found"

    # Check main files
    FILES=("api-server.js" "render.yaml" "lib/api-key-manager.js")
    for file in "${FILES[@]}"; do
        if [ -f "$file" ]; then
            print_success "$file exists"
        else
            print_error "$file not found!"
            exit 1
        fi
    done

    echo ""
}

# Push to GitHub
push_to_github() {
    print_step "Pushing to GitHub..."

    CURRENT_BRANCH=$(git branch --show-current)
    print_success "Current branch: $CURRENT_BRANCH"

    # Add all changes
    git add .

    # Check if there are changes to commit
    if [ -n "$(git status --porcelain)" ]; then
        read -p "Commit message: " COMMIT_MSG
        if [ -z "$COMMIT_MSG" ]; then
            COMMIT_MSG="Deploy to Render - $(date +'%Y-%m-%d %H:%M')"
        fi

        git commit -m "$COMMIT_MSG"
        print_success "Changes committed"
    else
        print_success "No changes to commit"
    fi

    # Push to GitHub
    git push -u origin "$CURRENT_BRANCH"
    print_success "Pushed to GitHub"

    echo ""
}

# Display deployment instructions
show_instructions() {
    echo ""
    echo "╔═══════════════════════════════════════════════╗"
    echo "║   📋 MANUAL DEPLOYMENT STEPS                  ║"
    echo "╚═══════════════════════════════════════════════╝"
    echo ""
    echo "1️⃣  Go to Render Dashboard:"
    echo "   https://dashboard.render.com"
    echo ""
    echo "2️⃣  Create New Blueprint:"
    echo "   • Click 'New' → 'Blueprint'"
    echo "   • Connect your GitHub account (if not connected)"
    echo "   • Select repository: Samar220659/LinktoFunnel"
    echo "   • Branch: $(git branch --show-current)"
    echo ""
    echo "3️⃣  Render will detect render.yaml automatically"
    echo "   This will create 3 services:"
    echo "   • linktofunnel-api (Web Service)"
    echo "   • linktofunnel-telegram-bot (Worker)"
    echo "   • linktofunnel-orchestrator (Cron Job)"
    echo ""
    echo "4️⃣  Configure Environment Variables:"
    echo "   For each service, add these API keys:"
    echo ""
    echo "   📌 Required (Critical):"
    echo "   • NEXT_PUBLIC_SUPABASE_URL"
    echo "   • NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "   • GEMINI_API_KEY"
    echo "   • TELEGRAM_BOT_TOKEN"
    echo "   • TELEGRAM_CHAT_ID"
    echo ""
    echo "   📌 Optional (for full features):"
    echo "   • OPENAI_API_KEY"
    echo "   • DIGISTORE24_API_KEY"
    echo "   • GETRESPONSE_API_KEY"
    echo "   • SCRAPINGBEE_API_KEY"
    echo ""
    echo "5️⃣  Deploy!"
    echo "   Click 'Apply' and wait for deployment"
    echo ""
    echo "6️⃣  Get your API URL:"
    echo "   After deployment, you'll get a URL like:"
    echo "   https://linktofunnel-api.onrender.com"
    echo ""
    echo "7️⃣  Test your API:"
    echo "   curl https://your-api-url.onrender.com/health"
    echo ""
    echo "╔═══════════════════════════════════════════════╗"
    echo "║   ✅ DEPLOYMENT GUIDE COMPLETE                ║"
    echo "╚═══════════════════════════════════════════════╝"
    echo ""
}

# Export API keys helper
export_keys_for_render() {
    print_step "Exporting API keys for Render..."

    if [ -f ".env.local" ]; then
        echo ""
        echo "Copy these environment variables to Render:"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        cat .env.local | grep -v '^#' | grep -v '^$'
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""

        # Save to file for easy copy
        cat .env.local | grep -v '^#' | grep -v '^$' > render-env-vars.txt
        print_success "Saved to render-env-vars.txt"
    else
        print_warning "No .env.local file found"
        echo "  Run: npm run keys:export"
    fi

    echo ""
}

# Main deployment flow
main() {
    echo ""
    print_step "Starting deployment process..."
    echo ""

    # Run checks
    check_directory
    check_git_status
    pre_deploy_checks

    # Ask what to do
    echo "What would you like to do?"
    echo ""
    echo "1) Push to GitHub (required for Render)"
    echo "2) Export API keys for Render"
    echo "3) Show deployment instructions"
    echo "4) All of the above"
    echo "5) Cancel"
    echo ""
    read -p "Choose option (1-5): " -n 1 -r
    echo ""
    echo ""

    case $REPLY in
        1)
            push_to_github
            show_instructions
            ;;
        2)
            export_keys_for_render
            ;;
        3)
            show_instructions
            ;;
        4)
            push_to_github
            export_keys_for_render
            show_instructions
            ;;
        5)
            print_warning "Cancelled by user"
            exit 0
            ;;
        *)
            print_error "Invalid option"
            exit 1
            ;;
    esac
}

# Run main function
main

# Success message
echo ""
print_success "Deployment preparation complete!"
echo ""
echo "Next: Go to https://dashboard.render.com and create a Blueprint"
echo ""
