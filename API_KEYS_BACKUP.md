# 🔐 API KEYS BACKUP & DOKUMENTATION

**WICHTIG:** Diese Datei NIEMALS zu Git hinzufügen! Nur lokal speichern.

---

## 📋 VOLLSTÄNDIGE LISTE ALLER API KEYS

### ✅ BEREITS KONFIGURIERT:

| Service | Variable | Status | Wert |
|---------|----------|--------|------|
| **Supabase URL** | `NEXT_PUBLIC_SUPABASE_URL` | ✅ | `https://mkiliztwhxzwizwwjhqn.supabase.co` |
| **Supabase Anon Key** | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | `eyJhbGc...Xc-w` |
| **Gemini AI** | `GEMINI_API_KEY` | ✅ | `AIzaSyCjmQnnPhLcj5cFG1r759jyX-C4xuwPzQE` |
| **OpenAI** | `OPENAI_API_KEY` | ✅ | `sk-zsKJg6785GNx0pJYUuh5cIrq...` |
| **ScrapingBee** | `SCRAPINGBEE_API_KEY` | ✅ | `ESUONFHKA4ZOVTT1LKTKPYIQ...` |
| **Stripe Public** | `STRIPE_PUBLISHABLE_KEY` | ✅ | `pk_live_51RXxMyG1aiMAOWbF...` |
| **DigiStore24** | `DIGISTORE24_API_KEY` | ✅ | `1417598-BP9FgEF71a0Kpzh5wHMt...` |
| **GetResponse** | `GETRESPONSE_API_KEY` | ✅ | `dmg18fztw7ecpfyhhfeallh6hdske13q` |
| **Telegram Bot** | `TELEGRAM_BOT_TOKEN` | ✅ | `7215449153:AAEZekOaNe1_j9kd0Ey...` |
| **Telegram Chat** | `TELEGRAM_CHAT_ID` | ✅ | `6982601388` |

---

### ⚠️ NOCH HINZUZUFÜGEN:

| Service | Variable | Benötigt für | Wo bekommen? |
|---------|----------|--------------|--------------|
| **Supabase Service Role** | `SUPABASE_SERVICE_ROLE_KEY` | Admin-Operationen | Supabase Dashboard → Settings → API |
| **RunwayML** | `RUNWAYML_API_KEY` | Video-Generierung | https://runwayml.com/account/api-keys |
| **Stripe Secret** | `STRIPE_SECRET_KEY` | Payment Processing | Stripe Dashboard → Developers → API Keys |
| **Scheduler Secret** | `SCHEDULER_SECRET` | Cron Jobs absichern | Zufälliger String generieren |

---

### 🔵 OPTIONAL (Social Media):

| Service | Variable | Funktion | Wo bekommen? |
|---------|----------|----------|--------------|
| **Buffer** | `BUFFER_ACCESS_TOKEN` | Auto-Posting (FB, Twitter, etc.) | https://buffer.com/developers/api |
| **Ayrshare** | `AYRSHARE_API_KEY` | Auto-Posting (TikTok, Pinterest) | https://www.ayrshare.com/dashboard |

---

## 🗄️ DATENBANK-ZUGANG:

| Info | Wert |
|------|------|
| **Host** | `db.mkiliztwhxzwizwwjhqn.supabase.co` |
| **Port** | `5432` |
| **Database** | `postgres` |
| **User** | `postgres` |
| **Password** | `DanielOettel@@@@` |
| **Connection String** | `postgres://postgres:DanielOettel@@@@@db.mkiliztwhxzwizwwjhqn.supabase.co:5432/postgres` |

---

## 📦 WO FINDE ICH DIE KEYS?

### 1. Supabase Service Role Key:
```bash
1. https://supabase.com/dashboard/project/mkiliztwhxzwizwwjhqn
2. Settings → API
3. Project API keys → service_role (secret) kopieren
```

### 2. RunwayML API Key:
```bash
1. https://runwayml.com/
2. Account erstellen/einloggen
3. Account → API Keys → Create API Key
4. Key kopieren
```

### 3. Stripe Secret Key:
```bash
1. https://dashboard.stripe.com/
2. Developers → API keys
3. Secret key (sk_live_...) kopieren
ODER für Testing: Test mode secret key (sk_test_...)
```

### 4. Scheduler Secret generieren:
```bash
# Auf Linux/Mac/Termux:
openssl rand -base64 32

# Oder online:
https://www.random.org/strings/
- 32 Zeichen
- Alphanumerisch
```

### 5. Buffer Access Token:
```bash
1. https://buffer.com/developers/api
2. "Create Access Token"
3. Token kopieren
4. Social Accounts verbinden (Facebook, Twitter, etc.)
```

### 6. Ayrshare API Key:
```bash
1. https://www.ayrshare.com/
2. Kostenloses Konto erstellen
3. Dashboard → API Key
4. Key kopieren
5. Social Accounts verbinden (TikTok, Pinterest, etc.)
```

---

## 🔧 VOLLSTÄNDIGE .env.local TEMPLATE:

```bash
# ==========================================
# SUPABASE CONFIGURATION
# ==========================================
NEXT_PUBLIC_SUPABASE_URL=https://mkiliztwhxzwizwwjhqn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1raWxpenR3aHh6d2l6d3dqaHFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NjY1ODksImV4cCI6MjA3NjE0MjU4OX0.olvY21Ppazo8d9z76FPZ4KzeLOY2UVqk8nUpnr1Xc-w
SUPABASE_SERVICE_ROLE_KEY=NOCH_HINZUFÜGEN_VON_SUPABASE_DASHBOARD

# ==========================================
# DATABASE (für direkten Zugriff)
# ==========================================
DATABASE_URL=postgres://postgres:DanielOettel@@@@@db.mkiliztwhxzwizwwjhqn.supabase.co:5432/postgres

# ==========================================
# AI / CONTENT GENERATION
# ==========================================
GEMINI_API_KEY=AIzaSyCjmQnnPhLcj5cFG1r759jyX-C4xuwPzQE
OPENAI_API_KEY=sk-zsKJg6785GNx0pJYUuh5cIrqv6al1Kc__gf1EiXWcI9umo0NsSmJOG3aWRmMJD4gJ5xch98p_sMpVYv04Y20HlEVEOIq
RUNWAYML_API_KEY=NOCH_HINZUFÜGEN_VON_RUNWAYML

# ==========================================
# WEB SCRAPING
# ==========================================
SCRAPINGBEE_API_KEY=ESUONFHKA4ZOVTT1LKTKPYIQJXMXQH3ZT8Z6TXCX1A4KRLTK6VUIRMD8VDN27WJ8W5KE2VC5778CI81Z

# ==========================================
# PAYMENT PROCESSING
# ==========================================
STRIPE_PUBLISHABLE_KEY=pk_live_51RXxMyG1aiMAOWbFsiDcEDL1f5Wk3ECOB6H7Av1VG2S6PhyAuDQsfnLvAIakjyGnS5y0va7v8zpAB1trCW5WmEFO00x81rRG8O
STRIPE_SECRET_KEY=NOCH_HINZUFÜGEN_VON_STRIPE_DASHBOARD

# ==========================================
# AFFILIATE & MARKETING
# ==========================================
DIGISTORE24_API_KEY=1417598-BP9FgEF71a0Kpzh5wHMtaEr9w1k5qJyWHoHeS
GETRESPONSE_API_KEY=dmg18fztw7ecpfyhhfeallh6hdske13q

# ==========================================
# NOTIFICATIONS
# ==========================================
TELEGRAM_BOT_TOKEN=7215449153:AAEZekOaNe1_j9kd0kEyytKh0L0ajrwqJqk
TELEGRAM_CHAT_ID=6982601388

# ==========================================
# SOCIAL MEDIA (Optional - 20 Posts/Monat pro Service)
# ==========================================
# Buffer: https://buffer.com/developers/api (Facebook, Twitter, LinkedIn, Instagram)
BUFFER_ACCESS_TOKEN=your_buffer_token_here
# Ayrshare: https://www.ayrshare.com/ (TikTok, Pinterest, YouTube, Reddit)
AYRSHARE_API_KEY=your_ayrshare_key_here

# ==========================================
# SECURITY & SCHEDULING
# ==========================================
SCHEDULER_SECRET=NOCH_GENERIEREN_MIT_openssl_rand_base64_32
NODE_ENV=production

# ==========================================
# WEBHOOK URLs (für n8n/Zapier)
# ==========================================
WEBHOOK_BASE_URL=https://ihr-server.com
```

---

## 🔐 SICHERHEITS-HINWEISE:

### ✅ ZU TUN:
- [ ] `.env.local` ist in `.gitignore` (bereits erledigt ✅)
- [ ] Keys niemals in Code hardcoden
- [ ] Service Role Key nur auf Server nutzen
- [ ] Regelmäßig Keys rotieren (alle 90 Tage)
- [ ] Backup dieser Datei an sicherem Ort (1Password, Bitwarden, etc.)

### ❌ NIEMALS:
- ❌ Keys zu Git committen
- ❌ Keys in Screenshots teilen
- ❌ Service Role Key im Frontend nutzen
- ❌ Keys in öffentliche Repositories pushen
- ❌ Keys per unverschlüsselter Email senden

---

## 💾 BACKUP-STANDORTE:

### Empfohlene sichere Speicherorte:
1. **1Password** - Password Manager mit Notes
2. **Bitwarden** - Open Source Password Manager
3. **Keepass** - Lokale verschlüsselte Datenbank
4. **Verschlüsselte USB-Stick** - Offline Backup
5. **Encrypted Cloud Storage** - Google Drive/Dropbox mit Verschlüsselung

### Backup erstellen:
```bash
# Lokales Backup erstellen
cp .env.local .env.backup-$(date +%Y%m%d)

# Verschlüsseltes Backup (mit GPG)
gpg -c .env.local
# Erstellt: .env.local.gpg (verschlüsselt)
```

---

## 📞 SUPPORT-KONTAKTE:

| Service | Support URL |
|---------|-------------|
| Supabase | https://supabase.com/dashboard/support/new |
| Stripe | https://support.stripe.com/ |
| OpenAI | https://help.openai.com/ |
| Gemini | https://ai.google.dev/docs |
| RunwayML | https://runwayml.com/contact |
| Buffer | https://support.buffer.com/ |
| Ayrshare | https://www.ayrshare.com/support |

---

## 🔄 KEY ROTATION SCHEDULE:

| Key Type | Rotate Every | Last Rotated | Next Rotation |
|----------|--------------|--------------|---------------|
| Database Passwords | 90 days | - | - |
| API Keys | 180 days | - | - |
| Service Role Keys | 90 days | - | - |
| Scheduler Secrets | 90 days | - | - |
| Webhook Secrets | 180 days | - | - |

---

**Erstellt am:** 27.10.2025
**Letzte Aktualisierung:** 27.10.2025
**Version:** 1.0

---

⚠️ **WICHTIG:** Diese Datei enthält sensible Informationen!
Speichern Sie sie sicher und löschen Sie sie von unsicheren Systemen.
