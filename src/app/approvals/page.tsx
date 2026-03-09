'use client'

import { useState, useEffect, useCallback } from 'react'

interface ApprovalRequest {
  id: string
  agentId: string
  sessionId: string
  action: string
  description: string
  risk: 'low' | 'medium' | 'high'
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  resolvedAt?: string
  resolvedBy?: string
}

const riskStyles = {
  low: 'bg-accent-500/10 text-accent-600 dark:bg-accent-500/10 dark:text-accent-400',
  medium: 'bg-amber-500/10 text-amber-600 dark:bg-amber-800 dark:text-yellow-300',
  high: 'bg-red-500/50/10 text-red-500 dark:bg-red-900 dark:text-red-300',
}

const statusStyles = {
  approved: 'bg-accent-500/10 text-accent-600 dark:bg-accent-500/10 dark:text-accent-400',
  rejected: 'bg-red-500/50/10 text-red-500 dark:bg-red-900 dark:text-red-300',
}

export default function ApprovalsPage() {
  const [pending, setPending] = useState<ApprovalRequest[]>([])
  const [history, setHistory] = useState<ApprovalRequest[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchApprovals = useCallback(async () => {
    try {
      const res = await fetch('/api/approvals')
      const data = await res.json()
      if (data.success) setPending(data.data)
    } catch {
      // ignore
    }
    setLoading(false)
  }, [])

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/approvals')
      const data = await res.json()
      if (data.success) {
        // The GET endpoint returns pending only, so we need all
        // For now we track resolved items locally after actions
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    fetchApprovals()
  }, [fetchApprovals])

  useEffect(() => {
    const evtSource = new EventSource('/api/events')
    evtSource.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        if (msg.event === 'approval:created') {
          setPending(prev => [msg.data, ...prev])
        } else if (msg.event === 'approval:resolved') {
          setPending(prev => prev.filter(a => a.id !== msg.data.id))
          setHistory(prev => [msg.data, ...prev])
        }
      } catch {
        // ignore
      }
    }
    return () => evtSource.close()
  }, [])

  const resolve = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/approvals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, resolvedBy: 'user' }),
      })
      const data = await res.json()
      if (data.success) {
        setPending(prev => prev.filter(a => a.id !== id))
        setHistory(prev => [data.data, ...prev])
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-forge-800 dark:text-forge-100">Approval Queue</h1>
        <p className="text-forge-500 dark:text-forge-400 mt-2">Review and approve or reject agent actions requiring human oversight.</p>
      </div>

      <div className="bg-forge-50 dark:bg-forge-900 rounded-md  border border-forge-200 dark:border-forge-700 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-forge-200 dark:border-forge-800">
          <h2 className="text-lg font-bold text-forge-800 dark:text-forge-100">Pending Approvals</h2>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-forge-300">Loading...</div>
        ) : pending.length === 0 ? (
          <div className="px-6 py-12 text-center text-forge-300 dark:text-forge-400">
            No pending approvals
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {pending.map(approval => (
              <div key={approval.id} className="px-6 py-4 hover:bg-forge-100 dark:hover:bg-forge-850 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-semibold text-forge-800 dark:text-forge-100">{approval.action}</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${riskStyles[approval.risk]}`}>
                        {approval.risk} risk
                      </span>
                    </div>
                    <p className="text-sm text-forge-500 dark:text-forge-400">{approval.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-forge-300">
                      <span>Agent: {approval.agentId}</span>
                      {approval.sessionId && <span>Session: {approval.sessionId}</span>}
                      <span>{new Date(approval.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => resolve(approval.id, 'approved')}
                      className="px-3 py-1.5 text-sm font-medium rounded bg-accent-500 text-forge-950 hover:bg-accent-600 transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => resolve(approval.id, 'rejected')}
                      className="px-3 py-1.5 text-sm font-medium rounded bg-red-600 text-forge-950 hover:bg-red-700 transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-forge-50 dark:bg-forge-900 rounded-md  border border-forge-200 dark:border-forge-700 overflow-hidden">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-forge-100 dark:hover:bg-forge-850 transition"
        >
          <h2 className="text-lg font-bold text-forge-800 dark:text-forge-100">History</h2>
          <svg className={`h-5 w-5 text-forge-300 transition-transform ${showHistory ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showHistory && (
          <div className="border-t border-forge-200 dark:border-forge-800">
            {history.length === 0 ? (
              <div className="px-6 py-8 text-center text-forge-300 dark:text-forge-400">
                No resolved approvals yet
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {history.map(approval => (
                  <div key={approval.id} className="px-6 py-4 opacity-75">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-sm font-semibold text-forge-800 dark:text-forge-100">{approval.action}</span>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${riskStyles[approval.risk]}`}>
                            {approval.risk} risk
                          </span>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${statusStyles[approval.status as 'approved' | 'rejected']}`}>
                            {approval.status}
                          </span>
                        </div>
                        <p className="text-sm text-forge-500 dark:text-forge-400">{approval.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-forge-300">
                          <span>Agent: {approval.agentId}</span>
                          {approval.resolvedAt && <span>Resolved: {new Date(approval.resolvedAt).toLocaleString()}</span>}
                          {approval.resolvedBy && <span>By: {approval.resolvedBy}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
