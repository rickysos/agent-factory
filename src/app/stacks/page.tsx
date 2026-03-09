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
        <h1 className="text-3xl font-bold text-forge-800">Agent Stack Templates</h1>
        <p className="text-forge-500 mt-2">
          Deploy pre-built multi-agent systems. Each stack includes an orchestrator, specialized sub-agents, and scheduled tasks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamTemplates.map(template => (
          <div key={template.id} className="bg-forge-50 rounded-2xl  p-6 border border-forge-200 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{template.emoji}</span>
              <div>
                <h2 className="text-lg font-bold text-forge-800">{template.name}</h2>
                <p className="text-xs text-forge-400">
                  {1 + template.subAgents.length} agents &middot; {template.cronJobs.length} scheduled tasks
                </p>
              </div>
            </div>

            <p className="text-sm text-forge-500 mb-4 flex-1">{template.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 bg-forge-200 text-forge-600 rounded font-medium">
                  {template.orchestrator.name}
                </span>
                <span className="text-forge-300">{template.orchestrator.model}</span>
              </div>
              {template.subAgents.map(agent => (
                <div key={agent.name} className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 bg-accent-500/10 text-accent-600 rounded font-medium">
                    {agent.name}
                  </span>
                  <span className="text-forge-300">{agent.model}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => deployStack(template.id)}
              disabled={deploying === template.id || deployed.has(template.id)}
              className="w-full py-2 text-sm font-medium rounded transition disabled:opacity-50 disabled:cursor-not-allowed bg-accent-500 text-forge-950 hover:bg-accent-400"
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
