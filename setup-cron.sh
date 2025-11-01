#!/data/data/com.termux/files/usr/bin/bash

################################################################################
# TERMUX CRON SETUP FÜR LINKTOFUNNEL
# Richtet automatische tägliche Ausführung ein
################################################################################

echo "🔧 LinktoFunnel - Cron Setup"
echo "============================="
echo ""

# 1. Prüfe ob Termux:Boot installiert ist
if [ ! -d "$HOME/.termux/boot" ]; then
    echo "⚠️  Termux:Boot nicht gefunden!"
    echo ""
    echo "📱 INSTALLATION:"
    echo "1. Installiere 'Termux:Boot' aus dem Google Play Store / F-Droid"
    echo "2. Öffne Termux:Boot einmal, um Berechtigungen zu erhalten"
    echo "3. Führe dieses Script erneut aus"
    echo ""
    exit 1
fi

# 2. Installiere cronie (falls nicht vorhanden)
if ! command -v crond &> /dev/null; then
    echo "📦 Installiere cronie..."
    pkg install cronie -y
fi

# 3. Erstelle Boot-Script für Termux:Boot
BOOT_DIR="$HOME/.termux/boot"
mkdir -p "$BOOT_DIR"

cat > "$BOOT_DIR/start-cron.sh" << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash
termux-wake-lock
crond
EOF

chmod +x "$BOOT_DIR/start-cron.sh"
echo "✅ Boot-Script erstellt"

# 4. Konfiguriere Crontab
CRON_FILE="/tmp/linktofunnel-cron"

cat > "$CRON_FILE" << 'EOF'
# LinktoFunnel - Täglicher automatischer Durchlauf
# Jeden Tag um 10:00 Uhr
0 10 * * * bash $HOME/LinktoFunnel/auto-run-daily.sh

# Jeden Tag um 18:00 Uhr (zweiter Durchlauf)
0 18 * * * bash $HOME/LinktoFunnel/auto-run-daily.sh
EOF

crontab "$CRON_FILE"
rm "$CRON_FILE"

echo "✅ Crontab konfiguriert"

# 5. Starte Cron
pkill crond 2>/dev/null || true
crond

echo ""
echo "🎉 SETUP ERFOLGREICH!"
echo "====================="
echo ""
echo "📅 Das System läuft jetzt automatisch:"
echo "   - Täglich um 10:00 Uhr"
echo "   - Täglich um 18:00 Uhr"
echo ""
echo "📊 Logs findest du in: ~/LinktoFunnel/logs/"
echo ""
echo "🔍 NÜTZLICHE BEFEHLE:"
echo "   crontab -l              # Zeige Cron-Jobs"
echo "   crontab -e              # Bearbeite Cron-Jobs"
echo "   ~/LinktoFunnel/auto-run-daily.sh  # Manuell ausführen"
echo ""
echo "⚠️  WICHTIG: Termux muss im Hintergrund laufen bleiben!"
echo "   Tipp: Benutze 'termux-wake-lock' um zu verhindern,"
echo "   dass Android Termux beendet."
echo ""

exit 0
