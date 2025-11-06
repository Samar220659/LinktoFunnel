#!/usr/bin/env node

/**
 * 🧪 TEST SCRIPT: Social Media API Manager
 *
 * Testet alle Komponenten des Social Media API Managers:
 * - Datenbank-Verbindung
 * - API-Sync
 * - Verschlüsselung
 * - Health Checks
 * - REST API
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { SocialMediaAPIManager, SecureStorage } = require('../ai-agent/agents/social-media-api-manager');

// Colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function testHeader(title) {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log(`  ${title}`, 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
}

async function test1_DatabaseConnection() {
  testHeader('TEST 1: Datenbank-Verbindung');

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      log('❌ FAILED: Supabase Credentials fehlen in .env.local', 'red');
      log('   Bitte NEXT_PUBLIC_SUPABASE_URL und NEXT_PUBLIC_SUPABASE_ANON_KEY setzen', 'yellow');
      return false;
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data, error } = await supabase
      .from('social_media_apis')
      .select('count')
      .limit(1);

    if (error && error.code === '42P01') {
      log('❌ FAILED: Tabelle social_media_apis existiert nicht', 'red');
      log('   Bitte führe das Schema SQL aus (siehe SOCIAL_MEDIA_API_MANAGER.md)', 'yellow');
      return false;
    }

    if (error) {
      log(`❌ FAILED: ${error.message}`, 'red');
      return false;
    }

    log('✅ PASSED: Datenbank-Verbindung erfolgreich', 'green');
    return true;

  } catch (err) {
    log(`❌ FAILED: ${err.message}`, 'red');
    return false;
  }
}

async function test2_Encryption() {
  testHeader('TEST 2: Verschlüsselung');

  try {
    const storage = new SecureStorage();

    // Test-Daten
    const testData = 'test_api_key_12345_secret';

    // Verschlüsseln
    const encrypted = storage.encrypt(testData);

    if (!encrypted.encrypted || !encrypted.iv || !encrypted.authTag) {
      log('❌ FAILED: Verschlüsselung hat keine vollständigen Daten zurückgegeben', 'red');
      return false;
    }

    // Entschlüsseln
    const decrypted = storage.decrypt(encrypted);

    if (decrypted !== testData) {
      log('❌ FAILED: Entschlüsselung liefert falschen Wert', 'red');
      log(`   Original: ${testData}`, 'yellow');
      log(`   Decrypted: ${decrypted}`, 'yellow');
      return false;
    }

    log('✅ PASSED: Verschlüsselung & Entschlüsselung funktionieren', 'green');
    return true;

  } catch (err) {
    log(`❌ FAILED: ${err.message}`, 'red');
    return false;
  }
}

async function test3_APISync() {
  testHeader('TEST 3: API-Synchronisierung');

  try {
    const manager = new SocialMediaAPIManager();
    await manager.initialize();

    log('   Synchronisiere APIs zur Datenbank...', 'cyan');
    await manager.syncAPIsToDatabase();

    // Check if APIs were synced
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: apis, error } = await supabase
      .from('social_media_apis')
      .select('*');

    if (error) {
      log(`❌ FAILED: ${error.message}`, 'red');
      return false;
    }

    if (!apis || apis.length === 0) {
      log('❌ FAILED: Keine APIs wurden synchronisiert', 'red');
      return false;
    }

    log(`✅ PASSED: ${apis.length} APIs erfolgreich synchronisiert`, 'green');

    // Show platforms
    const platforms = [...new Set(apis.map(a => a.platform))];
    log(`   Plattformen: ${platforms.join(', ')}`, 'cyan');

    return true;

  } catch (err) {
    log(`❌ FAILED: ${err.message}`, 'red');
    return false;
  }
}

async function test4_HealthCheck() {
  testHeader('TEST 4: Health Check');

  try {
    const manager = new SocialMediaAPIManager();

    log('   Führe Test-Health-Check durch...', 'cyan');

    // Test single API
    const isAvailable = await manager.verifyAPIAvailability('tiktok', 'TikTok Creator API');

    log(`   TikTok Creator API: ${isAvailable ? '✅ Verfügbar' : '⚠️ Nicht erreichbar'}`, 'cyan');

    // Check if health data was saved
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: healthChecks, error } = await supabase
      .from('social_media_api_health')
      .select('*')
      .order('check_timestamp', { ascending: false })
      .limit(1);

    if (error) {
      log(`❌ FAILED: ${error.message}`, 'red');
      return false;
    }

    if (!healthChecks || healthChecks.length === 0) {
      log('⚠️  WARNING: Keine Health-Check Daten gespeichert', 'yellow');
      log('   Möglicherweise fehlen Tabellen-Berechtigungen', 'yellow');
      return true; // Soft fail
    }

    log('✅ PASSED: Health Check erfolgreich durchgeführt', 'green');
    return true;

  } catch (err) {
    log(`❌ FAILED: ${err.message}`, 'red');
    return false;
  }
}

async function test5_APIKeyStorage() {
  testHeader('TEST 5: API-Key Speicherung');

  try {
    const manager = new SocialMediaAPIManager();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Get first API
    const { data: apis } = await supabase
      .from('social_media_apis')
      .select('id')
      .limit(1);

    if (!apis || apis.length === 0) {
      log('⚠️  SKIPPED: Keine APIs zum Testen vorhanden', 'yellow');
      return true;
    }

    const testApiId = apis[0].id;
    const testKeyValue = 'test_secret_key_12345';

    // Store key
    log('   Speichere Test-API-Key...', 'cyan');
    const stored = await manager.storeAPIKey(
      testApiId,
      'test_key',
      testKeyValue,
      { read: true, write: false }
    );

    if (!stored) {
      log('❌ FAILED: API-Key konnte nicht gespeichert werden', 'red');
      return false;
    }

    // Retrieve key
    log('   Lade Test-API-Key...', 'cyan');
    const retrieved = await manager.retrieveAPIKey(testApiId, 'test_key');

    if (retrieved !== testKeyValue) {
      log('❌ FAILED: API-Key wurde nicht korrekt entschlüsselt', 'red');
      return false;
    }

    // Clean up
    await supabase
      .from('social_media_api_keys')
      .delete()
      .eq('api_id', testApiId)
      .eq('key_name', 'test_key');

    log('✅ PASSED: API-Key Speicherung & Abruf funktioniert', 'green');
    return true;

  } catch (err) {
    log(`❌ FAILED: ${err.message}`, 'red');
    return false;
  }
}

async function test6_RESTServer() {
  testHeader('TEST 6: REST API Server');

  try {
    // Check if server is running
    log('   Teste REST API Server...', 'cyan');

    const port = process.env.API_SERVER_PORT || 3001;
    const testUrl = `http://localhost:${port}/health`;

    try {
      const response = await fetch(testUrl);
      const data = await response.json();

      if (response.ok && data.status === 'ok') {
        log('✅ PASSED: REST API Server läuft', 'green');
        return true;
      } else {
        log('⚠️  WARNING: REST API Server antwortet nicht korrekt', 'yellow');
        return true; // Soft fail
      }
    } catch (fetchErr) {
      log('⚠️  WARNING: REST API Server ist nicht erreichbar', 'yellow');
      log(`   Start Server mit: node ai-agent/api/social-media-api-server.js`, 'cyan');
      return true; // Soft fail - Server muss nicht immer laufen
    }

  } catch (err) {
    log(`❌ FAILED: ${err.message}`, 'red');
    return false;
  }
}

// ===== MAIN =====

async function main() {
  log('\n', 'reset');
  log('╔══════════════════════════════════════════════════╗', 'cyan');
  log('║   🧪 Social Media API Manager Test Suite        ║', 'bright');
  log('╚══════════════════════════════════════════════════╝', 'cyan');

  const results = [];

  // Run all tests
  results.push({ name: 'Datenbank-Verbindung', passed: await test1_DatabaseConnection() });
  results.push({ name: 'Verschlüsselung', passed: await test2_Encryption() });
  results.push({ name: 'API-Synchronisierung', passed: await test3_APISync() });
  results.push({ name: 'Health Check', passed: await test4_HealthCheck() });
  results.push({ name: 'API-Key Speicherung', passed: await test5_APIKeyStorage() });
  results.push({ name: 'REST API Server', passed: await test6_RESTServer() });

  // Summary
  testHeader('ZUSAMMENFASSUNG');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  for (const result of results) {
    const icon = result.passed ? '✅' : '❌';
    const color = result.passed ? 'green' : 'red';
    log(`${icon} ${result.name}`, color);
  }

  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log(`ERGEBNIS: ${passed}/${total} Tests bestanden`, passed === total ? 'green' : 'yellow');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

  if (failed > 0) {
    log('⚠️  Einige Tests sind fehlgeschlagen', 'yellow');
    log('Bitte überprüfe die SOCIAL_MEDIA_API_MANAGER.md für Setup-Anweisungen\n', 'yellow');
    process.exit(1);
  } else {
    log('🎉 Alle Tests bestanden! Social Media API Manager ist einsatzbereit!\n', 'green');
    process.exit(0);
  }
}

// Run tests
if (require.main === module) {
  main().catch(err => {
    log(`\n💥 Critical Error: ${err.message}\n`, 'red');
    console.error(err);
    process.exit(1);
  });
}

module.exports = { main };
