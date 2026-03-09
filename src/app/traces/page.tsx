'use client'

import { useState } from 'react'

interface TraceStep {
  type: 'tool_call' | 'model_response' | 'delegation'
  name: string
  detail: string
  durationMs: number
  timestamp: string
}

interface Trace {
  id: string
  agentName: string
  taskSummary: string
  timestamp: string
  durationMs: number
  status: 'success' | 'error'
  steps: TraceStep[]
}

const sampleTraces: Trace[] = [
  {
    id: 'tr-001',
    agentName: 'code-reviewer',
    taskSummary: 'Review PR #482 for security vulnerabilities',
    timestamp: '2026-03-09T14:32:11Z',
    durationMs: 4820,
    status: 'success',
    steps: [
      { type: 'model_response', name: 'Plan', detail: 'Identified 3 files to review: auth.ts, middleware.ts, api/login.ts', durationMs: 320, timestamp: '2026-03-09T14:32:11Z' },
      { type: 'tool_call', name: 'read_file', detail: 'Read src/auth.ts (142 lines)', durationMs: 85, timestamp: '2026-03-09T14:32:12Z' },
      { type: 'tool_call', name: 'read_file', detail: 'Read src/middleware.ts (89 lines)', durationMs: 72, timestamp: '2026-03-09T14:32:12Z' },
      { type: 'tool_call', name: 'read_file', detail: 'Read src/api/login.ts (67 lines)', durationMs: 68, timestamp: '2026-03-09T14:32:13Z' },
      { type: 'model_response', name: 'Analysis', detail: 'Found SQL injection risk in login handler. JWT secret is hardcoded.', durationMs: 1840, timestamp: '2026-03-09T14:32:13Z' },
      { type: 'delegation', name: 'Delegate to security-scanner', detail: 'Delegated deep scan of auth.ts to security-scanner agent', durationMs: 2120, timestamp: '2026-03-09T14:32:15Z' },
      { type: 'model_response', name: 'Summary', detail: 'Generated review with 2 critical findings, 1 warning', durationMs: 315, timestamp: '2026-03-09T14:32:17Z' },
    ],
  },
  {
    id: 'tr-002',
    agentName: 'data-pipeline',
    taskSummary: 'ETL run for daily user metrics',
    timestamp: '2026-03-09T13:00:02Z',
    durationMs: 12450,
    status: 'success',
    steps: [
      { type: 'tool_call', name: 'query_database', detail: 'SELECT count(*) FROM events WHERE date = 2026-03-09', durationMs: 340, timestamp: '2026-03-09T13:00:02Z' },
      { type: 'model_response', name: 'Transform', detail: 'Aggregated 48,291 events into 12 metric buckets', durationMs: 2100, timestamp: '2026-03-09T13:00:03Z' },
      { type: 'tool_call', name: 'write_file', detail: 'Wrote metrics to s3://analytics/2026-03-09.parquet', durationMs: 890, timestamp: '2026-03-09T13:00:05Z' },
      { type: 'model_response', name: 'Validate', detail: 'Row count matches source. No nulls in required fields.', durationMs: 420, timestamp: '2026-03-09T13:00:06Z' },
    ],
  },
  {
    id: 'tr-003',
    agentName: 'deploy-bot',
    taskSummary: 'Deploy v2.4.1 to staging',
    timestamp: '2026-03-09T11:15:44Z',
    durationMs: 8920,
    status: 'error',
    steps: [
      { type: 'tool_call', name: 'git_checkout', detail: 'Checked out tag v2.4.1', durationMs: 220, timestamp: '2026-03-09T11:15:44Z' },
      { type: 'tool_call', name: 'run_tests', detail: 'Ran 342 tests, 341 passed, 1 failed', durationMs: 6200, timestamp: '2026-03-09T11:15:45Z' },
      { type: 'model_response', name: 'Decision', detail: 'Test suite failed: integration/payments.test.ts. Aborting deploy.', durationMs: 180, timestamp: '2026-03-09T11:15:51Z' },
    ],
  },
  {
    id: 'tr-004',
    agentName: 'support-agent',
    taskSummary: 'Respond to ticket #1094 - billing issue',
    timestamp: '2026-03-09T10:42:18Z',
    durationMs: 3210,
    status: 'success',
    steps: [
      { type: 'tool_call', name: 'fetch_ticket', detail: 'Retrieved ticket #1094 from Zendesk', durationMs: 180, timestamp: '2026-03-09T10:42:18Z' },
      { type: 'tool_call', name: 'query_database', detail: 'Looked up customer billing history (customer_id: cust_8821)', durationMs: 290, timestamp: '2026-03-09T10:42:19Z' },
      { type: 'model_response', name: 'Draft Response', detail: 'Identified duplicate charge on 2026-03-07. Drafted refund approval.', durationMs: 1400, timestamp: '2026-03-09T10:42:19Z' },
      { type: 'delegation', name: 'Delegate to billing-agent', detail: 'Delegated refund processing ($49.99) to billing-agent', durationMs: 1100, timestamp: '2026-03-09T10:42:21Z' },
      { type: 'model_response', name: 'Close', detail: 'Sent response to customer and marked ticket resolved', durationMs: 240, timestamp: '2026-03-09T10:42:22Z' },
    ],
  },
]

const stepTypeStyles: Record<string, { bg: string; text: string; label: string }> = {
  tool_call: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Tool Call' },
  model_response: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Model Response' },
  delegation: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Delegation' },
}

export default function TracesPage() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'error'>('all')

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const filtered = sampleTraces.filter(t => statusFilter === 'all' || t.status === statusFilter)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Execution Traces</h1>
          <p className="text-gray-600 mt-2">Inspect agent execution traces with full step-by-step detail.</p>
        </div>
        <div className="flex gap-2">
          {(['all', 'success', 'error'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                statusFilter === s
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(trace => (
          <div key={trace.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => toggle(trace.id)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-4">
                <div className={`w-2.5 h-2.5 rounded-full ${trace.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                <div>
                  <p className="font-semibold text-gray-900">{trace.taskSummary}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {trace.agentName} -- {new Date(trace.timestamp).toLocaleString()} -- {trace.steps.length} steps
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-mono text-gray-500">{(trace.durationMs / 1000).toFixed(2)}s</span>
                <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                  trace.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {trace.status}
                </span>
                <svg className={`w-5 h-5 text-gray-400 transition-transform ${expanded.has(trace.id) ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {expanded.has(trace.id) && (
              <div className="px-6 pb-5 border-t border-gray-100">
                <div className="relative ml-4 mt-4">
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200" />
                  {trace.steps.map((step, i) => {
                    const style = stepTypeStyles[step.type]
                    return (
                      <div key={i} className="relative pl-8 pb-5 last:pb-0">
                        <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-gray-300 -translate-x-[3.5px]" />
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${style.bg} ${style.text}`}>
                            {style.label}
                          </span>
                          <span className="text-sm font-semibold text-gray-800">{step.name}</span>
                          <span className="text-xs font-mono text-gray-400">{step.durationMs}ms</span>
                        </div>
                        <p className="text-sm text-gray-600">{step.detail}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
