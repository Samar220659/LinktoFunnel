# 🤖 LinktoFunnel Auto-Pilot MCP Server

**Model Context Protocol Server für vollautomatisches Business**

## Was ist das?

Ein MCP-Server, der dein gesamtes Affiliate-Business **vollautomatisch** betreibt.

**Du machst nur:**
1. Morgens: 2 Varianten durchklicken → Beste wählen (2 Minuten)
2. Einmal pro Woche: Rechtliches absegnen mit digitaler Signatur (5 Minuten)
3. **FERTIG!**

**Der MCP macht:**
- ✅ Produkte finden (automatisch)
- ✅ Scripts schreiben (automatisch mit AI)
- ✅ Bilder generieren (automatisch)
- ✅ Videos erstellen (automatisch)
- ✅ Posten auf allen Plattformen (automatisch)
- ✅ Analytics tracken (automatisch)
- ✅ Optimierungen vornehmen (automatisch mit RL)
- ✅ Rechtliches prüfen (automatisch)

---

## 🏗️ System-Architektur

```
┌─────────────────────────────────────────────────────────┐
│                    DU (User)                             │
│  ┌──────────────┐        ┌──────────────────────────┐   │
│  │   Approval   │        │   Digital Signature      │   │
│  │   Dashboard  │◄───────┤      System              │   │
│  │   (2 Min)    │        │   (1x/Woche 5 Min)       │   │
│  └──────────────┘        └──────────────────────────┘   │
└───────────────────┬──────────────────┬──────────────────┘
                    │                  │
                    ↓                  ↓
┌─────────────────────────────────────────────────────────┐
│            AUTO-PILOT MCP SERVER                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │          MASTER ORCHESTRATOR                      │   │
│  │  Läuft 24/7 - Macht alles automatisch            │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌───────────────┐    │
│  │  Product   │  │  Content   │  │   Multi-      │    │
│  │  Scout     │→ │  Generator │→ │   Platform    │    │
│  │  Agent     │  │  Agent     │  │   Poster      │    │
│  └────────────┘  └────────────┘  └───────────────┘    │
│         ↓                ↓               ↓              │
│  ┌────────────┐  ┌────────────┐  ┌───────────────┐    │
│  │ Analytics  │  │   Legal    │  │  Approval     │    │
│  │  Tracker   │  │  Checker   │  │  Generator    │    │
│  └────────────┘  └────────────┘  └───────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │       APPROVAL QUEUE (2 Varianten)             │     │
│  │  User sieht: Option A vs Option B              │     │
│  │  User klickt: "A" oder "B"                     │     │
│  │  System führt aus                              │     │
│  └────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              EXTERNAL SERVICES                           │
│  OpenAI | Social Media APIs | Digistore24 | etc.       │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 MCP Server Tools (Verfügbare Funktionen)

### 1. **auto_generate_content**
```typescript
{
  name: "auto_generate_content",
  description: "Generiert automatisch 2 Content-Varianten (Scripts, Bilder, Videos)",
  inputSchema: {
    product_id: "string",
    variations: "number (default: 2)"
  },
  output: {
    variant_a: { script, images, video_preview },
    variant_b: { script, images, video_preview }
  }
}
```

### 2. **get_approval_queue**
```typescript
{
  name: "get_approval_queue",
  description: "Zeigt alle Inhalte die auf Approval warten",
  inputSchema: {},
  output: {
    pending_approvals: [
      {
        id: "approval-001",
        type: "content",
        variant_a: {...},
        variant_b: {...},
        deadline: "2024-11-07 18:00"
      }
    ]
  }
}
```

### 3. **approve_content**
```typescript
{
  name: "approve_content",
  description: "User wählt Variante A oder B",
  inputSchema: {
    approval_id: "string",
    selected_variant: "a" | "b",
    digital_signature: "string (optional für rechtliche Sachen)"
  },
  output: {
    status: "approved",
    scheduled_for: "2024-11-07 18:00",
    platforms: ["tiktok", "instagram", "youtube"]
  }
}
```

### 4. **auto_post_content**
```typescript
{
  name: "auto_post_content",
  description: "Postet approved Content automatisch zur besten Zeit",
  inputSchema: {
    content_id: "string"
  },
  output: {
    posted_platforms: ["tiktok", "instagram"],
    post_urls: [...],
    analytics_tracking: true
  }
}
```

### 5. **get_analytics_summary**
```typescript
{
  name: "get_analytics_summary",
  description: "Tägliche Zusammenfassung: Revenue, Views, Conversions",
  inputSchema: {},
  output: {
    today: { views, clicks, conversions, revenue },
    trend: "up" | "down" | "stable",
    recommendations: ["post more at 18:00", "use shock hooks"]
  }
}
```

### 6. **legal_compliance_check**
```typescript
{
  name: "legal_compliance_check",
  description: "Prüft ob alles rechtens ist (Impressum, Kennzeichnung, etc.)",
  inputSchema: {},
  output: {
    status: "compliant" | "needs_action",
    issues: [],
    required_signatures: [
      {
        type: "gewerbeanmeldung",
        reason: "Revenue >410€ erreicht",
        template: "Vorbereitet, nur Unterschrift nötig"
      }
    ]
  }
}
```

### 7. **auto_optimize**
```typescript
{
  name: "auto_optimize",
  description: "AI analysiert Performance und optimiert automatisch",
  inputSchema: {},
  output: {
    optimizations_made: [
      "Hook-Typ gewechselt zu 'Question' (bessere CTR)",
      "Posting-Zeit auf 19:00 verschoben (+20% Engagement)"
    ],
    expected_impact: "+15% Revenue"
  }
}
```

---

## 🔧 Installation

### Schritt 1: MCP Server installieren

```bash
# Im LinktoFunnel Verzeichnis
cd mcp-server
npm install
```

### Schritt 2: Config erstellen

```bash
# .env für MCP Server
cp .env.example .env.mcp

# Füge hinzu:
OPENAI_API_KEY=sk-...
SUPABASE_URL=...
SUPABASE_KEY=...

# Social Media Credentials (aus OAuth)
TIKTOK_ACCESS_TOKEN=...
INSTAGRAM_ACCESS_TOKEN=...
# etc.

# Approval Settings
APPROVAL_MODE=true
AUTO_POST_AFTER_APPROVAL=true
REQUIRE_SIGNATURE_FOR_LEGAL=true
```

### Schritt 3: MCP Server starten

```bash
# Development
npm run mcp:dev

# Production (Railway/VPS)
npm run mcp:start
```

---

## 💻 Dein Tagesablauf (2 Minuten!)

### Morgens 08:00 Uhr (2 Minuten)

**1. Dashboard öffnen:**
```bash
# Browser: http://localhost:3000/dashboard

Oder: Telegram-Bot öffnen
/approvals
```

**2. Du siehst:**
```
┌──────────────────────────────────────────────┐
│  📋 HEUTE ZUM APPROVAL (1 Item)              │
├──────────────────────────────────────────────┤
│                                              │
│  🎬 VIDEO FÜR HEUTE 18:00 UHR               │
│                                              │
│  ┌────────────────┐  ┌────────────────┐     │
│  │  VARIANTE A    │  │  VARIANTE B    │     │
│  ├────────────────┤  ├────────────────┤     │
│  │ Hook:          │  │ Hook:          │     │
│  │ "Wusstest du   │  │ "STOP! Bevor   │     │
│  │  dass..."      │  │  du scrollst..." │   │
│  │                │  │                │     │
│  │ Produkt:       │  │ Produkt:       │     │
│  │ Online-Kurs    │  │ Online-Kurs    │     │
│  │ €97 → €58 Prov.│  │ €97 → €58 Prov.│     │
│  │                │  │                │     │
│  │ AI-Score: 8.2  │  │ AI-Score: 8.7  │     │
│  │                │  │                │     │
│  │ [Video-Vorschau│  │ [Video-Vorschau│     │
│  │     Bild]      │  │     Bild]      │     │
│  │                │  │                │     │
│  │ [ Wählen A ]   │  │ [ Wählen B ]   │     │
│  └────────────────┘  └────────────────┘     │
│                                              │
│  Automatisch gepostet um 18:00 auf:         │
│  ✓ TikTok  ✓ Instagram  ✓ YouTube          │
│                                              │
└──────────────────────────────────────────────┘
```

**3. Du klickst:**
- "Wählen B" (weil höherer AI-Score)

**4. Fertig!**
- System postet automatisch um 18:00 Uhr
- Du bekommst Notification
- Analytics werden getrackt

**Zeit: 2 Minuten** ⏱️

---

### Wöchentlich Sonntags (5 Minuten)

**Nur wenn rechtlich nötig:**

```
┌──────────────────────────────────────────────┐
│  ⚖️ RECHTLICHE ABSEGNUNG ERFORDERLICH       │
├──────────────────────────────────────────────┤
│                                              │
│  🎯 GRUND: Revenue >€410 erreicht           │
│  📋 AKTION: Gewerbeanmeldung nötig          │
│                                              │
│  Wir haben alles vorbereitet:               │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │ GEWERBEANMELDUNG - Formular            │ │
│  │                                        │ │
│  │ Name: [Max Mustermann]                 │ │
│  │ Adresse: [Musterstraße 1]             │ │
│  │ Tätigkeit: [Online-Marketing]         │ │
│  │ Kleinunternehmer: [x] Ja              │ │
│  │                                        │ │
│  │ Alle Felder ausgefüllt!               │ │
│  │                                        │ │
│  │ ┌────────────────┐  ┌────────────────┐│ │
│  │ │  VARIANTE A    │  │  VARIANTE B    ││ │
│  │ │  Kleinuntern.  │  │  Regelbesteuer││ │
│  │ │  Empfohlen ✓   │  │  (Nicht empf.)││ │
│  │ └────────────────┘  └────────────────┘│ │
│  │                                        │ │
│  │ [ Variante A wählen & signieren ]     │ │
│  │                                        │ │
│  │ Signatur: ________________            │ │
│  │           (Dein Name)                 │ │
│  │                                        │ │
│  │ [ Jetzt online einreichen ]           │ │
│  └────────────────────────────────────────┘ │
│                                              │
│  System reicht dann automatisch ein!         │
│                                              │
└──────────────────────────────────────────────┘
```

**Du machst:**
1. ✅ Variante A wählen
2. ✅ Digital signieren (Name tippen)
3. ✅ "Einreichen" klicken

**System macht:**
- Reicht Formular bei deiner Stadt ein
- Speichert Bestätigung
- Updated dein Impressum automatisch
- Benachrichtigt dich wenn fertig

**Zeit: 5 Minuten** ⏱️

---

## 🤖 Was das System AUTOMATISCH macht

### Jeden Tag:

**05:00 Uhr - Product Scout läuft**
```
→ Scannt Digistore24
→ Findet 3 neue profitable Produkte
→ Analysiert Conversion-Rates
→ Speichert in Queue
```

**07:00 Uhr - Content Generator läuft**
```
→ Nimmt Top-Produkt
→ Erstellt 2 Script-Varianten (GPT-4)
→ Generiert Bilder (DALL-E)
→ Erstellt Video-Vorschau
→ Berechnet AI-Score
→ Legt in Approval-Queue
```

**08:00 Uhr - DU bekommst Notification**
```
→ "1 Approval wartet auf dich"
→ Du klickst, wählst Variante
→ Fertig!
```

**09:00 Uhr - Video wird fertiggestellt**
```
→ System erstellt Full Video in CapCut (via API)
→ Fügt Audio hinzu
→ Rendert
→ Speichert
```

**18:00 Uhr - Auto-Post**
```
→ Postet auf TikTok
→ Postet auf Instagram
→ Postet auf YouTube Shorts
→ Alle Hashtags automatisch
→ Alle Links automatisch
→ Tracking aktiviert
```

**23:00 Uhr - Analytics & Optimization**
```
→ Sammelt Analytics
→ Berechnet Performance
→ Lernt aus Daten (RL)
→ Passt Strategie an
→ Bereitet Report vor
```

**23:30 Uhr - Daily Report an dich**
```
→ Telegram: "Heute: 12.400 Views, 2 Verkäufe, €116"
→ Trend: ↑ +15%
```

---

## 📱 Approval-Methoden

### Methode 1: Web-Dashboard (Empfohlen)

```bash
# Browser öffnen:
http://localhost:3000/approvals

# Siehst:
- Alle pending Approvals
- 2 Varianten nebeneinander
- Click to approve
- Fertig!
```

### Methode 2: Telegram Bot (Mobil)

```bash
# Bot starten:
/start

# Approvals checken:
/approvals

# Bot zeigt:
"📋 1 Approval wartet

🎬 Video für heute 18:00

A) Hook: 'Wusstest du...' (Score: 8.2)
B) Hook: 'STOP! Bevor...' (Score: 8.7)

Wähle: /approve_a oder /approve_b"

# Du antwortest:
/approve_b

# Bot:
"✅ Variante B approved!
Wird um 18:00 automatisch gepostet.
Nächster Approval morgen 08:00."
```

### Methode 3: Email (Backup)

```
Subject: [LinktoFunnel] 1 Approval benötigt

Body:
Hi,

1 Content wartet auf Approval für heute 18:00.

Variante A: [Link zum Dashboard]
Variante B: [Link zum Dashboard]

Klicke einen Link zum Approven.

Grüße,
Dein Auto-Pilot Bot
```

---

## 🔐 Digitale Signatur (Rechtliches)

### Wann brauchst du das?

**Nur bei:**
- Gewerbeanmeldung
- Steuererklärung
- Vertragsabschlüssen (falls)

**Wie oft?**
- Gewerbeanmeldung: 1x (wenn du €410+ erreichst)
- Steuererklärung: 1x pro Jahr
- Sonst: gar nicht

### Wie funktioniert's?

**1. System bereitet ALLES vor:**
```
✅ Formular ausgefüllt
✅ Daten eingetragen
✅ Dokumente angehängt
✅ 2 Varianten erstellt (Empfehlung + Alternative)
```

**2. Du siehst:**
```
┌────────────────────────────────────────┐
│  Dokument: Gewerbeanmeldung           │
│  Status: Bereit zur Einreichung       │
│                                        │
│  Vorschau: [PDF zeigen]               │
│                                        │
│  ┌──────────────┐  ┌──────────────┐   │
│  │ VARIANTE A   │  │ VARIANTE B   │   │
│  │ Klein-Unt.   │  │ Regel-Best.  │   │
│  │ Empfohlen ✓  │  │              │   │
│  └──────────────┘  └──────────────┘   │
│                                        │
│  Wähle Variante: [ A ] [ B ]          │
│                                        │
│  Digital signieren:                    │
│  Name: [Max Mustermann]                │
│  Datum: [Auto: 07.11.2024]             │
│                                        │
│  [ Bestätigen & Einreichen ]           │
└────────────────────────────────────────┘
```

**3. Du machst:**
- Variante wählen
- Name tippen
- "Bestätigen"

**4. System macht:**
- Sendet Formular elektronisch
- Speichert Kopie
- Tracked Status
- Benachrichtigt dich bei Update

**Zeit: 2 Minuten** ⏱️

---

## 📊 Dashboard Features

### Main Dashboard

```
┌─────────────────────────────────────────────────────────┐
│  🤖 LinktoFunnel Auto-Pilot                             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📊 HEUTE                                                │
│  Views: 12.400 (+15%)                                    │
│  Klicks: 42 (0.34% CTR)                                  │
│  Verkäufe: 2                                             │
│  Revenue: €116,40                                        │
│                                                          │
│  📈 DIESER MONAT                                         │
│  Videos: 28                                              │
│  Gesamt-Views: 340.200                                   │
│  Verkäufe: 18                                            │
│  Revenue: €1.047,60                                      │
│                                                          │
│  ⏳ PENDING APPROVALS                                    │
│  [ 1 ] Content für heute 18:00                          │
│  [ → ZUM APPROVAL ]                                      │
│                                                          │
│  ✅ SYSTEM STATUS                                        │
│  ● Product Scout: Running                               │
│  ● Content Generator: Running                           │
│  ● Auto-Poster: Scheduled (18:00)                       │
│  ● Analytics: Tracking                                  │
│  ● Legal Check: ⚠️ Action needed                        │
│                                                          │
│  💡 AI EMPFEHLUNGEN                                      │
│  • Hook-Typ "Question" performt +20% besser            │
│  • Posting-Zeit auf 19:00 verschieben (+15% Views)     │
│  • Produkt "X" hat 35% Conversion → mehr promoten      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## ⚙️ Konfiguration (Einmalig)

### Deine Präferenzen einstellen:

```bash
# Dashboard → Settings

┌────────────────────────────────────────┐
│  AUTOMATION SETTINGS                   │
├────────────────────────────────────────┤
│                                        │
│  Approval-Modus:                       │
│  [x] Täglich 1 Approval (empfohlen)   │
│  [ ] Wöchentlich Batch (7 auf einmal) │
│  [ ] Auto (kein Approval nötig)       │
│                                        │
│  Posting-Frequenz:                     │
│  [x] 1x täglich (empfohlen)           │
│  [ ] 2x täglich                        │
│  [ ] Nur werktags                      │
│                                        │
│  Plattformen:                          │
│  [x] TikTok                            │
│  [x] Instagram                         │
│  [x] YouTube Shorts                    │
│  [ ] Pinterest                         │
│  [ ] Twitter                           │
│                                        │
│  Nischen (Top 3):                      │
│  1. [Online-Business]                  │
│  2. [Produktivität]                    │
│  3. [Tech-Gadgets]                     │
│                                        │
│  Minimum-Provision:                    │
│  [€40] pro Verkauf                     │
│                                        │
│  Notifications:                        │
│  [x] Telegram                          │
│  [x] Email (nur wichtige)              │
│  [ ] SMS                               │
│                                        │
│  [ SPEICHERN ]                         │
└────────────────────────────────────────┘
```

**Einmal einstellen → Läuft dann so!**

---

## 🚀 Wie ich das für dich aufsetze

### Option A: Ich baue es komplett (Empfohlen)

**Was ich mache:**
1. ✅ MCP Server programmieren
2. ✅ Alle Agents implementieren
3. ✅ Approval-System bauen
4. ✅ Dashboard erstellen
5. ✅ Telegram Bot einrichten
6. ✅ Alles auf Railway deployen
7. ✅ OAuth für Social Media einrichten
8. ✅ Erste Testläufe

**Was du machst:**
1. ✅ Mir Zugang zu ChatGPT API geben (für Content-Generierung)
2. ✅ Social Media Accounts erstellen (TikTok, Instagram)
3. ✅ Digistore24 registrieren
4. ✅ Approval-Dashboard testen
5. ✅ Erste Woche: Täglich 2 Min Approvals

**Dauer:** 2-3 Tage Entwicklung
**Danach:** Läuft vollautomatisch!

### Option B: Ich zeige dir wie (Du baust)

**Was ich mache:**
1. ✅ Kompletten Code schreiben
2. ✅ Schritt-für-Schritt Anleitung
3. ✅ Alle Prompts & Scripts
4. ✅ Support bei Problemen

**Was du machst:**
1. Code in dein Repo kopieren
2. Anleitung folgen
3. Deployen
4. Testen

**Dauer:** 1 Tag meine Arbeit, 1-2 Tage deine Umsetzung

---

## 💡 Wie wir starten

**Sag mir einfach:**

**Option 1:** *"Bau mir das komplette System!"*
→ Ich programmiere alles fertig
→ Du bekommst Link zum Dashboard
→ Du kannst direkt starten

**Option 2:** *"Zeig mir wie ich's baue!"*
→ Ich schreibe den Code
→ Du setzt es um
→ Ich helfe bei Problemen

**Option 3:** *"Starte mit dem Wichtigsten!"*
→ Ich baue zuerst: Content-Generator + Approval-System
→ Rest später nachrüsten

---

## 📋 Was das System dir bringt

### Vorher (Ohne Automation):

**Dein Aufwand:**
- 2h Sonntag: Content produzieren
- 15 Min/Tag: Posten & Kommentare
- 1h Samstag: Analytics
- **= 5h/Woche**

**Fehlerquellen:**
- Vergessen zu posten
- Schlechte Posting-Zeiten
- Inkonsistenz
- Keine Optimierung

### Nachher (Mit Auto-Pilot MCP):

**Dein Aufwand:**
- 2 Min/Tag: Approval klicken
- 5 Min/Woche: Rechtliches (nur wenn nötig)
- **= 20 Min/Woche!**

**Vorteile:**
- ✅ Nie vergessen
- ✅ Immer beste Zeit
- ✅ 100% konsistent
- ✅ AI optimiert ständig
- ✅ Du schläfst → System arbeitet

---

## 🎯 Nächster Schritt

**Was möchtest du?**

**A)** *"Bau mir das System - Ich will nur noch klicken!"*
→ Ich entwickle den kompletten MCP Server für dich

**B)** *"Zeig mir den Code - Ich will verstehen wie's geht!"*
→ Ich schreibe dir den kompletten Code mit Anleitung

**C)** *"Erkläre mir das nochmal genauer..."*
→ Ich erkläre jeden Teil im Detail

**D)** *"Gibt's sowas schon? Kann ich kaufen?"*
→ Ich check ob es fertige Lösungen gibt

Sag mir einfach was du willst! 🚀
