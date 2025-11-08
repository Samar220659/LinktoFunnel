#!/usr/bin/env node

/**
 * 🧪 COMPLETE SYSTEM TEST
 * Testet alle Komponenten vom Mobile-Only Setup
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import TelegramBot from 'node-telegram-bot-api';

dotenv.config({ path: '.env.local' });

// Colors for terminal
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`)
};

console.log('\n╔════════════════════════════════════════╗');
console.log('║   🧪 COMPLETE SYSTEM TEST             ║');
console.log('╚════════════════════════════════════════╝\n');

let testsPassed = 0;
let testsFailed = 0;

// ===== TEST 1: Environment Variables =====
console.log('📋 TEST 1: Environment Variables\n');

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_KEY',
  'OPENAI_API_KEY',
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_CHAT_ID'
];

for (const varName of requiredVars) {
  if (process.env[varName]) {
    log.success(`${varName} is set`);
    testsPassed++;
  } else {
    log.error(`${varName} is MISSING!`);
    testsFailed++;
  }
}

console.log('');

// ===== TEST 2: Supabase Connection =====
console.log('💾 TEST 2: Supabase Database Connection\n');

try {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  // Test connection
  const { data, error } = await supabase
    .from('users')
    .select('count')
    .limit(1);

  if (error) {
    if (error.message.includes('relation "users" does not exist')) {
      log.warning('Supabase connected but tables not created yet');
      log.info('Run the SQL schema in Supabase SQL Editor!');
      testsFailed++;
    } else {
      log.error(`Supabase error: ${error.message}`);
      testsFailed++;
    }
  } else {
    log.success('Supabase connected and tables exist!');
    testsPassed++;
  }
} catch (err) {
  log.error(`Supabase connection failed: ${err.message}`);
  testsFailed++;
}

console.log('');

// ===== TEST 3: OpenAI API =====
console.log('🤖 TEST 3: OpenAI API\n');

try {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: 'Say "Hello"' }],
    max_tokens: 10
  });

  if (completion.choices[0].message.content) {
    log.success('OpenAI API is working!');
    log.info(`Response: ${completion.choices[0].message.content}`);
    testsPassed++;
  }
} catch (err) {
  log.error(`OpenAI API failed: ${err.message}`);
  if (err.message.includes('Incorrect API key')) {
    log.info('Check your OPENAI_API_KEY in .env.local');
  }
  testsFailed++;
}

console.log('');

// ===== TEST 4: Telegram Bot =====
console.log('📱 TEST 4: Telegram Bot\n');

try {
  const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

  // Test bot token
  const botInfo = await bot.getMe();
  log.success(`Telegram Bot connected: @${botInfo.username}`);
  log.info(`Bot Name: ${botInfo.first_name}`);
  log.info(`Bot ID: ${botInfo.id}`);
  testsPassed++;

  // Try to send a test message
  try {
    await bot.sendMessage(
      process.env.TELEGRAM_CHAT_ID,
      '✅ System Test Complete!\n\nAlle Tests erfolgreich! 🎉\n\nDu kannst jetzt /start senden um mit dem Setup zu beginnen!'
    );
    log.success('Test message sent to your Telegram!');
    testsPassed++;
  } catch (err) {
    log.warning('Bot works but could not send message');
    log.info('You might need to start a conversation with the bot first');
    log.info('Open Telegram and send /start to your bot');
  }

} catch (err) {
  log.error(`Telegram Bot failed: ${err.message}`);
  if (err.message.includes('401')) {
    log.info('Invalid bot token. Check TELEGRAM_BOT_TOKEN in .env.local');
  }
  testsFailed++;
}

console.log('');

// ===== TEST 5: File Structure =====
console.log('📁 TEST 5: File Structure\n');

import { existsSync } from 'fs';

const requiredFiles = [
  'telegram-bot-mobile-setup.js',
  'MOBILE_SETUP.md',
  'supabase-schema.sql',
  'package.json',
  'railway.json'
];

for (const file of requiredFiles) {
  if (existsSync(file)) {
    log.success(`${file} exists`);
    testsPassed++;
  } else {
    log.error(`${file} is missing!`);
    testsFailed++;
  }
}

console.log('');

// ===== SUMMARY =====
console.log('╔════════════════════════════════════════╗');
console.log('║           📊 TEST SUMMARY             ║');
console.log('╚════════════════════════════════════════╝\n');

console.log(`${colors.green}✅ Passed: ${testsPassed}${colors.reset}`);
console.log(`${colors.red}❌ Failed: ${testsFailed}${colors.reset}`);
console.log(`📈 Total:  ${testsPassed + testsFailed}\n`);

if (testsFailed === 0) {
  console.log(`${colors.green}🎉 ALL TESTS PASSED! System is ready!${colors.reset}\n`);
  console.log('📱 Next Steps:\n');
  console.log('   1. Open Telegram');
  console.log('   2. Find your bot');
  console.log('   3. Send /start');
  console.log('   4. Follow the setup wizard!\n');
} else {
  console.log(`${colors.yellow}⚠️  Some tests failed. Fix them before starting!${colors.reset}\n`);

  if (testsFailed === 1 && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.log('💡 Most likely you need to:\n');
    console.log('   1. Open Supabase SQL Editor');
    console.log('   2. Copy content from supabase-schema.sql');
    console.log('   3. Run it in SQL Editor');
    console.log('   4. Run this test again!\n');
  }
}

process.exit(testsFailed > 0 ? 1 : 0);
