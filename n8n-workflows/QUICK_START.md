# 🚀 N8N QUICK START - 5 SCHRITTE IN 30 MINUTEN

## SCHRITT 1: N8N Account (5 Min)

1. **Öffnen:** https://n8n.io
2. **Klicken:** "Start for Free"
3. **Wählen:** "n8n Cloud"
4. **Email registrieren** und bestätigen
5. **Fertig!** Sie sind im Dashboard

**Kosten:** $50/Monat (Pro Plan empfohlen)

---

## SCHRITT 2: Workflows importieren (2 Min)

Im n8n Dashboard:

1. **Klicken:** "+ Add workflow"
2. **Klicken:** "⋮" → "Import from File"
3. **Importieren Sie diese 4 Dateien:**
   - `1-master-orchestrator.json`
   - `2-traffic-scaling.json`
   - `3-lead-sales-process.json`
   - `4-payout-reporting.json`

---

## SCHRITT 3: Credentials einrichten (10 Min)

### Google Sheets
1. Settings → Credentials → "New Credential"
2. Wählen: "Google Sheets OAuth2 API"
3. "Sign in with Google"
4. Name: `google-sheets`

### Gemini AI
1. Öffnen: https://makersuite.google.com/app/apikey
2. "Create API Key"
3. In n8n: New Credential → "HTTP Header Auth"
4. Name: `gemini-api`
5. Header Name: `x-goog-api-key`
6. Header Value: Ihr Gemini API Key

### Telegram Bot
1. Telegram öffnen → @BotFather suchen
2. `/newbot` senden
3. In n8n: New Credential → "Telegram API"
4. Access Token: `7215449153:AAEZekOaNe1_j9kd0kEyytKh0L0ajrwqJqk`
5. Name: `telegram-bot`

### DigiStore24
1. Login: https://www.digistore24.com
2. Account → API → API Key erstellen
3. In n8n: New Credential → "HTTP Header Auth"
4. Name: `digistore24-api`
5. Header Name: `X-DS-API-Key`
6. Header Value: Ihr DigiStore24 API Key

---

## SCHRITT 4: Google Sheets erstellen (5 Min)

1. **Öffnen:** https://sheets.google.com
2. **Neues Sheet:** "ZZ Lobby Elite Dashboard"
3. **7 Tabs erstellen:**
   - KPIs
   - Products
   - Health_Log
   - Content_Schedule
   - Ad_Campaigns
   - Sales_Log
   - Daily_Reports

4. **Sheet ID kopieren:**
   - URL: `https://docs.google.com/spreadsheets/d/1ABC...XYZ/edit`
   - Kopieren: Der Teil zwischen `/d/` und `/edit`

### KPIs Tab - Zeile 1 (Header):
```
conversion_rate | daily_revenue | monthly_revenue | active_campaigns | last_updated
```

### KPIs Tab - Zeile 2 (Beispiel-Daten):
```
12.5 | 150 | 3500 | 5 | 2025-10-25
```

### Products Tab - Zeile 1:
```
product_id | product_name | product_url | niche | conversion_rate | commission
```

### Products Tab - Zeile 2 (Ihr DigiStore24 Produkt):
```
529808 | Viral Cash Machine | https://www.digistore24.com/product/529808 | make money online | 15.2 | 47.00
```

**Andere Tabs:** Nur Header-Zeilen, Rest wird automatisch gefüllt!

---

## SCHRITT 5: Workflows konfigurieren (5 Min)

**In JEDEM der 4 Workflows:**

1. Workflow öffnen
2. Strg+F drücken
3. Suchen: `YOUR_GOOGLE_SHEET_ID`
4. Ersetzen mit: Ihrer Sheet ID
5. Suchen: `YOUR_TELEGRAM_CHAT_ID`
6. Ersetzen mit: `6982601388`
7. Speichern

**Dann:**

1. Workflow 2 aktivieren (Toggle auf "Active")
2. Workflow 3 aktivieren
3. Workflow 4 aktivieren
4. Workflow 1 aktivieren (ZULETZT!)

---

## 🎉 FERTIG!

**Ihr System läuft jetzt!**

### Was passiert jetzt automatisch:

- **Alle 5 Min:** Balance Check + Health Score
- **Bei gutem Performance:** Landing Pages + Content generiert
- **Bei jedem Sale:** Telegram Notification + Datenbank-Eintrag
- **Täglich 8:00:** Report + Payout (wenn >= €50)

### Erste Schritte:

1. **Telegram öffnen:** Warten auf erste Nachricht vom Bot
2. **Google Sheets öffnen:** Daten fließen sehen
3. **Mehr Produkte hinzufügen:** Products Tab ausfüllen
4. **Geld verdienen!** 💰

---

## 🆘 PROBLEME?

### Telegram funktioniert nicht
- Bot-Token korrekt?
- Chat ID korrekt? (6982601388)
- Bot gestartet? (/start an Bot senden)

### Google Sheets Error
- Sheet ID korrekt kopiert?
- Tab-Namen EXAKT richtig? (Case-sensitive!)
- Google Sheets Credential autorisiert?

### Workflow startet nicht
- "Execute Workflow" klicken zum Testen
- Error-Message lesen
- Meist: Credential fehlt

---

## 📱 SUPPORT

- N8N Docs: https://docs.n8n.io
- N8N Community: https://community.n8n.io

**Viel Erfolg! 🚀💸**
