'use client'

import { useState } from 'react'

type AutonomyLevel = 'L1' | 'L2' | 'L3' | 'L4'
type Trend = 'up' | 'down' | 'stable'

interface AgentScore {
  id: string
  name: string
  overallScore: number
  completionRate: number
  avgSpeedMs: number
  costEfficiency: number
  errorRate: number
  autonomy: AutonomyLevel
  trend: Trend
  tasksCompleted: number
}

const mockAgents: AgentScore[] = [
  { id: 'a1', name: 'CodeBot', overallScore: 94, completionRate: 97.2, avgSpeedMs: 1200, costEfficiency: 91, errorRate: 1.8, autonomy: 'L3', trend: 'up', tasksCompleted: 1482 },
  { id: 'a2', name: 'DeployBot', overallScore: 89, completionRate: 95.0, avgSpeedMs: 3400, costEfficiency: 88, errorRate: 3.1, autonomy: 'L2', trend: 'up', tasksCompleted: 634 },
  { id: 'a3', name: 'ResearchBot', overallScore: 87, completionRate: 92.5, avgSpeedMs: 4500, costEfficiency: 85, errorRate: 4.2, autonomy: 'L3', trend: 'stable', tasksCompleted: 891 },
  { id: 'a4', name: 'OpsBot', overallScore: 82, completionRate: 90.1, avgSpeedMs: 2100, costEfficiency: 79, errorRate: 5.0, autonomy: 'L4', trend: 'down', tasksCompleted: 2103 },
  { id: 'a5', name: 'DataBot', overallScore: 78, completionRate: 88.3, avgSpeedMs: 5600, costEfficiency: 82, errorRate: 6.7, autonomy: 'L2', trend: 'stable', tasksCompleted: 445 },
  { id: 'a6', name: 'WriterBot', overallScore: 75, completionRate: 93.8, avgSpeedMs: 3200, costEfficiency: 70, errorRate: 2.5, autonomy: 'L1', trend: 'up', tasksCompleted: 312 },
  { id: 'a7', name: 'TestBot', overallScore: 71, completionRate: 85.0, avgSpeedMs: 7800, costEfficiency: 76, errorRate: 8.2, autonomy: 'L2', trend: 'down', tasksCompleted: 567 },
  { id: 'a8', name: 'SecurityBot', overallScore: 68, completionRate: 80.5, avgSpeedMs: 9200, costEfficiency: 65, errorRate: 10.1, autonomy: 'L1', trend: 'stable', tasksCompleted: 198 },
]

const autonomyLabels: Record<AutonomyLevel, string> = {
  L1: 'Human-supervised',
  L2: 'Human-assisted',
  L3: 'Semi-autonomous',
  L4: 'Fully autonomous',
}

const autonomyColors: Record<AutonomyLevel, string> = {
  L1: 'bg-gray-100 text-gray-700',
  L2: 'bg-blue-100 text-blue-700',
  L3: 'bg-purple-100 text-purple-700',
  L4: 'bg-green-100 text-green-700',
}

function TrendArrow({ trend }: { trend: Trend }) {
  if (trend === 'up') return <span className="text-green-600 font-bold">^</span>
  if (trend === 'down') return <span className="text-red-600 font-bold">v</span>
  return <span className="text-gray-400 font-bold">--</span>
}

function ScoreBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = (value / max) * 100
  return (
    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${pct > 80 ? 'bg-green-500' : pct > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function formatSpeed(ms: number) {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export default function ScoringPage() {
  const [sortBy, setSortBy] = useState<'score' | 'completion' | 'speed' | 'cost' | 'error'>('score')

  const sorted = [...mockAgents].sort((a, b) => {
    switch (sortBy) {
      case 'score': return b.overallScore - a.overallScore
      case 'completion': return b.completionRate - a.completionRate
      case 'speed': return a.avgSpeedMs - b.avgSpeedMs
      case 'cost': return b.costEfficiency - a.costEfficiency
      case 'error': return a.errorRate - b.errorRate
      default: return 0
    }
  })

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Agent <span className="text-blue-600">Scoring</span>
        </h1>
        <p className="text-lg text-gray-600">
          Performance leaderboard across all active agents.
        </p>
      </div>

      {/* Top 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {sorted.slice(0, 3).map((agent, i) => (
          <div
            key={agent.id}
            className={`rounded-xl border p-5 ${
              i === 0
                ? 'border-yellow-300 bg-yellow-50'
                : i === 1
                ? 'border-gray-300 bg-gray-50'
                : 'border-orange-200 bg-orange-50'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl font-bold text-gray-400">#{i + 1}</span>
              <TrendArrow trend={agent.trend} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{agent.name}</h3>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl font-bold text-gray-900">{agent.overallScore}</span>
              <span className="text-sm text-gray-500">/ 100</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${autonomyColors[agent.autonomy]}`}>
                {agent.autonomy} {autonomyLabels[agent.autonomy]}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">{agent.tasksCompleted.toLocaleString()} tasks completed</p>
          </div>
        ))}
      </div>

      {/* Sort controls */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-gray-500">Sort by:</span>
        {([
          ['score', 'Score'],
          ['completion', 'Completion'],
          ['speed', 'Speed'],
          ['cost', 'Cost Eff.'],
          ['error', 'Error Rate'],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSortBy(key)}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
              sortBy === key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Full leaderboard */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 w-10">Rank</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Agent</th>
              <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Score</th>
              <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Completion</th>
              <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Avg Speed</th>
              <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Cost Eff.</th>
              <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Error Rate</th>
              <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Autonomy</th>
              <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 w-10">Trend</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((agent, i) => (
              <tr key={agent.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-400 font-mono">{i + 1}</td>
                <td className="px-4 py-3">
                  <span className="text-sm font-semibold text-gray-900">{agent.name}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="text-center">
                    <span className="text-sm font-bold text-gray-900">{agent.overallScore}</span>
                    <ScoreBar value={agent.overallScore} />
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-700">{agent.completionRate}%</td>
                <td className="px-4 py-3 text-center text-sm font-mono text-gray-700">{formatSpeed(agent.avgSpeedMs)}</td>
                <td className="px-4 py-3 text-center text-sm text-gray-700">{agent.costEfficiency}%</td>
                <td className="px-4 py-3 text-center text-sm text-gray-700">{agent.errorRate}%</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${autonomyColors[agent.autonomy]}`}>
                    {agent.autonomy}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <TrendArrow trend={agent.trend} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
