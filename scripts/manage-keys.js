#!/usr/bin/env node

// 🔧 API KEY MANAGER CLI
// Command-line tool for managing API keys

import apiKeyManager from '../lib/api-key-manager.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

const commands = {
  async list() {
    console.log('\n🔑 Configured API Keys:\n');
    const keys = await apiKeyManager.getAllKeys();

    for (const [keyName, maskedValue] of Object.entries(keys)) {
      const status = maskedValue !== '(not set)' ? '✓' : '✗';
      console.log(`  ${status} ${keyName}: ${maskedValue}`);
    }
    console.log();
  },

  async add() {
    console.log('\n➕ Add New API Key\n');

    const keyName = await question('Key name (e.g., OPENAI_API_KEY): ');
    if (!keyName) {
      console.log('❌ Key name required');
      return;
    }

    const keyValue = await question('Key value: ');
    if (!keyValue) {
      console.log('❌ Key value required');
      return;
    }

    await apiKeyManager.setKey(keyName.trim().toUpperCase(), keyValue.trim());
    console.log(`✅ Key "${keyName}" saved successfully!\n`);
  },

  async get() {
    const keyName = await question('\nKey name to retrieve: ');
    if (!keyName) {
      console.log('❌ Key name required');
      return;
    }

    const value = await apiKeyManager.getKey(keyName.trim().toUpperCase());

    if (value) {
      console.log(`\n🔑 ${keyName}:`);
      console.log(`   Full value: ${value}`);
      console.log(`   Masked: ***${value.slice(-4)}\n`);
    } else {
      console.log(`❌ Key "${keyName}" not found\n`);
    }
  },

  async delete() {
    const keyName = await question('\n🗑️  Key name to delete: ');
    if (!keyName) {
      console.log('❌ Key name required');
      return;
    }

    const confirm = await question(`Are you sure you want to delete "${keyName}"? (y/N): `);
    if (confirm.toLowerCase() !== 'y') {
      console.log('Cancelled\n');
      return;
    }

    await apiKeyManager.deleteKey(keyName.trim().toUpperCase());
    console.log(`✅ Key "${keyName}" deleted\n`);
  },

  async export() {
    console.log('\n📤 Exporting keys to .env.local...');
    await apiKeyManager.exportToEnv('.env.local');
    console.log('✅ Done!\n');
  },

  async import() {
    console.log('\n📥 Importing keys from .env.local...');
    const count = await apiKeyManager.importFromEnv('.env.local');
    console.log(`✅ Imported ${count} keys\n`);
  },

  async health() {
    console.log('\n🏥 API Key Manager Health Check\n');
    const status = await apiKeyManager.healthCheck();

    console.log(`Vault Available: ${status.vaultAvailable ? '✅' : '❌'}`);
    console.log(`Local Storage: ${status.localStorageAvailable ? '✅' : '❌'}`);
    console.log(`Cache Size: ${status.cacheSize} keys`);
    console.log(`Encryption: ${status.encryptionEnabled ? '✅' : '❌'}`);
    console.log();

    console.log('Critical Keys:');
    for (const key of status.keysConfigured) {
      const icon = key.configured ? '✅' : '❌';
      const source = key.configured ? `(from ${key.source})` : '';
      console.log(`  ${icon} ${key.key} ${source}`);
    }
    console.log();
  },

  async help() {
    console.log('\n🔐 API Key Manager - Available Commands:\n');
    console.log('  list      - List all configured keys (masked)');
    console.log('  add       - Add a new API key');
    console.log('  get       - Get a specific key value');
    console.log('  delete    - Delete an API key');
    console.log('  export    - Export keys to .env.local');
    console.log('  import    - Import keys from .env.local');
    console.log('  health    - Show system health status');
    console.log('  help      - Show this help message');
    console.log('  exit      - Exit the tool\n');
  }
};

async function main() {
  const args = process.argv.slice(2);

  if (args.length > 0) {
    // Direct command execution
    const command = args[0];
    if (commands[command]) {
      await commands[command]();
      rl.close();
      return;
    } else {
      console.log(`❌ Unknown command: ${command}`);
      await commands.help();
      rl.close();
      return;
    }
  }

  // Interactive mode
  console.log('\n🔐 API Key Manager - Interactive Mode');
  console.log('Type "help" for available commands\n');

  while (true) {
    const input = await question('keys> ');
    const command = input.trim().toLowerCase();

    if (!command) continue;

    if (command === 'exit' || command === 'quit') {
      console.log('Goodbye! 👋\n');
      break;
    }

    if (commands[command]) {
      try {
        await commands[command]();
      } catch (error) {
        console.error('❌ Error:', error.message, '\n');
      }
    } else {
      console.log(`❌ Unknown command: ${command}`);
      console.log('Type "help" for available commands\n');
    }
  }

  rl.close();
}

// Run
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
