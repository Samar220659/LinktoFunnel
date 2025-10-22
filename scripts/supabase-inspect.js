#!/usr/bin/env node

/**
 * Supabase Database Inspector
 * Analyzes database schema, tables, and relationships
 */

require('dotenv').config({ path: '.env.local' });

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function inspectSupabase() {
  log('\n🔍 Supabase Database Inspector', 'yellow');
  log('═══════════════════════════════════════', 'yellow');

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    log('\n✅ Connected to Supabase', 'green');
    log(`   URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`, 'blue');

    // Inspect 'generations' table
    log('\n📊 Inspecting "generations" table...', 'cyan');

    const { data: generations, error: genError, count } = await supabase
      .from('generations')
      .select('*', { count: 'exact' })
      .limit(5);

    if (genError) {
      log(`   ❌ Error: ${genError.message}`, 'red');
    } else {
      log(`   ✅ Total rows: ${count}`, 'green');

      if (generations && generations.length > 0) {
        log(`   ✅ Sample data (first ${generations.length} rows):`, 'blue');

        // Show structure
        const sampleRow = generations[0];
        const columns = Object.keys(sampleRow);
        log(`\n   📋 Columns (${columns.length}):`, 'cyan');
        columns.forEach(col => {
          const value = sampleRow[col];
          const type = typeof value;
          log(`      - ${col}: ${type}`, 'blue');
        });

        // Show sample data
        log(`\n   📄 Sample rows:`, 'cyan');
        generations.forEach((row, idx) => {
          log(`\n   Row ${idx + 1}:`, 'yellow');
          Object.entries(row).forEach(([key, value]) => {
            const displayValue = typeof value === 'object'
              ? JSON.stringify(value).substring(0, 50) + '...'
              : String(value).substring(0, 50);
            log(`      ${key}: ${displayValue}`, 'blue');
          });
        });
      } else {
        log('   ⚠️  Table is empty', 'yellow');
      }
    }

    // Try to discover other tables (this might fail due to permissions)
    log('\n🔍 Attempting to discover other tables...', 'cyan');

    const possibleTables = [
      'users',
      'products',
      'videos',
      'campaigns',
      'analytics',
      'settings',
      'api_keys',
      'templates',
      'workflows'
    ];

    log('\n   Checking for common table names:', 'blue');

    for (const tableName of possibleTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (!error) {
          log(`   ✅ Found table: "${tableName}"`, 'green');
        }
      } catch (e) {
        // Table doesn't exist or no permission - skip silently
      }
    }

    log('\n═══════════════════════════════════════\n', 'yellow');

  } catch (error) {
    log(`\n💥 Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

inspectSupabase();
