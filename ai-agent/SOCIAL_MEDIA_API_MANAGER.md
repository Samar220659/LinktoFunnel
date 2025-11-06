# 🔐 Social Media API Manager

Ein hochsicherer KI-Agent zur Verwaltung, Überwachung und Bereitstellung von Social Media APIs.

## 🎯 Features

### ✅ API-Sammlung & Verwaltung
- **Unterstützte Plattformen:**
  - TikTok (Creator API & Business API)
  - Instagram (Graph API)
  - YouTube (Data API v3)
  - Pinterest (API v5)
  - Twitter/X (API v2)
  - LinkedIn (Marketing API)
  - Facebook (Graph API)

- **Zentrale Verwaltung:**
  - API-Versionen
  - Endpunkte und Methoden
  - Authentifizierungstypen
  - Rate Limits
  - Dokumentations-Links

### 🔒 Sicherheit
- **AES-256-GCM Verschlüsselung** für API-Keys
- **Row Level Security** in Supabase
- **Sichere Speicherung** aller Credentials
- **Berechtigungsverwaltung** pro Key

### 📊 Monitoring & Änderungserkennung
- **Health Checks:**
  - Automatische Verfügbarkeits-Prüfung
  - Response-Zeit Tracking
  - Uptime-Monitoring (24h, 7d, 30d)

- **Änderungserkennung:**
  - Version-Updates
  - Endpoint-Änderungen
  - Rate-Limit-Änderungen
  - Deprecations
  - Severity-Klassifizierung (low, medium, high, critical)

### 🔔 Benachrichtigungen
- **Telegram-Integration:**
  - Sofortige Benachrichtigung bei kritischen Änderungen
  - Tägliche Health-Reports
  - On-Demand API-Status Abfragen

### 🌐 REST API
- **Endpoints:**
  - `GET /api/social-media-apis` - Alle APIs
  - `GET /api/social-media-apis/:platform` - APIs einer Plattform
  - `GET /api/social-media-apis/:platform/:name` - Spezifische API
  - `GET /api/social-media-apis/health/:platform` - Health Status
  - `GET /api/social-media-apis/changes` - Änderungslog
  - `GET /api/social-media-apis/stats` - Statistiken
  - `POST /api/social-media-apis/verify` - API verifizieren

---

## 🚀 Setup-Anleitung

### Schritt 1: Datenbank-Schema installieren

1. Öffne dein **Supabase Dashboard**
2. Gehe zu **SQL Editor**
3. Öffne die Datei: `ai-agent/data/social-media-api-schema.sql`
4. Kopiere den gesamten Inhalt
5. Füge ihn in den SQL Editor ein
6. Klicke auf **RUN**

✅ Das Schema erstellt automatisch:
- 5 Tabellen (APIs, Keys, Changes, Health, Usage)
- 3 Views (Aggregierte Daten)
- Trigger für Timestamps
- Row Level Security Policies

### Schritt 2: Umgebungsvariablen einrichten

Füge zu deiner `.env.local` Datei hinzu:

```bash
# Supabase (bereits vorhanden)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# API Verschlüsselung (WICHTIG: Generiere einen sicheren Key!)
API_ENCRYPTION_KEY=your_32_byte_hex_key

# Optional: Separater API Server Port
API_SERVER_PORT=3001

# Telegram Bot (für Benachrichtigungen)
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

**Encryption Key generieren:**

```bash
# In Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Oder mit OpenSSL:
openssl rand -hex 32
```

### Schritt 3: Agent initialisieren

Führe den Agent zum ersten Mal aus:

```bash
node ai-agent/agents/social-media-api-manager.js
```

Das wird:
- ✅ APIs in die Datenbank synchronisieren
- ✅ Initiale Health Checks durchführen
- ✅ Einen Report generieren

### Schritt 4: API Server starten (Optional)

Wenn du die APIs über REST bereitstellen möchtest:

```bash
node ai-agent/api/social-media-api-server.js
```

Der Server läuft dann auf `http://localhost:3001`

**Teste die API:**

```bash
# Alle APIs abrufen
curl http://localhost:3001/api/social-media-apis

# Spezifische Plattform
curl http://localhost:3001/api/social-media-apis/tiktok

# Health Status
curl http://localhost:3001/api/social-media-apis/health/tiktok

# Statistiken
curl http://localhost:3001/api/social-media-apis/stats
```

### Schritt 5: Telegram Bot einrichten

1. **Bot erstellen:**
   - Öffne Telegram
   - Suche nach `@BotFather`
   - Sende `/newbot`
   - Folge den Anweisungen
   - Kopiere den Bot Token

2. **Chat ID herausfinden:**
   - Sende eine Nachricht an deinen Bot
   - Öffne: `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
   - Finde `"chat":{"id": YOUR_CHAT_ID}`
   - Kopiere die Chat ID

3. **In .env.local eintragen:**

```bash
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789
```

4. **Bot starten:**

```bash
node ai-agent/telegram-bot.js
```

5. **Teste den Bot:**
   - Öffne Telegram
   - Sende `/apis` an deinen Bot
   - Der Bot zeigt alle registrierten APIs

---

## 📱 Telegram Bot Commands

### API Management Commands

| Command | Beschreibung |
|---------|-------------|
| `/apis` | Zeigt alle registrierten Social Media APIs |
| `/apis_health` | Health Status aller APIs mit Uptime |
| `/apis_changes` | Letzte API-Änderungen anzeigen |

**Beispiel:**

```
/apis_health

🔍 API HEALTH STATUS
━━━━━━━━━━━━━━━━━━━━━━

✅ TikTok Creator API
├─ Platform: tiktok
├─ Uptime 24h: 99.5%
├─ Response: 245ms
└─ Last Check: 14:23:45

✅ Instagram Graph API
├─ Platform: instagram
├─ Uptime 24h: 100%
├─ Response: 180ms
└─ Last Check: 14:23:47

━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🔧 Verwendung in deinem Code

### APIs abrufen

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Alle APIs abrufen
const { data: apis } = await supabase
  .from('social_media_apis')
  .select('*');

// Spezifische API abrufen
const { data: tiktokAPI } = await supabase
  .from('social_media_apis')
  .select('*')
  .eq('platform', 'tiktok')
  .eq('api_name', 'TikTok Creator API')
  .single();

console.log('TikTok API:', tiktokAPI);
console.log('Base URL:', tiktokAPI.base_url);
console.log('Version:', tiktokAPI.version);
console.log('Endpoints:', tiktokAPI.endpoints);
```

### API-Key verschlüsselt speichern

```javascript
const { SocialMediaAPIManager, SecureStorage } = require('./agents/social-media-api-manager');

const manager = new SocialMediaAPIManager();

// API-Key sicher speichern
await manager.storeAPIKey(
  'api-uuid-here',
  'production',
  'your-actual-api-key-here',
  {
    read: true,
    write: true,
    scopes: ['user.read', 'post.write']
  },
  new Date('2025-12-31') // Ablaufdatum
);

// API-Key abrufen (automatisch entschlüsselt)
const apiKey = await manager.retrieveAPIKey('api-uuid-here', 'production');
console.log('Decrypted API Key:', apiKey);
```

### API-Verfügbarkeit prüfen

```javascript
const manager = new SocialMediaAPIManager();

// Einzelne API prüfen
const isAvailable = await manager.verifyAPIAvailability('tiktok', 'TikTok Creator API');

if (isAvailable) {
  console.log('✅ API is available');
} else {
  console.log('❌ API is down');
}

// Alle APIs prüfen
const results = await manager.checkAllAPIs();
console.log(`${results.available}/${results.total} APIs available`);
```

### Änderungen überwachen

```javascript
const manager = new SocialMediaAPIManager();

// Unbenachrichtigte Änderungen abrufen
const changes = await manager.getUnnotifiedChanges();

for (const change of changes) {
  if (change.severity === 'critical') {
    console.log('🔴 CRITICAL:', change.description);
    // Sende Alert an dein Team
  }
}

// Benachrichtigungen senden
await manager.sendChangeNotifications();
```

---

## 🤖 Automatisierung

### Cron-Job einrichten (täglich)

**Linux/Mac/Termux:**

```bash
# Crontab öffnen
crontab -e

# Täglich um 9:00 Uhr ausführen
0 9 * * * cd /path/to/LinktoFunnel && node ai-agent/agents/social-media-api-manager.js

# Alle 6 Stunden Health-Check
0 */6 * * * cd /path/to/LinktoFunnel && node ai-agent/agents/social-media-api-manager.js
```

**Node.js Scheduler (node-cron):**

```javascript
const cron = require('node-cron');
const { SocialMediaAPIManager } = require('./agents/social-media-api-manager');

// Täglich um 9:00 Uhr
cron.schedule('0 9 * * *', async () => {
  console.log('🔍 Running daily API check...');

  const manager = new SocialMediaAPIManager();
  await manager.initialize();
  await manager.syncAPIsToDatabase();
  await manager.checkAllAPIs();
  await manager.sendChangeNotifications();

  console.log('✅ Daily API check complete');
});

// Alle 6 Stunden Health-Check
cron.schedule('0 */6 * * *', async () => {
  const manager = new SocialMediaAPIManager();
  await manager.checkAllAPIs();
});
```

### Integration in Master Orchestrator

Der Agent ist bereits in den Master Orchestrator integriert:

```bash
# Führt täglich alle Agenten aus (inkl. API Manager)
node ai-agent/core/orchestrator.js
```

---

## 📊 Datenbank-Schema Übersicht

### Tabelle: `social_media_apis`

Speichert alle Social Media API Definitionen.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `platform` | TEXT | Plattform (tiktok, instagram, etc.) |
| `api_name` | TEXT | Name der API |
| `base_url` | TEXT | Base URL |
| `version` | TEXT | API Version |
| `docs_url` | TEXT | Dokumentations-Link |
| `auth_type` | TEXT | OAuth2, API Key, etc. |
| `endpoints` | JSONB | Array von Endpoints |
| `rate_limit` | JSONB | Rate Limit Informationen |
| `status` | TEXT | active, deprecated, changed |
| `last_checked` | TIMESTAMP | Letzte Überprüfung |

### Tabelle: `social_media_api_keys`

Verschlüsselte API-Keys.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `api_id` | UUID | Referenz zur API |
| `key_name` | TEXT | Name des Keys (production, test) |
| `encrypted_value` | TEXT | AES-256-GCM verschlüsselt |
| `encryption_iv` | TEXT | Initialization Vector |
| `encryption_auth_tag` | TEXT | Authentication Tag |
| `permissions` | JSONB | Berechtigungen |
| `expires_at` | TIMESTAMP | Ablaufdatum |
| `is_active` | BOOLEAN | Ist aktiv? |

### Tabelle: `social_media_api_changes`

Log aller API-Änderungen.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `api_id` | UUID | Referenz zur API |
| `change_type` | TEXT | version_update, endpoint_added, etc. |
| `old_value` | JSONB | Alter Wert |
| `new_value` | JSONB | Neuer Wert |
| `severity` | TEXT | low, medium, high, critical |
| `description` | TEXT | Beschreibung |
| `detected_at` | TIMESTAMP | Erkennungszeitpunkt |
| `notified` | BOOLEAN | Benachrichtigt? |
| `acknowledged` | BOOLEAN | Bestätigt? |

### Tabelle: `social_media_api_health`

Health-Check Ergebnisse.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `api_id` | UUID | Referenz zur API |
| `check_timestamp` | TIMESTAMP | Check-Zeitpunkt |
| `response_time_ms` | INTEGER | Antwortzeit in ms |
| `status_code` | INTEGER | HTTP Status Code |
| `is_available` | BOOLEAN | Verfügbar? |
| `error_message` | TEXT | Fehlermeldung |
| `rate_limit_remaining` | INTEGER | Verbleibende Requests |

### Tabelle: `social_media_api_usage`

API-Nutzungsstatistiken.

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primärschlüssel |
| `api_id` | UUID | Referenz zur API |
| `endpoint` | TEXT | Aufgerufener Endpoint |
| `method` | TEXT | GET, POST, etc. |
| `request_timestamp` | TIMESTAMP | Request-Zeitpunkt |
| `status_code` | INTEGER | HTTP Status Code |
| `success` | BOOLEAN | Erfolgreich? |
| `cost_units` | DECIMAL | API-Kosten |

---

## 🔐 Sicherheits-Best Practices

### 1. Encryption Key Management

**WICHTIG:** Der `API_ENCRYPTION_KEY` muss sicher aufbewahrt werden!

- ✅ Generiere einen starken 32-Byte Key
- ✅ Speichere ihn niemals in Git
- ✅ Verwende Umgebungsvariablen
- ✅ Rotiere den Key regelmäßig

**Key rotieren:**

```javascript
const oldKey = process.env.API_ENCRYPTION_KEY;
const newKey = crypto.randomBytes(32);

// Alle Keys mit neuem Key neu verschlüsseln
const { data: keys } = await supabase
  .from('social_media_api_keys')
  .select('*')
  .eq('is_active', true);

for (const key of keys) {
  // Mit altem Key entschlüsseln
  const decrypted = oldStorage.decrypt(key);

  // Mit neuem Key verschlüsseln
  const encrypted = newStorage.encrypt(decrypted);

  // In DB aktualisieren
  await supabase
    .from('social_media_api_keys')
    .update(encrypted)
    .eq('id', key.id);
}
```

### 2. Row Level Security

Die Supabase-Policies schützen deine Daten:

```sql
-- Nur authentifizierte Benutzer können API-Keys lesen
CREATE POLICY "Only authenticated users can read API keys"
  ON social_media_api_keys
  FOR SELECT
  USING (auth.role() = 'authenticated');
```

**Für Produktion anpassen:**

```sql
-- Nur spezifische Benutzer
CREATE POLICY "Only admins can read API keys"
  ON social_media_api_keys
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');
```

### 3. API-Key Berechtigungen

Vergib minimale Berechtigungen pro Key:

```javascript
await manager.storeAPIKey(apiId, 'read-only', apiKey, {
  read: true,
  write: false,
  delete: false,
  scopes: ['user.read', 'content.read']
});
```

### 4. Monitoring & Alerts

Überwache kritische Änderungen:

```javascript
// Bei kritischen Änderungen sofort benachrichtigen
const changes = await manager.getUnnotifiedChanges();

for (const change of changes) {
  if (change.severity === 'critical') {
    // Telegram Notification
    await bot.sendNotification('api_change', {
      apiName: change.social_media_apis.api_name,
      platform: change.social_media_apis.platform,
      changeType: change.change_type,
      severity: change.severity,
      description: change.description
    });

    // E-Mail Alert
    await sendEmail({
      to: 'admin@example.com',
      subject: `🔴 CRITICAL: ${change.social_media_apis.api_name} changed`,
      body: change.description
    });
  }
}
```

---

## 🎯 Nächste Schritte

1. **Schema installieren** (siehe Schritt 1)
2. **Umgebungsvariablen setzen** (siehe Schritt 2)
3. **Agent initialisieren** (siehe Schritt 3)
4. **Telegram Bot einrichten** (siehe Schritt 5)
5. **Cron-Job für tägliche Checks** einrichten
6. **API-Keys hinzufügen** für deine Social Media Accounts

---

## 📚 Ressourcen

### API-Dokumentationen

- **TikTok:** https://developers.tiktok.com/
- **Instagram:** https://developers.facebook.com/docs/instagram-api
- **YouTube:** https://developers.google.com/youtube/v3
- **Pinterest:** https://developers.pinterest.com/
- **Twitter/X:** https://developer.twitter.com/
- **LinkedIn:** https://learn.microsoft.com/en-us/linkedin/
- **Facebook:** https://developers.facebook.com/docs/graph-api

### Support

Bei Fragen oder Problemen:
- 📧 GitHub Issues: https://github.com/Samar220659/LinktoFunnel/issues
- 💬 Telegram: Nutze `/help` in deinem Bot

---

## 🎉 Fertig!

Dein Social Media API Manager ist jetzt einsatzbereit! 🚀

**Was er automatisch für dich macht:**
- ✅ Überwacht alle wichtigen Social Media APIs
- ✅ Benachrichtigt dich bei Änderungen
- ✅ Schützt deine API-Keys mit Verschlüsselung
- ✅ Stellt APIs über REST bereit
- ✅ Tracked Health und Uptime
- ✅ Integriert mit deinem Telegram Bot

**Viel Erfolg mit deinem automatisierten Business-System!** 💰
