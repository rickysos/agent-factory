'use client'

import { useAgents } from '@/lib/agent-context'
import { AgentCard } from './AgentCard'

export function AgentDashboard() {
  const { agents } = useAgents()

  const stats = {
    total: agents.length,
    active: agents.filter(a => a.status === 'active').length,
    draft: agents.filter(a => a.status === 'draft').length,
    deployments: agents.reduce((sum, agent) => sum + agent.deployments, 0),
  }

  const statItems = [
    { label: 'Total', value: stats.total, color: 'text-amber-400' },
    { label: 'Active', value: stats.active, color: 'text-green-400' },
    { label: 'Draft', value: stats.draft, color: 'text-forge-400' },
    { label: 'Deploys', value: stats.deployments, color: 'text-copper-400' },
  ]

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {statItems.map(s => (
          <div key={s.label} className="bg-forge-50 dark:bg-forge-900 border border-forge-200 dark:border-forge-800 rounded-md p-4">
            <p className="text-[10px] font-mono uppercase tracking-wider text-forge-400 dark:text-forge-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-mono font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-xs font-mono font-medium text-forge-500 dark:text-forge-400 uppercase tracking-wider">Fleet</h3>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-forge-500 dark:text-forge-400 border border-forge-200 dark:border-forge-700 rounded hover:border-amber-500/50 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
            Filter
          </button>
          <button className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-forge-500 dark:text-forge-400 border border-forge-200 dark:border-forge-700 rounded hover:border-amber-500/50 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
            Sort
          </button>
        </div>
      </div>

      {agents.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-forge-300 dark:border-forge-700 rounded-md">
          <div className="mx-auto h-12 w-12 text-forge-300 dark:text-forge-600 mb-4">
            <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h3 className="text-sm font-mono font-medium text-forge-600 dark:text-forge-300 mb-1 uppercase tracking-wider">No agents forged</h3>
          <p className="text-sm text-forge-400 dark:text-forge-500 mb-5">Create your first agent to begin</p>
          <button className="px-5 py-2 text-xs font-mono font-medium uppercase tracking-wider bg-amber-500 text-forge-950 rounded hover:bg-amber-400 transition-colors">
            Forge Agent
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}
    </div>
  )
}
