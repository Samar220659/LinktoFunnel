/**
 * 💰 REAL-TIME REVENUE TRACKING DASHBOARD
 *
 * Live performance metrics and AI insights
 *
 * Features:
 * - Real-time revenue tracking
 * - Product performance comparison
 * - Platform analytics
 * - Active AI insights
 * - Optimization history
 */

import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadDashboardData();

    // Auto-refresh every 30 seconds
    let interval;
    if (autoRefresh) {
      interval = setInterval(loadDashboardData, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  async function loadDashboardData() {
    try {
      const response = await fetch('/api/dashboard-data');
      const data = await response.json();

      setStats(data);
      setLoading(false);
      setError(null);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>
    );
  }

  const mockStats = stats || {
    revenue: {
      today: 127.50,
      week: 892.30,
      month: 3456.80,
      trend: '+18%',
    },
    performance: {
      totalPosts: 245,
      totalClicks: 12450,
      totalConversions: 167,
      avgCTR: 2.3,
      avgConversionRate: 1.34,
      avgROI: 287,
    },
    topProducts: [
      { name: 'Passives Einkommen Blueprint', revenue: 1234.50, conversions: 45, score: 92 },
      { name: 'Affiliate Secrets', revenue: 987.20, conversions: 38, score: 88 },
      { name: 'Monster Traffic', revenue: 765.30, conversions: 29, score: 81 },
    ],
    platforms: [
      { name: 'TikTok', posts: 98, clicks: 5678, conversions: 78, revenue: 1567.80 },
      { name: 'Instagram', posts: 87, clicks: 4321, conversions: 54, revenue: 1089.50 },
      { name: 'YouTube', posts: 60, clicks: 2451, conversions: 35, revenue: 799.50 },
    ],
    insights: [
      {
        title: 'High Performer: Passives Einkommen Blueprint',
        description: 'This product has 47% better performance than average',
        confidence: 0.92,
        action: 'Increase promotion',
      },
      {
        title: 'Best Platform: TikTok',
        description: 'TikTok outperforms other platforms by 38%',
        confidence: 0.87,
        action: 'Focus more effort here',
      },
      {
        title: 'Best Posting Times',
        description: 'Posts at 19:00, 20:00, 21:00 perform 35% better',
        confidence: 0.79,
        action: 'Adjust schedule',
      },
    ],
    optimizations: [
      {
        action: 'Increased promotion',
        product: 'Passives Einkommen Blueprint',
        time: '2 hours ago',
        status: 'active',
      },
      {
        action: 'Stopped promotion',
        product: 'Low Carb Diät',
        time: '5 hours ago',
        status: 'completed',
      },
    ],
  };

  return (
    <>
      <Head>
        <title>Revenue Dashboard - LinktoFunnel AI</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">💰 Revenue Dashboard</h1>
                <p className="text-gray-400 text-sm mt-1">
                  Real-time performance tracking powered by AI
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    autoRefresh
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {autoRefresh ? '🔄 Auto-Refresh ON' : '⏸️  Auto-Refresh OFF'}
                </button>
                <button
                  onClick={loadDashboardData}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium"
                >
                  🔃 Refresh Now
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Revenue Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Today"
              value={`€${mockStats.revenue.today.toFixed(2)}`}
              trend={mockStats.revenue.trend}
              icon="💵"
            />
            <StatCard
              title="This Week"
              value={`€${mockStats.revenue.week.toFixed(2)}`}
              icon="📊"
            />
            <StatCard
              title="This Month"
              value={`€${mockStats.revenue.month.toFixed(2)}`}
              icon="📈"
            />
            <StatCard
              title="Avg ROI"
              value={`${mockStats.performance.avgROI}%`}
              icon="🎯"
              highlight
            />
          </div>

          {/* Performance Metrics */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">📊 Performance Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Metric label="Total Posts" value={mockStats.performance.totalPosts} />
              <Metric label="Total Clicks" value={mockStats.performance.totalClicks.toLocaleString()} />
              <Metric label="Conversions" value={mockStats.performance.totalConversions} />
              <Metric label="Avg CTR" value={`${mockStats.performance.avgCTR}%`} />
              <Metric label="Conv. Rate" value={`${mockStats.performance.avgConversionRate}%`} />
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Top Products */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">🏆 Top Products</h2>
              <div className="space-y-3">
                {mockStats.topProducts.map((product, i) => (
                  <div key={i} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{product.name}</span>
                      <span className="text-green-400 font-bold">
                        €{product.revenue.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>{product.conversions} conversions</span>
                      <span className="flex items-center gap-2">
                        Score: <span className="text-white font-bold">{product.score}</span>
                        {getScoreEmoji(product.score)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Performance */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">📱 Platform Performance</h2>
              <div className="space-y-3">
                {mockStats.platforms.map((platform, i) => (
                  <div key={i} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{platform.name}</span>
                      <span className="text-green-400 font-bold">
                        €{platform.revenue.toFixed(2)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-400">
                      <div>
                        {platform.posts} posts
                      </div>
                      <div>
                        {platform.clicks.toLocaleString()} clicks
                      </div>
                      <div>
                        {platform.conversions} conv.
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">🧠 AI Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockStats.insights.map((insight, i) => (
                <div key={i} className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-blue-200">
                      Confidence: {(insight.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <h3 className="font-bold mb-2">{insight.title}</h3>
                  <p className="text-sm text-gray-300 mb-3">{insight.description}</p>
                  <div className="inline-block bg-white bg-opacity-20 px-3 py-1 rounded-full text-xs">
                    💡 {insight.action}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Optimizations */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">⚡ Recent Optimizations</h2>
            <div className="space-y-3">
              {mockStats.optimizations.map((opt, i) => (
                <div key={i} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <span className="font-semibold">{opt.action}</span>
                    <span className="text-gray-400"> • {opt.product}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400">{opt.time}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        opt.status === 'active'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-600 text-gray-300'
                      }`}
                    >
                      {opt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Helper Components
function StatCard({ title, value, trend, icon, highlight = false }) {
  return (
    <div
      className={`rounded-lg p-6 ${
        highlight
          ? 'bg-gradient-to-br from-green-600 to-green-700'
          : 'bg-gray-800'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-sm">{title}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {trend && (
        <div className="text-sm text-green-400 mt-1">{trend}</div>
      )}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  );
}

function getScoreEmoji(score) {
  if (score >= 90) return '🔥';
  if (score >= 80) return '✨';
  if (score >= 70) return '👍';
  return '📊';
}
