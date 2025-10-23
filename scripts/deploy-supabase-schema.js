#!/usr/bin/env node

/**
 * 🗄️ SUPABASE SCHEMA DEPLOYER
 * Deployed das komplette Datenbank-Schema
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const c = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(msg, color = 'reset') {
  console.log(`${c[color]}${msg}${c.reset}`);
}

async function testConnection() {
  log('\n🔍 Teste Supabase-Verbindung...', 'cyan');

  try {
    // Try to query a simple table
    const { data, error } = await supabase
      .from('digistore_products')
      .select('count')
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        log('⚠️  Tabellen existieren noch nicht!', 'yellow');
        log('\n📋 WICHTIG: Du musst das Schema manuell deployen:', 'yellow');
        log('\n1. Öffne: https://supabase.com/dashboard', 'cyan');
        log('2. Wähle dein Projekt', 'cyan');
        log('3. Klicke: SQL Editor (links)', 'cyan');
        log('4. Klicke: "+ New Query"', 'cyan');
        log('5. Kopiere GESAMTEN Inhalt von: ai-agent/data/schema.sql', 'cyan');
        log('6. Füge ein → Klicke "Run" (oder Strg+Enter)', 'cyan');
        log('7. Warte bis "Success" erscheint', 'cyan');
        log('8. Dann: node scripts/quickstart.js\n', 'cyan');
        return false;
      }
      throw error;
    }

    log('✅ Verbindung erfolgreich!', 'green');
    return true;

  } catch (err) {
    log(`❌ Fehler: ${err.message}`, 'red');
    log('\n💡 Mögliche Lösungen:', 'yellow');
    log('   • Prüfe NEXT_PUBLIC_SUPABASE_URL in .env.local', 'cyan');
    log('   • Prüfe NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local', 'cyan');
    log('   • Stelle sicher, dass Supabase-Projekt aktiv ist\n', 'cyan');
    return false;
  }
}

async function showSchemaContent() {
  log('\n📄 SCHEMA VORSCHAU:', 'cyan');
  log('─'.repeat(60), 'cyan');

  const schema = fs.readFileSync('ai-agent/data/schema.sql', 'utf8');
  const lines = schema.split('\n');

  // Show first 30 lines
  lines.slice(0, 30).forEach(line => {
    if (line.trim().startsWith('--')) {
      log(line, 'yellow');
    } else if (line.trim().startsWith('CREATE')) {
      log(line, 'green');
    } else {
      console.log(line);
    }
  });

  log('\n... (insgesamt ' + lines.length + ' Zeilen)', 'cyan');
  log('─'.repeat(60), 'cyan');
}

async function main() {
  console.clear();

  log('\n╔══════════════════════════════════════╗', 'cyan');
  log('║  🗄️  SUPABASE SCHEMA DEPLOYER       ║', 'cyan');
  log('╚══════════════════════════════════════╝\n', 'cyan');

  const isConnected = await testConnection();

  if (!isConnected) {
    await showSchemaContent();

    log('\n📍 DATEI-PFAD:', 'yellow');
    log('   /home/user/LinktoFunnel/ai-agent/data/schema.sql\n', 'cyan');

    log('💡 TIPP: Kopiere diese Datei und führe sie in Supabase SQL Editor aus!', 'green');
    log('   Dann läuft alles automatisch.\n', 'green');

    process.exit(1);
  } else {
    log('\n🎉 Datenbank ist bereit!', 'green');
    log('   Führe jetzt aus: node scripts/quickstart.js\n', 'cyan');
  }
}

if (require.main === module) {
  main().catch(err => {
    log(`\n❌ Error: ${err.message}\n`, 'red');
    process.exit(1);
  });
}

module.exports = { testConnection };
