#!/usr/bin/env node

/**
 * 🌐 SOCIAL MEDIA API SERVER
 *
 * REST API zur Bereitstellung der gesammelten Social Media API Informationen
 *
 * Endpoints:
 * - GET  /api/social-media-apis           - Liste aller APIs
 * - GET  /api/social-media-apis/:platform - APIs einer Plattform
 * - GET  /api/social-media-apis/:platform/:name - Spezifische API Details
 * - GET  /api/social-media-apis/health/:platform - Health Status
 * - GET  /api/social-media-apis/changes   - API Änderungen
 * - POST /api/social-media-apis/verify    - API Verfügbarkeit prüfen
 */

require('dotenv').config({ path: '.env.local' });
const http = require('http');
const url = require('url');
const { createClient } = require('@supabase/supabase-js');

const PORT = process.env.API_SERVER_PORT || 3001;

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ===== HELPER FUNCTIONS =====

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data, null, 2));
}

function sendError(res, statusCode, message) {
  sendJSON(res, statusCode, {
    error: true,
    message: message,
    timestamp: new Date().toISOString()
  });
}

async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// ===== API HANDLERS =====

async function getAllAPIs(req, res) {
  try {
    const { data: apis, error } = await supabase
      .from('social_media_apis')
      .select('*')
      .order('platform', { ascending: true });

    if (error) throw error;

    // Group by platform
    const grouped = {};
    for (const api of apis || []) {
      if (!grouped[api.platform]) {
        grouped[api.platform] = [];
      }
      grouped[api.platform].push({
        id: api.id,
        name: api.api_name,
        version: api.version,
        baseUrl: api.base_url,
        docsUrl: api.docs_url,
        authType: api.auth_type,
        endpoints: api.endpoints,
        rateLimit: api.rate_limit,
        status: api.status,
        lastChecked: api.last_checked,
      });
    }

    sendJSON(res, 200, {
      success: true,
      count: apis?.length || 0,
      platforms: Object.keys(grouped).length,
      data: grouped,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    sendError(res, 500, `Failed to fetch APIs: ${err.message}`);
  }
}

async function getPlatformAPIs(req, res, platform) {
  try {
    const { data: apis, error } = await supabase
      .from('social_media_apis')
      .select('*')
      .eq('platform', platform);

    if (error) throw error;

    if (!apis || apis.length === 0) {
      sendError(res, 404, `No APIs found for platform: ${platform}`);
      return;
    }

    sendJSON(res, 200, {
      success: true,
      platform: platform,
      count: apis.length,
      data: apis.map(api => ({
        id: api.id,
        name: api.api_name,
        version: api.version,
        baseUrl: api.base_url,
        docsUrl: api.docs_url,
        authType: api.auth_type,
        endpoints: api.endpoints,
        rateLimit: api.rate_limit,
        status: api.status,
        lastChecked: api.last_checked,
      })),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    sendError(res, 500, `Failed to fetch platform APIs: ${err.message}`);
  }
}

async function getSpecificAPI(req, res, platform, apiName) {
  try {
    const { data: api, error } = await supabase
      .from('social_media_apis')
      .select('*')
      .eq('platform', platform)
      .eq('api_name', apiName)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        sendError(res, 404, `API not found: ${platform}/${apiName}`);
        return;
      }
      throw error;
    }

    sendJSON(res, 200, {
      success: true,
      data: {
        id: api.id,
        platform: api.platform,
        name: api.api_name,
        version: api.version,
        baseUrl: api.base_url,
        docsUrl: api.docs_url,
        authType: api.auth_type,
        endpoints: api.endpoints,
        rateLimit: api.rate_limit,
        checkUrl: api.check_url,
        status: api.status,
        lastChecked: api.last_checked,
        createdAt: api.created_at,
        updatedAt: api.updated_at,
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    sendError(res, 500, `Failed to fetch API: ${err.message}`);
  }
}

async function getAPIHealth(req, res, platform) {
  try {
    // Get APIs for platform
    const { data: apis, error: apiError } = await supabase
      .from('social_media_apis')
      .select('id, api_name')
      .eq('platform', platform);

    if (apiError) throw apiError;

    if (!apis || apis.length === 0) {
      sendError(res, 404, `No APIs found for platform: ${platform}`);
      return;
    }

    // Get recent health checks for these APIs
    const apiIds = apis.map(api => api.id);
    const { data: healthChecks, error: healthError } = await supabase
      .from('social_media_api_health')
      .select('*')
      .in('api_id', apiIds)
      .order('check_timestamp', { ascending: false });

    if (healthError) throw healthError;

    // Group health checks by API
    const healthByAPI = {};
    for (const api of apis) {
      const checks = (healthChecks || []).filter(h => h.api_id === api.id);
      const latestCheck = checks[0];
      const last24h = checks.filter(h =>
        new Date(h.check_timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      );

      const availableCount = last24h.filter(h => h.is_available).length;
      const uptime = last24h.length > 0
        ? ((availableCount / last24h.length) * 100).toFixed(2)
        : null;

      healthByAPI[api.api_name] = {
        latestStatus: latestCheck?.is_available || null,
        lastChecked: latestCheck?.check_timestamp || null,
        responseTime: latestCheck?.response_time_ms || null,
        uptime24h: uptime,
        checksLast24h: last24h.length,
      };
    }

    sendJSON(res, 200, {
      success: true,
      platform: platform,
      data: healthByAPI,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    sendError(res, 500, `Failed to fetch health status: ${err.message}`);
  }
}

async function getAPIChanges(req, res, query) {
  try {
    let dbQuery = supabase
      .from('social_media_api_changes')
      .select('*, social_media_apis(platform, api_name)')
      .order('detected_at', { ascending: false });

    // Filter by notified status
    if (query.notified !== undefined) {
      dbQuery = dbQuery.eq('notified', query.notified === 'true');
    }

    // Filter by severity
    if (query.severity) {
      dbQuery = dbQuery.eq('severity', query.severity);
    }

    // Limit results
    const limit = parseInt(query.limit) || 50;
    dbQuery = dbQuery.limit(limit);

    const { data: changes, error } = await dbQuery;

    if (error) throw error;

    sendJSON(res, 200, {
      success: true,
      count: changes?.length || 0,
      data: (changes || []).map(change => ({
        id: change.id,
        platform: change.social_media_apis?.platform,
        apiName: change.social_media_apis?.api_name,
        changeType: change.change_type,
        severity: change.severity,
        description: change.description,
        oldValue: change.old_value,
        newValue: change.new_value,
        detectedAt: change.detected_at,
        notified: change.notified,
        acknowledged: change.acknowledged,
      })),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    sendError(res, 500, `Failed to fetch changes: ${err.message}`);
  }
}

async function verifyAPI(req, res) {
  try {
    const body = await parseBody(req);

    if (!body.platform || !body.apiName) {
      sendError(res, 400, 'Missing required fields: platform, apiName');
      return;
    }

    // Get API details
    const { data: api, error } = await supabase
      .from('social_media_apis')
      .select('*')
      .eq('platform', body.platform)
      .eq('api_name', body.apiName)
      .single();

    if (error || !api) {
      sendError(res, 404, `API not found: ${body.platform}/${body.apiName}`);
      return;
    }

    // Verify availability
    const startTime = Date.now();
    let isAvailable = false;
    let statusCode = null;
    let errorMessage = null;

    try {
      const response = await fetch(api.base_url, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'LinktoFunnel-API-Monitor/1.0'
        },
        signal: AbortSignal.timeout(10000) // 10s timeout
      });

      statusCode = response.status;
      isAvailable = response.status < 500;
    } catch (fetchError) {
      errorMessage = fetchError.message;
    }

    const responseTime = Date.now() - startTime;

    // Log health check
    await supabase
      .from('social_media_api_health')
      .insert({
        api_id: api.id,
        response_time_ms: responseTime,
        status_code: statusCode,
        is_available: isAvailable,
        error_message: errorMessage,
      });

    sendJSON(res, 200, {
      success: true,
      data: {
        platform: body.platform,
        apiName: body.apiName,
        isAvailable: isAvailable,
        statusCode: statusCode,
        responseTime: responseTime,
        errorMessage: errorMessage,
        checkedAt: new Date().toISOString(),
      }
    });
  } catch (err) {
    sendError(res, 500, `Verification failed: ${err.message}`);
  }
}

async function getAPIStats(req, res) {
  try {
    // Get total counts
    const { data: apis, error: apiError } = await supabase
      .from('social_media_apis')
      .select('platform, status');

    if (apiError) throw apiError;

    const totalAPIs = apis?.length || 0;
    const platforms = [...new Set(apis?.map(a => a.platform) || [])].length;
    const activeAPIs = apis?.filter(a => a.status === 'active').length || 0;

    // Get recent changes
    const { data: changes, error: changeError } = await supabase
      .from('social_media_api_changes')
      .select('severity')
      .gte('detected_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const recentChanges = changes?.length || 0;
    const criticalChanges = changes?.filter(c => c.severity === 'critical').length || 0;

    // Get health summary
    const { data: health, error: healthError } = await supabase
      .from('social_media_api_health')
      .select('is_available')
      .gte('check_timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const totalChecks = health?.length || 0;
    const availableChecks = health?.filter(h => h.is_available).length || 0;
    const uptime = totalChecks > 0 ? ((availableChecks / totalChecks) * 100).toFixed(2) : null;

    sendJSON(res, 200, {
      success: true,
      data: {
        overview: {
          totalAPIs,
          platforms,
          activeAPIs,
          inactiveAPIs: totalAPIs - activeAPIs,
        },
        changes: {
          last7Days: recentChanges,
          critical: criticalChanges,
        },
        health: {
          uptime24h: uptime ? `${uptime}%` : 'N/A',
          totalChecks,
          availableChecks,
        },
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    sendError(res, 500, `Failed to fetch stats: ${err.message}`);
  }
}

// ===== REQUEST ROUTER =====

async function handleRequest(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  // Health check
  if (pathname === '/health') {
    sendJSON(res, 200, {
      status: 'ok',
      service: 'Social Media API Server',
      timestamp: new Date().toISOString()
    });
    return;
  }

  // API root
  if (pathname === '/api' || pathname === '/api/') {
    sendJSON(res, 200, {
      name: 'Social Media API Manager',
      version: '1.0.0',
      endpoints: {
        'GET /api/social-media-apis': 'Liste aller APIs',
        'GET /api/social-media-apis/:platform': 'APIs einer Plattform',
        'GET /api/social-media-apis/:platform/:name': 'Spezifische API Details',
        'GET /api/social-media-apis/health/:platform': 'Health Status einer Plattform',
        'GET /api/social-media-apis/changes': 'API Änderungen',
        'GET /api/social-media-apis/stats': 'Statistiken',
        'POST /api/social-media-apis/verify': 'API Verfügbarkeit prüfen',
      },
      documentation: 'https://github.com/Samar220659/LinktoFunnel'
    });
    return;
  }

  // Route matching
  const apiMatch = pathname.match(/^\/api\/social-media-apis\/?(.*)$/);

  if (!apiMatch) {
    sendError(res, 404, 'Endpoint not found');
    return;
  }

  const path = apiMatch[1];

  // GET /api/social-media-apis
  if (!path && req.method === 'GET') {
    await getAllAPIs(req, res);
    return;
  }

  // GET /api/social-media-apis/stats
  if (path === 'stats' && req.method === 'GET') {
    await getAPIStats(req, res);
    return;
  }

  // GET /api/social-media-apis/changes
  if (path === 'changes' && req.method === 'GET') {
    await getAPIChanges(req, res, query);
    return;
  }

  // POST /api/social-media-apis/verify
  if (path === 'verify' && req.method === 'POST') {
    await verifyAPI(req, res);
    return;
  }

  // GET /api/social-media-apis/health/:platform
  const healthMatch = path.match(/^health\/(.+)$/);
  if (healthMatch && req.method === 'GET') {
    await getAPIHealth(req, res, healthMatch[1]);
    return;
  }

  // GET /api/social-media-apis/:platform
  // GET /api/social-media-apis/:platform/:name
  const parts = path.split('/').filter(p => p);

  if (parts.length === 1 && req.method === 'GET') {
    await getPlatformAPIs(req, res, parts[0]);
    return;
  }

  if (parts.length === 2 && req.method === 'GET') {
    await getSpecificAPI(req, res, parts[0], decodeURIComponent(parts[1]));
    return;
  }

  sendError(res, 404, 'Endpoint not found');
}

// ===== SERVER =====

const server = http.createServer(async (req, res) => {
  try {
    await handleRequest(req, res);
  } catch (err) {
    console.error('Server error:', err);
    sendError(res, 500, 'Internal server error');
  }
});

server.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🌐 Social Media API Server');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log(`📋 API Docs: http://localhost:${PORT}/api`);
  console.log(`📡 All APIs: http://localhost:${PORT}/api/social-media-apis`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = { server };
