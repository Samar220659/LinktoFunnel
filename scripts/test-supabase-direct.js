#!/usr/bin/env node

/**
 * 🔍 SUPABASE DIRECT REST API TESTER
 * Testet Supabase ohne @supabase/supabase-js
 */

require('dotenv').config({ path: '.env.local' });
const https = require('https');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const c = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
};

function log(msg, color = 'reset') {
  console.log(`${c[color]}${msg}${c.reset}`);
}

function httpsRequest(url, options) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data,
          headers: res.headers
        });
      });
    });

    req.on('error', (err) => reject(err));
    req.end();
  });
}

async function testSupabaseDirectly() {
  log('\n🔍 TESTE SUPABASE REST API DIREKT...', 'cyan');
  log('─'.repeat(60), 'cyan');

  // Extract hostname from URL
  const hostname = SUPABASE_URL.replace('https://', '').replace('http://', '');

  log(`\n📡 URL: ${SUPABASE_URL}`, 'cyan');
  log(`🔑 Key: ${SUPABASE_KEY.substring(0, 20)}...`, 'cyan');

  try {
    // Test 1: Check digistore_products table
    const url = `${SUPABASE_URL}/rest/v1/digistore_products?select=count`;

    const response = await httpsRequest(url, {
      hostname: hostname.split('/')[0],
      path: `/rest/v1/digistore_products?select=count`,
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    log(`\n📊 HTTP Status: ${response.status}`, response.status === 200 ? 'green' : 'yellow');

    if (response.status === 200) {
      log('✅ VERBINDUNG ERFOLGREICH!', 'green');
      log('✅ Tabelle "digistore_products" existiert!', 'green');

      const data = JSON.parse(response.data);
      log(`\n📦 Anzahl Produkte: ${data.length}`, 'cyan');

      return true;
    } else if (response.status === 404 || response.status === 400) {
      log('⚠️  Tabelle "digistore_products" existiert NICHT!', 'yellow');
      log('\n📋 NÄCHSTER SCHRITT:', 'yellow');
      log('   → Deploye das Supabase Schema:', 'cyan');
      log('   → Siehe: SUPABASE_DEPLOYMENT_ANLEITUNG.md\n', 'cyan');
      return false;
    } else {
      log(`⚠️  Unerwarteter Status: ${response.status}`, 'yellow');
      log(`📄 Response: ${response.data.substring(0, 200)}`, 'cyan');
      return false;
    }

  } catch (err) {
    log(`\n❌ FEHLER: ${err.message}`, 'red');
    log('\n💡 Mögliche Lösungen:', 'yellow');
    log('   1. Prüfe NEXT_PUBLIC_SUPABASE_URL in .env.local', 'cyan');
    log('   2. Prüfe NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local', 'cyan');
    log('   3. Stelle sicher, dass Supabase-Projekt aktiv ist', 'cyan');
    log('   4. Deploye das Schema: siehe SUPABASE_DEPLOYMENT_ANLEITUNG.md\n', 'cyan');
    return false;
  }
}

async function main() {
  console.clear();

  log('\n╔══════════════════════════════════════╗', 'cyan');
  log('║  🔍 SUPABASE DIRECT CONNECTION TEST  ║', 'cyan');
  log('╚══════════════════════════════════════╝\n', 'cyan');

  const success = await testSupabaseDirectly();

  if (success) {
    log('\n🎉 ALLES BEREIT!', 'green');
    log('   Nächster Schritt: node scripts/quickstart.js\n', 'cyan');
    process.exit(0);
  } else {
    log('\n⏸️  SETUP ERFORDERLICH', 'yellow');
    log('   Siehe: SUPABASE_DEPLOYMENT_ANLEITUNG.md\n', 'cyan');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { testSupabaseDirectly };
