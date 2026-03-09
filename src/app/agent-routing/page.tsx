'use client'

import { useState } from 'react'

interface RoutingRule {
  id: string
  agentName: string
  pattern: string
  description: string
}

const initialRules: RoutingRule[] = [
  { id: '1', agentName: 'devbot', pattern: '@devbot', description: 'Routes coding tasks to DevBot 9000 for implementation and debugging' },
  { id: '2', agentName: 'alfred', pattern: '@alfred', description: 'Routes office and scheduling tasks to Alfred' },
  { id: '3', agentName: 'atlas', pattern: '@atlas', description: 'Routes travel planning and research to Atlas' },
]

function generateAgentsMd(rules: RoutingRule[]): string {
  let md = '# AGENTS.md\n\n'
  md += 'Sub-agent routing configuration. Use @mentions to delegate tasks.\n\n'
  rules.forEach(rule => {
    md += `## ${rule.pattern}\n\n`
    md += `${rule.description}\n\n`
  })
  return md
}

export default function AgentRoutingPage() {
  const [rules, setRules] = useState<RoutingRule[]>(initialRules)
  const [newAgent, setNewAgent] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const addRule = () => {
    if (!newAgent.trim()) return
    const name = newAgent.trim().toLowerCase().replace(/\s+/g, '_')
    setRules(prev => [...prev, {
      id: Date.now().toString(),
      agentName: name,
      pattern: `@${name}`,
      description: newDescription || `Routes tasks to ${newAgent}`,
    }])
    setNewAgent('')
    setNewDescription('')
  }

  const removeRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id))
  }

  const updateDescription = (id: string, description: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, description } : r))
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-2">Sub-Agent Routing via AGENTS.md</h1>
      <p className="text-gray-400 mb-8">Configure how tasks are routed to sub-agents using @mentions</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Routing Rules</h2>
            <div className="space-y-3">
              {rules.map(rule => (
                <div key={rule.id} className="bg-gray-800 rounded p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-blue-400 font-medium">{rule.pattern}</span>
                      <span className="text-xs text-gray-600">--&gt;</span>
                      <span className="text-sm text-gray-300">{rule.agentName}</span>
                    </div>
                    <button
                      onClick={() => removeRule(rule.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    type="text"
                    value={rule.description}
                    onChange={e => updateDescription(rule.id, e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm text-gray-300"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Add Routing Rule</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 uppercase mb-1">Agent Name</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 font-mono">@</span>
                  <input
                    type="text"
                    value={newAgent}
                    onChange={e => setNewAgent(e.target.value)}
                    placeholder="agent_name"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase mb-1">Description</label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="What this agent handles"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                />
              </div>
              <button
                onClick={addRule}
                disabled={!newAgent.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-600 rounded text-sm font-medium transition-colors"
              >
                Add Rule
              </button>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Routing Visualization</h2>
            <div className="space-y-2">
              {rules.map(rule => (
                <div key={rule.id} className="flex items-center gap-3 text-sm">
                  <span className="bg-gray-800 rounded px-3 py-1 font-mono text-blue-400">{rule.pattern}</span>
                  <div className="flex-1 border-t border-dashed border-gray-700" />
                  <span className="text-gray-500">--&gt;</span>
                  <div className="flex-1 border-t border-dashed border-gray-700" />
                  <span className="bg-gray-800 rounded px-3 py-1 text-gray-300">{rule.agentName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Generated AGENTS.md</h2>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              {showPreview ? 'Raw' : 'Preview'}
            </button>
          </div>
          <pre className="bg-gray-800 rounded p-4 text-sm font-mono text-gray-300 whitespace-pre-wrap overflow-auto max-h-[600px]">
            {generateAgentsMd(rules)}
          </pre>
        </div>
      </div>
    </div>
  )
}
