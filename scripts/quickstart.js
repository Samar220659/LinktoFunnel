#!/usr/bin/env node

/**
 * 🚀 QUICK START LAUNCHER
 * Startet dein komplettes passives Einkommen System
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function header(text) {
  const line = '═'.repeat(text.length + 4);
  log(`\n╔${line}╗`, 'cyan');
  log(`║  ${text}  ║`, 'cyan');
  log(`╚${line}╝\n`, 'cyan');
}

async function checkDatabaseConnection() {
  header('🔍 SYSTEM-CHECK');

  log('📊 Prüfe Supabase-Verbindung...', 'blue');

  try {
    const { data, error } = await supabase
      .from('digistore_products')
      .select('count')
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        log('⚠️  Datenbank-Tabellen noch nicht erstellt!', 'yellow');
        log('\n📝 Bitte führe zuerst aus:', 'yellow');
        log('   1. Öffne: https://supabase.com/dashboard', 'cyan');
        log('   2. SQL Editor → New Query', 'cyan');
        log('   3. Kopiere: ai-agent/data/schema.sql', 'cyan');
        log('   4. Run → Fertig!\n', 'cyan');
        return false;
      }
      throw error;
    }

    log('✅ Supabase verbunden!\n', 'green');
    return true;

  } catch (err) {
    log(`❌ Verbindungsfehler: ${err.message}\n`, 'red');
    return false;
  }
}

async function importProducts() {
  header('📦 PRODUKT-IMPORT');

  log('📥 Importiere deine 15 Affiliate-Links...', 'blue');

  try {
    // Lade Produkt-Daten
    const productsData = JSON.parse(
      fs.readFileSync('data/affiliate-products.json', 'utf8')
    );

    let imported = 0;

    for (const product of productsData.products) {
      const { error } = await supabase
        .from('digistore_products')
        .upsert(product, { onConflict: 'product_id' });

      if (!error) {
        imported++;
        log(`  ✓ ${product.product_name}`, 'green');
      } else {
        log(`  ✗ ${product.product_name}: ${error.message}`, 'red');
      }
    }

    log(`\n✅ ${imported}/${productsData.products.length} Produkte importiert!\n`, 'green');

    // Zeige Top 5
    log('⭐ TOP 5 EMPFEHLUNGEN:\n', 'magenta');

    const top5 = productsData.recommendations.start_with;
    const products = productsData.products;

    top5.forEach((id, i) => {
      const p = products.find(prod => prod.product_id === id);
      if (p) {
        log(`${i + 1}. ${p.product_name}`, 'cyan');
        log(`   💰 ${p.commission_rate}% Commission`, 'blue');
        log(`   📊 Score: ${p.conversion_score}/10`, 'blue');
        log(`   🎯 ${p.category}`, 'blue');
        log('', 'reset');
      }
    });

    return imported;

  } catch (err) {
    log(`❌ Import fehlgeschlagen: ${err.message}\n`, 'red');
    return 0;
  }
}

async function launchAutomation() {
  header('🤖 AUTOMATION START');

  log('🚀 Starte Digitalen Zwilling...', 'cyan');
  log('', 'reset');

  log('Das System wird jetzt:', 'blue');
  log('  ✓ Top-Produkte auswählen', 'green');
  log('  ✓ Content mit AI generieren', 'green');
  log('  ✓ Sales-Funnels erstellen', 'green');
  log('  ✓ E-Mail-Sequenzen aufsetzen', 'green');
  log('  ✓ Kampagnen optimieren', 'green');
  log('  ✓ Passives Einkommen generieren!', 'green');

  log('\n💡 Nächster Schritt:', 'yellow');
  log('   node ai-agent/MASTER_ORCHESTRATOR.js\n', 'cyan');
}

async function setupInstructions() {
  header('📋 SETUP-ANLEITUNG');

  const steps = [
    {
      emoji: '🗄️',
      title: 'Supabase Schema',
      cmd: 'SQL in Supabase ausführen',
      file: 'ai-agent/data/schema.sql',
      status: 'pending',
    },
    {
      emoji: '📦',
      title: 'Produkte importieren',
      cmd: 'node scripts/quickstart.js',
      file: 'data/affiliate-products.json',
      status: 'done',
    },
    {
      emoji: '🤖',
      title: 'Automation starten',
      cmd: 'node ai-agent/MASTER_ORCHESTRATOR.js',
      file: null,
      status: 'next',
    },
    {
      emoji: '📱',
      title: 'Termux Setup (optional)',
      cmd: 'Siehe TERMUX_SETUP.md',
      file: 'TERMUX_SETUP.md',
      status: 'optional',
    },
  ];

  steps.forEach((step, i) => {
    const statusIcon = step.status === 'done' ? '✅' : step.status === 'next' ? '👉' : '⏸️';
    log(`${statusIcon} ${step.emoji} ${step.title}`, step.status === 'done' ? 'green' : step.status === 'next' ? 'yellow' : 'blue');
    log(`   Befehl: ${step.cmd}`, 'cyan');
    if (step.file) {
      log(`   Datei: ${step.file}`, 'blue');
    }
    log('', 'reset');
  });
}

async function showRevenuePotential() {
  header('💰 REVENUE-POTENTIAL');

  log('Basierend auf deinen 15 Produkten:\n', 'blue');

  log('📊 KONSERVATIVE SCHÄTZUNG:', 'yellow');
  log('   • 5 aktive Produkte', 'cyan');
  log('   • 100 Klicks/Monat pro Produkt', 'cyan');
  log('   • 2% Conversion-Rate', 'cyan');
  log('   • Ø €30 Commission', 'cyan');
  log('   ═══════════════════════════', 'cyan');
  log('   💰 = €300/Monat passiv', 'green');

  log('\n📈 OPTIMISTISCH (nach 3 Monaten):', 'yellow');
  log('   • 10 aktive Produkte', 'cyan');
  log('   • 500 Klicks/Monat pro Produkt', 'cyan');
  log('   • 3% Conversion-Rate', 'cyan');
  log('   • Ø €35 Commission', 'cyan');
  log('   ═══════════════════════════', 'cyan');
  log('   💰 = €5.250/Monat passiv', 'green');

  log('\n🚀 SKALIERT (6-12 Monate):', 'yellow');
  log('   • Eigene Produkte', 'cyan');
  log('   • Multi-Channel Traffic', 'cyan');
  log('   • Paid Ads Reinvestition', 'cyan');
  log('   ═══════════════════════════', 'cyan');
  log('   💰 = €10.000+/Monat', 'bright');

  log('\n🎯 Deine Top-Nischen:', 'magenta');
  log('   1. Abnehmen/Gesundheit (sehr hohes Potential!)', 'green');
  log('   2. Online-Marketing (5 Produkte)', 'green');
  log('   3. Geld verdienen (4 Produkte)', 'green');
  log('   4. Finanzen/Investment', 'green');

  log('', 'reset');
}

async function main() {
  console.clear();

  log('\n╔════════════════════════════════════════════════════════════════╗', 'bright');
  log('║                                                                ║', 'bright');
  log('║          🤖 DIGITALER ZWILLING - QUICK START                   ║', 'bright');
  log('║          Passives Einkommen Automation System                  ║', 'bright');
  log('║                                                                ║', 'bright');
  log('╚════════════════════════════════════════════════════════════════╝', 'bright');

  // Check database
  const dbReady = await checkDatabaseConnection();

  if (!dbReady) {
    log('⏸️  Bitte richte zuerst Supabase ein, dann starte erneut:\n', 'yellow');
    log('   node scripts/quickstart.js\n', 'cyan');
    process.exit(0);
  }

  // Import products
  const imported = await importProducts();

  if (imported === 0) {
    log('⚠️  Keine Produkte importiert. Prüfe die Verbindung.\n', 'yellow');
  }

  // Show instructions
  await setupInstructions();

  // Revenue potential
  await showRevenuePotential();

  // Next steps
  header('🚀 BEREIT ZUM START!');

  log('Führe jetzt aus:', 'green');
  log('   node ai-agent/MASTER_ORCHESTRATOR.js\n', 'cyan');

  log('Oder für Cron-Automation:', 'green');
  log('   0 9 * * * cd ~/LinktoFunnel && node ai-agent/MASTER_ORCHESTRATOR.js\n', 'cyan');

  log('📖 Dokumentation:', 'blue');
  log('   • README.md - Komplette Übersicht', 'cyan');
  log('   • TERMUX_SETUP.md - Mobile Control', 'cyan');
  log('   • ai-agent/ARCHITECTURE.md - System-Design\n', 'cyan');

  log('💡 Support:', 'blue');
  log('   • GitHub Issues: https://github.com/Samar220659/LinktoFunnel', 'cyan');
  log('   • E-Mail: Samar220659@gmail.com\n', 'cyan');

  log('🎉 Viel Erfolg mit deinem digitalen Zwilling!\n', 'bright');
}

if (require.main === module) {
  main().catch(err => {
    log(`\n💥 Error: ${err.message}\n`, 'red');
    process.exit(1);
  });
}
