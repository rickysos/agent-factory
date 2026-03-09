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
  low: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  high: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
}

const statusStyles = {
  approved: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Approval Queue</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Review and approve or reject agent actions requiring human oversight.</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Pending Approvals</h2>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-gray-400">Loading...</div>
        ) : pending.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 dark:text-gray-500">
            No pending approvals
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {pending.map(approval => (
              <div key={approval.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{approval.action}</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${riskStyles[approval.risk]}`}>
                        {approval.risk} risk
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{approval.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>Agent: {approval.agentId}</span>
                      {approval.sessionId && <span>Session: {approval.sessionId}</span>}
                      <span>{new Date(approval.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => resolve(approval.id, 'approved')}
                      className="px-3 py-1.5 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => resolve(approval.id, 'rejected')}
                      className="px-3 py-1.5 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
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

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">History</h2>
          <svg className={`h-5 w-5 text-gray-400 transition-transform ${showHistory ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showHistory && (
          <div className="border-t border-gray-100 dark:border-gray-800">
            {history.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-400 dark:text-gray-500">
                No resolved approvals yet
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {history.map(approval => (
                  <div key={approval.id} className="px-6 py-4 opacity-75">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{approval.action}</span>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${riskStyles[approval.risk]}`}>
                            {approval.risk} risk
                          </span>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${statusStyles[approval.status as 'approved' | 'rejected']}`}>
                            {approval.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{approval.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
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
