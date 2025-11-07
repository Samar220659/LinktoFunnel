# 🔐 API KEY MANAGEMENT SYSTEM

Ein sicheres, zentralisiertes System zur Verwaltung aller API-Keys für den LinktoFunnel AI Business Agent.

## 🎯 Features

- ✅ **Supabase Vault Integration** - Sichere Cloud-Speicherung
- ✅ **Verschlüsselte lokale Speicherung** - AES-256-GCM Encryption
- ✅ **Automatisches Fallback** - Verwendet .env.local wenn Vault nicht verfügbar
- ✅ **Interaktives Setup** - Wizard-basierte Konfiguration
- ✅ **CLI-Tool** - Einfache Verwaltung über die Kommandozeile
- ✅ **Import/Export** - Nahtlose Integration mit .env-Dateien
- ✅ **Caching** - Schneller Zugriff auf häufig verwendete Keys

---

## 🚀 Quick Start

### 1. Setup-Wizard ausführen

```bash
npm run keys:setup
```

Der interaktive Wizard führt dich durch die Konfiguration:
- Prüft bestehende Keys
- Importiert .env.local (falls vorhanden)
- Fragt nach kritischen Keys (Supabase, Gemini)
- Optionale Keys können übersprungen werden
- Generiert automatisch .env.local

### 2. Supabase-Tabelle erstellen (Optional für Vault)

Falls du Supabase Vault nutzen möchtest:

```sql
-- In Supabase SQL Editor ausführen:
-- Kopiere den Inhalt aus: ai-agent/data/api-secrets-schema.sql
```

### 3. Service Role Key setzen (für Vault)

```bash
npm run keys:add

# Dann eingeben:
# Key name: SUPABASE_SERVICE_ROLE_KEY
# Key value: eyJhbG... (dein Service Role Key)
```

---

## 📖 Verwendung

### Kommandozeilen-Tools

```bash
# API Keys verwalten (interaktiv)
npm run keys

# Oder direkte Befehle:
npm run keys:list      # Alle Keys anzeigen (maskiert)
npm run keys:add       # Neuen Key hinzufügen
npm run keys:export    # Nach .env.local exportieren
npm run keys:import    # Aus .env.local importieren
npm run keys:health    # System-Status prüfen
```

### In deinem Code verwenden

```javascript
import apiKeyManager, { getKey } from './lib/api-key-manager.js';

// Einfacher Weg
const geminiKey = await getKey('GEMINI_API_KEY');

// Mit Fallback-Wert
const openaiKey = await getKey('OPENAI_API_KEY', 'sk-default-key');

// Alle Keys abrufen
const allKeys = await apiKeyManager.getAllKeys();

// Key speichern
await apiKeyManager.setKey('NEW_API_KEY', 'value123');

// Health Check
const health = await apiKeyManager.healthCheck();
console.log('Vault verfügbar:', health.vaultAvailable);
```

---

## 🔧 Konfiguration

### Benötigte Keys (Minimum)

Diese Keys sind für die Grundfunktion erforderlich:

```bash
NEXT_PUBLIC_SUPABASE_URL         # Supabase Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY    # Supabase Anonymous Key
GEMINI_API_KEY                   # Google Gemini (kostenlos!)
```

### Empfohlene Keys

Für volle Funktionalität:

```bash
# Vault-Support
SUPABASE_SERVICE_ROLE_KEY        # Für Supabase Vault

# Benachrichtigungen
TELEGRAM_BOT_TOKEN               # Telegram Bot (@BotFather)
TELEGRAM_CHAT_ID                 # Deine Chat-ID

# AI-Services
OPENAI_API_KEY                   # GPT-4, DALL-E 3

# Marketing-Tools
DIGISTORE24_API_KEY              # Affiliate-Produkte
GETRESPONSE_API_KEY              # E-Mail-Marketing
SCRAPINGBEE_API_KEY              # Web-Scraping

# Social Media
TIKTOK_ACCESS_TOKEN
INSTAGRAM_ACCESS_TOKEN
YOUTUBE_API_KEY
PINTEREST_ACCESS_TOKEN
```

### Optionale Keys

```bash
STRIPE_PUBLISHABLE_KEY
TWITTER_API_KEY
LINKEDIN_ACCESS_TOKEN
```

---

## 🔐 Sicherheit

### Verschlüsselung

Alle Keys werden mit **AES-256-GCM** verschlüsselt:

```javascript
// Automatisch generierter Master-Key
MASTER_ENCRYPTION_KEY=<random-32-byte-hex>

// Wird beim ersten Start automatisch erstellt
```

### Speicherorte (Priorität)

1. **Environment Variables** (höchste Priorität)
   - `process.env.GEMINI_API_KEY`

2. **Supabase Vault** (wenn `SUPABASE_SERVICE_ROLE_KEY` gesetzt)
   - Verschlüsselt in `api_secrets` Tabelle

3. **Lokale Datei** (Fallback)
   - `.api-keys.encrypted` (verschlüsselt, nicht in Git)

### Best Practices

✅ **DO:**
- Nutze Supabase Vault für Produktionsumgebungen
- Rotiere API-Keys regelmäßig
- Verwende `.env.local` nur für Entwicklung
- Füge `.api-keys.encrypted` zu `.gitignore` hinzu

❌ **DON'T:**
- Committe niemals echte API-Keys in Git
- Teile niemals deinen `MASTER_ENCRYPTION_KEY`
- Verwende keine Produktion-Keys in Entwicklung

---

## 🛠️ Troubleshooting

### Problem: "Supabase Vault not available"

**Lösung:**
```bash
# Service Role Key setzen
npm run keys:add
# Key: SUPABASE_SERVICE_ROLE_KEY
# Value: <dein-service-role-key>
```

### Problem: "Key not found"

**Lösung:**
```bash
# 1. Prüfen ob Key existiert
npm run keys:list

# 2. Key hinzufügen
npm run keys:add

# 3. Oder aus .env importieren
npm run keys:import
```

### Problem: "Cannot read properties of null"

**Lösung:**
```bash
# Verschlüsselte Datei löschen und neu starten
rm .api-keys.encrypted
npm run keys:setup
```

### Problem: Keys aus Termux übertragen

**Lösung:**
```bash
# Auf Termux:
scp ~/.env.local user@server:/path/to/LinktoFunnel/.env.local

# Auf Server:
npm run keys:import
```

---

## 📊 CLI-Befehle (Detailliert)

### `npm run keys:setup`

Interaktiver Setup-Wizard:
- Prüft bestehende Konfiguration
- Importiert vorhandene .env-Datei
- Fragt nach kritischen Keys
- Optional: Weitere Keys konfigurieren
- Generiert .env.local

### `npm run keys:list`

Zeigt alle konfigurierten Keys (maskiert):
```
🔑 Configured API Keys:

  ✓ GEMINI_API_KEY: ***x7Fg
  ✓ SUPABASE_URL: ***co
  ✗ OPENAI_API_KEY: (not set)
```

### `npm run keys:add`

Fügt einen neuen Key hinzu:
```
Key name: TIKTOK_ACCESS_TOKEN
Key value: act.abc123xyz...
✅ Saved securely!
```

### `npm run keys:export`

Exportiert alle Keys nach `.env.local`:
```bash
# Generated file:
GEMINI_API_KEY=AIzaSy...
NEXT_PUBLIC_SUPABASE_URL=https://...
...
```

### `npm run keys:import`

Importiert Keys aus `.env.local`:
```
✅ Imported 12 keys from .env.local
```

### `npm run keys:health`

System-Status:
```
🏥 Health Check

Vault Available: ✅
Local Storage: ✅
Cache Size: 8 keys
Encryption: ✅

Critical Keys:
  ✅ GEMINI_API_KEY (from storage)
  ✅ SUPABASE_URL (from env)
  ❌ OPENAI_API_KEY
```

### `npm run keys`

Interaktiver Modus:
```
keys> help
keys> list
keys> add
keys> health
keys> exit
```

---

## 🏗️ Architektur

```
┌─────────────────────────────────────────────┐
│  Application Code                           │
│  ↓ await getKey('GEMINI_API_KEY')          │
└─────────────────┬───────────────────────────┘
                  ↓
┌─────────────────────────────────────────────┐
│  API Key Manager (lib/api-key-manager.js)  │
│  - Caching Layer                            │
│  - Priority Resolution                      │
│  - Encryption/Decryption                    │
└─────────────────┬───────────────────────────┘
                  ↓
    ┌─────────────┴─────────────┐
    ↓                           ↓
┌───────────────┐      ┌────────────────┐
│ Supabase      │      │ Local Storage  │
│ Vault         │      │ (.encrypted)   │
│               │      │                │
│ api_secrets   │      │ AES-256-GCM    │
│ table         │      │                │
└───────────────┘      └────────────────┘
```

### Prioritäts-Reihenfolge

1. **process.env** (höchste Priorität)
2. **Memory Cache** (Performance)
3. **Supabase Vault** (Produktion)
4. **Local Storage** (Entwicklung)
5. **Fallback Value** (optional)

---

## 📝 Beispiele

### Setup für neues Projekt

```bash
# 1. Repository clonen
git clone https://github.com/Samar220659/LinktoFunnel.git
cd LinktoFunnel

# 2. Dependencies installieren
npm install

# 3. API Keys konfigurieren
npm run keys:setup

# 4. Supabase Datenbank einrichten
# (SQL aus ai-agent/data/schema.sql + api-secrets-schema.sql)

# 5. System testen
npm test

# 6. Orchestrator starten
npm run orchestrator
```

### Migration von .env zu Vault

```bash
# 1. Keys aus .env importieren
npm run keys:import

# 2. Service Role Key hinzufügen
npm run keys:add
# SUPABASE_SERVICE_ROLE_KEY

# 3. Health Check (prüft Vault)
npm run keys:health

# 4. .env.local löschen (optional, wenn alles im Vault ist)
rm .env.local
```

### Termux → Server Migration

```bash
# Auf Termux (Lilly):
cd ~/LinktoFunnel
npm run keys:export  # Erstellt .env.local
scp .env.local user@server:/home/user/LinktoFunnel/

# Auf Server:
cd /home/user/LinktoFunnel
npm run keys:import
npm run keys:list  # Verifizieren
```

---

## 🤝 Integration mit bestehendem Code

### Update deine Agents

```javascript
// Vorher:
const apiKey = process.env.GEMINI_API_KEY;

// Nachher:
import { getKey } from '../lib/api-key-manager.js';
const apiKey = await getKey('GEMINI_API_KEY');
```

### Update mit Fallback

```javascript
import { getKey } from '../lib/api-key-manager.js';

// Mit Fallback für Tests
const apiKey = await getKey(
  'GEMINI_API_KEY',
  process.env.CI ? 'test-key' : null
);
```

---

## 📚 Weitere Ressourcen

- [Supabase Vault Docs](https://supabase.com/docs/guides/database/vault)
- [AES-256-GCM Encryption](https://en.wikipedia.org/wiki/Galois/Counter_Mode)
- [Node.js Crypto Module](https://nodejs.org/api/crypto.html)

---

## 🎉 Fertig!

Du hast jetzt ein professionelles API-Key-Management-System! 🔐

**Next Steps:**
1. ✅ Keys konfiguriert → `npm run keys:list`
2. ✅ Datenbank eingerichtet → `npm run db:setup`
3. ✅ System testen → `npm test`
4. 🚀 Orchestrator starten → `npm run orchestrator`

Bei Fragen oder Problemen: Check die [Troubleshooting](#troubleshooting)-Sektion!
