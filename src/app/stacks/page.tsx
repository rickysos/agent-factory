'use client'

import { useState } from 'react'
import { teamTemplates } from '@/data/team-templates'
import { useAgents } from '@/lib/agent-context'

export default function StacksPage() {
  const { refreshAgents } = useAgents()
  const [deploying, setDeploying] = useState<string | null>(null)
  const [deployed, setDeployed] = useState<Set<string>>(new Set())

  const deployStack = async (templateId: string) => {
    setDeploying(templateId)
    try {
      const res = await fetch('/api/stacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId }),
      })
      const data = await res.json()
      if (data.success) {
        setDeployed(prev => new Set(prev).add(templateId))
        await refreshAgents()
      }
    } finally {
      setDeploying(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Agent Stack Templates</h1>
        <p className="text-gray-600 mt-2">
          Deploy pre-built multi-agent systems. Each stack includes an orchestrator, specialized sub-agents, and scheduled tasks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamTemplates.map(template => (
          <div key={template.id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{template.emoji}</span>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{template.name}</h2>
                <p className="text-xs text-gray-500">
                  {1 + template.subAgents.length} agents &middot; {template.cronJobs.length} scheduled tasks
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4 flex-1">{template.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded font-medium">
                  {template.orchestrator.name}
                </span>
                <span className="text-gray-400">{template.orchestrator.model}</span>
              </div>
              {template.subAgents.map(agent => (
                <div key={agent.name} className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">
                    {agent.name}
                  </span>
                  <span className="text-gray-400">{agent.model}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => deployStack(template.id)}
              disabled={deploying === template.id || deployed.has(template.id)}
              className="w-full py-2 text-sm font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
            >
              {deployed.has(template.id) ? 'Deployed' :
               deploying === template.id ? 'Deploying...' : 'Deploy Stack'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
