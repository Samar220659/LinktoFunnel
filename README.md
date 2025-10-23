# 🤖 AI BUSINESS AGENT - Digitaler Zwilling

**Vollautomatisches passives Einkommen durch AI-gesteuerte Marketing-Automation**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![AI Powered](https://img.shields.io/badge/AI-Powered-blue.svg)](https://ai.google.dev/)

---

## 🎯 WAS IST DAS?

Ein **autonomer digitaler Zwilling** der dein Online-Business **komplett automatisch** führt:

- 🔍 **Findet hochkonvertierende Produkte** auf Digistore24
- 🎬 **Generiert Marketing-Videos** mit KI (LinktoFunnel)
- 🌪️ **Erstellt Sales-Funnels** automatisch (zZ-Lobby Integration)
- 📧 **E-Mail-Marketing** mit GetResponse
- 📊 **Optimiert Kampagnen** mit Reinforcement Learning
- 💰 **Generiert passives Einkommen** 24/7

**Alles steuerbar vom Handy via Termux!**

---

## 🏗️ SYSTEM-ARCHITEKTUR

```
┌─────────────────────────────────────────────────────────────┐
│  🤖 MASTER ORCHESTRATOR (Digitaler Zwilling)               │
│  - Zentrale AI-Intelligenz mit RL-Engine                   │
│  - Trifft autonome Business-Entscheidungen                  │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│  👥 SPEZIALISIERTE AGENTEN                                  │
├─────────────────────────────────────────────────────────────┤
│  🔍 Product Scout    → Digistore24 Analyse                 │
│  🎬 Content Creator  → AI Video-Generierung                │
│  📧 Email Agent      → GetResponse Automation              │
│  📊 Analytics Agent  → Performance-Tracking                │
│  💰 Sales Agent      → Conversion-Optimierung              │
└─────────────┬───────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│  💾 SUPABASE DATABASE                                       │
│  - Produkte, Kampagnen, Analytics                          │
│  - Reinforcement Learning History                          │
│  - Lead-Tracking & Conversions                             │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│  📱 TERMUX MOBILE CONTROL                                   │
│  - Cron-Jobs für tägliche Automatisierung                  │
│  - Gemini CLI Integration                                  │
│  - Push-Benachrichtigungen via Telegram                    │
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ FEATURES

### 🤖 Künstliche Intelligenz

- **Gemini AI** - Strategische Entscheidungen & Content-Generierung
- **GPT-4** - Copywriting & Script-Erstellung
- **DALL-E 3** - Bild-Generierung für Ads
- **Reinforcement Learning** - Kontinuierliche Optimierung

### 📈 Marketing-Automation

- **Digistore24 Integration** - Automatische Produktauswahl
- **Video-Ads** - AI-generierte TikTok/Instagram/YouTube Shorts
- **E-Mail-Funnels** - GetResponse Autoresponder-Sequenzen
- **Landing Pages** - Automatische Generierung & Deployment

### 💰 Revenue-Generierung

- **Affiliate-Marketing** - Hochkonvertierende Digistore24 Produkte
- **Eigene Produkte** - AI-generierte digitale Produkte
- **Multi-Channel** - TikTok, Instagram, YouTube, Pinterest

### 📊 Analytics & Tracking

- **Echtzeit-Dashboard** - Supabase-basiert
- **ROI-Tracking** - Automatische Gewinn-Verlust-Rechnung
- **A/B-Testing** - AI-optimierte Varianten
- **Telegram-Reports** - Tägliche Performance-Updates

---

## 🚀 QUICK START

### 1. Repository clonen

```bash
git clone https://github.com/Samar220659/LinktoFunnel.git
cd LinktoFunnel
```

### 2. Dependencies installieren

```bash
npm install
# oder
pnpm install
```

### 3. Umgebungsvariablen konfigurieren

Die `.env.local` Datei ist bereits vorkonfiguriert mit allen API-Keys.

**Wichtig:** Füge noch deinen Telegram Bot Token hinzu (optional):

```bash
# Erstelle Bot bei @BotFather auf Telegram
# Dann in .env.local eintragen:
TELEGRAM_BOT_TOKEN=dein_bot_token
```

### 4. Supabase Datenbank einrichten

```bash
# SQL-Schema in Supabase SQL Editor ausführen:
cat ai-agent/data/schema.sql

# Dann in Supabase: Project → SQL Editor → Paste & Run
```

### 5. System testen

```bash
# Alle API-Verbindungen prüfen
npm test

# Digitaler Zwilling starten
node ai-agent/MASTER_ORCHESTRATOR.js
```

### 6. (Optional) Termux Setup

Siehe **[TERMUX_SETUP.md](./TERMUX_SETUP.md)** für mobile Steuerung!

---

## 📁 PROJEKT-STRUKTUR

```
LinktoFunnel/
├── ai-agent/
│   ├── core/
│   │   └── orchestrator.js           # Original Orchestrator (deprecated)
│   ├── agents/
│   │   ├── product-scout.js          # Digistore24 Produkt-Analyse
│   │   └── content-creator.js        # Video-Generierung
│   ├── integrations/
│   │   ├── digistore24.js            # Digistore24 API Client
│   │   ├── zz-lobby-bridge.js        # GetResponse Integration
│   │   └── zz-lobby/
│   │       └── zz_lobby_engine.py    # Original Python-Code (Referenz)
│   ├── workflows/
│   │   └── (coming soon)
│   ├── data/
│   │   └── schema.sql                # Supabase DB-Schema
│   ├── ARCHITECTURE.md               # System-Architektur Dokumentation
│   └── MASTER_ORCHESTRATOR.js        # 🤖 HAUPTPROGRAMM
│
├── lib/
│   ├── generator.js                  # LinktoFunnel Video-Pipeline
│   └── supabase.js                   # Supabase Client
│
├── scripts/
│   ├── test-apis.js                  # API-Connection-Tester
│   └── supabase-inspect.js           # DB-Inspector
│
├── .github/workflows/
│   └── deploy.yml                    # CI/CD Pipeline
│
├── .env.local                        # 🔐 API-Keys (NICHT in Git!)
├── .env.example                      # Template für API-Keys
├── .gitignore
├── package.json
├── TERMUX_SETUP.md                   # 📱 Mobile Setup-Guide
└── README.md                         # Diese Datei
```

---

## 🎮 VERWENDUNG

### Automatischer Tagesablauf (Cron)

```bash
# Crontab bearbeiten
crontab -e

# Tägliche Automation um 9:00 Uhr
0 9 * * * cd ~/LinktoFunnel && node ai-agent/MASTER_ORCHESTRATOR.js

# Report um 18:00 Uhr
0 18 * * * cd ~/LinktoFunnel && node ai-agent/MASTER_ORCHESTRATOR.js --report
```

### Manuelle Ausführung

```bash
# Kompletter Workflow
node ai-agent/MASTER_ORCHESTRATOR.js

# Nur Produkt-Analyse
node ai-agent/agents/product-scout.js

# Nur Content-Generierung
# (kommt noch)

# Digistore24 Top-Produkte finden
node ai-agent/integrations/digistore24.js

# ZZ-Lobby Funnel erstellen
node ai-agent/integrations/zz-lobby-bridge.js
```

### Termux (Mobile)

```bash
# Morning-Routine
~/morning.sh

# Live-Logs
tail -f ~/automation.log

# Status-Check
ps aux | grep node
```

---

## 💰 ZERO-BUDGET STRATEGIE

### Kostenlose Services (Free Tier):

| Service | Free Tier | Nutzung |
|---------|-----------|---------|
| **Supabase** | 500 MB DB | Datenbank & Auth |
| **Vercel** | Unlimited Deployments | Landing Pages |
| **GitHub Actions** | 2.000 min/Monat | Automation |
| **Gemini API** | Großzügiges Free-Limit | AI-Entscheidungen |
| **TikTok/Instagram** | Kostenlos | Organischer Traffic |
| **Termux** | Komplett kostenlos | Mobile Steuerung |

### Pay-as-you-go (nur bei Skalierung):

- **OpenAI API** - ~$5-20/Monat
- **ScrapingBee** - ~$5-10/Monat
- **Digistore24** - Nur bei Verkauf (Gebühren)

**Total: $0-30/Monat maximal**

---

## 📊 ROADMAP

### Phase 1: Foundation ✅ (Woche 1-2)
- [x] Supabase Setup
- [x] Digistore24 Integration
- [x] ZZ-Lobby Bridge
- [x] Master Orchestrator
- [x] Termux Scripts

### Phase 2: Automation 🔄 (Woche 3-4)
- [ ] Content-Generator Agent
- [ ] Social Media Auto-Posting
- [ ] Landing Page Generator
- [ ] E-Mail Automation

### Phase 3: Learning 🧠 (Woche 5-8)
- [ ] RL-Engine Optimierung
- [ ] Performance-Tracking
- [ ] Auto-A/B-Testing
- [ ] Predictive Analytics

### Phase 4: Scaling 🚀 (Woche 9-12)
- [ ] Product Development Agent
- [ ] Multi-Niche Expansion
- [ ] Advanced Analytics Dashboard
- [ ] Revenue >€5.000/Monat

---

## 🔒 SICHERHEIT

- **Alle API-Keys** in `.env.local` (nicht in Git!)
- **Supabase Row Level Security** aktiviert
- **DSGVO-konform** (EU-Server)
- **Stripe PCI-compliant** für Payments

---

## 🤝 CONTRIBUTING

Contributions sind willkommen! Bitte:

1. Fork das Repo
2. Feature-Branch erstellen
3. Änderungen commiten
4. Pull Request öffnen

---

## 📄 LIZENZ

MIT License - siehe [LICENSE](LICENSE) Datei

---

## 🆘 SUPPORT

**Bei Fragen oder Problemen:**

- 📧 E-Mail: Samar220659@gmail.com
- 💬 Telegram: @dein_username
- 🐛 Issues: [GitHub Issues](https://github.com/Samar220659/LinktoFunnel/issues)

---

## 🙏 CREDITS

**Entwickelt von:**
- Daniel Oettel (zZ-Lobby Original-Konzept)
- Claude AI (System-Integration & Automation)

**Technologien:**
- Google Gemini AI
- OpenAI GPT-4 & DALL-E 3
- Supabase
- Next.js
- Digistore24
- GetResponse

---

## 🎉 LOS GEHT'S!

```bash
# System starten
node ai-agent/MASTER_ORCHESTRATOR.js

# Passives Einkommen generieren
# 💰💰💰
```

**Viel Erfolg mit deinem digitalen Zwilling!** 🚀
