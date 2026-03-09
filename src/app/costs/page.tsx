'use client'

import { useState } from 'react'

interface AgentCost {
  agentName: string
  model: string
  inputTokens: number
  outputTokens: number
  cost: number
}

interface TaskCost {
  id: string
  taskName: string
  agentName: string
  timestamp: string
  tokens: number
  cost: number
  status?: 'completed' | 'failed'
}

const agentCosts: AgentCost[] = [
  { agentName: 'code-reviewer', model: 'claude-sonnet-4-20250514', inputTokens: 612_000, outputTokens: 280_100, cost: 48.21 },
  { agentName: 'security-scanner', model: 'claude-opus-4-20250514', inputTokens: 184_200, outputTokens: 99_900, cost: 38.15 },
  { agentName: 'support-agent', model: 'claude-sonnet-4-20250514', inputTokens: 382_400, outputTokens: 158_800, cost: 29.23 },
  { agentName: 'data-pipeline', model: 'claude-haiku-4-20250414', inputTokens: 412_300, outputTokens: 212_200, cost: 12.49 },
  { agentName: 'billing-agent', model: 'claude-haiku-4-20250414', inputTokens: 128_400, outputTokens: 64_292, cost: 8.53 },
  { agentName: 'deploy-bot', model: 'claude-haiku-4-20250414', inputTokens: 208_600, outputTokens: 104_200, cost: 6.26 },
]

const recentTasks = [
  { id: 'task-301', taskName: 'Review PR #482', agentName: 'code-reviewer', timestamp: '2026-03-09T14:32:11Z', tokens: 18_420, cost: 0.98 },
  { id: 'task-300', taskName: 'Scan auth module', agentName: 'security-scanner', timestamp: '2026-03-09T14:15:02Z', tokens: 12_800, cost: 1.72 },
  { id: 'task-299', taskName: 'Ticket #1094 response', agentName: 'support-agent', timestamp: '2026-03-09T10:42:18Z', tokens: 8_920, cost: 0.47 },
  { id: 'task-298', taskName: 'Daily ETL 2026-03-09', agentName: 'data-pipeline', timestamp: '2026-03-09T13:00:02Z', tokens: 6_140, cost: 0.12 },
  { id: 'task-297', taskName: 'Deploy v2.4.1 staging', agentName: 'deploy-bot', timestamp: '2026-03-09T11:15:44Z', tokens: 4_280, cost: 0.09, status: 'failed' },
  { id: 'task-296', taskName: 'Review PR #481', agentName: 'code-reviewer', timestamp: '2026-03-09T09:22:33Z', tokens: 22_100, cost: 1.18 },
  { id: 'task-295', taskName: 'Refund processing', agentName: 'billing-agent', timestamp: '2026-03-09T10:44:00Z', tokens: 3_200, cost: 0.06 },
  { id: 'task-294', taskName: 'Ticket #1093 response', agentName: 'support-agent', timestamp: '2026-03-08T16:30:12Z', tokens: 7_640, cost: 0.41 },
  { id: 'task-293', taskName: 'Daily ETL 2026-03-08', agentName: 'data-pipeline', timestamp: '2026-03-08T13:00:01Z', tokens: 5_890, cost: 0.11 },
  { id: 'task-292', taskName: 'Scan payments module', agentName: 'security-scanner', timestamp: '2026-03-08T11:05:44Z', tokens: 14_200, cost: 1.91 },
].map(t => ({ ...t, status: t.status || 'completed' as const }))

const totalCost = agentCosts.reduce((s, a) => s + a.cost, 0)
const costToday = recentTasks.filter(t => t.timestamp.startsWith('2026-03-09')).reduce((s, t) => s + t.cost, 0)
const avgCostPerTask = totalCost / recentTasks.length

type Period = '24h' | '7d' | '30d'

export default function CostsPage() {
  const [period, setPeriod] = useState<Period>('24h')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cost Tracking</h1>
          <p className="text-gray-600 mt-2">Monitor spend across agents, models, and individual tasks.</p>
        </div>
        <div className="flex gap-2">
          {(['24h', '7d', '30d'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                period === p ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Cost</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">${totalCost.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">All time</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cost Today</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">${costToday.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">2026-03-09</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Avg Cost per Task</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">${avgCostPerTask.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">Across {recentTasks.length} recent tasks</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Cost by Agent</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3">Agent</th>
                <th className="px-6 py-3">Model</th>
                <th className="px-6 py-3 text-right">Input Tokens</th>
                <th className="px-6 py-3 text-right">Output Tokens</th>
                <th className="px-6 py-3 text-right">Cost</th>
                <th className="px-6 py-3 text-right">% of Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {agentCosts.map(a => (
                <tr key={a.agentName} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-3 font-medium text-gray-900">{a.agentName}</td>
                  <td className="px-6 py-3 text-gray-500 font-mono text-xs">{a.model}</td>
                  <td className="px-6 py-3 text-right text-gray-700">{a.inputTokens.toLocaleString()}</td>
                  <td className="px-6 py-3 text-right text-gray-700">{a.outputTokens.toLocaleString()}</td>
                  <td className="px-6 py-3 text-right font-medium text-gray-900">${a.cost.toFixed(2)}</td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${(a.cost / totalCost) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-10 text-right">{((a.cost / totalCost) * 100).toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-semibold text-sm">
                <td className="px-6 py-3 text-gray-900">Total</td>
                <td className="px-6 py-3" />
                <td className="px-6 py-3 text-right text-gray-900">{agentCosts.reduce((s, a) => s + a.inputTokens, 0).toLocaleString()}</td>
                <td className="px-6 py-3 text-right text-gray-900">{agentCosts.reduce((s, a) => s + a.outputTokens, 0).toLocaleString()}</td>
                <td className="px-6 py-3 text-right text-gray-900">${totalCost.toFixed(2)}</td>
                <td className="px-6 py-3 text-right text-gray-500">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Recent Tasks</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3">Task</th>
                <th className="px-6 py-3">Agent</th>
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3 text-right">Tokens</th>
                <th className="px-6 py-3 text-right">Cost</th>
                <th className="px-6 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentTasks.map(t => (
                <tr key={t.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-3 font-medium text-gray-900">{t.taskName}</td>
                  <td className="px-6 py-3 text-gray-600">{t.agentName}</td>
                  <td className="px-6 py-3 text-gray-500 text-xs">{new Date(t.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-3 text-right text-gray-700">{t.tokens.toLocaleString()}</td>
                  <td className="px-6 py-3 text-right font-medium text-gray-900">${t.cost.toFixed(2)}</td>
                  <td className="px-6 py-3 text-center">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      t.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
