import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function applySchema() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Fehlende Umgebungsvariablen!');
    console.log('SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('📄 Lese Schema-Datei...');
  const schemaPath = path.resolve(__dirname, '../ai-agent/data/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  console.log('🗑️  Lösche alle bestehenden Tabellen...');

  // Get all tables
  const { data: tables, error: tableError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .eq('table_type', 'BASE TABLE');

  if (!tableError && tables) {
    for (const table of tables) {
      console.log(`  Lösche Tabelle: ${table.table_name}`);
      const { error } = await supabase.rpc('exec_sql', {
        sql: `DROP TABLE IF EXISTS ${table.table_name} CASCADE;`
      });
      if (error) {
        console.log(`  ⚠️  Konnte ${table.table_name} nicht löschen (wird ignoriert)`);
      }
    }
  }

  console.log('\n📦 Wende Schema an über Supabase SQL Editor...');
  console.log('\n⚠️  WICHTIG: Die Supabase JavaScript-Client-Bibliothek kann keine DDL-Statements ausführen.');
  console.log('Sie müssen das Schema manuell anwenden:\n');
  console.log('1. Öffnen Sie: https://supabase.com/dashboard/project/mkiliztwhxzwizwwjhqn/sql/new');
  console.log('2. Kopieren Sie den Inhalt von: ai-agent/data/schema.sql');
  console.log('3. Fügen Sie ihn in den SQL Editor ein');
  console.log('4. Klicken Sie auf "Run"\n');

  console.log('📋 Schema-Datei-Pfad:', schemaPath);
  console.log('\nAlternativ können Sie warten bis die Netzwerkverbindung stabiler ist und dann:');
  console.log('  node scripts/cleanup_and_setup.js\n');
}

applySchema().catch(err => {
  console.error('❌ Fehler:', err.message);
  process.exit(1);
});
