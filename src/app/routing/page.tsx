'use client'

import { useState } from 'react'

interface RouteRule {
  id: string
  category: string
  model: string
  fallbackModel: string
  costPer1K: number
  priority: number
}

const mockRules: RouteRule[] = [
  { id: 'r1', category: 'Code Generation', model: 'claude-opus-4', fallbackModel: 'claude-sonnet-4', costPer1K: 0.075, priority: 1 },
  { id: 'r2', category: 'Code Review', model: 'claude-sonnet-4', fallbackModel: 'claude-haiku', costPer1K: 0.015, priority: 2 },
  { id: 'r3', category: 'Simple Q&A', model: 'claude-haiku', fallbackModel: 'claude-haiku', costPer1K: 0.0025, priority: 3 },
  { id: 'r4', category: 'Research & Analysis', model: 'claude-opus-4', fallbackModel: 'claude-sonnet-4', costPer1K: 0.075, priority: 4 },
  { id: 'r5', category: 'Data Extraction', model: 'claude-sonnet-4', fallbackModel: 'claude-haiku', costPer1K: 0.015, priority: 5 },
  { id: 'r6', category: 'Summarization', model: 'claude-sonnet-4', fallbackModel: 'claude-haiku', costPer1K: 0.015, priority: 6 },
  { id: 'r7', category: 'Translation', model: 'claude-haiku', fallbackModel: 'claude-haiku', costPer1K: 0.0025, priority: 7 },
  { id: 'r8', category: 'Creative Writing', model: 'claude-opus-4', fallbackModel: 'claude-sonnet-4', costPer1K: 0.075, priority: 8 },
]

const modelColors: Record<string, string> = {
  'claude-opus-4': 'bg-forge-200 text-forge-600',
  'claude-sonnet-4': 'bg-accent-500/10 text-accent-600',
  'claude-haiku': 'bg-accent-500/10 text-accent-600',
}

export default function RoutingPage() {
  const [rules, setRules] = useState(mockRules)
  const [autoRouting, setAutoRouting] = useState(true)
  const [dragId, setDragId] = useState<string | null>(null)

  const totalCost = rules.reduce((sum, r) => sum + r.costPer1K, 0)
  const maxPossibleCost = rules.length * 0.075
  const optimizationScore = Math.round((1 - totalCost / maxPossibleCost) * 100)

  function moveRule(id: string, direction: 'up' | 'down') {
    setRules((prev) => {
      const idx = prev.findIndex((r) => r.id === id)
      if (idx < 0) return prev
      const target = direction === 'up' ? idx - 1 : idx + 1
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      const temp = next[idx]
      next[idx] = next[target]
      next[target] = temp
      return next.map((r, i) => ({ ...r, priority: i + 1 }))
    })
  }

  function handleDragStart(id: string) {
    setDragId(id)
  }

  function handleDragOver(e: React.DragEvent, targetId: string) {
    e.preventDefault()
    if (!dragId || dragId === targetId) return
    setRules((prev) => {
      const fromIdx = prev.findIndex((r) => r.id === dragId)
      const toIdx = prev.findIndex((r) => r.id === targetId)
      if (fromIdx < 0 || toIdx < 0) return prev
      const next = [...prev]
      const [moved] = next.splice(fromIdx, 1)
      next.splice(toIdx, 0, moved)
      return next.map((r, i) => ({ ...r, priority: i + 1 }))
    })
  }

  function handleDragEnd() {
    setDragId(null)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-forge-800 mb-2">
          Smart Model <span className="text-accent-600">Routing</span>
        </h1>
        <p className="text-lg text-forge-500">
          Route tasks to the right model based on category. Drag rows to reorder priority.
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-forge-600 font-medium">Auto-routing</span>
            <button
              onClick={() => setAutoRouting(!autoRouting)}
              className={`relative w-10 h-5 rounded-full transition-colors ${autoRouting ? 'bg-accent-500' : 'bg-forge-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-forge-50 transition-transform ${autoRouting ? 'translate-x-5' : ''}`} />
            </button>
          </label>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${autoRouting ? 'bg-accent-500/10 text-accent-600' : 'bg-forge-200 text-forge-500'}`}>
            {autoRouting ? 'Auto' : 'Manual'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-forge-400">Cost Optimization</span>
          <div className="flex items-center gap-2">
            <div className="w-32 h-2 bg-forge-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  optimizationScore > 60 ? 'bg-accent-500' : optimizationScore > 30 ? 'bg-amber-400' : 'bg-red-500/50'
                }`}
                style={{ width: `${optimizationScore}%` }}
              />
            </div>
            <span className="text-sm font-bold text-forge-800">{optimizationScore}%</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-forge-50 border border-forge-200 rounded-md overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-forge-200 bg-forge-100">
              <th className="text-left text-xs font-semibold text-forge-400 uppercase tracking-wide px-4 py-3 w-10">#</th>
              <th className="text-left text-xs font-semibold text-forge-400 uppercase tracking-wide px-4 py-3">Category</th>
              <th className="text-left text-xs font-semibold text-forge-400 uppercase tracking-wide px-4 py-3">Model</th>
              <th className="text-left text-xs font-semibold text-forge-400 uppercase tracking-wide px-4 py-3">Fallback</th>
              <th className="text-right text-xs font-semibold text-forge-400 uppercase tracking-wide px-4 py-3">Cost/1K</th>
              <th className="text-right text-xs font-semibold text-forge-400 uppercase tracking-wide px-4 py-3 w-20">Move</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => (
              <tr
                key={rule.id}
                draggable
                onDragStart={() => handleDragStart(rule.id)}
                onDragOver={(e) => handleDragOver(e, rule.id)}
                onDragEnd={handleDragEnd}
                className={`border-b border-forge-200 hover:bg-forge-100 transition-colors cursor-grab active:cursor-grabbing ${
                  dragId === rule.id ? 'opacity-50' : ''
                }`}
              >
                <td className="px-4 py-3 text-sm text-forge-300 font-mono">{rule.priority}</td>
                <td className="px-4 py-3 text-sm font-medium text-forge-800">{rule.category}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${modelColors[rule.model] || 'bg-forge-200 text-forge-500'}`}>
                    {rule.model}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${modelColors[rule.fallbackModel] || 'bg-forge-200 text-forge-500'}`}>
                    {rule.fallbackModel}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-right font-mono text-forge-600">${rule.costPer1K.toFixed(4)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => moveRule(rule.id, 'up')}
                      className="p-1 text-forge-300 hover:text-forge-600"
                      disabled={rule.priority === 1}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                    </button>
                    <button
                      onClick={() => moveRule(rule.id, 'down')}
                      className="p-1 text-forge-300 hover:text-forge-600"
                      disabled={rule.priority === rules.length}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
