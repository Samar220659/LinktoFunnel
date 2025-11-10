# 🔧 GEMINI CLI TERMUX FIX

## Problem
Die offizielle `@google/gemini-cli` nutzt `node-pty`, was in Termux nicht funktioniert:
```
Error: Cannot find module '../build/Debug/pty.node'
```

## ✅ Lösung
Wir verwenden einen **Python-based Gemini Wrapper** statt der offiziellen Node.js CLI.

---

## 🚀 QUICK FIX (30 Sekunden)

### In Termux ausführen:

```bash
cd ~/LinktoFunnel
git pull

# Fix ausführen
bash bin/fix-gemini-termux.sh

# API Key setzen
export GEMINI_API_KEY='your_gemini_api_key_here'

# Oder in .env.local:
nano .env.local
# GEMINI_API_KEY=your_key_here

# Testen
echo "What is 2+2?" | gemini
```

---

## 📱 VERWENDUNG

### 1. **Einfacher Prompt:**
```bash
gemini "Optimize this script for TikTok"
```

### 2. **Via Pipe:**
```bash
echo "Mein Script Text hier" | gemini "Optimize for viral score 93%+"
```

### 3. **JSON Output:**
```bash
gemini --json "Create video script about passive income"
```

### 4. **Mit File:**
```bash
cat script.txt | gemini "Optimize and return as JSON with hook, body, cta, hashtags"
```

### 5. **Multi-Line Input:**
```bash
gemini << EOF
Create a 30-second TikTok script about:
- Passive income for DACH audience
- Age 40-65
- No prior knowledge needed
- Return as JSON with viral score
EOF
```

---

## 🎯 PRAKTISCHE BEISPIELE

### Example 1: Script optimieren
```bash
cd ~/LinktoFunnel

# Script schreiben
cat > script.txt << 'EOF'
Ich zeige dir wie du in 30 Tagen passives Einkommen aufbaust.
Kein Bullshit, nur Fakten.
EOF

# Mit Gemini optimieren
cat script.txt | gemini "
Optimize this for TikTok with 93%+ viral score.
Return JSON with:
- hook (0-3s attention grabber)
- body (3-27s value delivery)
- cta (27-30s call to action)
- hashtags (viral + niche + longtail)
- viralScore (predicted score)
- improvements (what changed and why)
" > optimized.json

# Ergebnis ansehen
cat optimized.json | jq .
```

### Example 2: Batch-Optimierung
```bash
# Alle Scripts optimieren
for script in scripts/*.txt; do
  echo "Processing: $script"
  cat "$script" | gemini "Optimize for TikTok 93%+ viral" > "${script%.txt}_optimized.json"
  sleep 2  # Rate limiting
done
```

### Example 3: A/B Testing Varianten
```bash
HOOK="Warum dir niemand das über passives Einkommen erzählt"

gemini "
Generate 5 A/B test variants of this hook: $HOOK
Each variant should:
- Test different angle
- Maintain core message
- Be optimized for TikTok
Return as JSON array with variant and reason
" | jq .
```

### Example 4: In AI Trinity integrieren
```bash
# Script von Gemini optimieren lassen, dann in Queue
SCRIPT=$(echo "Mein Script" | gemini "Optimize for TikTok")

# In AI Trinity Queue
node -e "
const { MessageQueue } = require('./ai-trinity/core/message-queue');
const queue = new MessageQueue();
queue.init().then(() => {
  queue.enqueue('termux', 'gemini', 'enhance-content', {
    content: process.env.SCRIPT,
    contentType: 'video-script',
    enhancementGoals: ['viral', 'engagement', 'authenticity']
  });
});
" SCRIPT="$SCRIPT"
```

---

## ⚙️ ADVANCED OPTIONS

### Custom Temperature:
```bash
# More creative (0.9-1.0)
gemini --temperature 0.95 "Creative prompt"

# More focused (0.3-0.5)
gemini --temperature 0.3 "Factual prompt"
```

### Max Tokens:
```bash
# Longer output
gemini --max-tokens 16384 "Long-form content"
```

### Environment Variables:
```bash
# In .bashrc oder .env.local:
export GEMINI_MODEL="gemini-1.5-pro"
export GEMINI_TEMPERATURE=0.9
export GEMINI_MAX_TOKENS=8192
```

---

## 🔄 VERGLEICH: Vorher vs. Nachher

### ❌ Vorher (Broken):
```bash
echo "Test" | gemini
# Error: Cannot find module '../build/Debug/pty.node'
```

### ✅ Nachher (Working):
```bash
echo "Test" | gemini
# Optimized script with viral hooks...
```

---

## 🐛 TROUBLESHOOTING

### Problem: "GEMINI_API_KEY not set"
```bash
# Lösung 1: Export
export GEMINI_API_KEY='your_key_here'

# Lösung 2: In .env.local
echo "GEMINI_API_KEY='your_key_here'" >> .env.local
source .env.local

# Lösung 3: In .bashrc (permanent)
echo "export GEMINI_API_KEY='your_key_here'" >> ~/.bashrc
source ~/.bashrc
```

### Problem: "gemini: command not found"
```bash
# Fix PATH
export PATH="$HOME/bin:$PATH"

# Permanent in .bashrc
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Oder direkt nutzen
$HOME/bin/gemini "test"
```

### Problem: Python-Modul fehlt
```bash
pip install --upgrade google-generativeai
```

### Problem: "Rate limit exceeded"
```bash
# Warte zwischen Requests
sleep 2
```

---

## 📊 PERFORMANCE

### Durchschnittliche Response-Zeit:
- Kurze Prompts (<100 tokens): ~2-3 Sekunden
- Mittlere Prompts (100-500 tokens): ~5-8 Sekunden
- Lange Prompts (>500 tokens): ~10-15 Sekunden

### Rate Limits (Free Tier):
- 60 Requests pro Minute
- 1.500 Requests pro Tag

**Tipp:** Füge `sleep 1` zwischen Batch-Requests ein!

---

## 🎯 INTEGRATION MIT AI TRINITY

### Workflow:
```bash
# 1. Content mit Gemini optimieren
OPTIMIZED=$(echo "Script" | gemini "Optimize")

# 2. In AI Trinity Queue
node -e "
const { MessageQueue } = require('./ai-trinity/core/message-queue');
const queue = new MessageQueue();
queue.init().then(() => {
  queue.enqueue('termux', 'claude', 'analyze-results', {
    content: '$OPTIMIZED',
    metrics: { viralScore: 93 }
  });
});
"

# 3. Ergebnis aus Queue holen
cat ai-trinity/queue/done/*.json | jq .
```

---

## ✅ CHECKLIST

Nach Fix sollte funktionieren:

- [x] `gemini "Test prompt"` ✅
- [x] `echo "Test" | gemini` ✅
- [x] `gemini --json "Test"` ✅
- [x] Keine `node-pty` Fehler mehr ✅
- [x] JSON Parsing mit `jq` ✅
- [x] Integration in Bash Scripts ✅
- [x] AI Trinity Queue Integration ✅

---

## 🚀 BEREIT!

```bash
# Final Test:
echo "Create a viral TikTok script about passive income for DACH audience, 40-65 years old, 30 seconds" | gemini --json | jq .
```

Wenn das funktioniert → **ALLES READY! 🎉**

---

**Problem gelöst!** Der Python-Wrapper ist viel stabiler für Termux als die Node.js CLI! 🔧✅
