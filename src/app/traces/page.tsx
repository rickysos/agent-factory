'use client'

import { useState, useEffect, useCallback } from 'react'

interface Span {
  id: string
  traceId: string
  name: string
  type: 'llm' | 'tool' | 'delegation' | 'system'
  startedAt: string
  endedAt?: string
  duration?: number
  input?: string
  output?: string
  parentSpanId?: string
}

interface Trace {
  id: string
  agentId: string
  sessionId: string
  startedAt: string
  endedAt?: string
  status: 'running' | 'completed' | 'error'
  spans: Span[]
}

const agentNames: Record<string, string> = {
  '1': 'Support Bot',
  '2': 'Content Generator',
  '3': 'Code Reviewer',
}

const spanTypeStyles: Record<string, { bg: string; darkBg: string; text: string; darkText: string; label: string }> = {
  llm: { bg: 'bg-blue-100', darkBg: 'dark:bg-blue-900/40', text: 'text-blue-700', darkText: 'dark:text-blue-300', label: 'LLM' },
  tool: { bg: 'bg-green-100', darkBg: 'dark:bg-green-900/40', text: 'text-green-700', darkText: 'dark:text-green-300', label: 'Tool' },
  delegation: { bg: 'bg-purple-100', darkBg: 'dark:bg-purple-900/40', text: 'text-purple-700', darkText: 'dark:text-purple-300', label: 'Delegation' },
  system: { bg: 'bg-gray-100', darkBg: 'dark:bg-gray-700/40', text: 'text-gray-600', darkText: 'dark:text-gray-300', label: 'System' },
}

function formatDuration(ms?: number) {
  if (!ms) return '--'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString()
}

function traceDuration(trace: Trace): number | undefined {
  if (!trace.endedAt) return undefined
  return new Date(trace.endedAt).getTime() - new Date(trace.startedAt).getTime()
}

export default function TracesPage() {
  const [traces, setTraces] = useState<Trace[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [expandedSpans, setExpandedSpans] = useState<Set<string>>(new Set())
  const [agentFilter, setAgentFilter] = useState<string>('all')
  const [autoRefresh, setAutoRefresh] = useState(false)

  const fetchTraces = useCallback(async () => {
    const url = agentFilter === 'all' ? '/api/traces' : `/api/traces?agentId=${agentFilter}`
    const res = await fetch(url)
    const json = await res.json()
    if (json.success) setTraces(json.data)
    setLoading(false)
  }, [agentFilter])

  useEffect(() => {
    fetchTraces()
  }, [fetchTraces])

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(fetchTraces, 5000)
    return () => clearInterval(interval)
  }, [autoRefresh, fetchTraces])

  const toggleTrace = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleSpan = (id: string) => {
    setExpandedSpans(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"><span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse mr-1.5" />Running</span>
      case 'completed':
        return <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">Completed</span>
      case 'error':
        return <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">Error</span>
      default:
        return null
    }
  }

  const statusDot = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-500 animate-pulse'
      case 'completed': return 'bg-green-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-400'
    }
  }

  // Build parent-child tree for rendering indented spans
  const renderSpans = (spans: Span[]) => {
    const topLevel = spans.filter(s => !s.parentSpanId)
    const children = (parentId: string) => spans.filter(s => s.parentSpanId === parentId)

    const renderSpan = (span: Span, depth: number) => {
      const style = spanTypeStyles[span.type]
      const kids = children(span.id)
      const isExpanded = expandedSpans.has(span.id)

      return (
        <div key={span.id} style={{ marginLeft: depth * 24 }} className="relative">
          <div className="relative pl-6 pb-3 last:pb-0">
            <div className="absolute left-0 top-2 w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
            {depth > 0 && <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700 -ml-3" />}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`px-2 py-0.5 text-xs font-medium rounded ${style.bg} ${style.darkBg} ${style.text} ${style.darkText}`}>
                {style.label}
              </span>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{span.name}</span>
              <span className="text-xs font-mono text-gray-400">{formatDuration(span.duration)}</span>
              {(span.input || span.output) && (
                <button
                  onClick={() => toggleSpan(span.id)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {isExpanded ? 'Hide details' : 'Show details'}
                </button>
              )}
            </div>
            {isExpanded && (
              <div className="mt-2 space-y-2">
                {span.input && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Input</p>
                    <pre className="text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded p-2 whitespace-pre-wrap font-mono">{span.input}</pre>
                  </div>
                )}
                {span.output && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Output</p>
                    <pre className="text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded p-2 whitespace-pre-wrap font-mono">{span.output}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
          {kids.map(child => renderSpan(child, depth + 1))}
        </div>
      )
    }

    return topLevel.map(span => renderSpan(span, 0))
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-72" />
          <div className="space-y-3 mt-8">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl" />)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Execution Traces</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Inspect agent execution traces with span-level detail.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={agentFilter}
            onChange={e => setAgentFilter(e.target.value)}
            className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
          >
            <option value="all">All Agents</option>
            {Object.entries(agentNames).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
              autoRefresh
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh'}
          </button>
        </div>
      </div>

      {traces.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">No traces found.</div>
      ) : (
        <div className="space-y-3">
          {traces.map(trace => {
            const dur = traceDuration(trace)
            return (
              <div key={trace.id} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <button
                  onClick={() => toggleTrace(trace.id)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-2.5 h-2.5 rounded-full ${statusDot(trace.status)}`} />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {agentNames[trace.agentId] || `Agent ${trace.agentId}`}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {trace.sessionId} -- {formatTime(trace.startedAt)} -- {trace.spans.length} span{trace.spans.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                      {dur ? formatDuration(dur) : '--'}
                    </span>
                    {statusBadge(trace.status)}
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${expanded.has(trace.id) ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {expanded.has(trace.id) && (
                  <div className="px-6 pb-5 border-t border-gray-100 dark:border-gray-800">
                    <div className="relative ml-4 mt-4">
                      <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
                      {renderSpans(trace.spans)}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
