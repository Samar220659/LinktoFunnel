/**
 * 📊 DASHBOARD DATA API
 *
 * Provides real-time performance data for the revenue dashboard
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 86400000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch revenue data
    const revenue = await getRevenue(todayStart, weekStart, monthStart);

    // Fetch performance metrics
    const performance = await getPerformanceMetrics();

    // Fetch top products
    const topProducts = await getTopProducts();

    // Fetch platform performance
    const platforms = await getPlatformPerformance();

    // Fetch AI insights
    const insights = await getActiveInsights();

    // Fetch recent optimizations
    const optimizations = await getRecentOptimizations();

    return res.status(200).json({
      revenue,
      performance,
      topProducts,
      platforms,
      insights,
      optimizations,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    return res.status(500).json({
      error: 'Failed to fetch dashboard data',
      message: error.message,
    });
  }
}

async function getRevenue(todayStart, weekStart, monthStart) {
  try {
    // Today's revenue
    const { data: todayData } = await supabase
      .from('performance_metrics')
      .select('revenue_cents')
      .gte('created_at', todayStart.toISOString());

    const today = (todayData || []).reduce((sum, m) => sum + (m.revenue_cents || 0), 0) / 100;

    // Week's revenue
    const { data: weekData } = await supabase
      .from('performance_metrics')
      .select('revenue_cents')
      .gte('created_at', weekStart.toISOString());

    const week = (weekData || []).reduce((sum, m) => sum + (m.revenue_cents || 0), 0) / 100;

    // Month's revenue
    const { data: monthData } = await supabase
      .from('performance_metrics')
      .select('revenue_cents')
      .gte('created_at', monthStart.toISOString());

    const month = (monthData || []).reduce((sum, m) => sum + (m.revenue_cents || 0), 0) / 100;

    // Calculate trend (compare with previous week)
    const prevWeekStart = new Date(weekStart.getTime() - 7 * 86400000);
    const { data: prevWeekData } = await supabase
      .from('performance_metrics')
      .select('revenue_cents')
      .gte('created_at', prevWeekStart.toISOString())
      .lt('created_at', weekStart.toISOString());

    const prevWeek = (prevWeekData || []).reduce((sum, m) => sum + (m.revenue_cents || 0), 0) / 100;

    let trend = '0%';
    if (prevWeek > 0) {
      const change = ((week - prevWeek) / prevWeek) * 100;
      trend = `${change > 0 ? '+' : ''}${change.toFixed(0)}%`;
    }

    return { today, week, month, trend };
  } catch (error) {
    console.error('Revenue fetch error:', error);
    return { today: 0, week: 0, month: 0, trend: '0%' };
  }
}

async function getPerformanceMetrics() {
  try {
    const { data } = await supabase
      .from('performance_metrics')
      .select('*')
      .gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString());

    if (!data || data.length === 0) {
      return {
        totalPosts: 0,
        totalClicks: 0,
        totalConversions: 0,
        avgCTR: 0,
        avgConversionRate: 0,
        avgROI: 0,
      };
    }

    const totalPosts = data.length;
    const totalClicks = data.reduce((sum, m) => sum + (m.clicks || 0), 0);
    const totalConversions = data.reduce((sum, m) => sum + (m.conversions || 0), 0);
    const avgCTR = data.reduce((sum, m) => sum + (m.ctr || 0), 0) / data.length;
    const avgConversionRate = data.reduce((sum, m) => sum + (m.conversion_rate || 0), 0) / data.length;
    const avgROI = data.reduce((sum, m) => sum + (m.roi || 0), 0) / data.length;

    return {
      totalPosts,
      totalClicks,
      totalConversions,
      avgCTR: (avgCTR * 100).toFixed(2),
      avgConversionRate: (avgConversionRate * 100).toFixed(2),
      avgROI: avgROI.toFixed(0),
    };
  } catch (error) {
    console.error('Performance metrics error:', error);
    return {
      totalPosts: 0,
      totalClicks: 0,
      totalConversions: 0,
      avgCTR: 0,
      avgConversionRate: 0,
      avgROI: 0,
    };
  }
}

async function getTopProducts() {
  try {
    const { data } = await supabase
      .from('performance_metrics')
      .select('entity_id, entity_name, revenue_cents, conversions, performance_score')
      .gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString())
      .order('performance_score', { ascending: false });

    if (!data || data.length === 0) return [];

    // Group by product
    const productMap = {};

    data.forEach(metric => {
      if (!productMap[metric.entity_id]) {
        productMap[metric.entity_id] = {
          id: metric.entity_id,
          name: metric.entity_name || metric.entity_id,
          revenue: 0,
          conversions: 0,
          scores: [],
        };
      }

      const product = productMap[metric.entity_id];
      product.revenue += (metric.revenue_cents || 0) / 100;
      product.conversions += metric.conversions || 0;
      product.scores.push(metric.performance_score || 0);
    });

    // Calculate average scores and sort
    const products = Object.values(productMap)
      .map(p => ({
        name: p.name,
        revenue: p.revenue,
        conversions: p.conversions,
        score: Math.round(p.scores.reduce((a, b) => a + b, 0) / p.scores.length),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return products;
  } catch (error) {
    console.error('Top products error:', error);
    return [];
  }
}

async function getPlatformPerformance() {
  try {
    const { data } = await supabase
      .from('performance_metrics')
      .select('platform, clicks, conversions, revenue_cents')
      .not('platform', 'is', null)
      .gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString());

    if (!data || data.length === 0) return [];

    // Group by platform
    const platformMap = {};

    data.forEach(metric => {
      if (!platformMap[metric.platform]) {
        platformMap[metric.platform] = {
          name: metric.platform,
          posts: 0,
          clicks: 0,
          conversions: 0,
          revenue: 0,
        };
      }

      const platform = platformMap[metric.platform];
      platform.posts++;
      platform.clicks += metric.clicks || 0;
      platform.conversions += metric.conversions || 0;
      platform.revenue += (metric.revenue_cents || 0) / 100;
    });

    return Object.values(platformMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  } catch (error) {
    console.error('Platform performance error:', error);
    return [];
  }
}

async function getActiveInsights() {
  try {
    const { data } = await supabase
      .from('learning_insights')
      .select('*')
      .eq('status', 'active')
      .gte('confidence', 0.7)
      .order('confidence', { ascending: false })
      .limit(6);

    if (!data) return [];

    return data.map(insight => ({
      title: insight.title,
      description: insight.description,
      confidence: insight.confidence,
      action: insight.recommended_action?.replace(/_/g, ' ').replace(':', ': '),
    }));
  } catch (error) {
    console.error('Insights error:', error);
    return [];
  }
}

async function getRecentOptimizations() {
  try {
    const { data } = await supabase
      .from('optimization_actions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (!data) return [];

    return data.map(opt => {
      const createdAt = new Date(opt.created_at);
      const hoursAgo = Math.floor((Date.now() - createdAt.getTime()) / 3600000);

      return {
        action: opt.action_type?.replace(/_/g, ' '),
        product: opt.entity_id || 'Unknown',
        time: hoursAgo === 0 ? 'Just now' : `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`,
        status: opt.status,
      };
    });
  } catch (error) {
    console.error('Optimizations error:', error);
    return [];
  }
}
