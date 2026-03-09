'use client'

import { Agent } from '@/lib/agent-context'
import { useAgents } from '@/lib/agent-context'
import { useState } from 'react'

interface AgentCardProps {
  agent: Agent
}

const statusConfig = {
  draft: { dot: 'bg-forge-400', label: 'Draft', border: 'border-forge-300 dark:border-forge-600' },
  active: { dot: 'bg-accent-400 animate-pulse', label: 'Active', border: 'border-accent-500/30' },
  inactive: { dot: 'bg-forge-500', label: 'Inactive', border: 'border-forge-300 dark:border-forge-700' },
  error: { dot: 'bg-red-500', label: 'Error', border: 'border-red-500/30' },
}

export function AgentCard({ agent }: AgentCardProps) {
  const { deleteAgent, deployAgent, isLoading } = useAgents()
  const [isDeploying, setIsDeploying] = useState(false)

  const handleDeploy = async () => {
    setIsDeploying(true)
    try {
      await deployAgent(agent.id)
    } finally {
      setIsDeploying(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const status = statusConfig[agent.status]

  return (
    <div className={`bg-forge-50 dark:bg-forge-900 border ${status.border} rounded-md p-5 hover:border-accent-500/40 transition-colors group`}>
      <div className="flex justify-between items-start mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-display font-semibold text-forge-800 dark:text-forge-100 truncate">{agent.name}</h3>
          <p className="text-xs text-forge-400 dark:text-forge-500 mt-0.5 truncate">{agent.description}</p>
        </div>
        <div className="flex items-center gap-1.5 ml-3 shrink-0">
          <div className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
          <span className="text-[10px] font-mono uppercase tracking-wider text-forge-400 dark:text-forge-500">{status.label}</span>
        </div>
      </div>

      <div className="space-y-1.5 mb-4 text-xs font-mono text-forge-500 dark:text-forge-400">
        <div className="flex items-center gap-2">
          <span className="text-forge-300 dark:text-forge-600">MODEL</span>
          <span className="text-forge-600 dark:text-forge-300">{agent.model}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-forge-300 dark:text-forge-600">CREATED</span>
          <span className="text-forge-600 dark:text-forge-300">{formatDate(agent.createdAt)}</span>
        </div>
        {agent.lastDeployed && (
          <div className="flex items-center gap-2">
            <span className="text-forge-300 dark:text-forge-600">DEPLOYED</span>
            <span className="text-forge-600 dark:text-forge-300">{formatDate(agent.lastDeployed)}</span>
          </div>
        )}
      </div>

      {agent.capabilities.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {agent.capabilities.map((capability) => (
            <span
              key={capability}
              className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-accent-500/10 text-accent-600 dark:text-accent-400 border border-accent-500/20 rounded"
            >
              {capability}
            </span>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center pt-3 border-t border-forge-200 dark:border-forge-800">
        <span className="text-[10px] font-mono text-forge-400 dark:text-forge-500 uppercase tracking-wider">
          {agent.deployments} deploy{agent.deployments !== 1 ? 's' : ''}
        </span>

        <div className="flex gap-2">
          {agent.status === 'draft' && (
            <button
              onClick={handleDeploy}
              disabled={isLoading || isDeploying}
              className="px-3 py-1 text-xs font-mono font-medium uppercase tracking-wider bg-accent-500 text-forge-950 rounded hover:bg-accent-400 disabled:opacity-50 transition-colors"
            >
              {isDeploying ? 'Deploying...' : 'Deploy'}
            </button>
          )}

          <button
            onClick={() => deleteAgent(agent.id)}
            className="px-3 py-1 text-xs font-mono uppercase tracking-wider text-forge-500 dark:text-forge-400 border border-forge-200 dark:border-forge-700 rounded hover:border-red-500/50 hover:text-red-500 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
