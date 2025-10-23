# 🚀 TERMUX ONE-LINER DEPLOYMENT

## Schnellstart (Kopiere & Füge ein):

```bash
pkg update -y && pkg install -y nodejs git curl && cd ~ && git clone https://github.com/Samar220659/LinktoFunnel.git && cd LinktoFunnel && git checkout claude/placeholder-branch-011CUQo1KPh7UKfEJA1F2qZ5 && chmod +x termux-deploy.sh && ./termux-deploy.sh
```

---

## Was macht dieser Befehl?

1. **System-Update**: `pkg update -y`
2. **Pakete installieren**: Node.js, Git, Curl
3. **Repository klonen**: Von GitHub
4. **Branch wechseln**: Zum aktuellen Development-Branch
5. **Deploy-Script ausführen**: Komplettes Setup

---

## Nach dem ersten Durchlauf:

### .env.local anpassen (WICHTIG!):

```bash
nano .env.local
```

**Trage ein:**
- ✅ NEXT_PUBLIC_SUPABASE_URL (bereits eingetragen)
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY (bereits eingetragen)
- ✅ GEMINI_API_KEY (bereits eingetragen)
- ✅ OPENAI_API_KEY (bereits eingetragen)
- ✅ DIGISTORE24_API_KEY (bereits eingetragen)
- ✅ GETRESPONSE_API_KEY (bereits eingetragen)
- ✅ TELEGRAM_BOT_TOKEN (bereits eingetragen)
- ✅ TELEGRAM_CHAT_ID (bereits eingetragen)

**Speichern**: `Strg+X` → `Y` → `Enter`

---

## Supabase Schema deployen:

**WICHTIG**: Dies muss im Browser gemacht werden!

1. Öffne: https://supabase.com/dashboard
2. SQL Editor → New Query
3. Kopiere: `ai-agent/data/schema.sql`
4. Run (Strg+Enter)

---

## System starten:

```bash
# Erster Test-Durchlauf
node ai-agent/MASTER_ORCHESTRATOR.js

# Oder: Super-Automation (vollständig)
node ai-agent/SUPER_AUTOMATION.js

# Im Hintergrund mit Cron (täglich 09:00)
sv-enable crond
```

---

## Termux im Hintergrund halten:

```bash
# Wake-Lock aktivieren (verhindert Sleep)
termux-wake-lock

# Termux in den Hintergrund
# Drücke: Lautstärke-Runter + C
# Dann: schließe Termux-App
# → Läuft weiter im Hintergrund!
```

---

## Monitoring-Befehle:

```bash
# Logs live ansehen
tail -f logs/automation.log

# Datenbank inspizieren
node scripts/supabase-inspect.js

# API-Tests
node scripts/test-apis.js

# Telegram-Test
node -e "require('dotenv').config({path:'.env.local'});const TelegramBot=require('node-telegram-bot-api');const bot=new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);bot.sendMessage(process.env.TELEGRAM_CHAT_ID,'🤖 Test!');"
```

---

## Vollständiges Setup (Schritt-für-Schritt):

### 1. Termux öffnen

```bash
# One-Liner ausführen (siehe oben)
pkg update -y && pkg install -y nodejs git curl && cd ~ && git clone https://github.com/Samar220659/LinktoFunnel.git && cd LinktoFunnel && git checkout claude/placeholder-branch-011CUQo1KPh7UKfEJA1F2qZ5 && chmod +x termux-deploy.sh && ./termux-deploy.sh
```

### 2. .env.local prüfen

```bash
cat .env.local | grep "API_KEY"
```

**Sollte zeigen:**
- GEMINI_API_KEY=AIzaSy...
- OPENAI_API_KEY=sk-...
- DIGISTORE24_API_KEY=1417598-...
- GETRESPONSE_API_KEY=dmg18f...
- usw.

✅ Wenn alles gefüllt ist: Weiter!

### 3. Supabase Schema deployen (im Browser!)

- https://supabase.com/dashboard
- SQL Editor → schema.sql ausführen

### 4. Produkte importieren

```bash
node scripts/quickstart.js
```

**Erwartete Ausgabe:**
```
✅ 15/15 Produkte importiert!
```

### 5. Erste Kampagne starten

```bash
node ai-agent/MASTER_ORCHESTRATOR.js
```

**Läuft für ~5-10 Minuten**:
- Analysiert Top-Produkte
- Generiert Content
- Erstellt Funnels
- Optimiert Kampagnen

### 6. Automatisierung aktivieren

```bash
# Cron-Service starten
sv-enable crond

# Prüfen ob aktiv
crontab -l
```

### 7. Termux persistieren

```bash
# Wake-Lock
termux-wake-lock

# Batterie-Optimierung für Termux deaktivieren (in Android-Einstellungen)
# → Apps → Termux → Akku → Nicht optimieren
```

---

## 🎯 ERFOLGS-INDIKATOREN

### Nach 1. Durchlauf:

✅ Telegram-Benachrichtigung: "🤖 Kampagne gestartet"
✅ Supabase: 15 Produkte in `digistore_products` Tabelle
✅ GetResponse: Neue Kampagne erstellt
✅ Logs: Keine Fehler

### Nach 7 Tagen:

✅ Täglich automatische Durchläufe
✅ Erste Klicks auf Affiliate-Links
✅ Email-Liste wächst (Leads in DB)

### Nach 30 Tagen:

✅ Erste Provision bei Digistore24
✅ 50-100 Leads gesammelt
✅ 3-5 aktive Kampagnen

### Nach 90 Tagen:

✅ €300-800 Umsatz/Monat
✅ Mehrere funktionierende Funnels
✅ Multi-Channel Traffic

---

## 🆘 PROBLEME LÖSEN

### Problem: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Problem: "Supabase connection failed"
```bash
# Prüfe URL
echo $NEXT_PUBLIC_SUPABASE_URL

# Sollte sein: https://mkiliztwhxzwizwwjhqn.supabase.co
# Wenn nicht: nano .env.local → korrigieren
```

### Problem: "Telegram not working"
```bash
# Test direkt
curl "https://api.telegram.org/bot7215449153:AAEZekOaNe1_j9kd0kEyytKh0L0ajrwqJqk/getMe"

# Sollte Bot-Info zurückgeben
```

### Problem: "Cron läuft nicht"
```bash
# Service neu starten
sv-disable crond
sv-enable crond

# Status prüfen
sv status crond
```

---

## 📱 TERMUX TIPPS

### Shortcuts:

- `Lautstärke-Runter + C`: Strg+C (Prozess beenden)
- `Lautstärke-Runter + Q`: Tastatur einblenden/ausblenden
- `Lautstärke-Runter + W`: Pfeil-Tasten
- `Lautstärke-Runter + L`: Clear screen

### Nützliche Aliasse:

```bash
echo "alias ll='ls -lah'" >> ~/.bashrc
echo "alias lt='tail -f logs/automation.log'" >> ~/.bashrc
echo "alias lf='cd ~/LinktoFunnel'" >> ~/.bashrc
source ~/.bashrc
```

Jetzt:
- `ll` = detaillierte Dateiliste
- `lt` = Logs live ansehen
- `lf` = Zu LinktoFunnel wechseln

---

## 🚀 READY TO LAUNCH!

**Kopiere den One-Liner oben → Starte in Termux → Werde zum digitalen CEO!**

💰 Ziel: €10.000/Monat passiv

🤖 Dein digitaler Zwilling arbeitet 24/7 für dich!
