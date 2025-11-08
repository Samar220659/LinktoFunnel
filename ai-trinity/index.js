#!/usr/bin/env node

/**
 * 🌉 AI TRINITY BRIDGE - MAIN ENTRY POINT
 * Orchestrates communication between Claude AI, Gemini, and Claude Code
 */

require('dotenv').config({ path: '../.env.local' });
const { AITrinityOrchestrator } = require('./core/orchestrator');

const orchestrator = new AITrinityOrchestrator({
  claudeApiKey: process.env.ANTHROPIC_API_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY
});

async function main() {
  console.log('\n🌉 AI Trinity Bridge Starting...\n');

  await orchestrator.init();

  console.log('✅ AI Trinity Bridge is running');
  console.log('📡 Listening for messages...\n');

  // Keep process alive
  process.on('SIGINT', async () => {
    console.log('\n👋 Shutting down gracefully...');
    await orchestrator.stop();
    process.exit(0);
  });
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
