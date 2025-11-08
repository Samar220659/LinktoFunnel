#!/usr/bin/env node

/**
 * 🤖 SETUP AUTOMATION MCP SERVER
 *
 * Vollautomatischer Setup-Agent für LinktoFunnel!
 *
 * Tools:
 * 1. setup_supabase_database - Führt SQL Schema automatisch aus
 * 2. deploy_to_railway - Deployed Projekt auf Railway
 * 3. test_telegram_bot - Testet Telegram Bot
 * 4. complete_setup - Führt ALLES automatisch aus!
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

// ===== CONFIGURATION =====
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// ===== MCP SERVER =====
const server = new Server(
  {
    name: 'linktofunnel-setup-automation',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ===== TOOL DEFINITIONS =====
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'setup_supabase_database',
        description: 'Führt das Supabase SQL Schema automatisch aus. Erstellt alle Tabellen für das System.',
        inputSchema: {
          type: 'object',
          properties: {
            confirm: {
              type: 'boolean',
              description: 'Bestätigung dass Schema ausgeführt werden soll'
            }
          },
          required: ['confirm']
        },
      },
      {
        name: 'deploy_to_railway',
        description: 'Deployed das Projekt automatisch auf Railway mit allen Environment Variables',
        inputSchema: {
          type: 'object',
          properties: {
            railway_token: {
              type: 'string',
              description: 'Railway API Token (von railway.app/account/tokens)'
            },
            project_name: {
              type: 'string',
              description: 'Name für das Railway Projekt',
              default: 'linktofunnel-autopilot'
            }
          },
          required: ['railway_token']
        },
      },
      {
        name: 'test_telegram_bot',
        description: 'Testet den Telegram Bot und sendet Test-Nachricht',
        inputSchema: {
          type: 'object',
          properties: {
            send_test_message: {
              type: 'boolean',
              description: 'Soll Test-Nachricht gesendet werden?',
              default: true
            }
          }
        },
      },
      {
        name: 'complete_setup',
        description: 'VOLLAUTOMATISCHES SETUP! Führt ALLE Schritte aus: Supabase SQL + Railway Deploy + Bot Test',
        inputSchema: {
          type: 'object',
          properties: {
            railway_token: {
              type: 'string',
              description: 'Railway API Token (OPTIONAL - wenn vorhanden wird deployed)'
            },
            skip_railway: {
              type: 'boolean',
              description: 'Railway Deploy überspringen? (Nur Supabase + Bot Test)',
              default: false
            }
          }
        },
      },
      {
        name: 'get_setup_status',
        description: 'Zeigt aktuellen Setup-Status: Was ist fertig, was fehlt noch?',
        inputSchema: {
          type: 'object',
          properties: {}
        },
      }
    ],
  };
});

// ===== TOOL IMPLEMENTATIONS =====

async function setupSupabaseDatabase() {
  try {
    console.log('🔧 Supabase Database Setup wird gestartet...');

    // Supabase Client erstellen
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // SQL Schema laden
    const schemaPath = join(__dirname, '../supabase-schema.sql');
    const sqlSchema = readFileSync(schemaPath, 'utf-8');

    console.log('📄 SQL Schema geladen:', sqlSchema.length, 'Zeichen');

    // SQL in Statements aufteilen (bei Semikolon)
    const statements = sqlSchema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log('📝', statements.length, 'SQL Statements gefunden');

    // Jedes Statement ausführen
    const results = [];
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      console.log(`⚙️  Führe Statement ${i + 1}/${statements.length} aus...`);

      try {
        // Supabase nutzt .rpc() für SQL Queries
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: stmt + ';'
        });

        if (error) {
          // Versuche direkt über REST API
          const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/query`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: stmt + ';' })
          });

          if (!response.ok) {
            console.warn(`⚠️  Statement ${i + 1} fehlgeschlagen (möglicherweise schon vorhanden)`);
          } else {
            console.log(`✅ Statement ${i + 1} erfolgreich`);
          }
        } else {
          console.log(`✅ Statement ${i + 1} erfolgreich`);
          results.push({ statement: i + 1, success: true });
        }
      } catch (err) {
        console.warn(`⚠️  Statement ${i + 1} Error:`, err.message);
      }
    }

    // Tabellen überprüfen
    console.log('\n🔍 Überprüfe erstellte Tabellen...');

    const tables = ['users', 'credentials', 'social_accounts', 'affiliate_accounts',
                   'automation_settings', 'approval_queue', 'products', 'content', 'posts', 'analytics'];

    const tableStatus = {};
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('count').limit(1);
      tableStatus[table] = error ? '❌ Fehlt' : '✅ Vorhanden';
      console.log(`  ${tableStatus[table]} ${table}`);
    }

    const allTablesExist = Object.values(tableStatus).every(v => v.startsWith('✅'));

    return {
      success: allTablesExist,
      message: allTablesExist ?
        '✅ SUPABASE SETUP KOMPLETT! Alle Tabellen erstellt!' :
        '⚠️  Einige Tabellen fehlen noch. Bitte SQL manuell in Supabase SQL Editor ausführen.',
      tables: tableStatus,
      statements_executed: results.length
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: '❌ Supabase Setup fehlgeschlagen',
      help: 'Bitte manuell in Supabase SQL Editor ausführen: https://supabase.com/dashboard/project/mkiliztwxhxzwizwwjhqn'
    };
  }
}

async function deployToRailway(railwayToken, projectName = 'linktofunnel-autopilot') {
  try {
    console.log('🚂 Railway Deployment wird gestartet...');

    // Railway GraphQL API
    const railwayAPI = 'https://backboard.railway.app/graphql/v2';

    // 1. Projekt erstellen
    console.log('📦 Erstelle Railway Projekt...');

    const createProjectQuery = `
      mutation {
        projectCreate(input: {
          name: "${projectName}"
        }) {
          id
          name
        }
      }
    `;

    const projectResponse = await fetch(railwayAPI, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${railwayToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: createProjectQuery })
    });

    const projectData = await projectResponse.json();

    if (projectData.errors) {
      throw new Error('Railway Projekt konnte nicht erstellt werden: ' + JSON.stringify(projectData.errors));
    }

    const projectId = projectData.data.projectCreate.id;
    console.log('✅ Projekt erstellt:', projectId);

    // 2. GitHub Repo verbinden
    console.log('🔗 Verbinde GitHub Repository...');

    const connectRepoQuery = `
      mutation {
        serviceConnect(input: {
          projectId: "${projectId}"
          source: {
            repo: "Samar220659/LinktoFunnel"
            branch: "claude/fullstack-automation-guide-011CUtrnKExpN8KHoVW3L4iU"
          }
        }) {
          id
        }
      }
    `;

    const serviceResponse = await fetch(railwayAPI, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${railwayToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: connectRepoQuery })
    });

    const serviceData = await serviceResponse.json();

    if (serviceData.errors) {
      throw new Error('GitHub Repo konnte nicht verbunden werden: ' + JSON.stringify(serviceData.errors));
    }

    const serviceId = serviceData.data.serviceConnect.id;
    console.log('✅ GitHub verbunden:', serviceId);

    // 3. Environment Variables setzen
    console.log('⚙️  Setze Environment Variables...');

    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
      TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
      NODE_ENV: 'production'
    };

    for (const [key, value] of Object.entries(envVars)) {
      if (!value) continue;

      const setEnvQuery = `
        mutation {
          variableUpsert(input: {
            projectId: "${projectId}"
            serviceId: "${serviceId}"
            name: "${key}"
            value: "${value}"
          })
        }
      `;

      await fetch(railwayAPI, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${railwayToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: setEnvQuery })
      });

      console.log(`  ✅ ${key} gesetzt`);
    }

    // 4. Deployment triggern
    console.log('🚀 Triggere Deployment...');

    const deployQuery = `
      mutation {
        deploymentTrigger(input: {
          serviceId: "${serviceId}"
        }) {
          id
        }
      }
    `;

    await fetch(railwayAPI, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${railwayToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: deployQuery })
    });

    console.log('✅ Deployment gestartet!');

    return {
      success: true,
      message: '✅ RAILWAY DEPLOYMENT GESTARTET!',
      project_id: projectId,
      service_id: serviceId,
      dashboard_url: `https://railway.app/project/${projectId}`,
      note: 'Deployment läuft jetzt! Dauert ca. 3-5 Minuten. Öffne Railway Dashboard um Status zu sehen.'
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: '❌ Railway Deployment fehlgeschlagen',
      help: 'Bitte manuell deployen: https://railway.app → New Project → Deploy from GitHub'
    };
  }
}

async function testTelegramBot(sendTestMessage = true) {
  try {
    console.log('🤖 Teste Telegram Bot...');

    // Bot Info abrufen
    const botInfoResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
    const botInfo = await botInfoResponse.json();

    if (!botInfo.ok) {
      throw new Error('Bot Token ungültig: ' + botInfo.description);
    }

    console.log('✅ Bot gefunden:', botInfo.result.username);

    let testMessageSent = false;
    if (sendTestMessage && TELEGRAM_CHAT_ID) {
      // Test-Nachricht senden
      const message = `
✅ <b>TELEGRAM BOT TEST ERFOLGREICH!</b>

🤖 Bot: @${botInfo.result.username}
📱 Chat ID: ${TELEGRAM_CHAT_ID}

<b>Nächste Schritte:</b>

1. Sende /start um Setup zu beginnen
2. Beantworte Fragen im Chat (10 Min)
3. Ab morgen 08:00: Content Approvals!

🎉 <b>System ist ready!</b>
      `;

      const sendResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML'
        })
      });

      const sendData = await sendResponse.json();
      testMessageSent = sendData.ok;

      if (testMessageSent) {
        console.log('✅ Test-Nachricht gesendet!');
      }
    }

    return {
      success: true,
      message: '✅ TELEGRAM BOT FUNKTIONIERT!',
      bot: {
        id: botInfo.result.id,
        username: botInfo.result.username,
        name: botInfo.result.first_name
      },
      test_message_sent: testMessageSent,
      next_steps: [
        'Öffne Telegram',
        'Finde deinen Bot: @' + botInfo.result.username,
        'Sende: /start',
        'Folge dem Setup-Wizard'
      ]
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: '❌ Telegram Bot Test fehlgeschlagen',
      help: 'Prüfe TELEGRAM_BOT_TOKEN in .env.local'
    };
  }
}

async function completeSetup(railwayToken = null, skipRailway = false) {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  🚀 VOLLAUTOMATISCHES SETUP STARTET   ║');
  console.log('╚════════════════════════════════════════╝\n');

  const results = {
    supabase: null,
    railway: null,
    telegram: null,
    overall_success: false
  };

  // SCHRITT 1: Supabase Setup
  console.log('📝 SCHRITT 1/3: Supabase Database Setup\n');
  results.supabase = await setupSupabaseDatabase();
  console.log('\n' + results.supabase.message + '\n');

  // SCHRITT 2: Railway Deploy (optional)
  if (!skipRailway && railwayToken) {
    console.log('📝 SCHRITT 2/3: Railway Deployment\n');
    results.railway = await deployToRailway(railwayToken);
    console.log('\n' + results.railway.message + '\n');
  } else {
    console.log('⏭️  SCHRITT 2/3: Railway Deploy übersprungen\n');
    results.railway = { skipped: true };
  }

  // SCHRITT 3: Telegram Bot Test
  console.log('📝 SCHRITT 3/3: Telegram Bot Test\n');
  results.telegram = await testTelegramBot(true);
  console.log('\n' + results.telegram.message + '\n');

  // Zusammenfassung
  console.log('╔════════════════════════════════════════╗');
  console.log('║        📊 SETUP ZUSAMMENFASSUNG        ║');
  console.log('╚════════════════════════════════════════╝\n');

  const supabaseOK = results.supabase?.success;
  const railwayOK = results.railway?.success || results.railway?.skipped;
  const telegramOK = results.telegram?.success;

  console.log(`Supabase:  ${supabaseOK ? '✅ Fertig' : '❌ Fehler'}`);
  console.log(`Railway:   ${railwayOK ? '✅ Fertig' : '❌ Fehler'} ${results.railway?.skipped ? '(übersprungen)' : ''}`);
  console.log(`Telegram:  ${telegramOK ? '✅ Fertig' : '❌ Fehler'}`);

  results.overall_success = supabaseOK && railwayOK && telegramOK;

  if (results.overall_success) {
    console.log('\n🎉 SETUP KOMPLETT! System ist ready!\n');
  } else {
    console.log('\n⚠️  Einige Schritte fehlgeschlagen. Details siehe oben.\n');
  }

  return results;
}

async function getSetupStatus() {
  const status = {
    environment_variables: {},
    supabase: {},
    telegram: {},
    files: {}
  };

  // Check Environment Variables
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_KEY',
    'OPENAI_API_KEY',
    'TELEGRAM_BOT_TOKEN',
    'TELEGRAM_CHAT_ID'
  ];

  for (const varName of requiredVars) {
    status.environment_variables[varName] = process.env[varName] ? '✅ Gesetzt' : '❌ Fehlt';
  }

  // Check Supabase Connection
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { data, error } = await supabase.from('users').select('count').limit(1);
    status.supabase.connection = error ? '❌ Fehler' : '✅ Verbunden';
    status.supabase.tables_exist = error ? '❌ Tabellen fehlen' : '✅ Tabellen vorhanden';
  } catch (err) {
    status.supabase.connection = '❌ Fehler: ' + err.message;
  }

  // Check Telegram Bot
  try {
    const botInfoResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
    const botInfo = await botInfoResponse.json();
    status.telegram.bot_valid = botInfo.ok ? '✅ Funktioniert' : '❌ Ungültig';
    if (botInfo.ok) {
      status.telegram.bot_username = '@' + botInfo.result.username;
    }
  } catch (err) {
    status.telegram.bot_valid = '❌ Fehler: ' + err.message;
  }

  // Check Files
  const requiredFiles = [
    'telegram-bot-mobile-setup.js',
    'supabase-schema.sql',
    'MOBILE_SETUP.md',
    'railway.json'
  ];

  for (const file of requiredFiles) {
    try {
      readFileSync(join(__dirname, '..', file));
      status.files[file] = '✅ Vorhanden';
    } catch {
      status.files[file] = '❌ Fehlt';
    }
  }

  return {
    success: true,
    status: status,
    ready_to_deploy: Object.values(status.environment_variables).every(v => v.startsWith('✅'))
  };
}

// ===== TOOL HANDLER =====
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;

    switch (name) {
      case 'setup_supabase_database':
        result = await setupSupabaseDatabase();
        break;

      case 'deploy_to_railway':
        result = await deployToRailway(args.railway_token, args.project_name);
        break;

      case 'test_telegram_bot':
        result = await testTelegramBot(args.send_test_message !== false);
        break;

      case 'complete_setup':
        result = await completeSetup(args.railway_token, args.skip_railway);
        break;

      case 'get_setup_status':
        result = await getSetupStatus();
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };

  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// ===== START SERVER =====
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('🤖 Setup Automation MCP Server gestartet!');
  console.error('📋 Verfügbare Tools:');
  console.error('   - setup_supabase_database');
  console.error('   - deploy_to_railway');
  console.error('   - test_telegram_bot');
  console.error('   - complete_setup (VOLLAUTOMATISCH!)');
  console.error('   - get_setup_status');
}

main().catch((error) => {
  console.error('❌ Server Error:', error);
  process.exit(1);
});
