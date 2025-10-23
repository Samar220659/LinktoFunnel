#!/usr/bin/env node

/**
 * API Connection Test Script
 * Tests all configured APIs and reports status
 */

require('dotenv').config({ path: '.env.local' });

const testResults = {
  passed: [],
  failed: [],
};

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test Supabase Connection
async function testSupabase() {
  log('\n🔍 Testing Supabase connection...', 'blue');

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Try to fetch from generations table
    const { data, error } = await supabase
      .from('generations')
      .select('*')
      .limit(1);

    if (error) {
      throw new Error(`Supabase query error: ${error.message}`);
    }

    testResults.passed.push('Supabase');
    log('✅ Supabase: Connected successfully', 'green');
    log(`   Database URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`, 'blue');

    return true;
  } catch (error) {
    testResults.failed.push({ name: 'Supabase', error: error.message });
    log(`❌ Supabase: ${error.message}`, 'red');
    return false;
  }
}

// Test OpenAI API
async function testOpenAI() {
  log('\n🔍 Testing OpenAI API...', 'blue');

  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    testResults.passed.push('OpenAI');
    log('✅ OpenAI: API key valid', 'green');
    log(`   Available models: ${data.data.length}`, 'blue');

    return true;
  } catch (error) {
    testResults.failed.push({ name: 'OpenAI', error: error.message });
    log(`❌ OpenAI: ${error.message}`, 'red');
    return false;
  }
}

// Test Gemini API
async function testGemini() {
  log('\n🔍 Testing Gemini API...', 'blue');

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${process.env.GEMINI_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    testResults.passed.push('Gemini');
    log('✅ Gemini: API key valid', 'green');
    log(`   Available models: ${data.models?.length || 0}`, 'blue');

    return true;
  } catch (error) {
    testResults.failed.push({ name: 'Gemini', error: error.message });
    log(`❌ Gemini: ${error.message}`, 'red');
    return false;
  }
}

// Test ScrapingBee API
async function testScrapingBee() {
  log('\n🔍 Testing ScrapingBee API...', 'blue');

  try {
    const testUrl = 'https://example.com';
    const apiUrl = `https://app.scrapingbee.com/api/v1/?api_key=${process.env.SCRAPINGBEE_API_KEY}&url=${encodeURIComponent(testUrl)}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    testResults.passed.push('ScrapingBee');
    log('✅ ScrapingBee: API key valid', 'green');

    return true;
  } catch (error) {
    testResults.failed.push({ name: 'ScrapingBee', error: error.message });
    log(`❌ ScrapingBee: ${error.message}`, 'red');
    return false;
  }
}

// Main test runner
async function runAllTests() {
  log('\n🚀 Starting API Connection Tests...', 'yellow');
  log('═══════════════════════════════════════', 'yellow');

  await testSupabase();
  await testOpenAI();
  await testGemini();
  await testScrapingBee();

  // Summary
  log('\n📊 Test Summary:', 'yellow');
  log('═══════════════════════════════════════', 'yellow');
  log(`✅ Passed: ${testResults.passed.length}`, 'green');
  log(`❌ Failed: ${testResults.failed.length}`, 'red');

  if (testResults.failed.length > 0) {
    log('\n❌ Failed Tests:', 'red');
    testResults.failed.forEach(({ name, error }) => {
      log(`   - ${name}: ${error}`, 'red');
    });
  }

  log('\n═══════════════════════════════════════\n', 'yellow');

  // Exit with error code if any tests failed
  process.exit(testResults.failed.length > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  log(`\n💥 Unexpected error: ${error.message}`, 'red');
  process.exit(1);
});
