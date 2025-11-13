# 🤖 Jules Backend - AI Business Automation

**Complete backend for automated digital product sales with Stripe, Email, and Telegram integration.**

---

## 🎯 What is Jules?

Jules is the backend powerhouse that handles:
- ✅ **Stripe Payment Processing** - Create products, prices, payment links
- ✅ **Digital Product Generation** - AI-powered PDF creation with Gemini
- ✅ **Email Fulfillment** - Automatic delivery via Gmail SMTP
- ✅ **Telegram Notifications** - Real-time sale alerts
- ✅ **Secure Downloads** - JWT-protected download links
- ✅ **Sales Tracking** - SQLite database for all transactions

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip3 install -r requirements.txt
```

### 2. Configure Environment

```bash
# Copy example config
cp .env.example .env

# Edit .env and add your API keys:
# - GEMINI_API_KEY (from Google AI Studio)
# - STRIPE_SECRET_KEY (from Stripe Dashboard)
# - STRIPE_WEBHOOK_SECRET (after creating webhook)
# - GMAIL_APP_PASSWORD (Google App Password)
# - TELEGRAM_BOT_TOKEN (from @BotFather)
```

### 3. Run Quickstart

```bash
./quickstart.sh
```

### 4. Start Backend

```bash
python3 jules_backend.py
```

Server runs on: **http://localhost:5001**

### 5. Start Landing Page Server

```bash
cd landing_pages
python3 -m http.server 8080
```

Landing page: **http://localhost:8080/ai-blueprint-2025.html**

---

## 📡 API Endpoints

### Health Check
```
GET /health
```

### Create Stripe Product
```
POST /create-stripe-product
Body: {
  "product_name": "AI Automation Blueprint 2025",
  "price_cents": 2700,
  "description": "..."
}
```

### Get Payment Link
```
GET /get-payment-link
```

### Stripe Webhook
```
POST /stripe-webhook
```

### Download Product
```
GET /download/:token
```

### Test Endpoints
```
POST /test-email
POST /test-telegram
```

---

## 🔧 Configuration

All configuration is in `.env`:

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `GMAIL_EMAIL` | Gmail address for sending emails |
| `GMAIL_APP_PASSWORD` | Gmail App Password |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token |
| `TELEGRAM_CHAT_ID` | Your Telegram chat ID |
| `JWT_SECRET` | Secret for JWT tokens |

---

## 🧪 Testing

### Test Email
```bash
curl -X POST http://localhost:5001/test-email
```

### Test Telegram
```bash
curl -X POST http://localhost:5001/test-telegram
```

### Create Test Product
```bash
curl -X POST http://localhost:5001/create-stripe-product \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "Test Product",
    "price_cents": 2700,
    "description": "Test description"
  }'
```

---

## 🔐 Stripe Webhook Setup (Local Testing)

1. **Install ngrok:**
   ```bash
   # Download from https://ngrok.com
   ```

2. **Start ngrok:**
   ```bash
   ngrok http 5001
   ```

3. **Configure Stripe webhook:**
   - Go to Stripe Dashboard > Developers > Webhooks
   - Add endpoint: `https://YOUR-NGROK-URL.ngrok-free.app/stripe-webhook`
   - Select event: `checkout.session.completed`
   - Copy the signing secret to `.env` as `STRIPE_WEBHOOK_SECRET`

---

## 📊 Workflow

```
1. Create Product
   ↓
2. Generate Payment Link
   ↓
3. Customer Pays via Stripe
   ↓
4. Stripe Webhook Triggered
   ↓
5. Generate Download Token
   ↓
6. Send Email with Download Link
   ↓
7. Send Telegram Notification
   ↓
8. Customer Downloads PDF
```

---

## 🚀 Production Deployment

### Railway Deployment

1. Install Railway CLI:
   ```bash
   npm install -g railway
   ```

2. Login and deploy:
   ```bash
   railway login
   railway init
   railway up
   ```

3. Set environment variables in Railway dashboard

4. Update Stripe webhook URL to Railway URL

---

## 📁 Project Structure

```
backend/
├── jules_backend.py          # Main Flask server
├── config.py                 # Configuration management
├── utils.py                  # Utility functions
├── email_sender.py           # Gmail SMTP integration
├── telegram_bot.py           # Telegram notifications
├── product_generator.py      # PDF product generation
├── requirements.txt          # Python dependencies
├── .env.example              # Environment template
├── quickstart.sh             # Quick start script
├── digital_products/         # Generated PDFs
├── landing_pages/            # HTML landing pages
└── sales.db                  # SQLite database
```

---

## 💰 Revenue Tracking

Sales are tracked in `sales.db` (SQLite):

```sql
SELECT * FROM sales;
SELECT * FROM products;
```

---

## 🐛 Troubleshooting

### Email not sending
- Check Gmail App Password (not regular password!)
- Enable 2FA in Google Account
- Generate App Password in Security settings

### Telegram not working
- Get token from @BotFather
- Send a message to your bot first
- Get chat ID from bot updates

### Stripe webhook not triggering
- Check ngrok is running
- Verify webhook URL in Stripe dashboard
- Check STRIPE_WEBHOOK_SECRET is correct

---

## ✅ Ready to Launch!

```bash
./quickstart.sh
python3 jules_backend.py
```

**🎉 Your automated money-making machine is ready!**
