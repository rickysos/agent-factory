'use client'

import { useState } from 'react'

interface AgentMetric {
  agentName: string
  model: string
  totalTokens: number
  requests: number
  avgLatencyMs: number
  errors: number
  cost: number
}

const summaryMetrics = {
  totalTokens: 2_847_392,
  avgLatencyMs: 1240,
  errorRate: 2.3,
  totalCost: 142.87,
  totalRequests: 1_284,
  uptime: 99.7,
}

const agentMetrics: AgentMetric[] = [
  { agentName: 'code-reviewer', model: 'claude-sonnet-4-20250514', totalTokens: 892_100, requests: 342, avgLatencyMs: 1820, errors: 4, cost: 48.21 },
  { agentName: 'data-pipeline', model: 'claude-haiku-4-20250414', totalTokens: 624_500, requests: 288, avgLatencyMs: 640, errors: 2, cost: 12.49 },
  { agentName: 'support-agent', model: 'claude-sonnet-4-20250514', totalTokens: 541_200, requests: 198, avgLatencyMs: 1540, errors: 8, cost: 29.23 },
  { agentName: 'deploy-bot', model: 'claude-haiku-4-20250414', totalTokens: 312_800, requests: 156, avgLatencyMs: 890, errors: 12, cost: 6.26 },
  { agentName: 'security-scanner', model: 'claude-opus-4-20250514', totalTokens: 284_100, requests: 142, avgLatencyMs: 2100, errors: 1, cost: 38.15 },
  { agentName: 'billing-agent', model: 'claude-haiku-4-20250414', totalTokens: 192_692, requests: 158, avgLatencyMs: 520, errors: 3, cost: 8.53 },
]

const statCards = [
  { label: 'Total Tokens', value: summaryMetrics.totalTokens.toLocaleString(), sub: 'Last 24 hours' },
  { label: 'Avg Latency', value: `${summaryMetrics.avgLatencyMs}ms`, sub: 'Across all agents' },
  { label: 'Error Rate', value: `${summaryMetrics.errorRate}%`, sub: `${Math.round(summaryMetrics.totalRequests * summaryMetrics.errorRate / 100)} of ${summaryMetrics.totalRequests} requests` },
  { label: 'Total Cost', value: `$${summaryMetrics.totalCost.toFixed(2)}`, sub: 'Last 24 hours' },
  { label: 'Total Requests', value: summaryMetrics.totalRequests.toLocaleString(), sub: 'Last 24 hours' },
  { label: 'Uptime', value: `${summaryMetrics.uptime}%`, sub: 'Last 30 days' },
]

type SortKey = 'agentName' | 'totalTokens' | 'requests' | 'errors' | 'cost'

export default function MonitoringPage() {
  const [sortBy, setSortBy] = useState<SortKey>('cost')
  const [sortAsc, setSortAsc] = useState(false)

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortBy(key)
      setSortAsc(false)
    }
  }

  const sorted = [...agentMetrics].sort((a, b) => {
    const av = a[sortBy]
    const bv = b[sortBy]
    if (typeof av === 'string') return sortAsc ? (av as string).localeCompare(bv as string) : (bv as string).localeCompare(av as string)
    return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number)
  })

  const sortIcon = (key: SortKey) => {
    if (sortBy !== key) return null
    return <span className="ml-1 text-xs">{sortAsc ? 'ASC' : 'DESC'}</span>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-forge-800">Monitoring Dashboard</h1>
        <p className="text-forge-500 mt-2">Real-time metrics and performance data for all running agents.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {statCards.map(card => (
          <div key={card.label} className="bg-forge-50 rounded-md  border border-forge-200 p-4">
            <p className="text-xs font-medium text-forge-400 uppercase tracking-wide">{card.label}</p>
            <p className="text-2xl font-bold text-forge-800 mt-1">{card.value}</p>
            <p className="text-xs text-forge-300 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-forge-50 rounded-md  border border-forge-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-forge-200">
          <h2 className="text-lg font-bold text-forge-800">Per-Agent Metrics</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-forge-100 text-left text-xs font-medium text-forge-400 uppercase tracking-wider">
                <th className="px-6 py-3 cursor-pointer hover:text-forge-600" onClick={() => handleSort('agentName')}>
                  Agent{sortIcon('agentName')}
                </th>
                <th className="px-6 py-3">Model</th>
                <th className="px-6 py-3 cursor-pointer hover:text-forge-600 text-right" onClick={() => handleSort('totalTokens')}>
                  Tokens{sortIcon('totalTokens')}
                </th>
                <th className="px-6 py-3 cursor-pointer hover:text-forge-600 text-right" onClick={() => handleSort('requests')}>
                  Requests{sortIcon('requests')}
                </th>
                <th className="px-6 py-3 text-right">Avg Latency</th>
                <th className="px-6 py-3 cursor-pointer hover:text-forge-600 text-right" onClick={() => handleSort('errors')}>
                  Errors{sortIcon('errors')}
                </th>
                <th className="px-6 py-3 cursor-pointer hover:text-forge-600 text-right" onClick={() => handleSort('cost')}>
                  Cost{sortIcon('cost')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sorted.map(m => (
                <tr key={m.agentName} className="hover:bg-forge-100 transition">
                  <td className="px-6 py-3 font-medium text-forge-800">{m.agentName}</td>
                  <td className="px-6 py-3 text-forge-400 font-mono text-xs">{m.model}</td>
                  <td className="px-6 py-3 text-right text-forge-600">{m.totalTokens.toLocaleString()}</td>
                  <td className="px-6 py-3 text-right text-forge-600">{m.requests}</td>
                  <td className="px-6 py-3 text-right text-forge-600">{m.avgLatencyMs}ms</td>
                  <td className="px-6 py-3 text-right">
                    <span className={m.errors > 5 ? 'text-red-600 font-medium' : 'text-forge-600'}>{m.errors}</span>
                  </td>
                  <td className="px-6 py-3 text-right font-medium text-forge-800">${m.cost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-forge-100 font-semibold text-sm">
                <td className="px-6 py-3 text-forge-800">Total</td>
                <td className="px-6 py-3" />
                <td className="px-6 py-3 text-right text-forge-800">{agentMetrics.reduce((s, m) => s + m.totalTokens, 0).toLocaleString()}</td>
                <td className="px-6 py-3 text-right text-forge-800">{agentMetrics.reduce((s, m) => s + m.requests, 0)}</td>
                <td className="px-6 py-3 text-right text-forge-800">{Math.round(agentMetrics.reduce((s, m) => s + m.avgLatencyMs, 0) / agentMetrics.length)}ms</td>
                <td className="px-6 py-3 text-right text-forge-800">{agentMetrics.reduce((s, m) => s + m.errors, 0)}</td>
                <td className="px-6 py-3 text-right text-forge-800">${agentMetrics.reduce((s, m) => s + m.cost, 0).toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
