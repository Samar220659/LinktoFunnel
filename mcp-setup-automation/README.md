# 🤖 Setup Automation MCP Server

**Vollautomatisches Setup für LinktoFunnel!**

Dieser MCP Server führt ALLE Setup-Schritte automatisch aus:
- ✅ Supabase Database Setup (SQL Schema)
- ✅ Railway Deployment
- ✅ Telegram Bot Test

Kein Browser, kein Copy-Paste - alles automatisch! 🚀

---

## 📋 Voraussetzungen

Diese Werte müssen in `.env.local` sein:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=...
OPENAI_API_KEY=...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

---

## 🚀 Installation

```bash
cd mcp-setup-automation
npm install
```

---

## 💻 Verwendung

### **Option 1: MCP Server (mit Claude Desktop / CLI)**

1. **MCP Server Config** (in Claude Desktop):

```json
{
  "mcpServers": {
    "linktofunnel-setup": {
      "command": "node",
      "args": ["/path/to/LinktoFunnel/mcp-setup-automation/setup-automation-mcp.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

2. **Claude Desktop starten**

3. **Befehle an Claude:**

```
Nutze das Tool "complete_setup" um vollautomatisches Setup zu starten!
```

Oder einzelne Tools:
```
- setup_supabase_database: Nur Datenbank setup
- test_telegram_bot: Nur Bot testen
- get_setup_status: Status anzeigen
```

---

### **Option 2: Standalone Script (EINFACHER!)**

Ich hab auch ein Standalone-Script gemacht das OHNE MCP läuft!

```bash
cd mcp-setup-automation
node standalone-setup.js
```

Das führt ALLES automatisch aus! ✅

---

## 🛠 Verfügbare Tools

### 1. `setup_supabase_database`

Führt SQL Schema automatisch aus.

**Parameter:**
- `confirm`: true

**Beispiel:**
```javascript
{
  "name": "setup_supabase_database",
  "arguments": {
    "confirm": true
  }
}
```

---

### 2. `deploy_to_railway`

Deployed Projekt auf Railway.

**Parameter:**
- `railway_token`: Railway API Token (von railway.app/account/tokens)
- `project_name`: Name des Projekts (optional)

**Beispiel:**
```javascript
{
  "name": "deploy_to_railway",
  "arguments": {
    "railway_token": "YOUR_RAILWAY_TOKEN",
    "project_name": "linktofunnel-autopilot"
  }
}
```

---

### 3. `test_telegram_bot`

Testet Telegram Bot.

**Parameter:**
- `send_test_message`: true/false (optional)

**Beispiel:**
```javascript
{
  "name": "test_telegram_bot",
  "arguments": {
    "send_test_message": true
  }
}
```

---

### 4. `complete_setup` ⭐

**VOLLAUTOMATISCH!** Führt alle Schritte aus!

**Parameter:**
- `railway_token`: Railway Token (optional - wenn nicht vorhanden wird Railway übersprungen)
- `skip_railway`: true um Railway zu überspringen (optional)

**Beispiel:**
```javascript
{
  "name": "complete_setup",
  "arguments": {
    "skip_railway": true  // Nur Supabase + Bot
  }
}
```

Oder mit Railway:
```javascript
{
  "name": "complete_setup",
  "arguments": {
    "railway_token": "YOUR_TOKEN"
  }
}
```

---

### 5. `get_setup_status`

Zeigt Status an: Was ist fertig, was fehlt?

**Keine Parameter**

**Beispiel:**
```javascript
{
  "name": "get_setup_status",
  "arguments": {}
}
```

---

## 📖 Schritt-für-Schritt

### **Szenario 1: Nur Supabase + Telegram (ohne Railway)**

```bash
# Standalone Script:
node standalone-setup.js --skip-railway

# Oder mit MCP:
# Tool: complete_setup
# Args: { "skip_railway": true }
```

### **Szenario 2: Komplett mit Railway**

**1. Railway Token holen:**
- https://railway.app/account/tokens
- "Create Token"
- Token kopieren

**2. Setup starten:**
```bash
# Standalone Script:
node standalone-setup.js --railway-token YOUR_TOKEN

# Oder mit MCP:
# Tool: complete_setup
# Args: { "railway_token": "YOUR_TOKEN" }
```

---

## 🎯 Was macht der Automation Agent?

### **Supabase Setup:**
1. Lädt `supabase-schema.sql`
2. Verbindet mit Supabase
3. Führt SQL aus (alle Statements)
4. Überprüft Tabellen
5. ✅ Fertig!

### **Railway Deploy:**
1. Erstellt Railway Projekt
2. Verbindet GitHub Repo
3. Setzt Environment Variables
4. Triggert Deployment
5. ✅ Deployed!

### **Telegram Test:**
1. Prüft Bot Token
2. Ruft Bot Info ab
3. Sendet Test-Nachricht
4. ✅ Bot funktioniert!

---

## ⚡ Railway Token Alternative

Falls du KEIN Railway nutzen willst:

```bash
node standalone-setup.js --skip-railway
```

Dann macht er nur:
- ✅ Supabase Setup
- ✅ Telegram Bot Test

Railway kannst du manuell machen! (Siehe MOBILE_SETUP.md)

---

## 🔧 Troubleshooting

### **Error: Supabase Connection Failed**
- Prüfe `SUPABASE_SERVICE_KEY` in `.env.local`
- Ist Supabase Projekt erstellt?

### **Error: Railway API Failed**
- Prüfe Railway Token
- Token noch gültig?
- Railway Account aktiv?

### **Error: Telegram Bot Invalid**
- Prüfe `TELEGRAM_BOT_TOKEN`
- Bot bei @BotFather erstellt?

---

## 📊 Output Beispiel

```
╔════════════════════════════════════════╗
║  🚀 VOLLAUTOMATISCHES SETUP STARTET   ║
╚════════════════════════════════════════╝

📝 SCHRITT 1/3: Supabase Database Setup

🔧 Supabase Database Setup wird gestartet...
📄 SQL Schema geladen: 5847 Zeichen
📝 169 SQL Statements gefunden
⚙️  Führe Statement 1/169 aus...
✅ Statement 1 erfolgreich
...
✅ SUPABASE SETUP KOMPLETT! Alle Tabellen erstellt!

📝 SCHRITT 2/3: Railway Deployment

🚂 Railway Deployment wird gestartet...
📦 Erstelle Railway Projekt...
✅ Projekt erstellt: abc123
🔗 Verbinde GitHub Repository...
✅ GitHub verbunden: xyz789
⚙️  Setze Environment Variables...
  ✅ NEXT_PUBLIC_SUPABASE_URL gesetzt
  ✅ SUPABASE_SERVICE_KEY gesetzt
  ...
🚀 Triggere Deployment...
✅ Deployment gestartet!

✅ RAILWAY DEPLOYMENT GESTARTET!

📝 SCHRITT 3/3: Telegram Bot Test

🤖 Teste Telegram Bot...
✅ Bot gefunden: your_bot_name
✅ Test-Nachricht gesendet!

✅ TELEGRAM BOT FUNKTIONIERT!

╔════════════════════════════════════════╗
║        📊 SETUP ZUSAMMENFASSUNG        ║
╚════════════════════════════════════════╝

Supabase:  ✅ Fertig
Railway:   ✅ Fertig
Telegram:  ✅ Fertig

🎉 SETUP KOMPLETT! System ist ready!
```

---

## 🚀 Next Steps

Nach erfolgreichem Setup:

1. **Telegram öffnen**
2. **Dein Bot finden**
3. **`/start` senden**
4. **Setup-Wizard durchlaufen** (10 Min)
5. **Ab morgen 08:00: Content Approvals!** 🎉

---

**Made with 🤖 by Setup Automation Agent**
