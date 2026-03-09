'use client'

import { Agent } from '@/lib/agent-context'
import { useAgents } from '@/lib/agent-context'
import { useState } from 'react'

interface AgentCardProps {
  agent: Agent
}

export function AgentCard({ agent }: AgentCardProps) {
  const { deleteAgent, deployAgent, isLoading } = useAgents()
  const [isDeploying, setIsDeploying] = useState(false)

  const statusColors = {
    draft: 'bg-yellow-100 text-yellow-800',
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    error: 'bg-red-100 text-red-800',
  }

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
      year: 'numeric',
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
          <p className="text-sm text-gray-500">{agent.description}</p>
        </div>
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusColors[agent.status]}`}>
          {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
          <span>Model: {agent.model}</span>
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">Created:</span> {formatDate(agent.createdAt)}
        </div>
        {agent.lastDeployed && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Last deployed:</span> {formatDate(agent.lastDeployed)}
          </div>
        )}
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {agent.capabilities.map((capability) => (
            <span
              key={capability}
              className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded"
            >
              {capability}
            </span>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {agent.deployments} deployment{agent.deployments !== 1 ? 's' : ''}
        </div>
        
        <div className="flex space-x-2">
          {agent.status === 'draft' && (
            <button
              onClick={handleDeploy}
              disabled={isLoading || isDeploying}
              className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isDeploying ? 'Deploying...' : 'Deploy'}
            </button>
          )}
          
          <button
            onClick={() => deleteAgent(agent.id)}
            className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}