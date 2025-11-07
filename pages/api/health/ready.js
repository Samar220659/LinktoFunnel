/**
 * 🏥 HEALTH CHECK - Ready Endpoint
 */

import { createClient } from '@supabase/supabase-js';

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  : null;

async function checkSupabase() {
  if (!supabase) {
    return {
      status: 'error',
      message: 'Supabase not configured',
    };
  }

  try {
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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  try {
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
  } catch (error) {
    return res.status(503).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
