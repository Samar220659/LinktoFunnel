# 🔑 SUPABASE SERVICE KEY PROBLEM - LÖSUNG

## ❌ **DAS PROBLEM**

In deiner `.env.local` ist der **SUPABASE_SERVICE_ROLE_KEY** identisch mit dem **ANON_KEY**:

```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....(role: anon)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....(role: anon)  ❌ FALSCH!
```

**Resultat:**
```
❌ permission denied for table digistore_products
```

---

## ✅ **DIE LÖSUNG**

### **ANON KEY vs SERVICE ROLE KEY:**

| Key Type | Zweck | Rechte | Verwendung |
|----------|-------|--------|------------|
| **ANON_KEY** | Public Client | ❌ RLS Restrictions | Frontend, öffentliche API-Calls |
| **SERVICE_ROLE_KEY** | Backend Admin | ✅ ALLE Rechte | Server-side, Automation, Admin-Tasks |

---

## 🔧 **SO BEKOMMST DU DEN SERVICE ROLE KEY:**

### **1. Gehe zu Supabase Dashboard:**
```
https://supabase.com/dashboard/project/mkiliztwhxzwizwwjhqn/settings/api
```

### **2. Finde den "service_role" Key:**
```
┌─────────────────────────────────────────────────┐
│ Project API keys                                 │
├─────────────────────────────────────────────────┤
│                                                  │
│ anon (public)                                    │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....        │  ← DAS HAST DU SCHON
│                                                  │
│ service_role (secret!) ⚠️                        │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....        │  ← DAS BRAUCHST DU!
│                                                  │
└─────────────────────────────────────────────────┘
```

### **3. Kopiere den "service_role" Key**

### **4. Update deine `.env.local`:**

```bash
cd ~/LinktoFunnel
nano .env.local

# Ersetze Zeile 6:
SUPABASE_SERVICE_ROLE_KEY=<DEIN_SERVICE_ROLE_KEY_HIER>

# Speichern: Ctrl+O, Enter, Ctrl+X
```

---

## 🧪 **TESTEN:**

### **MIT Service Role Key:**
```bash
node --env-file=.env.local scripts/insert-real-products.js
```

**Erwartete Ausgabe:**
```
✅ Success: 16/16
✅ Real products successfully inserted!
```

---

## 🚨 **WICHTIG:**

⚠️  **NIEMALS den SERVICE_ROLE_KEY im Frontend oder GitHub veröffentlichen!**

Der SERVICE_ROLE_KEY hat **ADMIN-RECHTE** und kann:
- Alle Daten lesen/schreiben/löschen
- RLS Policies umgehen
- Datenbank-Schema ändern

**NUR in .env.local verwenden (ist in .gitignore)!**

---

## 📊 **AKTUELLER STATUS:**

```
✅ System läuft offline (MASTER_ORCHESTRATOR_TEST.js)
✅ 16 echte Affiliate-Produkte im Code
⏳ Warte auf SERVICE_ROLE_KEY für Supabase Sync
```

---

## 💡 **ALTERNATIVE (wenn kein Service Key):**

Du kannst auch die **RLS Policies** in Supabase anpassen:

```sql
-- In Supabase SQL Editor:
ALTER TABLE digistore_products ENABLE ROW LEVEL SECURITY;

-- Policy für ANON key (lesen erlauben):
CREATE POLICY "Allow public read access" ON digistore_products
FOR SELECT USING (true);

-- Policy für ANON key (schreiben erlauben):
CREATE POLICY "Allow public insert access" ON digistore_products
FOR INSERT WITH CHECK (true);
```

**Aber:** Service Role Key ist die sauberere Lösung! 🎯
