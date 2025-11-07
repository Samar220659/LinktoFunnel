import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApproval, setSelectedApproval] = useState(null);

  useEffect(() => {
    fetchApprovals();
    // Refresh every 30 seconds
    const interval = setInterval(fetchApprovals, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchApprovals() {
    try {
      const res = await fetch('/api/mcp/get_approval_queue');
      const data = await res.json();
      setApprovals(data.pending_approvals || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching approvals:', error);
      setLoading(false);
    }
  }

  async function approveVariant(approvalId, variant) {
    if (!confirm(`Variante ${variant.toUpperCase()} wählen?`)) return;

    try {
      const res = await fetch('/api/mcp/approve_content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approval_id: approvalId,
          selected_variant: variant
        })
      });

      const data = await res.json();

      if (data.success) {
        alert(`✅ Variante ${variant.toUpperCase()} approved!\nSystem postet automatisch um 18:00.`);
        fetchApprovals();
      }
    } catch (error) {
      alert('Fehler beim Approven: ' + error.message);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Approvals - LinktoFunnel Auto-Pilot</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow px-6 py-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              🤖 Auto-Pilot Approvals
            </h1>
            <p className="mt-2 text-gray-600">
              Wähle die beste Variante - System macht den Rest!
            </p>
          </div>

          {/* Approvals */}
          {approvals.length === 0 ? (
            <div className="bg-white rounded-lg shadow px-6 py-12 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Alles erledigt!
              </h2>
              <p className="text-gray-600">
                Keine Approvals pending. Nächster Content wird morgen 07:00 generiert.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {approvals.map((approval) => (
                <div key={approval.id} className="bg-white rounded-lg shadow overflow-hidden">
                  {/* Approval Header */}
                  <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {approval.type === 'content' ? '🎬 Video Content' : '📄 Dokument'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Deadline: {new Date(approval.deadline).toLocaleString('de-DE')}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                          ⏳ Wartet auf dich
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Variants Comparison */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {approval.variants.map((variant) => (
                        <div
                          key={variant.variant}
                          className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-400 transition-colors"
                        >
                          {/* Variant Header */}
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xl font-bold text-gray-900">
                              VARIANTE {variant.variant.toUpperCase()}
                            </h4>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-600">AI-Score:</span>
                              <span className={`text-lg font-bold ${
                                variant.aiScore >= 8 ? 'text-green-600' :
                                variant.aiScore >= 6 ? 'text-yellow-600' :
                                'text-gray-600'
                              }`}>
                                {variant.aiScore.toFixed(1)}
                              </span>
                            </div>
                          </div>

                          {/* Hook Type */}
                          <div className="mb-4">
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              {variant.hookType}
                            </span>
                          </div>

                          {/* Script Preview */}
                          <div className="space-y-3 mb-6">
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                Hook (0-3s)
                              </p>
                              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
                                {variant.script.hook}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                Problem (3-15s)
                              </p>
                              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded line-clamp-3">
                                {variant.script.problem}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                CTA (30-45s)
                              </p>
                              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
                                {variant.script.cta}
                              </p>
                            </div>

                            {/* Hashtags */}
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                Hashtags
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {variant.script.hashtags.map((tag, i) => (
                                  <span key={i} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Approve Button */}
                          <button
                            onClick={() => approveVariant(approval.id, variant.variant)}
                            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
                              variant.aiScore >= 8
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-blue-500 hover:bg-blue-600'
                            }`}
                          >
                            ✅ Variante {variant.variant.toUpperCase()} wählen
                            {variant.aiScore >= 8 && ' (Empfohlen)'}
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Info Box */}
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">ℹ️ Info:</span> Nach dem Approval produziert das System
                        automatisch das finale Video und postet es um 18:00 Uhr auf alle Plattformen.
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Stats */}
          <div className="mt-8 bg-white rounded-lg shadow px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Pending Approvals</p>
                <p className="text-3xl font-bold text-blue-600">{approvals.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nächster Content</p>
                <p className="text-lg font-semibold text-gray-900">Morgen 07:00</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Auto-Posting</p>
                <p className="text-lg font-semibold text-gray-900">Heute 18:00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
