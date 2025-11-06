# 📋 VERARBEITUNGSVERZEICHNIS (RoPA)
## Record of Processing Activities - DSGVO Art. 30

**Stand:** 06.11.2025
**Verantwortlicher:** Daniel Oettel
**Kontakt:** a22061981@gmx.de

---

## ⚠️ WICHTIG: DSGVO-PFLICHT!

Dieses Dokument ist **gesetzlich verpflichtend** gemäß **DSGVO Art. 30**.

**Strafe bei Fehlen:** Bis zu €10.000.000 oder 2% des Jahresumsatzes!

**Was Sie tun müssen:**
1. ✅ Ersetzen Sie alle {Platzhalter} mit Ihren echten Daten
2. ✅ Fügen Sie ALLE Verarbeitungstätigkeiten hinzu (auch neue Tools!)
3. ✅ Aktualisieren Sie dieses Dokument bei Änderungen (mindestens jährlich)
4. ✅ Halten Sie es für Datenschutzbehörden bereit (kann jederzeit angefordert werden)

---

## 1️⃣ VERARBEITUNGSTÄTIGKEIT: Website-Betrieb

### 1.1 Zweck der Verarbeitung
- Bereitstellung der Website
- Gewährleistung der IT-Sicherheit
- Analyse des Nutzerverhaltens

### 1.2 Kategorien betroffener Personen
- Website-Besucher
- Potenzielle Kunden
- Newsletter-Abonnenten

### 1.3 Kategorien personenbezogener Daten
- IP-Adresse
- Browsertyp und -version
- Betriebssystem
- Referrer URL
- Uhrzeit des Zugriffs
- E-Mail-Adresse (bei Newsletter-Anmeldung)
- Name (bei Kontaktaufnahme)

### 1.4 Kategorien von Empfängern
- Hosting-Provider: Render.com (USA)
- CDN-Provider: {Falls vorhanden}
- IT-Dienstleister: {Falls vorhanden}

### 1.5 Übermittlung an Drittländer
- ✅ NEIN (empfohlen: nur EU-Server nutzen)
- ⚠️ FALLS JA: {Land}, {Rechtsgrundlage: Standardvertragsklauseln / Angemessenheitsbeschluss}

### 1.6 Löschfristen
- Server-Logfiles: 7 Tage
- Cookie-Daten: Gemäß Cookie-Einstellungen (max. 12 Monate)
- Newsletter-Daten: Bis zum Widerruf der Einwilligung

### 1.7 Technische und organisatorische Maßnahmen
Siehe: [TOM.md](./TOM.md)

### 1.8 Rechtsgrundlage
- Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse - Betrieb der Website)
- Art. 6 Abs. 1 lit. a DSGVO (Einwilligung - bei Cookies/Newsletter)

---

## 2️⃣ VERARBEITUNGSTÄTIGKEIT: Social Media Marketing

### 2.1 Zweck der Verarbeitung
- Automatisierte Social Media Content-Erstellung
- Affiliate-Marketing über Social Media
- Verwaltung Social Media Accounts

### 2.2 Kategorien betroffener Personen
- Social Media Nutzer (Follower, Kommentatoren)
- Kunden über Affiliate-Links

### 2.3 Kategorien personenbezogener Daten
- Social Media Profilnamen
- Interaktionsdaten (Likes, Kommentare)
- Klick-Daten (Affiliate-Links)
- IP-Adressen (beim Klick auf Links)

### 2.4 Kategorien von Empfängern
- **Buffer:** {https://buffer.com} - Social Media Management USA
  - Rechtsgrundlage Drittland: Standardvertragsklauseln (EU-US Data Privacy Framework)
- **Ayrshare:** {https://ayrshare.com} - Social Media Posting
  - Rechtsgrundlage Drittland: {Prüfen und eintragen}
- **Social Media Plattformen:**
  - TikTok (China/Singapur) - Nutzung unter eigener Verantwortung
  - Instagram/Facebook (USA - Meta) - EU-US Data Privacy Framework
  - YouTube (USA - Google) - EU-US Data Privacy Framework
  - Pinterest (USA) - EU-US Data Privacy Framework
  - LinkedIn (USA - Microsoft) - EU-US Data Privacy Framework
  - Twitter/X (USA) - EU-US Data Privacy Framework

### 2.5 Übermittlung an Drittländer
- ⚠️ JA - USA (siehe Empfänger oben)
- Rechtsgrundlage:
  - EU-US Data Privacy Framework (für Meta, Google, Microsoft)
  - Standardvertragsklauseln (für Buffer)
  - {Für andere Dienste prüfen und dokumentieren!}

### 2.6 Löschfristen
- Content-Daten in Datenbank: Bis zur Löschung des Accounts
- Klick-Daten: 30 Tage
- Social Media Posts: Gemäß Plattform-Richtlinien

### 2.7 Technische und organisatorische Maßnahmen
Siehe: [TOM.md](./TOM.md)

### 2.8 Rechtsgrundlage
- Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse - Marketing)
- Art. 6 Abs. 1 lit. a DSGVO (Einwilligung - Social Media Nutzer)

---

## 3️⃣ VERARBEITUNGSTÄTIGKEIT: Datenbank & Backend (Supabase)

### 3.1 Zweck der Verarbeitung
- Speicherung von Produktdaten
- Speicherung von generierten Inhalten
- Verwaltung von API-Keys (verschlüsselt)
- Nutzer-Authentifizierung (falls vorhanden)

### 3.2 Kategorien betroffener Personen
- Website-Administratoren
- Affiliate-Partner (DigiStore24)

### 3.3 Kategorien personenbezogener Daten
- E-Mail-Adressen (bei Auth)
- Verschlüsselte API-Keys
- Produktdaten (ohne personenbezogene Daten)
- Content-Generierungs-Historie
- IP-Adressen (bei API-Zugriff)

### 3.4 Kategorien von Empfängern
- **Supabase:** {https://supabase.com} - Database-as-a-Service
  - Server-Standort: {EU/USA - in Supabase Projekteinstellungen prüfen!}
  - **WICHTIG:** Wenn USA → EU-US Data Privacy Framework oder Standardvertragsklauseln

### 3.5 Übermittlung an Drittländer
- {Abhängig von Supabase Server-Region - PRÜFEN!}
- Falls USA: EU-US Data Privacy Framework oder Standardvertragsklauseln

### 3.6 Löschfristen
- Produktdaten: Solange Affiliate-Programm aktiv
- API-Keys: Bei Deaktivierung oder Ablauf
- Generierte Inhalte: 90 Tage nach Veröffentlichung
- Auth-Daten: Bis zur Löschung des Accounts

### 3.7 Technische und organisatorische Maßnahmen
Siehe: [TOM.md](./TOM.md)
- **Besonders wichtig:** AES-256-GCM Verschlüsselung für API-Keys

### 3.8 Rechtsgrundlage
- Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)
- Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)

---

## 4️⃣ VERARBEITUNGSTÄTIGKEIT: KI-Content-Generierung (Gemini AI)

### 4.1 Zweck der Verarbeitung
- Automatische Generierung von Marketing-Content
- Automatische Generierung von Social Media Posts
- Text- und Bild-Optimierung

### 4.2 Kategorien betroffener Personen
- Keine direkten personenbezogenen Daten

### 4.3 Kategorien personenbezogener Daten
- **Achtung:** Produkt-Informationen werden an KI gesendet
- Keine Nutzer-Daten werden verarbeitet
- **WICHTIG:** Niemals personenbezogene Daten in Prompts senden!

### 4.4 Kategorien von Empfängern
- **Google Gemini AI:** {https://ai.google.dev} - USA
  - Server-Standort: USA
  - Rechtsgrundlage: EU-US Data Privacy Framework

### 4.5 Übermittlung an Drittländer
- ⚠️ JA - USA (Google)
- Rechtsgrundlage: EU-US Data Privacy Framework

### 4.6 Löschfristen
- Prompts: Gemäß Google Gemini Datenschutzerklärung
  - **WICHTIG:** Google speichert möglicherweise Anfragen zur Verbesserung des Modells
  - Details: https://support.google.com/gemini/answer/13594961

### 4.7 Technische und organisatorische Maßnahmen
- API-Key Verschlüsselung
- Keine personenbezogenen Daten in Prompts
- Prompt-Validierung vor Versand
- Content-Moderation nach Generierung

### 4.8 Rechtsgrundlage
- Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse - Marketing)

### 4.9 EU AI Act Compliance
- ✅ KI-Content wird als "KI-generiert" gekennzeichnet (Art. 50 EU AI Act)
- ✅ Transparenz-Anforderungen erfüllt

---

## 5️⃣ VERARBEITUNGSTÄTIGKEIT: Zahlungsabwicklung (PayPal)

### 5.1 Zweck der Verarbeitung
- Abwicklung von Affiliate-Provisionen
- Zahlungsempfang

### 5.2 Kategorien betroffener Personen
- Affiliate-Partner (Sie selbst)
- Kunden (bei Direct Sales)

### 5.3 Kategorien personenbezogener Daten
- Name
- E-Mail-Adresse
- PayPal-Account-Daten
- Transaktionsdaten
- Rechnungsdaten

### 5.4 Kategorien von Empfängern
- **PayPal:** {https://paypal.com} - USA
  - Server-Standort: USA & EU
  - Rechtsgrundlage: EU-US Data Privacy Framework + Standardvertragsklauseln

### 5.5 Übermittlung an Drittländer
- ⚠️ JA - USA (PayPal)
- Rechtsgrundlage:
  - EU-US Data Privacy Framework
  - Standardvertragsklauseln (PayPal bietet diese an)
  - Details: https://www.paypal.com/de/webapps/mpp/ua/privacy-full

### 5.6 Löschfristen
- Transaktionsdaten: Gemäß gesetzlicher Aufbewahrungspflichten (10 Jahre)
- Rechnungsdaten: 10 Jahre (§ 147 AO)

### 5.7 Technische und organisatorische Maßnahmen
- PayPal ist PCI-DSS zertifiziert
- Webhooks über HTTPS
- Signatur-Verifizierung

### 5.8 Rechtsgrundlage
- Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)
- Art. 6 Abs. 1 lit. c DSGVO (rechtliche Verpflichtung - Aufbewahrung)

---

## 6️⃣ VERARBEITUNGSTÄTIGKEIT: Affiliate-Marketing (DigiStore24)

### 6.1 Zweck der Verarbeitung
- Vermittlung von Produkten
- Provision bei Verkäufen
- Tracking von Affiliate-Links

### 6.2 Kategorien betroffener Personen
- Kunden über Affiliate-Links
- Sie selbst als Affiliate-Partner

### 6.3 Kategorien personenbezogener Daten
- Click-IDs
- IP-Adressen (für Tracking)
- Kaufverhalten
- E-Mail-Adresse (bei Kauf)
- Rechnungsdaten (bei Provision)

### 6.4 Kategorien von Empfängern
- **DigiStore24:** {https://digistore24.com} - Deutschland
  - Server-Standort: Deutschland (DSGVO-konform!)

### 6.5 Übermittlung an Drittländer
- ✅ NEIN - Alles in Deutschland!

### 6.6 Löschfristen
- Tracking-Cookies: 30 Tage
- Provisionsabrechnungen: 10 Jahre (§ 147 AO)

### 6.7 Technische und organisatorische Maßnahmen
- Siehe DigiStore24 Auftragsverarbeitungsvertrag (AVV)
- **WICHTIG:** AVV mit DigiStore24 abschließen!

### 6.8 Rechtsgrundlage
- Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse - Affiliate-Marketing)
- Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)

---

## 7️⃣ VERARBEITUNGSTÄTIGKEIT: Kommunikation (Telegram Bot)

### 7.1 Zweck der Verarbeitung
- Automatische Benachrichtigungen
- System-Monitoring
- Reporting

### 7.2 Kategorien betroffener Personen
- Website-Administratoren
- Bot-Nutzer

### 7.3 Kategorien personenbezogener Daten
- Telegram User-ID
- Telegram Username
- Chat-Nachrichten
- Bot-Kommandos

### 7.4 Kategorien von Empfängern
- **Telegram:** {https://telegram.org} - Dubai/Türkei
  - Server-Standort: Weltweit verteilt
  - **ACHTUNG:** Kein Angemessenheitsbeschluss!

### 7.5 Übermittlung an Drittländer
- ⚠️ JA - Verschiedene Länder (Telegram)
- **Problem:** Telegram bietet KEINE Standardvertragsklauseln
- **Lösung:**
  - Nur auf Einwilligung basieren (Art. 49 Abs. 1 lit. a DSGVO)
  - Alternative: Verzicht auf Telegram, Nutzung von EU-Diensten (z.B. Rocket.Chat)

### 7.6 Löschfristen
- Bot-Nachrichten: Sofort nach Zustellung
- User-IDs: Bis zur Deaktivierung des Bots

### 7.7 Technische und organisatorische Maßnahmen
- Minimierung übertragener Daten
- Keine sensiblen Daten über Telegram
- Verschlüsselung (durch Telegram)

### 7.8 Rechtsgrundlage
- Art. 6 Abs. 1 lit. a DSGVO (Einwilligung - bei Bot-Nutzung)
- Art. 49 Abs. 1 lit. a DSGVO (Ausnahme für Drittland-Übermittlung)

---

## 📋 ZUSAMMENFASSUNG DER EMPFÄNGER

### ✅ EU/Deutschland (DSGVO-konform):
- DigiStore24 (Deutschland)
- Render.com (USA)

### ⚠️ USA (EU-US Data Privacy Framework):
- Google Gemini AI
- Meta (Instagram, Facebook)
- Google (YouTube)
- Microsoft (LinkedIn)
- PayPal
- Buffer

### 🔴 Sonstige Drittländer:
- Telegram (Dubai/Türkei) → Nur mit Einwilligung!
- TikTok (China/Singapur) → Unter eigener Verantwortung

---

## 🔄 AKTUALISIERUNGSPROTOKOLL

| Datum | Änderung | Durchgeführt von |
|-------|----------|------------------|
| 06.11.2025 | Initiale Erstellung | Daniel Oettel |
| 06.11.2025 | {Änderung} | Daniel Oettel |

---

## ✅ CHECKLISTE: RoPA VOLLSTÄNDIG?

- [ ] Alle Verarbeitungstätigkeiten dokumentiert
- [ ] Alle externen Tools/Dienste aufgeführt
- [ ] Drittland-Übermittlungen mit Rechtsgrundlage
- [ ] Löschfristen festgelegt
- [ ] Rechtsgrundlagen korrekt
- [ ] TOM.md verlinkt
- [ ] Platzhalter {xxx} ersetzt
- [ ] Aktuelles Datum eingetragen
- [ ] Verantwortlicher benannt
- [ ] Regelmäßige Aktualisierung geplant

---

## 📚 WEITERE PFLICHTEN

**Zusätzlich zur RoPA benötigen Sie:**

1. ✅ **Auftragsverarbeitungsverträge (AVV)** mit:
   - Hosting-Provider
   - Supabase
   - Buffer
   - Ayrshare
   - DigiStore24
   - PayPal

2. ✅ **Datenschutz-Folgenabschätzung (DSFA)** bei:
   - Systematischer Profilbildung
   - Großflächiger Verarbeitung sensibler Daten
   - {In Ihrem Fall wahrscheinlich NICHT erforderlich, aber prüfen!}

3. ✅ **Datenschutzbeauftragter (DSB)**:
   - Pflicht bei: 20+ Personen mit regelmäßiger Datenverarbeitung
   - {Für Solo-Selbstständige meist NICHT erforderlich}

---

## 🆘 HILFE & BERATUNG

**Bei Unsicherheiten:**
- Konsultieren Sie einen Datenschutzbeauftragten
- Nutzen Sie die kostenlose Beratung Ihrer IHK
- Informieren Sie sich: https://www.datenschutz.de/

**Achtung:** Dieses Dokument ist eine Vorlage. Es ersetzt KEINE rechtliche Beratung!

---

**Stand:** 06.11.2025
**Nächste Aktualisierung:** 06.11.2026
