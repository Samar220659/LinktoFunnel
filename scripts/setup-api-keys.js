#!/usr/bin/env node

// 🔐 API KEY SETUP WIZARD
// Interactive setup for API key management

import readline from 'readline';
import apiKeyManager from '../lib/api-key-manager.js';

// Simple color helpers (no external deps needed)
const colors = {
  cyan: (str) => `\x1b[36m${str}\x1b[0m`,
  yellow: (str) => `\x1b[33m${str}\x1b[0m`,
  green: (str) => `\x1b[32m${str}\x1b[0m`,
  red: (str) => `\x1b[31m${str}\x1b[0m`,
  gray: (str) => `\x1b[90m${str}\x1b[0m`,
  blue: (str) => `\x1b[34m${str}\x1b[0m`,
  bold: (str) => `\x1b[1m${str}\x1b[0m`
};

const chalk = {
  cyan: { bold: (str) => colors.bold(colors.cyan(str)) },
  yellow: { bold: (str) => colors.bold(colors.yellow(str)) },
  green: (str) => colors.green(str),
  red: (str) => colors.red(str),
  gray: (str) => colors.gray(str),
  blue: (str) => colors.blue(str)
};

// Make chalk functions callable directly
Object.keys(colors).forEach(color => {
  if (!chalk[color]) chalk[color] = colors[color];
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

const API_KEY_CONFIG = {
  critical: [
    {
      name: 'NEXT_PUBLIC_SUPABASE_URL',
      description: 'Supabase Project URL',
      example: 'https://xxxxx.supabase.co',
      required: true,
      validate: (val) => val.includes('supabase.co')
    },
    {
      name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      description: 'Supabase Anonymous Key',
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      required: true,
      validate: (val) => val.startsWith('eyJ')
    },
    {
      name: 'SUPABASE_SERVICE_ROLE_KEY',
      description: 'Supabase Service Role Key (for Vault)',
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      required: false,
      validate: (val) => val.startsWith('eyJ')
    },
    {
      name: 'GEMINI_API_KEY',
      description: 'Google Gemini API Key (FREE at ai.google.dev)',
      example: 'AIzaSy...',
      required: true,
      validate: (val) => val.startsWith('AIza')
    }
  ],

  optional: [
    {
      name: 'OPENAI_API_KEY',
      description: 'OpenAI API Key (for GPT-4)',
      example: 'sk-...',
      category: 'AI'
    },
    {
      name: 'TELEGRAM_BOT_TOKEN',
      description: 'Telegram Bot Token (from @BotFather)',
      example: '123456789:ABCdef...',
      category: 'Notifications'
    },
    {
      name: 'TELEGRAM_CHAT_ID',
      description: 'Your Telegram Chat ID',
      example: '123456789',
      category: 'Notifications'
    },
    {
      name: 'DIGISTORE24_API_KEY',
      description: 'Digistore24 API Key',
      example: 'ds24_...',
      category: 'Marketing'
    },
    {
      name: 'GETRESPONSE_API_KEY',
      description: 'GetResponse API Key',
      example: 'gr_...',
      category: 'Marketing'
    },
    {
      name: 'SCRAPINGBEE_API_KEY',
      description: 'ScrapingBee API Key',
      example: 'sb_...',
      category: 'Data Collection'
    }
  ]
};

async function displayBanner() {
  console.clear();
  console.log(chalk.cyan.bold('\n╔═══════════════════════════════════════════════╗'));
  console.log(chalk.cyan.bold('║   🔐 API KEY MANAGEMENT SETUP WIZARD          ║'));
  console.log(chalk.cyan.bold('╚═══════════════════════════════════════════════╝\n'));
}

async function checkExistingKeys() {
  console.log(chalk.yellow('🔍 Checking for existing API keys...\n'));

  const health = await apiKeyManager.healthCheck();

  console.log(chalk.blue('📊 Current Status:'));
  console.log(`   Vault Available: ${health.vaultAvailable ? '✅' : '❌'}`);
  console.log(`   Local Storage: ${health.localStorageAvailable ? '✅' : '❌'}`);
  console.log(`   Keys in Cache: ${health.cacheSize}`);
  console.log();

  console.log(chalk.blue('🔑 Configured Keys:'));
  for (const key of health.keysConfigured) {
    const status = key.configured ? chalk.green('✓') : chalk.red('✗');
    const source = key.configured ? chalk.gray(`(${key.source})`) : '';
    console.log(`   ${status} ${key.key} ${source}`);
  }
  console.log();
}

async function setupCriticalKeys() {
  console.log(chalk.yellow.bold('📝 STEP 1: Critical Keys (Required)\n'));

  for (const keyConfig of API_KEY_CONFIG.critical) {
    const existingValue = await apiKeyManager.getKey(keyConfig.name);

    if (existingValue) {
      const masked = '***' + existingValue.slice(-4);
      console.log(chalk.green(`✓ ${keyConfig.name} already set: ${masked}`));

      const update = await question(chalk.yellow('  Update? (y/N): '));
      if (update.toLowerCase() !== 'y') {
        continue;
      }
    }

    console.log(chalk.cyan(`\n📋 ${keyConfig.description}`));
    console.log(chalk.gray(`   Example: ${keyConfig.example}`));

    let value = '';
    let valid = false;

    while (!valid) {
      value = await question(chalk.yellow(`   Enter value: `));

      if (!value && !keyConfig.required) {
        console.log(chalk.gray('   Skipped (optional)'));
        valid = true;
        break;
      }

      if (!value && keyConfig.required) {
        console.log(chalk.red('   ❌ This key is required!'));
        continue;
      }

      if (keyConfig.validate && !keyConfig.validate(value)) {
        console.log(chalk.red('   ❌ Invalid format!'));
        continue;
      }

      valid = true;
    }

    if (value) {
      await apiKeyManager.setKey(keyConfig.name, value);
      console.log(chalk.green(`   ✅ Saved securely!`));
    }
  }

  console.log();
}

async function setupOptionalKeys() {
  console.log(chalk.yellow.bold('\n📝 STEP 2: Optional Keys\n'));

  const setupOptional = await question(
    chalk.yellow('Would you like to setup optional API keys now? (y/N): ')
  );

  if (setupOptional.toLowerCase() !== 'y') {
    console.log(chalk.gray('Skipped. You can add them later with: npm run keys:add\n'));
    return;
  }

  // Group by category
  const byCategory = {};
  for (const key of API_KEY_CONFIG.optional) {
    if (!byCategory[key.category]) {
      byCategory[key.category] = [];
    }
    byCategory[key.category].push(key);
  }

  for (const [category, keys] of Object.entries(byCategory)) {
    console.log(chalk.cyan.bold(`\n📦 ${category} Keys:`));

    for (const keyConfig of keys) {
      const existingValue = await apiKeyManager.getKey(keyConfig.name);

      if (existingValue) {
        const masked = '***' + existingValue.slice(-4);
        console.log(chalk.green(`✓ ${keyConfig.name}: ${masked} (skip)`));
        continue;
      }

      const setup = await question(
        chalk.yellow(`  Setup ${keyConfig.name}? (y/N): `)
      );

      if (setup.toLowerCase() === 'y') {
        console.log(chalk.gray(`  ${keyConfig.description}`));
        console.log(chalk.gray(`  Example: ${keyConfig.example}`));

        const value = await question(chalk.yellow(`  Enter value: `));

        if (value) {
          await apiKeyManager.setKey(keyConfig.name, value);
          console.log(chalk.green(`  ✅ Saved!`));
        }
      }
    }
  }
}

async function generateEnvFile() {
  console.log(chalk.yellow.bold('\n📝 STEP 3: Generate .env.local file\n'));

  const generate = await question(
    chalk.yellow('Generate .env.local file from stored keys? (Y/n): ')
  );

  if (generate.toLowerCase() !== 'n') {
    await apiKeyManager.exportToEnv('.env.local');
    console.log(chalk.green('✅ .env.local generated successfully!'));
  }
}

async function displaySummary() {
  console.log(chalk.cyan.bold('\n╔═══════════════════════════════════════════════╗'));
  console.log(chalk.cyan.bold('║   ✅ SETUP COMPLETE!                          ║'));
  console.log(chalk.cyan.bold('╚═══════════════════════════════════════════════╝\n'));

  const keys = await apiKeyManager.getAllKeys();

  console.log(chalk.blue('📊 Configured API Keys:\n'));

  let configured = 0;
  for (const [keyName, maskedValue] of Object.entries(keys)) {
    if (maskedValue !== '(not set)') {
      console.log(chalk.green(`✓ ${keyName}: ${maskedValue}`));
      configured++;
    }
  }

  console.log(chalk.gray(`\nTotal: ${configured} keys configured\n`));

  console.log(chalk.yellow('🚀 Next Steps:\n'));
  console.log('   1. Setup Supabase database: npm run db:setup');
  console.log('   2. Test API connections: npm test');
  console.log('   3. Start the system: node ai-agent/MASTER_ORCHESTRATOR.js\n');

  console.log(chalk.gray('💡 Manage keys anytime:'));
  console.log(chalk.gray('   • Add key: npm run keys:add'));
  console.log(chalk.gray('   • List keys: npm run keys:list'));
  console.log(chalk.gray('   • Export to .env: npm run keys:export\n'));
}

async function importExisting() {
  console.log(chalk.yellow('\n📥 Import from existing .env.local?\n'));

  const doImport = await question(chalk.yellow('Import? (y/N): '));

  if (doImport.toLowerCase() === 'y') {
    const imported = await apiKeyManager.importFromEnv('.env.local');
    console.log(chalk.green(`✅ Imported ${imported} keys from .env.local\n`));
  }
}

async function main() {
  try {
    await displayBanner();
    await checkExistingKeys();
    await importExisting();
    await setupCriticalKeys();
    await setupOptionalKeys();
    await generateEnvFile();
    await displaySummary();
  } catch (error) {
    console.error(chalk.red('\n❌ Setup failed:'), error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default main;
