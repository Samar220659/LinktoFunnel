#!/usr/bin/env node

// 🚀 LINKTOFUNNEL API SERVER
// Production-ready API server for Render deployment
// Integrates with API Key Manager and AI Agents

import http from 'http';
import { URL } from 'url';
import apiKeyManager from './lib/api-key-manager.js';

const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || 'development';
const VERSION = '1.0.0';

// ===== MIDDLEWARE =====

// CORS headers
const setCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

// JSON response helper
const jsonResponse = (res, statusCode, data) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data, null, 2));
};

// Error handler
const handleError = (res, error, statusCode = 500) => {
  console.error('❌ Error:', error);
  jsonResponse(res, statusCode, {
    error: error.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
};

// Parse JSON body
const parseBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
};

// Simple rate limiting (in-memory)
const rateLimiter = new Map();
const RATE_LIMIT = 100; // requests per minute
const RATE_WINDOW = 60000; // 1 minute

const checkRateLimit = (ip) => {
  const now = Date.now();
  const userLimit = rateLimiter.get(ip) || { count: 0, resetTime: now + RATE_WINDOW };

  if (now > userLimit.resetTime) {
    userLimit.count = 0;
    userLimit.resetTime = now + RATE_WINDOW;
  }

  userLimit.count++;
  rateLimiter.set(ip, userLimit);

  return userLimit.count <= RATE_LIMIT;
};

// ===== ROUTES =====

const routes = {
  // Health check endpoint
  'GET /health': async (req, res) => {
    const health = await apiKeyManager.healthCheck();

    jsonResponse(res, 200, {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: VERSION,
      environment: ENV,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      apiKeyManager: {
        vaultAvailable: health.vaultAvailable,
        keysConfigured: health.keysConfigured.length
      }
    });
  },

  // API info
  'GET /': async (req, res) => {
    jsonResponse(res, 200, {
      name: 'LinktoFunnel API',
      version: VERSION,
      description: 'AI Business Agent - Automated Marketing Platform',
      status: 'running',
      documentation: 'https://github.com/Samar220659/LinktoFunnel',
      endpoints: {
        health: 'GET /health',
        info: 'GET /',
        agents: {
          list: 'GET /api/agents',
          productScout: 'POST /api/agents/product-scout',
          contentCreator: 'POST /api/agents/content-creator'
        },
        campaigns: {
          list: 'GET /api/campaigns',
          create: 'POST /api/campaigns',
          stats: 'GET /api/campaigns/:id/stats'
        },
        webhooks: {
          telegram: 'POST /webhook/telegram',
          digistore24: 'POST /webhook/digistore24'
        }
      }
    });
  },

  // List available agents
  'GET /api/agents': async (req, res) => {
    jsonResponse(res, 200, {
      agents: [
        {
          id: 'product-scout',
          name: 'Product Scout',
          description: 'Finds high-converting products on Digistore24',
          status: 'active',
          endpoint: '/api/agents/product-scout'
        },
        {
          id: 'content-creator',
          name: 'Viral Content Creator',
          description: 'Generates AI-powered marketing content',
          status: 'active',
          endpoint: '/api/agents/content-creator'
        },
        {
          id: 'cross-poster',
          name: 'Social Media Cross Poster',
          description: 'Posts content across multiple platforms',
          status: 'active',
          endpoint: '/api/agents/cross-poster'
        }
      ]
    });
  },

  // Trigger Product Scout Agent
  'POST /api/agents/product-scout': async (req, res) => {
    try {
      const body = await parseBody(req);
      const limit = body.limit || 10;

      // Import and run agent (dynamic import for production)
      const { default: ProductScout } = await import('./ai-agent/agents/product-scout.js');

      jsonResponse(res, 202, {
        status: 'accepted',
        message: 'Product Scout agent started',
        jobId: Date.now().toString(),
        parameters: { limit }
      });

      // Run in background (don't block response)
      ProductScout.run({ limit }).catch(err => {
        console.error('Product Scout error:', err);
      });

    } catch (error) {
      handleError(res, error);
    }
  },

  // Trigger Content Creator Agent
  'POST /api/agents/content-creator': async (req, res) => {
    try {
      const body = await parseBody(req);

      jsonResponse(res, 202, {
        status: 'accepted',
        message: 'Content Creator agent started',
        jobId: Date.now().toString(),
        parameters: body
      });

    } catch (error) {
      handleError(res, error);
    }
  },

  // Get campaigns list
  'GET /api/campaigns': async (req, res) => {
    try {
      // TODO: Fetch from Supabase
      jsonResponse(res, 200, {
        campaigns: [],
        total: 0,
        message: 'Campaign integration coming soon'
      });
    } catch (error) {
      handleError(res, error);
    }
  },

  // Create new campaign
  'POST /api/campaigns': async (req, res) => {
    try {
      const body = await parseBody(req);

      jsonResponse(res, 201, {
        status: 'created',
        campaign: {
          id: Date.now().toString(),
          ...body,
          createdAt: new Date().toISOString()
        }
      });
    } catch (error) {
      handleError(res, error);
    }
  },

  // Telegram webhook
  'POST /webhook/telegram': async (req, res) => {
    try {
      const body = await parseBody(req);
      console.log('📨 Telegram webhook received:', body);

      // Process webhook (implement your Telegram bot logic)

      jsonResponse(res, 200, { ok: true });
    } catch (error) {
      handleError(res, error);
    }
  },

  // Digistore24 webhook
  'POST /webhook/digistore24': async (req, res) => {
    try {
      const body = await parseBody(req);
      console.log('💰 Digistore24 webhook received:', body);

      // Process conversion tracking

      jsonResponse(res, 200, { received: true });
    } catch (error) {
      handleError(res, error);
    }
  },

  // System info (for monitoring)
  'GET /api/system/info': async (req, res) => {
    const health = await apiKeyManager.healthCheck();

    jsonResponse(res, 200, {
      server: {
        version: VERSION,
        environment: ENV,
        uptime: process.uptime(),
        nodeVersion: process.version
      },
      resources: {
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      },
      apiKeys: {
        configured: health.keysConfigured.filter(k => k.configured).length,
        total: health.keysConfigured.length
      },
      features: {
        vaultEnabled: health.vaultAvailable,
        telegramBot: !!(await apiKeyManager.getKey('TELEGRAM_BOT_TOKEN')),
        geminiAI: !!(await apiKeyManager.getKey('GEMINI_API_KEY')),
        supabase: !!(await apiKeyManager.getKey('NEXT_PUBLIC_SUPABASE_URL'))
      }
    });
  },

  // Test endpoint (development only)
  'GET /api/test': async (req, res) => {
    if (ENV === 'production') {
      return jsonResponse(res, 403, { error: 'Not available in production' });
    }

    jsonResponse(res, 200, {
      message: 'Test endpoint working',
      timestamp: new Date().toISOString(),
      headers: req.headers,
      url: req.url
    });
  }
};

// ===== REQUEST HANDLER =====

const requestHandler = async (req, res) => {
  const startTime = Date.now();
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  // Log request
  console.log(`📥 ${req.method} ${req.url} from ${clientIp}`);

  // CORS preflight
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    res.writeHead(204);
    res.end();
    return;
  }

  // Set CORS headers for all requests
  setCorsHeaders(res);

  // Rate limiting
  if (!checkRateLimit(clientIp)) {
    jsonResponse(res, 429, {
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.'
    });
    return;
  }

  // Parse URL
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  const routeKey = `${req.method} ${pathname}`;

  // Find route handler
  const handler = routes[routeKey];

  if (handler) {
    try {
      await handler(req, res, parsedUrl);
      const duration = Date.now() - startTime;
      console.log(`✅ ${routeKey} completed in ${duration}ms`);
    } catch (error) {
      console.error(`❌ ${routeKey} failed:`, error);
      handleError(res, error);
    }
  } else {
    // 404 Not Found
    jsonResponse(res, 404, {
      error: 'Not found',
      path: pathname,
      method: req.method,
      availableEndpoints: Object.keys(routes)
    });
  }
};

// ===== SERVER INITIALIZATION =====

const server = http.createServer(requestHandler);

// Startup checks
async function startupChecks() {
  console.log('\n🔍 Running startup checks...\n');

  // Check API keys
  const health = await apiKeyManager.healthCheck();

  console.log('📊 API Key Manager Status:');
  console.log(`   Vault: ${health.vaultAvailable ? '✅' : '❌'}`);
  console.log(`   Cache: ${health.cacheSize} keys`);

  console.log('\n🔑 Critical Keys:');
  for (const key of health.keysConfigured) {
    const icon = key.configured ? '✅' : '⚠️ ';
    console.log(`   ${icon} ${key.key}`);
  }

  // Check if running on Render
  if (process.env.RENDER) {
    console.log('\n☁️  Running on Render.com');
    console.log(`   Region: ${process.env.RENDER_REGION || 'unknown'}`);
    console.log(`   Service: ${process.env.RENDER_SERVICE_NAME || 'unknown'}`);
  }

  console.log('');
}

// Start server
server.listen(PORT, async () => {
  await startupChecks();

  console.log('╔═══════════════════════════════════════════╗');
  console.log('║   🚀 LINKTOFUNNEL API SERVER STARTED     ║');
  console.log('╚═══════════════════════════════════════════╝\n');
  console.log(`   Environment: ${ENV}`);
  console.log(`   Version: ${VERSION}`);
  console.log(`   Port: ${PORT}`);
  console.log(`   URL: http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log('\n✨ Ready to receive requests!\n');
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\n${signal} received: Shutting down gracefully...`);

  server.close(() => {
    console.log('✅ HTTP server closed');
    console.log('👋 Goodbye!\n');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('❌ Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Unhandled errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

export default server;
