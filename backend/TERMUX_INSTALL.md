# 🚀 JULES BACKEND - TERMUX INSTALLATION GUIDE

## Schnell-Installation auf Termux

### Option 1: Automatisches Setup (Empfohlen)

```bash
# 1. Lade das Install-Script herunter
curl -o install-jules.sh https://raw.githubusercontent.com/Samar220659/LinktoFunnel/main/backend/install-termux.sh

# 2. Mache es ausführbar
chmod +x install-jules.sh

# 3. Führe es aus
./install-jules.sh
```

### Option 2: Manuelle Installation

```bash
# 1. Erstelle Verzeichnis
cd ~
mkdir -p jules-backend
cd jules-backend

# 2. Installiere Dependencies
pip install flask flask-cors stripe python-dotenv fpdf2 google-generativeai pyjwt requests

# 3. Erstelle .env Datei
nano .env

# Füge ein:
GEMINI_API_KEY=dein_key
STRIPE_SECRET_KEY=dein_key
GMAIL_APP_PASSWORD=dein_password
TELEGRAM_BOT_TOKEN=dein_token
TELEGRAM_CHAT_ID=6982601388
JWT_SECRET=random_secret_string
```

### Option 3: Download aus GitHub

```bash
# Clone das gesamte Projekt
cd ~
git clone https://github.com/Samar220659/LinktoFunnel.git
cd LinktoFunnel/backend

# Setup
./quickstart.sh
```

---

## 📁 Manuelle File-Erstellung

Falls du die Files manuell erstellen möchtest, hier die wichtigsten:

### jules_backend.py

```bash
cd ~/jules-backend
nano jules_backend.py
```

[Kopiere den Code aus dem Repository]

### config.py

```bash
nano config.py
```

[Kopiere den Code aus dem Repository]

### email_sender.py, telegram_bot.py, product_generator.py

Erstelle jede Datei einzeln mit `nano` und kopiere den Code.

---

## 🚀 Starten

```bash
cd ~/jules-backend
python jules_backend.py
```

Backend läuft auf: **http://localhost:5001**

---

## 🧪 Testen

```bash
# Test Email
curl -X POST http://localhost:5001/test-email

# Test Telegram
curl -X POST http://localhost:5001/test-telegram

# Create Product
curl -X POST http://localhost:5001/create-stripe-product \
  -H "Content-Type: application/json" \
  -d '{"product_name":"Test","price_cents":2700,"description":"Test"}'
```

---

## 💡 Troubleshooting

### Python Module nicht gefunden

```bash
pip install --upgrade flask flask-cors stripe python-dotenv
```

### Port bereits belegt

```bash
# Ändere Port in jules_backend.py:
app.run(host='0.0.0.0', port=5002)  # Statt 5001
```

### Permissions Error

```bash
# Verwende --break-system-packages Flag:
pip install -r requirements.txt --break-system-packages
```

---

## ✅ Ready!

Sobald alles läuft:

1. **Jules Backend:** `http://localhost:5001`
2. **Landing Page:** `http://localhost:8080`
3. **First Sale:** Make money! 💰
