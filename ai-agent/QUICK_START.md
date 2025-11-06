# 🚀 Quick Start - Social Media API Manager

## ⚡ 5-Minute Setup

### Step 1: Run Setup Script

```bash
bash scripts/setup-social-media-api-manager.sh
```

This will automatically:
- ✅ Generate encryption key
- ✅ Create/update .env.local
- ✅ Verify installation

### Step 2: Install SQL Schema

1. Open: https://app.supabase.com/project/YOUR_PROJECT/sql
2. Copy contents of: `ai-agent/data/social-media-api-schema.sql`
3. Paste and click **RUN**

Detailed guide: `ai-agent/data/SQL_SETUP_GUIDE.md`

### Step 3: Add Supabase Credentials

Edit `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these from: https://app.supabase.com/project/_/settings/api

### Step 4: Initialize Agent

```bash
node ai-agent/agents/social-media-api-manager.js
```

This will:
- Sync all social media APIs to database
- Run initial health checks
- Generate a status report

### Step 5: Test Everything

```bash
node scripts/test-social-media-api-manager.js
```

---

## 🎯 What You Get

### 🔐 Secure API Management
- AES-256-GCM encryption for all keys
- Central registry for 7+ platforms
- Permission management

### 📊 Real-time Monitoring
- 24/7 health checks
- Uptime tracking
- Response time monitoring

### 🔔 Automatic Alerts
- Version updates
- Endpoint changes
- API deprecations
- Critical issues

### 🌐 REST API
```bash
# Start server
node ai-agent/api/social-media-api-server.js

# Test endpoints
curl http://localhost:3001/api/social-media-apis
curl http://localhost:3001/api/social-media-apis/tiktok
curl http://localhost:3001/api/social-media-apis/stats
```

### 📱 Telegram Bot
```bash
# Start bot
node ai-agent/telegram-bot.js

# Commands
/apis          # List all APIs
/apis_health   # Health status
/apis_changes  # Recent changes
```

---

## 📚 Full Documentation

- **Complete Guide:** `ai-agent/SOCIAL_MEDIA_API_MANAGER.md`
- **SQL Setup:** `ai-agent/data/SQL_SETUP_GUIDE.md`
- **Test Suite:** `scripts/test-social-media-api-manager.js`

---

## 🆘 Troubleshooting

### Issue: "Cannot find module 'dotenv'"

**Solution:**
```bash
npm install dotenv --save-dev
# or
pnpm add -D dotenv
```

### Issue: "Supabase table not found"

**Solution:** Install SQL schema first (Step 2 above)

### Issue: "Permission denied"

**Solution:** Check Supabase credentials in `.env.local`

---

## ✅ Quick Checklist

- [ ] Run setup script
- [ ] Install SQL schema in Supabase
- [ ] Add Supabase credentials to .env.local
- [ ] Run agent initialization
- [ ] Run test suite
- [ ] (Optional) Start REST API server
- [ ] (Optional) Start Telegram bot

---

## 🎉 Ready!

Your Social Media API Manager is now running!

**Next:** Read the full documentation in `SOCIAL_MEDIA_API_MANAGER.md`
