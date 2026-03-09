'use client'

import { useState, useEffect, useCallback } from 'react'

interface AgentUsage {
  agentId: string
  agentName: string
  tokens: number
  cost: number
  requests: number
  lastUsed: string
}

interface ModelUsage {
  model: string
  requests: number
  totalTokens: number
  cost: number
}

interface DailyUsage {
  date: string
  cost: number
  tokens: number
  requests: number
}

interface UsageData {
  totalCost: number
  totalTokens: number
  byAgent: AgentUsage[]
  byModel: ModelUsage[]
  daily: DailyUsage[]
}

export default function CostsPage() {
  const [days, setDays] = useState(7)
  const [data, setData] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/usage?days=${days}`)
      const json = await res.json()
      setData(json)
    } catch {
      // keep existing data on error
    } finally {
      setLoading(false)
    }
  }, [days])

  useEffect(() => {
    setLoading(true)
    fetchData()
  }, [fetchData])

  if (loading && !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-forge-400 dark:text-forge-500">Loading usage data...</p>
      </div>
    )
  }

  const totalCost = data?.totalCost ?? 0
  const totalTokens = data?.totalTokens ?? 0
  const byAgent = data?.byAgent ?? []
  const byModel = data?.byModel ?? []
  const daily = data?.daily ?? []
  const maxAgentCost = Math.max(...byAgent.map(a => a.cost), 1)
  const maxModelCost = Math.max(...byModel.map(m => m.cost), 1)
  const maxDailyCost = Math.max(...daily.map(d => d.cost), 1)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-forge-800 dark:text-forge-100">Cost Tracking</h1>
          <p className="text-forge-500 dark:text-forge-400 mt-2">Monitor spend across agents and models.</p>
        </div>
        <div className="flex gap-2">
          {[1, 7, 30].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 text-sm font-medium rounded transition ${
                days === d
                  ? 'bg-forge-900 dark:bg-forge-100 text-forge-950 dark:text-forge-800'
                  : 'bg-forge-200 dark:bg-forge-800 text-forge-500 dark:text-forge-300 hover:bg-forge-200 dark:hover:bg-forge-800'
              }`}
            >
              {d === 1 ? '24h' : `${d}d`}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <div className="bg-forge-50 dark:bg-forge-900 rounded-md  border border-forge-200 dark:border-forge-700 p-5">
          <p className="text-xs font-medium text-forge-400 dark:text-forge-500 uppercase tracking-wide">Total Spend</p>
          <p className="text-3xl font-bold text-forge-800 dark:text-forge-100 mt-1">
            {totalCost === 0 ? (
              <span className="text-accent-600 dark:text-accent-400">Free</span>
            ) : (
              `$${totalCost.toFixed(4)}`
            )}
          </p>
          <p className="text-xs text-forge-300 mt-1">Last {days} day{days > 1 ? 's' : ''}</p>
        </div>
        <div className="bg-forge-50 dark:bg-forge-900 rounded-md  border border-forge-200 dark:border-forge-700 p-5">
          <p className="text-xs font-medium text-forge-400 dark:text-forge-500 uppercase tracking-wide">Tokens Used</p>
          <p className="text-3xl font-bold text-forge-800 dark:text-forge-100 mt-1">{totalTokens.toLocaleString()}</p>
          <p className="text-xs text-forge-300 mt-1">Prompt + completion</p>
        </div>
      </div>

      {/* Usage by Agent */}
      <div className="bg-forge-50 dark:bg-forge-900 rounded-md  border border-forge-200 dark:border-forge-700 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-forge-200 dark:border-forge-800">
          <h2 className="text-lg font-bold text-forge-800 dark:text-forge-100">Usage by Agent</h2>
        </div>
        {byAgent.length === 0 ? (
          <p className="px-6 py-8 text-forge-400 dark:text-forge-500 text-center">No usage recorded yet. Chat with an agent to see data here.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-forge-100 dark:bg-forge-850 text-left text-xs font-medium text-forge-400 dark:text-forge-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Agent</th>
                  <th className="px-6 py-3 text-right">Requests</th>
                  <th className="px-6 py-3 text-right">Tokens</th>
                  <th className="px-6 py-3 text-right">Cost</th>
                  <th className="px-6 py-3 text-right">Last Used</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {byAgent.map(a => (
                  <tr key={a.agentId} className="hover:bg-forge-100 dark:hover:bg-forge-850 transition">
                    <td className="px-6 py-3 font-medium text-forge-800 dark:text-forge-100">{a.agentName}</td>
                    <td className="px-6 py-3 text-right text-forge-600 dark:text-forge-300">{a.requests}</td>
                    <td className="px-6 py-3 text-right text-forge-600 dark:text-forge-300">{a.tokens.toLocaleString()}</td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-forge-200 dark:bg-forge-700 rounded-full h-1.5">
                          <div className="bg-accent-500 h-1.5 rounded-full" style={{ width: `${(a.cost / maxAgentCost) * 100}%` }} />
                        </div>
                        <span className="font-medium text-forge-800 dark:text-forge-100">{a.cost === 0 ? 'Free' : `$${a.cost.toFixed(4)}`}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right text-xs text-forge-400 dark:text-forge-500">{new Date(a.lastUsed).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Usage by Model */}
      <div className="bg-forge-50 dark:bg-forge-900 rounded-md  border border-forge-200 dark:border-forge-700 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-forge-200 dark:border-forge-800">
          <h2 className="text-lg font-bold text-forge-800 dark:text-forge-100">Usage by Model</h2>
        </div>
        {byModel.length === 0 ? (
          <p className="px-6 py-8 text-forge-400 dark:text-forge-500 text-center">No model usage recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-forge-100 dark:bg-forge-850 text-left text-xs font-medium text-forge-400 dark:text-forge-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Model</th>
                  <th className="px-6 py-3 text-right">Requests</th>
                  <th className="px-6 py-3 text-right">Tokens</th>
                  <th className="px-6 py-3 text-right">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {byModel.map(m => (
                  <tr key={m.model} className="hover:bg-forge-100 dark:hover:bg-forge-850 transition">
                    <td className="px-6 py-3 font-mono text-xs text-forge-800 dark:text-forge-100">{m.model}</td>
                    <td className="px-6 py-3 text-right text-forge-600 dark:text-forge-300">{m.requests}</td>
                    <td className="px-6 py-3 text-right text-forge-600 dark:text-forge-300">{m.totalTokens.toLocaleString()}</td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-forge-200 dark:bg-forge-700 rounded-full h-1.5">
                          <div className="bg-forge-600 h-1.5 rounded-full" style={{ width: `${(m.cost / maxModelCost) * 100}%` }} />
                        </div>
                        <span className="font-medium text-forge-800 dark:text-forge-100">{m.cost === 0 ? 'Free' : `$${m.cost.toFixed(4)}`}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Daily Usage */}
      <div className="bg-forge-50 dark:bg-forge-900 rounded-md  border border-forge-200 dark:border-forge-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-forge-200 dark:border-forge-800">
          <h2 className="text-lg font-bold text-forge-800 dark:text-forge-100">Daily Usage</h2>
        </div>
        {daily.length === 0 ? (
          <p className="px-6 py-8 text-forge-400 dark:text-forge-500 text-center">No daily usage data yet.</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {daily.map(d => (
              <div key={d.date} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-forge-800 dark:text-forge-100">{d.date}</p>
                  <p className="text-xs text-forge-400 dark:text-forge-500">{d.requests} request{d.requests !== 1 ? 's' : ''} / {d.tokens.toLocaleString()} tokens</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-forge-200 dark:bg-forge-700 rounded-full h-2">
                    <div className="bg-accent-500 h-2 rounded-full" style={{ width: `${(d.cost / maxDailyCost) * 100}%` }} />
                  </div>
                  <span className="text-sm font-medium text-forge-800 dark:text-forge-100 w-16 text-right">{d.cost === 0 ? 'Free' : `$${d.cost.toFixed(4)}`}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
