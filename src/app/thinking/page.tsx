'use client'

import { useState } from 'react'

const thinkingLevels = [
  { value: 'adaptive', label: 'Adaptive', description: 'Automatically adjusts thinking depth based on task complexity. Uses minimal thinking for simple tasks and deep reasoning for complex ones.', tokens: '~500-8000' },
  { value: 'low', label: 'Low', description: 'Minimal internal reasoning. Best for straightforward, well-defined tasks like formatting or simple lookups.', tokens: '~500-1500' },
  { value: 'medium', label: 'Medium', description: 'Moderate reasoning depth. Good for typical coding tasks, document analysis, and multi-step operations.', tokens: '~2000-4000' },
  { value: 'high', label: 'High', description: 'Maximum reasoning depth. Best for complex debugging, architecture decisions, and nuanced analysis. Higher token cost.', tokens: '~4000-8000' },
]

const mockAgents = [
  { id: '1', name: 'DevBot 9000', thinking: 'adaptive' },
  { id: '2', name: 'Alfred', thinking: 'low' },
  { id: '3', name: 'Atlas', thinking: 'medium' },
]

export default function ThinkingPage() {
  const [agents, setAgents] = useState(mockAgents)
  const [selectedAgent, setSelectedAgent] = useState(agents[0].id)

  const currentAgent = agents.find(a => a.id === selectedAgent)!
  const currentLevel = thinkingLevels.find(l => l.value === currentAgent.thinking)!

  const setThinking = (value: string) => {
    setAgents(prev => prev.map(a => a.id === selectedAgent ? { ...a, thinking: value } : a))
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-2">Thinking Level Configuration</h1>
      <p className="text-gray-400 mb-8">Control how deeply agents reason before responding</p>

      <div className="mb-8">
        <label className="block text-xs text-gray-500 uppercase mb-1">Agent</label>
        <select
          value={selectedAgent}
          onChange={e => setSelectedAgent(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
        >
          {agents.map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {thinkingLevels.map(level => (
          <button
            key={level.value}
            onClick={() => setThinking(level.value)}
            className={`p-5 rounded-lg border text-left transition-colors ${
              currentAgent.thinking === level.value
                ? 'bg-blue-900/40 border-blue-600'
                : 'bg-gray-900 border-gray-800 hover:border-gray-600'
            }`}
          >
            <h3 className="font-semibold mb-2">{level.label}</h3>
            <p className="text-gray-400 text-sm mb-3">{level.description}</p>
            <div className="text-xs text-gray-500 font-mono">Tokens: {level.tokens}</div>
          </button>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Current Settings</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 text-left text-xs uppercase">
              <th className="pb-3">Agent</th>
              <th className="pb-3">Thinking Level</th>
              <th className="pb-3">Est. Tokens</th>
            </tr>
          </thead>
          <tbody>
            {agents.map(agent => {
              const level = thinkingLevels.find(l => l.value === agent.thinking)!
              return (
                <tr key={agent.id} className="border-t border-gray-800">
                  <td className="py-3 font-medium">{agent.name}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      agent.thinking === 'high' ? 'bg-red-900 text-red-300' :
                      agent.thinking === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                      agent.thinking === 'low' ? 'bg-green-900 text-green-300' :
                      'bg-blue-900 text-blue-300'
                    }`}>
                      {level.label}
                    </span>
                  </td>
                  <td className="py-3 text-gray-400 font-mono">{level.tokens}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
