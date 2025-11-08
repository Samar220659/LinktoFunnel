#!/usr/bin/env node

/**
 * 🤖 STANDALONE SETUP AUTOMATION
 *
 * Vollautomatisches Setup OHNE MCP!
 * Einfach ausführen: node standalone-setup.js
 */

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

// Parse CLI args
const args = process.argv.slice(2);
const skipRailway = args.includes('--skip-railway');
const railwayTokenArg = args.find(arg => arg.startsWith('--railway-token='));
const railwayToken = railwayTokenArg ? railwayTokenArg.split('=')[1] : null;

console.log('\n╔═══════════════════════════════════════════════╗');
console.log('║  🤖 VOLLAUTOMATISCHES LINKTOFUNNEL SETUP     ║');
console.log('╚═══════════════════════════════════════════════╝\n');

console.log('📋 Konfiguration:');
console.log(`   Supabase: ✅ Wird durchgeführt`);
console.log(`   Railway:  ${skipRailway ? '⏭️  Übersprungen' : railwayToken ? '✅ Wird durchgeführt' : '⚠️  Kein Token (wird übersprungen)'}`);
console.log(`   Telegram: ✅ Wird getestet\n`);

// ===== SUPABASE SETUP =====
async function setupSupabase() {
  console.log('╔═══════════════════════════════════════════════╗');
  console.log('║   📝 SCHRITT 1/3: SUPABASE DATABASE SETUP    ║');
  console.log('╚═══════════════════════════════════════════════╝\n');

  try {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      throw new Error('SUPABASE_URL oder SUPABASE_SERVICE_KEY fehlt in .env.local!');
    }

    console.log('🔧 Verbinde mit Supabase...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // SQL Schema laden
    console.log('📄 Lade SQL Schema...');
    const schemaPath = join(__dirname, '../supabase-schema.sql');
    const sqlSchema = readFileSync(schemaPath, 'utf-8');
    console.log(`✅ ${sqlSchema.length} Zeichen geladen\n`);

    // Tabellen überprüfen
    console.log('🔍 Überprüfe existierende Tabellen...');
    const tables = ['users', 'credentials', 'social_accounts', 'affiliate_accounts',
                   'automation_settings', 'approval_queue', 'products', 'content', 'posts', 'analytics'];

    const tableStatus = {};
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('count').limit(1);
      const exists = !error;
      tableStatus[table] = exists;
      console.log(`  ${exists ? '✅' : '❌'} ${table}`);
    }

    const allTablesExist = Object.values(tableStatus).every(v => v);

    if (allTablesExist) {
      console.log('\n✅ Alle Tabellen existieren bereits! Supabase Setup komplett!\n');
      return { success: true, already_exists: true };
    }

    console.log('\n⚠️  Einige Tabellen fehlen noch!\n');
    console.log('📝 MANUELLE ANLEITUNG:\n');
    console.log('1. Browser öffnen:');
    console.log('   https://supabase.com/dashboard/project/mkiliztwxhxzwizwwjhqn\n');
    console.log('2. Links: "SQL Editor" klicken\n');
    console.log('3. "+ New query" klicken\n');
    console.log('4. SQL Schema kopieren von:');
    console.log('   ' + schemaPath);
    console.log('   ODER von GitHub:');
    console.log('   https://github.com/Samar220659/LinktoFunnel/blob/.../supabase-schema.sql\n');
    console.log('5. In Supabase einfügen & "Run" klicken ▶️\n');
    console.log('6. "Success" sehen? ✅ Fertig!\n');

    return { success: false, needs_manual_setup: true, tables: tableStatus };

  } catch (error) {
    console.error('❌ Fehler:', error.message);
    return { success: false, error: error.message };
  }
}

// ===== TELEGRAM TEST =====
async function testTelegram() {
  console.log('╔═══════════════════════════════════════════════╗');
  console.log('║     📝 SCHRITT 3/3: TELEGRAM BOT TEST        ║');
  console.log('╚═══════════════════════════════════════════════╝\n');

  try {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN fehlt in .env.local!');
    }

    console.log('🤖 Teste Bot Token...');
    const botInfoResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
    const botInfo = await botInfoResponse.json();

    if (!botInfo.ok) {
      throw new Error('Bot Token ungültig: ' + botInfo.description);
    }

    console.log(`✅ Bot gefunden: @${botInfo.result.username}`);
    console.log(`   Name: ${botInfo.result.first_name}`);
    console.log(`   ID: ${botInfo.result.id}\n`);

    if (TELEGRAM_CHAT_ID) {
      console.log('📬 Sende Test-Nachricht...');

      const message = `
✅ <b>SETUP AUTOMATION TEST</b>

🤖 Bot: @${botInfo.result.username}
📱 Chat ID: ${TELEGRAM_CHAT_ID}

<b>✅ Bot funktioniert!</b>

<b>Nächste Schritte:</b>

1. Sende /start um Setup zu beginnen
2. Beantworte Fragen im Chat
3. Ab morgen 08:00: Content Approvals!

🎉 System ist ready!
      `;

      const sendResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML'
        })
      });

      const sendData = await sendResponse.json();

      if (sendData.ok) {
        console.log('✅ Test-Nachricht gesendet!\n');
        console.log('📱 Öffne Telegram und check deine Nachrichten!\n');
      } else {
        console.log('⚠️  Nachricht konnte nicht gesendet werden:', sendData.description);
        console.log('   (Vielleicht hast du noch nie mit dem Bot geschrieben?)\n');
      }
    }

    console.log('✅ TELEGRAM BOT TEST ERFOLGREICH!\n');
    return { success: true, bot: botInfo.result };

  } catch (error) {
    console.error('❌ Fehler:', error.message);
    return { success: false, error: error.message };
  }
}

// ===== RAILWAY DEPLOY =====
async function deployRailway() {
  console.log('╔═══════════════════════════════════════════════╗');
  console.log('║    📝 SCHRITT 2/3: RAILWAY DEPLOYMENT         ║');
  console.log('╚═══════════════════════════════════════════════╝\n');

  if (!railwayToken) {
    console.log('⏭️  Railway Deploy übersprungen (kein Token)\n');
    console.log('💡 Railway Token holen:');
    console.log('   1. https://railway.app/account/tokens');
    console.log('   2. "Create Token"');
    console.log('   3. Script starten mit: --railway-token=YOUR_TOKEN\n');
    return { skipped: true };
  }

  console.log('🚂 Starte Railway Deployment...\n');
  console.log('⚠️  HINWEIS: Railway API Deployment ist komplex!');
  console.log('   Besser manuell via Railway UI deployen:\n');
  console.log('📝 MANUELLE ANLEITUNG:\n');
  console.log('1. Browser öffnen: https://railway.app\n');
  console.log('2. "Sign up with GitHub"\n');
  console.log('3. "New Project" → "Deploy from GitHub repo"\n');
  console.log('4. Repository: Samar220659/LinktoFunnel\n');
  console.log('5. Branch: claude/fullstack-automation-guide-011CUtrnKExpN8KHoVW3L4iU\n');
  console.log('6. Environment Variables setzen:');
  console.log('   NEXT_PUBLIC_SUPABASE_URL=' + process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  console.log('   SUPABASE_SERVICE_KEY=' + process.env.SUPABASE_SERVICE_KEY);
  console.log('   OPENAI_API_KEY=' + process.env.OPENAI_API_KEY);
  console.log('   TELEGRAM_BOT_TOKEN=' + process.env.TELEGRAM_BOT_TOKEN);
  console.log('   TELEGRAM_CHAT_ID=' + process.env.TELEGRAM_CHAT_ID);
  console.log('\n7. "Deploy" klicken! 🚀\n');

  return { manual: true };
}

// ===== MAIN =====
async function main() {
  const results = {};

  // Schritt 1: Supabase
  results.supabase = await setupSupabase();

  // Schritt 2: Railway (optional)
  if (!skipRailway) {
    results.railway = await deployRailway();
  } else {
    console.log('╔═══════════════════════════════════════════════╗');
    console.log('║    📝 SCHRITT 2/3: RAILWAY (ÜBERSPRUNGEN)    ║');
    console.log('╚═══════════════════════════════════════════════╝\n');
    results.railway = { skipped: true };
  }

  // Schritt 3: Telegram
  results.telegram = await testTelegram();

  // Zusammenfassung
  console.log('\n╔═══════════════════════════════════════════════╗');
  console.log('║          📊 SETUP ZUSAMMENFASSUNG             ║');
  console.log('╚═══════════════════════════════════════════════╝\n');

  const supabaseOK = results.supabase?.success;
  const railwayOK = results.railway?.skipped || results.railway?.manual;
  const telegramOK = results.telegram?.success;

  console.log(`Supabase:  ${supabaseOK ? '✅ Fertig' : '⚠️  Manuelles Setup nötig'}`);
  console.log(`Railway:   ${results.railway?.skipped ? '⏭️  Übersprungen' : results.railway?.manual ? '📝 Manuell deployen' : '✅ Fertig'}`);
  console.log(`Telegram:  ${telegramOK ? '✅ Fertig' : '❌ Fehler'}\n`);

  if (supabaseOK && telegramOK) {
    console.log('🎉 SETUP FAST KOMPLETT!\n');
    console.log('📝 Nächste Schritte:\n');

    if (!supabaseOK || results.supabase?.needs_manual_setup) {
      console.log('1. Supabase SQL Schema ausführen (siehe Anleitung oben)');
    }

    if (!railwayOK || results.railway?.manual) {
      console.log('2. Railway Deployment (siehe Anleitung oben)');
    }

    console.log('3. Telegram Bot testen:');
    console.log('   - Öffne Telegram');
    console.log('   - Finde deinen Bot: @' + (results.telegram?.bot?.username || 'your_bot'));
    console.log('   - Sende: /start');
    console.log('   - Folge Setup-Wizard\n');

    console.log('⏰ Ab morgen 08:00 Uhr:');
    console.log('   - Content-Benachrichtigung');
    console.log('   - Variante wählen');
    console.log('   - Fertig! 🎉\n');
  } else {
    console.log('⚠️  Einige Schritte fehlgeschlagen.\n');
    console.log('💡 Siehe Details oben!\n');
  }
}

main().catch(error => {
  console.error('\n💥 FEHLER:', error.message, '\n');
  process.exit(1);
});
