# 💰 Link to Funnel API Documentation

Zero-Budget Affiliate Automation System API

---

## 🚀 Quick Start

### 1. PayPal Integration Setup

```bash
# .env.local hinzufügen:
PAYPAL_CLIENT_ID=dein_paypal_client_id
PAYPAL_CLIENT_SECRET=dein_paypal_secret
PAYPAL_SANDBOX=true  # false für Production
APP_URL=http://localhost:3000
```

### 2. PayPal Sandbox Account erstellen

1. Gehe zu: https://developer.paypal.com
2. Erstelle Sandbox App
3. Kopiere Client ID + Secret

### 3. Landing Page deployen

```bash
# Landing Page testen
open landing-pages/ai-automation-guide.html

# PayPal Client ID eintragen (Zeile 146)
# Ersetze: YOUR_PAYPAL_CLIENT_ID
```

### 4. Backend starten

```bash
# Server starten
node server.js

# Webhook testen
node api/paypal-webhook.js TEST_ORDER_123
```

---

## 📡 API Endpoints

### POST /api/paypal-webhook

Verarbeitet PayPal Zahlungen.

**Request:**
```json
{
  "orderID": "7YH12345678901234",
  "details": { ... }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "order_id": "7YH12345678901234",
    "customer_email": "kunde@example.com",
    "amount": 47.00
  }
}
```

**Curl Example:**
```bash
curl -X POST http://localhost:3000/api/paypal-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "orderID": "TEST_123",
    "details": {}
  }'
```

---

## 🎨 PayPal Smart Buttons Integration

### Frontend (HTML):

```html
<!-- PayPal SDK laden -->
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&currency=EUR"></script>

<!-- Button Container -->
<div id="paypal-button-container"></div>

<script>
paypal.Buttons({
  createOrder: function(data, actions) {
    return actions.order.create({
      purchase_units: [{
        description: 'AI Automation Guide',
        amount: {
          currency_code: 'EUR',
          value: '47.00'
        }
      }]
    });
  },
  onApprove: function(data, actions) {
    return actions.order.capture().then(function(details) {
      // Zahlung erfolgreich
      fetch('/api/paypal-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderID: data.orderID,
          details: details
        })
      });
    });
  }
}).render('#paypal-button-container');
</script>
```

---

## 🛠️ Backend Integration

### Express Server (server.js):

```javascript
const { paypalWebhookMiddleware } = require('./api/paypal-webhook.js');

app.post('/api/paypal-webhook', paypalWebhookMiddleware);
```

### Standalone Handler:

```javascript
const { PayPalWebhookHandler } = require('./api/paypal-webhook.js');

const handler = new PayPalWebhookHandler();

// Process Payment
const result = await handler.processPayment(orderID, details);

if (result.success) {
  console.log('Payment processed!');
} else {
  console.error('Payment failed:', result.error);
}
```

---

## 📊 Supabase Schema

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT UNIQUE NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  status TEXT DEFAULT 'pending',
  product TEXT NOT NULL,
  paypal_details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_email ON orders(customer_email);
CREATE INDEX idx_orders_status ON orders(status);
```

---

## 🔔 Telegram Notifications

Automatische Benachrichtigungen bei:
- ✅ Neuer Verkauf
- ❌ Payment Fehler
- 📊 Tägliche Reports

**Setup:**
```bash
# .env.local
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

---

## 🧪 Testing

### PayPal Sandbox Testing:

```bash
# 1. Webhook Handler testen
node api/paypal-webhook.js

# 2. Mit Order ID testen
node api/paypal-webhook.js 7YH12345678901234

# 3. Server testen
curl -X POST http://localhost:3000/api/paypal-webhook \
  -H "Content-Type: application/json" \
  -d '{"orderID":"TEST_123"}'
```

### PayPal Sandbox Accounts:

- **Buyer Account:** Zum Testen von Käufen
- **Seller Account:** Dein Account der Geld erhält

Erstelle beide auf: https://developer.paypal.com/dashboard/

---

## 📝 OpenAPI Documentation

Vollständige API-Dokumentation:

```bash
# OpenAPI Spec anschauen
cat openapi.yaml

# Swagger UI (optional)
npx swagger-ui-serve openapi.yaml
```

---

## 🚀 Deployment

### Railway Deployment:

```bash
# Umgebungsvariablen setzen
railway variables set PAYPAL_CLIENT_ID=xxx
railway variables set PAYPAL_CLIENT_SECRET=xxx
railway variables set PAYPAL_SANDBOX=false

# Deployen
git push railway main
```

### Vercel Deployment (Serverless):

```bash
# vercel.json erstellen
{
  "functions": {
    "api/**/*.js": {
      "runtime": "nodejs18.x"
    }
  }
}

# Deployen
vercel deploy
```

---

## 💡 Best Practices

### Security:

1. **Webhook Verification:** Immer Order mit PayPal API verifizieren
2. **HTTPS:** Nur HTTPS in Production
3. **Rate Limiting:** Implementiere Rate Limits
4. **Input Validation:** Validiere alle Inputs

### Error Handling:

```javascript
try {
  const result = await handler.processPayment(orderID, details);

  if (!result.success) {
    // Log error
    console.error('Payment failed:', result.error);

    // Notify Admin
    await sendAdminAlert(result.error);

    // Return error response
    return res.status(500).json({ error: result.error });
  }

} catch (error) {
  // Unexpected error
  console.error('Unexpected error:', error);

  // Always notify on unexpected errors
  await sendCriticalAlert(error);

  return res.status(500).json({ error: 'Internal server error' });
}
```

---

## 🆘 Troubleshooting

### "PayPal API Error"

- Prüfe Client ID + Secret
- Prüfe PAYPAL_SANDBOX Setting
- Prüfe Internet Verbindung

### "Order verification failed"

- Order ID falsch
- Order nicht COMPLETED
- Sandbox/Production Mismatch

### "Supabase Error"

- Prüfe Supabase URL + Key
- Prüfe `orders` Tabelle existiert
- Prüfe Row Level Security (RLS)

---

## 📚 Resources

- **PayPal Developer:** https://developer.paypal.com
- **PayPal Sandbox:** https://developer.paypal.com/dashboard/
- **OpenAPI Spec:** https://swagger.io/specification/
- **Supabase Docs:** https://supabase.com/docs

---

## ✅ Checklist für Production

- [ ] PayPal Client ID + Secret konfiguriert
- [ ] PAYPAL_SANDBOX=false gesetzt
- [ ] HTTPS aktiviert
- [ ] Supabase `orders` Tabelle erstellt
- [ ] Telegram Notifications getestet
- [ ] E-Mail Versand implementiert
- [ ] Landing Page deployed
- [ ] Webhook URL bei PayPal registriert
- [ ] Testbestellung durchgeführt
- [ ] Error Monitoring aktiviert

---

**Happy Selling! 💰**
