# 🌌 GENESIS - Termux Setup (Ein Befehl!)

## 🚀 INSTALLATION - EIN EINZIGER BEFEHL

```bash
cd ~/LinktoFunnel && bash genesis-setup.sh
```

**Das war's!** 🎉

Dieser eine Befehl macht ALLES:
- ✅ Installiert Node.js, Git, pnpm, curl, jq, cronie
- ✅ Installiert alle Projekt-Dependencies
- ✅ Erstellt alle benötigten Verzeichnisse
- ✅ Richtet .env.local ein
- ✅ Installiert Cron-Jobs (automatische Ausführung)
- ✅ Startet GENESIS zum ersten Mal
- ✅ Verifiziert die Installation

---

## ⚡ QUICK COMMANDS

### GENESIS manuell starten:
```bash
cd ~/LinktoFunnel && node genesis-system.js
```

### Status prüfen:
```bash
cd ~/LinktoFunnel && bash termux-automation.sh status
```

### Logs ansehen (Live):
```bash
tail -f ~/LinktoFunnel/logs/genesis.log
```

### Cron-Jobs prüfen:
```bash
crontab -l
```

---

## 🔄 AUTOMATISIERUNG

Nach der Installation läuft GENESIS automatisch:

| Wann | Was |
|------|-----|
| **Alle 4 Stunden** | GENESIS Cycle |
| **Täglich 12:00** | Health Check |
| **Sonntag 10:00** | Content Calendar |

---

## 🎯 ZIEL

**€5.000/Monat passives Einkommen** 🚀💰

Das System arbeitet jetzt für dich - 24/7! 🌌
