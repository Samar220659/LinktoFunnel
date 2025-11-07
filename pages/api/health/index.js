/**
 * 🏥 HEALTH CHECK ENDPOINT
 *
 * Provides health status for:
 * - Load balancers
 * - Orchestration platforms (Kubernetes, Docker)
 * - Monitoring systems (Uptime Robot, Pingdom, etc.)
 *
 * Endpoints:
 * - GET /api/health       - Basic liveness check (is the service running?)
 * - GET /api/health/ready - Readiness check (can accept traffic?)
 * - GET /api/health/full  - Full system health including dependencies
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  : null;

/**
 * Check Supabase connectivity
 */
async function checkSupabase() {
  if (!supabase) {
    return {
      status: 'error',
      message: 'Supabase not configured',
    };
  }

  try {
    // Try a simple query with timeout
    const { data, error } = await Promise.race([
      supabase.from('digistore_products').select('count', { count: 'exact', head: true }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 5000)
      ),
    ]);

    if (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }

    return {
      status: 'healthy',
      message: 'Connected',
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message,
    };
  }
}

/**
 * Check external API connectivity
 */
async function checkExternalAPIs() {
  const checks = {};

  // Check Gemini API
  if (process.env.GEMINI_API_KEY) {
    checks.gemini = {
      configured: true,
      status: 'healthy',
    };
  } else {
    checks.gemini = {
      configured: false,
      status: 'warning',
    };
  }

  // Check DigiStore24 API
  if (process.env.DIGISTORE24_API_KEY) {
    checks.digistore24 = {
      configured: true,
      status: 'healthy',
    };
  } else {
    checks.digistore24 = {
      configured: false,
      status: 'warning',
    };
  }

  return checks;
}

/**
 * Get system info
 */
function getSystemInfo() {
  return {
    uptime: process.uptime(),
    memory: {
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
    },
    node_version: process.version,
    platform: process.platform,
    pid: process.pid,
  };
}

export default async function handler(req, res) {
  const { query } = req;

  // CORS headers for health check monitoring tools
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  try {
    // ===== /api/health - Basic liveness check =====
    if (!query.type || query.type.length === 0) {
      const uptime = process.uptime();

      return res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
        service: 'LinktoFunnel AI Agent',
        version: '1.0.0',
      });
    }

    // ===== /api/health/ready - Readiness check =====
    if (query.type[0] === 'ready') {
      const requiredEnvVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      ];

      const missing = requiredEnvVars.filter((key) => !process.env[key]);

      if (missing.length > 0) {
        return res.status(503).json({
          status: 'not_ready',
          message: 'Required environment variables missing',
          missing,
          timestamp: new Date().toISOString(),
        });
      }

      // Check Supabase connectivity
      const supabaseHealth = await checkSupabase();

      if (supabaseHealth.status === 'error') {
        return res.status(503).json({
          status: 'not_ready',
          message: 'Database connectivity issue',
          details: supabaseHealth,
          timestamp: new Date().toISOString(),
        });
      }

      return res.status(200).json({
        status: 'ready',
        message: 'Service ready to accept traffic',
        database: supabaseHealth,
        timestamp: new Date().toISOString(),
      });
    }

    // ===== /api/health/full - Full health check =====
    if (query.type[0] === 'full') {
      const supabaseHealth = await checkSupabase();
      const externalAPIs = await checkExternalAPIs();
      const systemInfo = getSystemInfo();

      const isHealthy = supabaseHealth.status === 'healthy';

      return res.status(isHealthy ? 200 : 503).json({
        status: isHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        system: systemInfo,
        database: supabaseHealth,
        external_apis: externalAPIs,
        environment: {
          node_env: process.env.NODE_ENV || 'development',
          configured_apis: {
            gemini: !!process.env.GEMINI_API_KEY,
            digistore24: !!process.env.DIGISTORE24_API_KEY,
            telegram: !!process.env.TELEGRAM_BOT_TOKEN,
            getresponse: !!process.env.GETRESPONSE_API_KEY,
          },
        },
      });
    }

    // Unknown health check type
    return res.status(400).json({
      status: 'error',
      message: 'Unknown health check type',
      available_endpoints: [
        '/api/health',
        '/api/health/ready',
        '/api/health/full',
      ],
    });
  } catch (error) {
    console.error('Health check error:', error);

    return res.status(503).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
