const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

async function cleanupAndSetup() {
  const connectionString = `postgres://postgres:DanielOettel@@@@@db.${new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname}:5432/postgres`;

  let client = null;
  let attempts = 0;
  const maxAttempts = 5;

  while (!client && attempts < maxAttempts) {
    attempts++;
    try {
      console.log(`🔌 Verbindungsversuch ${attempts}/${maxAttempts}...`);
      const newClient = new Client({
        connectionString,
        connectionTimeoutMillis: 10000,
        query_timeout: 30000,
      });
      await newClient.connect();
      client = newClient;
      console.log('✅ Mit der Datenbank verbunden.');
    } catch (err) {
      if (attempts === maxAttempts) {
        throw err;
      }
      console.log(`⚠️  Verbindung fehlgeschlagen, warte 3 Sekunden... (${err.message})`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  try {

    // 1. Lösche das komplette public Schema
    console.log('\n🗑️  Lösche vorhandenes Schema...');
    await client.query('DROP SCHEMA IF EXISTS public CASCADE;');
    console.log('✅ Schema gelöscht.');

    // 2. Erstelle das Schema neu
    console.log('\n📦 Erstelle neues Schema...');
    await client.query('CREATE SCHEMA public;');
    await client.query('GRANT ALL ON SCHEMA public TO postgres;');
    await client.query('GRANT ALL ON SCHEMA public TO public;');
    console.log('✅ Schema erstellt.');

    // 3. Erstelle UUID Extension
    console.log('\n🔧 Erstelle Erweiterungen...');
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    console.log('✅ Erweiterungen erstellt.');

    // 4. Lese und führe das Schema aus
    console.log('\n📄 Wende Datenbank-Schema an...');
    const schema = fs.readFileSync(path.resolve(__dirname, '../ai-agent/data/schema.sql'), 'utf-8');
    const statements = schema.split(/;\s*$/m).filter(s => s.trim().length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        await client.query(statement);
        const preview = statement.trim().substring(0, 50).replace(/\n/g, ' ');
        console.log(`  ✓ ${preview}...`);
      }
    }

    console.log('\n✅ Datenbank-Schema erfolgreich angewendet!');
    console.log('\n🎉 Setup abgeschlossen! Die Datenbank ist bereit.');

  } catch (err) {
    console.error('\n❌ Fehler beim Setup:', err.message);
    throw err;
  } finally {
    await client.end();
    console.log('\n🔌 Verbindung getrennt.');
  }
}

cleanupAndSetup();
