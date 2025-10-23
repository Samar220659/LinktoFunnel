# 🗄️ SUPABASE DATENBANK DEPLOYMENT

**WICHTIG**: Dieser Schritt ist KRITISCH für das System!
**Zeitaufwand**: 5 Minuten

---

## SCHRITT 1: Supabase Dashboard öffnen

```
1. Gehe zu: https://supabase.com/dashboard
2. Melde dich an (falls noch nicht eingeloggt)
3. Wähle dein Projekt aus
   (sollte "LinktoFunnel" oder ähnlich heißen)
```

---

## SCHRITT 2: SQL Editor öffnen

```
4. Klicke im linken Menü auf: "SQL Editor"
5. Klicke oben rechts auf: "+ New Query"
```

---

## SCHRITT 3: Schema-Code kopieren

```
6. Öffne die Datei: /home/user/LinktoFunnel/ai-agent/data/schema.sql
7. Kopiere den GESAMTEN Inhalt (alle 252 Zeilen!)
8. Füge den Code in den SQL Editor ein
```

**Alternativ kannst du das Schema hier sehen:**

```sql
-- 🗄️ SUPABASE DATABASE SCHEMA
-- Complete schema for AI Business Agent System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===== AGENT STATES TABLE =====
CREATE TABLE IF NOT EXISTS agent_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_name TEXT NOT NULL,
  state_data JSONB,
  reward DECIMAL,
  action TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_agent_states_name ON agent_states(agent_name);
CREATE INDEX idx_agent_states_created ON agent_states(created_at DESC);

-- ===== DIGISTORE24 PRODUCTS TABLE =====
CREATE TABLE IF NOT EXISTS digistore_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id TEXT UNIQUE NOT NULL,
  product_name TEXT,
  category TEXT,
  commission_rate DECIMAL,
  conversion_score DECIMAL,
  trend_score DECIMAL,
  affiliate_link TEXT,
  is_promoted BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_category ON digistore_products(category);
CREATE INDEX idx_products_score ON digistore_products(conversion_score DESC);
CREATE INDEX idx_products_promoted ON digistore_products(is_promoted);

-- Und so weiter... (siehe schema.sql für kompletten Code)
```

---

## SCHRITT 4: Schema ausführen

```
9. Klicke auf den "Run" Button (oder drücke Strg+Enter / Cmd+Enter)
10. Warte 3-5 Sekunden
11. Du solltest sehen: "Success. No rows returned"
```

**✅ ERFOLG-INDIKATOR:**
- Grünes Häkchen oben rechts
- Keine Fehler-Meldungen
- "Success" in der Ausgabe

---

## SCHRITT 5: Tabellen überprüfen

```
12. Klicke im linken Menü auf: "Table Editor"
13. Du solltest jetzt 10 Tabellen sehen:
    ✅ agent_states
    ✅ analytics_daily
    ✅ campaigns
    ✅ digistore_products
    ✅ generated_content
    ✅ leads
    ✅ notifications
    ✅ own_products
    ✅ rl_learning
    ✅ workflows
```

---

## SCHRITT 6: System testen

Zurück im Terminal:

```bash
# Teste die Verbindung
node scripts/deploy-supabase-schema.js

# Sollte zeigen:
# ✅ Verbindung erfolgreich!
# 🎉 Datenbank ist bereit!
```

---

## ⚠️ HÄUFIGE PROBLEME

### Problem: "relation already exists"
**Lösung**: Ignorieren - das bedeutet, Tabellen sind schon da!

### Problem: "permission denied"
**Lösung**:
- Gehe zu: Settings → API
- Kopiere den **service_role** key (nicht anon key!)
- Füge ihn zu .env.local hinzu:
  ```
  SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
  ```

### Problem: "syntax error"
**Lösung**:
- Stelle sicher, dass du den KOMPLETTEN Code kopiert hast
- Keine fehlenden Zeilen am Anfang/Ende
- Kopiere erneut aus schema.sql

---

## 🎉 FERTIG!

Wenn du alle 10 Tabellen siehst, ist die Datenbank bereit!

**Nächster Schritt:**
```bash
node scripts/quickstart.js
```

Dies wird deine 15 Affiliate-Produkte in die Datenbank importieren.

---

## 📞 SUPPORT

Falls Probleme auftreten:
1. Screenshot vom Fehler machen
2. GitHub Issue erstellen
3. Oder Email: Samar220659@gmail.com
