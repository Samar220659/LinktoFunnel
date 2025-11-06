# 🔒 TECHNISCHE UND ORGANISATORISCHE MAẞNAHMEN (TOM)
## Technical and Organizational Measures - DSGVO Art. 32

**Stand:** {Aktuelles Datum eintragen}
**Verantwortlicher:** {Ihr Name / Firma}
**System:** LinktoFunnel - AI-Powered Social Media Marketing System

---

## ⚠️ WICHTIG: DSGVO-PFLICHT!

Dieses Dokument ist **gesetzlich verpflichtend** gemäß **DSGVO Art. 32**.

**Strafe bei Fehlen:** Bis zu €10.000.000 oder 2% des Jahresumsatzes!

**Was Sie tun müssen:**
1. ✅ Dokumentieren Sie ALLE Sicherheitsmaßnahmen
2. ✅ Aktualisieren Sie bei technischen Änderungen
3. ✅ Überprüfen Sie regelmäßig (mindestens jährlich)
4. ✅ Halten Sie es für Datenschutzbehörden bereit

---

## 1️⃣ VERTRAULICHKEIT (Art. 32 Abs. 1 lit. b DSGVO)

### 1.1 Zutrittskontrolle

**Ziel:** Unbefugten Zugang zu Datenverarbeitungsanlagen verhindern

**Implementierte Maßnahmen:**

#### Physischer Zugang
- ✅ **Hosting in professionellen Rechenzentren**
  - Provider: {Ihr Hosting-Provider - z.B. Railway, Vercel, Render}
  - Zertifizierungen: {ISO 27001, SOC 2 - beim Provider prüfen}
  - Physische Sicherheit: Biometrischer Zugang, 24/7 Überwachung
  - Details: {Link zur Security-Dokumentation des Providers}

#### Lokaler Zugang (falls Server lokal)
- ⚠️ **Falls Server lokal betrieben:**
  - Abgeschlossener Serverraum
  - Zutrittskontrolle (Schlüssel/Karte)
  - Zutrittsliste führen

**Status:** ✅ Implementiert durch Cloud-Hosting

---

### 1.2 Zugangskontrolle

**Ziel:** Unbefugte Nutzung von Datenverarbeitungssystemen verhindern

**Implementierte Maßnahmen:**

#### Betriebssystem-Ebene
- ✅ **Linux Server mit SSH-Zugang**
  - SSH-Key-basierte Authentifizierung (keine Passwörter!)
  - Deaktivierte Root-Anmeldung
  - Fail2Ban für Brute-Force-Schutz
  - UFW Firewall aktiv

```bash
# Beispiel SSH-Konfiguration
PasswordAuthentication no
PermitRootLogin no
PubkeyAuthentication yes
```

#### Applikations-Ebene (Supabase)
- ✅ **Row Level Security (RLS)**
  - Aktiviert für alle Tabellen
  - Policies für authenticated/anon roles
  - API-Zugriff nur mit gültigen Keys

```sql
-- Beispiel RLS Policy
ALTER TABLE social_media_apis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read APIs"
  ON social_media_apis
  FOR SELECT
  USING (auth.role() = 'authenticated');
```

#### Admin-Zugang
- ✅ **Supabase Dashboard**
  - Multi-Faktor-Authentifizierung (2FA) empfohlen!
  - Starke Passwörter (min. 16 Zeichen, Passwort-Manager)
  - Regelmäßiger Passwort-Wechsel (alle 90 Tage)

- ✅ **GitHub Repository**
  - 2FA aktiviert
  - Protected Branches (Main)
  - Code Review erforderlich für Merges

**Status:** ✅ Implementiert

**TODO:**
- [ ] 2FA für alle Admin-Accounts aktivieren (falls noch nicht)
- [ ] Passwort-Manager nutzen (Empfehlung: Bitwarden, 1Password)

---

### 1.3 Zugriffskontrolle

**Ziel:** Sicherstellen, dass Berechtigte nur auf für sie bestimmte Daten zugreifen können

**Implementierte Maßnahmen:**

#### API-Ebene
- ✅ **Verschlüsselte API-Keys (AES-256-GCM)**
  - Encryption Key: 32-Byte (256-bit) zufällig generiert
  - IV (Initialization Vector): Pro Verschlüsselung einzigartig
  - Auth Tag: Für Integritätsprüfung
  - Storage: Supabase mit RLS

```javascript
// Beispiel aus ai-agent/utils/secure-storage.js
class SecureStorage {
  encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return {
      encrypted: encrypted,
      iv: iv.toString('hex'),
      authTag: cipher.getAuthTag().toString('hex')
    };
  }
}
```

#### Rollen-basierte Zugriffskontrolle (RBAC)
- ✅ **Supabase RLS Policies**
  - `anon` Role: Nur öffentliche API-Infos lesen
  - `authenticated` Role: API-Verwaltung
  - `service_role`: Voller Admin-Zugriff (nur Backend!)

#### API-Berechtigungen
- ✅ **Granulare Permissions**
  - Gespeichert in `social_media_api_keys.permissions` (JSONB)
  - Beispiel: `{"read": true, "write": false, "delete": false}`

**Status:** ✅ Implementiert

---

### 1.4 Trennungskontrolle

**Ziel:** Zu unterschiedlichen Zwecken erhobene Daten getrennt verarbeiten

**Implementierte Maßnahmen:**

#### Datenbank-Ebene
- ✅ **Getrennte Tabellen nach Zweck**
  - `social_media_apis` - API-Registry
  - `social_media_api_keys` - Credentials (verschlüsselt)
  - `social_media_api_changes` - Änderungsprotokoll
  - `social_media_api_health` - Monitoring
  - `social_media_api_usage` - Statistiken
  - `digistore_products` - Produktdaten
  - `generated_content` - AI-Content

#### Environment-Trennung
- ✅ **Separate Umgebungen**
  - Development: `.env.local` (lokal)
  - Production: Environment Variables auf Server
  - KEINE produktiven Daten in Development!

#### API-Key Trennung
- ✅ **Separate Keys pro Service**
  - Social Media APIs: Eigene Keys
  - Payment APIs: Eigene Keys
  - AI APIs: Eigene Keys
  - Keine Wiederverwendung!

**Status:** ✅ Implementiert

---

### 1.5 Pseudonymisierung

**Ziel:** Personenbezogene Daten nicht mehr ohne zusätzliche Informationen zuordbar

**Implementierte Maßnahmen:**

#### Server-Logs
- ✅ **IP-Adressen gekürzt**
  - Letztes Oktett entfernt (192.168.1.X → 192.168.1.0)
  - Anonymisierung nach 24 Stunden

#### Analytics
- ⚠️ **Aktueller Status:**
  - Keine Analytics implementiert (gut für Datenschutz!)
  - Falls geplant: Privacy-freundliche Alternative nutzen (z.B. Plausible, Fathom)

**Status:** ✅ Grundsätzlich implementiert (durch Verzicht auf Tracking)

---

## 2️⃣ INTEGRITÄT (Art. 32 Abs. 1 lit. b DSGVO)

### 2.1 Weitergabekontrolle

**Ziel:** Verhindern, dass Daten unbefugt übermittelt oder transportiert werden

**Implementierte Maßnahmen:**

#### Netzwerk-Sicherheit
- ✅ **HTTPS/TLS für alle Verbindungen**
  - TLS 1.3 (modern browsers)
  - HSTS Header aktiviert
  - SSL Certificates von Let's Encrypt (kostenlos!)

```javascript
// Beispiel: HTTPS-erzwingung in Next.js
// headers in next.config.js:
{
  key: 'Strict-Transport-Security',
  value: 'max-age=31536000; includeSubDomains'
}
```

#### API-Kommunikation
- ✅ **Verschlüsselte API-Calls**
  - Alle externen APIs: HTTPS
  - API-Keys in Headers (nicht in URL!)
  - Webhook-Signaturen verifiziert (PayPal)

#### E-Mail-Sicherheit
- ⚠️ **Falls E-Mail-Versand:**
  - TLS-verschlüsselt
  - SPF/DKIM/DMARC konfiguriert
  - {E-Mail-Provider eintragen}

**Status:** ✅ Implementiert

---

### 2.2 Eingabekontrolle

**Ziel:** Nachvollziehbar machen, wer wann welche Daten eingegeben/verändert/gelöscht hat

**Implementierte Maßnahmen:**

#### Audit-Logging
- ✅ **Timestamps in allen Tabellen**
  ```sql
  created_at TIMESTAMP DEFAULT NOW()
  updated_at TIMESTAMP DEFAULT NOW()
  last_used_at TIMESTAMP
  ```

- ✅ **Change-Log Tabelle**
  - `social_media_api_changes` protokolliert:
    - Welche API geändert wurde
    - Art der Änderung (version_update, endpoint_changed, etc.)
    - Wann (timestamp)
    - Severity (low, medium, high, critical)

#### Datenbank-Trigger
- ✅ **Auto-Update Timestamps**
  ```sql
  CREATE TRIGGER update_updated_at_timestamp
  BEFORE UPDATE ON social_media_apis
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
  ```

#### Application-Logs
- ✅ **Console Logging**
  - Alle wichtigen Aktionen geloggt
  - Compliance-Ereignisse protokolliert
  - Fehler mit Stack-Trace

**Status:** ✅ Implementiert

**Verbesserung möglich:**
- [ ] Zentrales Logging-System (z.B. Sentry für Fehler-Tracking)
- [ ] User-ID Tracking (falls Multi-User-System)

---

## 3️⃣ VERFÜGBARKEIT UND BELASTBARKEIT (Art. 32 Abs. 1 lit. b DSGVO)

### 3.1 Verfügbarkeitskontrolle

**Ziel:** Schutz vor Datenverlust und Sicherstellung der Verfügbarkeit

**Implementierte Maßnahmen:**

#### Backups
- ✅ **Supabase Automated Backups**
  - Tägliche automatische Backups
  - Point-in-Time Recovery (je nach Plan)
  - Geo-redundante Speicherung
  - Details: {Supabase Dashboard → Database → Backups}

- ⚠️ **Manuelle Code-Backups**
  - Git Repository auf GitHub
  - KEIN Backup von .env Dateien!

#### Redundanz
- ✅ **Cloud-Hosting mit Auto-Scaling**
  - Automatisches Failover
  - Load Balancing (bei Provider)
  - Multi-Region (optional, bei Provider prüfen)

#### Monitoring
- ✅ **Health Checks implementiert**
  - `social_media_api_health` Tabelle
  - Regelmäßige API-Verfügbarkeits-Checks
  - Response-Time Tracking

- ✅ **Telegram Bot Alerts**
  - Benachrichtigung bei Ausfällen
  - Kritische Änderungen werden gemeldet

**Status:** ✅ Implementiert

**Verbesserung möglich:**
- [ ] Uptime-Monitoring (z.B. UptimeRobot - kostenlos!)
- [ ] Externe Backup-Strategie (z.B. wöchentlicher DB-Export)

---

### 3.2 Schnelle Wiederherstellbarkeit

**Ziel:** Schnelle Wiederherstellung bei Zwischenfällen

**Implementierte Maßnahmen:**

#### Disaster Recovery Plan
- ⚠️ **Aktuell:**
  - Supabase Point-in-Time Recovery
  - Git Repository Restore
  - Environment Variables dokumentiert

- **Recovery Time Objective (RTO):** < 4 Stunden
  - Code: Minuten (Git)
  - Datenbank: 1-2 Stunden (Supabase Restore)
  - Environment: 30 Minuten (neu deployen)

- **Recovery Point Objective (RPO):** < 24 Stunden
  - Tägliche DB-Backups

#### Dokumentation
- ✅ **Deployment-Dokumentation vorhanden**
  - `RAILWAY_DEPLOYMENT.md`
  - `RENDER_DEPLOY.md`
  - `QUICK_START.md`

**Status:** ⚠️ Basis implementiert

**TODO:**
- [ ] Disaster Recovery Runbook erstellen
- [ ] Backup-Restore testen (1x pro Quartal)
- [ ] Notfall-Kontakte dokumentieren

---

## 4️⃣ VERFAHREN ZUR ÜBERPRÜFUNG, BEWERTUNG & EVALUIERUNG

### 4.1 Datenschutz-Management

**Ziel:** Regelmäßige Überprüfung der Wirksamkeit der TOM

**Implementierte Maßnahmen:**

#### Regelmäßige Reviews
- **Geplante Reviews:**
  - Monatlich: Sicherheits-Logs prüfen
  - Quartalsweise: Backup-Restore testen
  - Jährlich: Vollständige TOM-Überprüfung
  - Jährlich: RoPA aktualisieren

#### Compliance-Automatisierung
- ✅ **Legal Compliance Modul**
  - Automatische Affiliate-Kennzeichnung
  - Automatische AI-Content-Labels
  - Content-Moderation (NetzDG-Basis)
  - Compliance-Reports werden generiert

#### Incident Response
- ⚠️ **Aktuell:**
  - Telegram Alerts bei kritischen Problemen
  - Manuelle Prüfung bei Auffälligkeiten

- **TODO:**
  - [ ] Incident Response Plan erstellen
  - [ ] Meldepflichten dokumentieren (72h bei Data Breach!)

**Status:** ⚠️ Teilweise implementiert

---

### 4.2 Datenschutz durch Technikgestaltung (Privacy by Design)

**Implementiert:**

#### Datenminimierung
- ✅ **Nur notwendige Daten sammeln**
  - Keine unnötigen User-Tracking
  - Keine Analytics (aktuell)
  - API-Keys nur wenn benötigt

#### Privacy by Default
- ✅ **Sichere Defaults**
  - RLS aktiviert per default
  - HTTPS erzwungen
  - Strict Cookie-Consent
  - Opt-in für alle nicht-essentiellen Cookies

#### Verschlüsselung
- ✅ **End-to-End wo möglich**
  - API-Keys verschlüsselt (AES-256-GCM)
  - HTTPS für alle Verbindungen
  - Verschlüsselte Datenbank-Verbindungen

**Status:** ✅ Implementiert

---

### 4.3 Auftragsverarbeitung

**Ziel:** Sicherstellen dass Auftragsverarbeiter DSGVO-konform arbeiten

**Auftragsverarbeiter (AVV erforderlich):**

1. ✅ **Supabase** (Datenbank)
   - AVV vorhanden: {Ja/Nein - prüfen!}
   - Link: https://supabase.com/privacy

2. ✅ **{Ihr Hosting-Provider}**
   - AVV vorhanden: {Ja/Nein - prüfen!}
   - Link: {URL zur DPA eintragen}

3. ⚠️ **Google Gemini AI**
   - AVV vorhanden: Prüfen bei https://cloud.google.com/terms/data-processing-terms
   - WICHTIG: Keine personenbezogenen Daten in Prompts!

4. ⚠️ **Buffer**
   - AVV vorhanden: {Prüfen und Link eintragen}

5. ⚠️ **Ayrshare**
   - AVV vorhanden: {Prüfen und Link eintragen}

6. ✅ **PayPal**
   - AVV vorhanden: https://www.paypal.com/de/webapps/mpp/ua/privacy-full
   - DPA: https://www.paypal.com/de/webapps/mpp/ua/dpa

7. ✅ **DigiStore24**
   - AVV vorhanden: Im Account verfügbar
   - Kontakt: support@digistore24.com

**Status:** ⚠️ Teilweise abgeschlossen

**TODO:**
- [ ] AVV mit allen Diensten abschließen
- [ ] AVV-Dokumente archivieren
- [ ] Jährlich AVV überprüfen

---

## 5️⃣ ORGANISATORISCHE MAẞNAHMEN

### 5.1 Interne Datenschutz-Organisation

**Rollen & Verantwortlichkeiten:**

- **Verantwortlicher (Art. 4 Nr. 7 DSGVO):**
  - Name: {Ihr Name}
  - E-Mail: {Ihre E-Mail}
  - Aufgaben: Gesamtverantwortung für Datenschutz

- **Datenschutzbeauftragter (DSB):**
  - ⚠️ Aktuell: Nicht bestellt (bei <20 Mitarbeitern meist nicht erforderlich)
  - Falls erforderlich: Extern beauftragen

**Status:** ✅ Ausreichend für Solo-Betrieb

---

### 5.2 Schulung & Awareness

**Maßnahmen:**

- **Selbst-Schulung:**
  - Datenschutz-Grundlagen verstehen
  - DSGVO-Anforderungen kennen
  - Regelmäßige Updates verfolgen

- **Ressourcen:**
  - https://www.bfdi.bund.de/DE/Home/home_node.html
  - https://www.datenschutz.de/
  - https://noyb.eu/

**Status:** ⚠️ Selbstverantwortung

**TODO:**
- [ ] Jährlicher Datenschutz-Check (Checkliste abarbeiten)
- [ ] Bei Unsicherheiten: Fachanwalt konsultieren

---

### 5.3 Incident Response

**Bei Datenpannen (Data Breach):**

1. **Sofort:** Vorfall dokumentieren
   - Was ist passiert?
   - Welche Daten betroffen?
   - Wie viele Personen betroffen?

2. **Binnen 72 Stunden:** Meldung an Aufsichtsbehörde
   - In Deutschland: Landesdatenschutzbeauftragter
   - Formular: https://www.bfdi.bund.de/

3. **Betroffene informieren:**
   - Falls hohes Risiko für Betroffene
   - Per E-Mail unverzüglich

4. **Maßnahmen ergreifen:**
   - Sicherheitslücke schließen
   - TOM aktualisieren
   - Vorfall dokumentieren

**Notfall-Kontakte:**
- Aufsichtsbehörde: {Ihr Bundesland eintragen}
- Rechtsanwalt: {Falls vorhanden}

---

## ✅ TOM-CHECKLISTE

### Technisch:
- [x] Zutrittskontrolle (Cloud-Hosting)
- [x] Zugangskontrolle (SSH, 2FA)
- [x] Zugriffskontrolle (RLS, API-Keys)
- [x] Trennungskontrolle (Separate Tabellen)
- [x] Pseudonymisierung (IP-Kürzung)
- [x] Verschlüsselung (AES-256, HTTPS)
- [x] Backups (Supabase automatisch)
- [x] Monitoring (Health Checks)
- [x] Logging (Timestamps, Changes)

### Organisatorisch:
- [x] Verantwortlicher benannt
- [ ] AVV mit allen Diensten (teilweise)
- [ ] Datenschutzbeauftragter (nicht erforderlich)
- [ ] Incident Response Plan (in Arbeit)
- [ ] Regelmäßige Reviews (geplant)
- [ ] Schulung (Selbststudium)

### Dokumentation:
- [x] TOM dokumentiert
- [x] RoPA erstellt
- [ ] Disaster Recovery Plan
- [ ] Incident Response Runbook

---

## 📊 RISIKOBEWERTUNG

### Geringes Risiko:
- ✅ Keine sensiblen Daten (Gesundheit, Religion, etc.)
- ✅ Keine Profiling im großen Stil
- ✅ Transparente Datenverarbeitung

### Mittleres Risiko:
- ⚠️ Drittland-Übermittlungen (USA)
- ⚠️ KI-Nutzung (EU AI Act beachten)
- ⚠️ Affiliate-Tracking

### Hohes Risiko:
- ❌ Aktuell keine Hochrisiko-Verarbeitungen

**Fazit:** Angemessenes Schutzniveau für niedrig-mittleres Risiko

---

## 🔄 AKTUALISIERUNGSPROTOKOLL

| Datum | Änderung | Durchgeführt von |
|-------|----------|------------------|
| {Datum} | Initiale Erstellung | {Ihr Name} |
| {Datum} | {Änderung} | {Name} |

---

## 📚 REFERENZEN

- **DSGVO:** https://dsgvo-gesetz.de/
- **Art. 32 DSGVO:** https://dsgvo-gesetz.de/art-32-dsgvo/
- **BSI IT-Grundschutz:** https://www.bsi.bund.de/DE/Themen/Unternehmen-und-Organisationen/Standards-und-Zertifizierung/IT-Grundschutz/it-grundschutz_node.html

---

**Stand:** {DATUM EINTRAGEN}
**Nächste Überprüfung:** {DATUM + 1 Jahr}
**Verantwortlich:** {IHR NAME}
