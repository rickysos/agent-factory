'use client'

import { useState } from 'react'

type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

interface PendingDecision {
  id: string
  agentName: string
  action: string
  risk: RiskLevel
  timestamp: string
  context: string
}

interface ReviewedDecision {
  id: string
  agentName: string
  action: string
  risk: RiskLevel
  decision: 'approved' | 'rejected'
  reviewer: string
  comment: string
  reviewedAt: string
}

const mockPending: PendingDecision[] = [
  { id: 'p1', agentName: 'DeployBot', action: 'Deploy v2.4.1 to production', risk: 'critical', timestamp: '2026-03-09T11:00:00Z', context: 'Includes database migration affecting 3 tables' },
  { id: 'p2', agentName: 'CodeBot', action: 'Refactor auth module to use JWT', risk: 'high', timestamp: '2026-03-09T10:30:00Z', context: 'Affects 12 files across 4 services' },
  { id: 'p3', agentName: 'ResearchBot', action: 'Send summary report to stakeholders', risk: 'medium', timestamp: '2026-03-09T10:00:00Z', context: 'Weekly research digest with 8 findings' },
  { id: 'p4', agentName: 'DataBot', action: 'Archive logs older than 90 days', risk: 'low', timestamp: '2026-03-09T09:30:00Z', context: 'Estimated 2.3GB of log data' },
  { id: 'p5', agentName: 'OpsBot', action: 'Scale cluster to 12 nodes', risk: 'high', timestamp: '2026-03-09T09:00:00Z', context: 'Traffic spike detected, cost increase ~$840/day' },
]

const mockReviewed: ReviewedDecision[] = [
  { id: 'r1', agentName: 'CodeBot', action: 'Add rate limiting to API gateway', risk: 'medium', decision: 'approved', reviewer: 'Ricky B.', comment: 'Good call, set limit to 100 req/min', reviewedAt: '2026-03-09T08:00:00Z' },
  { id: 'r2', agentName: 'DeployBot', action: 'Rollback staging to v2.3.9', risk: 'high', decision: 'approved', reviewer: 'Sarah K.', comment: '', reviewedAt: '2026-03-08T22:00:00Z' },
  { id: 'r3', agentName: 'DataBot', action: 'Drop unused analytics table', risk: 'critical', decision: 'rejected', reviewer: 'Ricky B.', comment: 'Table is still referenced by reporting service', reviewedAt: '2026-03-08T18:00:00Z' },
  { id: 'r4', agentName: 'OpsBot', action: 'Enable auto-scaling policy', risk: 'medium', decision: 'approved', reviewer: 'Mike T.', comment: 'Approved with max 20 nodes cap', reviewedAt: '2026-03-08T14:00:00Z' },
]

const riskColors: Record<RiskLevel, string> = {
  low: 'bg-accent-500/10 text-accent-600',
  medium: 'bg-amber-500/10 text-amber-600',
  high: 'bg-amber-500/10 text-amber-600',
  critical: 'bg-red-500/50/10 text-red-500',
}

export default function FeedbackPage() {
  const [pending, setPending] = useState(mockPending)
  const [reviewed, setReviewed] = useState(mockReviewed)
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending')
  const [commentMap, setCommentMap] = useState<Record<string, string>>({})

  function handleDecision(id: string, decision: 'approved' | 'rejected') {
    const item = pending.find((p) => p.id === id)
    if (!item) return
    setPending((prev) => prev.filter((p) => p.id !== id))
    setReviewed((prev) => [
      {
        id: item.id,
        agentName: item.agentName,
        action: item.action,
        risk: item.risk,
        decision,
        reviewer: 'You',
        comment: commentMap[id] || '',
        reviewedAt: new Date().toISOString(),
      },
      ...prev,
    ])
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-forge-800 mb-2">
          Human-in-the-Loop <span className="text-accent-600">Feedback</span>
        </h1>
        <p className="text-lg text-forge-500">
          Review and approve agent decisions before they execute.
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
            activeTab === 'pending' ? 'bg-accent-500 text-forge-950' : 'bg-forge-200 text-forge-500 hover:bg-forge-200'
          }`}
        >
          Pending ({pending.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
            activeTab === 'history' ? 'bg-accent-500 text-forge-950' : 'bg-forge-200 text-forge-500 hover:bg-forge-200'
          }`}
        >
          History ({reviewed.length})
        </button>
      </div>

      {activeTab === 'pending' ? (
        pending.length === 0 ? (
          <div className="text-center py-20 text-forge-300">No pending decisions. All clear.</div>
        ) : (
          <div className="space-y-4">
            {pending.map((item) => (
              <div key={item.id} className="bg-forge-50 border border-forge-200 rounded-md p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-forge-800">{item.agentName}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${riskColors[item.risk]}`}>
                        {item.risk}
                      </span>
                    </div>
                    <p className="text-forge-700">{item.action}</p>
                    <p className="text-sm text-forge-400 mt-1">{item.context}</p>
                  </div>
                  <span className="text-xs text-forge-300 whitespace-nowrap">{new Date(item.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <input
                    type="text"
                    placeholder="Comment (optional)"
                    value={commentMap[item.id] || ''}
                    onChange={(e) => setCommentMap((prev) => ({ ...prev, [item.id]: e.target.value }))}
                    className="flex-1 px-3 py-2 rounded border border-forge-200 text-sm text-forge-800 focus:outline-none focus:ring-2 focus:ring-accent-500"
                  />
                  <button
                    onClick={() => handleDecision(item.id, 'approved')}
                    className="px-4 py-2 bg-accent-500 text-forge-950 text-sm font-medium rounded hover:bg-accent-600"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleDecision(item.id, 'rejected')}
                    className="px-4 py-2 bg-red-600 text-forge-950 text-sm font-medium rounded hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="space-y-3">
          {reviewed.map((item) => (
            <div key={item.id} className="bg-forge-50 border border-forge-200 rounded-md p-4 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-forge-800">{item.agentName}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${riskColors[item.risk]}`}>
                    {item.risk}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    item.decision === 'approved' ? 'bg-accent-500/10 text-accent-600' : 'bg-red-500/50/10 text-red-500'
                  }`}>
                    {item.decision}
                  </span>
                </div>
                <p className="text-sm text-forge-600">{item.action}</p>
                {item.comment && <p className="text-xs text-forge-400 mt-1 italic">&quot;{item.comment}&quot;</p>}
              </div>
              <div className="text-right ml-4 shrink-0">
                <p className="text-sm text-forge-500">{item.reviewer}</p>
                <p className="text-xs text-forge-300">{new Date(item.reviewedAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
