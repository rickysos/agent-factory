'use client'

import { useState } from 'react'
import { useAgents } from '@/lib/agent-context'

interface Tool {
  name: string
  category: string
  description: string
}

const toolsByCategory: Record<string, Tool[]> = {
  'File Ops': [
    { name: 'Read', category: 'File Ops', description: 'Read files from filesystem' },
    { name: 'Write', category: 'File Ops', description: 'Write files to filesystem' },
    { name: 'Edit', category: 'File Ops', description: 'Edit existing files with diffs' },
    { name: 'Glob', category: 'File Ops', description: 'Find files by pattern' },
    { name: 'Grep', category: 'File Ops', description: 'Search file contents' },
  ],
  'Shell': [
    { name: 'Bash', category: 'Shell', description: 'Execute shell commands' },
    { name: 'Script', category: 'Shell', description: 'Run multi-line scripts' },
  ],
  'Web': [
    { name: 'WebFetch', category: 'Web', description: 'Fetch web page content' },
    { name: 'WebSearch', category: 'Web', description: 'Search the web' },
  ],
  'Git': [
    { name: 'GitCommit', category: 'Git', description: 'Commit changes' },
    { name: 'GitPush', category: 'Git', description: 'Push to remote' },
    { name: 'GitBranch', category: 'Git', description: 'Create and switch branches' },
  ],
  'Delegation': [
    { name: 'TaskCreate', category: 'Delegation', description: 'Create sub-agent tasks' },
    { name: 'TaskGet', category: 'Delegation', description: 'Get task status' },
    { name: 'AgentSpawn', category: 'Delegation', description: 'Spawn sub-agents' },
  ],
}

const mockAgents = [
  { id: '1', name: 'DevBot 9000' },
  { id: '2', name: 'Alfred' },
  { id: '3', name: 'Atlas' },
]

export default function ToolsPage() {
  const [selectedAgent, setSelectedAgent] = useState(mockAgents[0].id)
  const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>({
    '1': { Read: true, Write: true, Edit: true, Glob: true, Grep: true, Bash: true, Script: true, WebFetch: true, WebSearch: true, GitCommit: true, GitPush: true, GitBranch: true, TaskCreate: true, TaskGet: true, AgentSpawn: false },
    '2': { Read: true, Write: true, Edit: false, Glob: true, Grep: false, Bash: false, Script: false, WebFetch: true, WebSearch: false, GitCommit: false, GitPush: false, GitBranch: false, TaskCreate: false, TaskGet: false, AgentSpawn: false },
    '3': { Read: true, Write: true, Edit: false, Glob: true, Grep: false, Bash: false, Script: false, WebFetch: true, WebSearch: true, GitCommit: false, GitPush: false, GitBranch: false, TaskCreate: false, TaskGet: false, AgentSpawn: false },
  })
  const [sandboxMode, setSandboxMode] = useState(false)

  const toggleTool = (tool: string) => {
    setPermissions(prev => ({
      ...prev,
      [selectedAgent]: {
        ...prev[selectedAgent],
        [tool]: !prev[selectedAgent]?.[tool],
      },
    }))
  }

  const agentPerms = permissions[selectedAgent] || {}
  const allowed = Object.values(agentPerms).filter(Boolean).length
  const denied = Object.values(agentPerms).filter(v => !v).length

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-2">Tool Permission Management</h1>
      <p className="text-gray-400 mb-8">Control which tools each agent can access</p>

      <div className="flex items-center gap-6 mb-8">
        <div>
          <label className="block text-xs text-gray-500 uppercase mb-1">Agent</label>
          <select
            value={selectedAgent}
            onChange={e => setSelectedAgent(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
          >
            {mockAgents.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-400">Sandbox Mode</label>
          <button
            onClick={() => setSandboxMode(!sandboxMode)}
            className={`w-12 h-6 rounded-full transition-colors relative ${sandboxMode ? 'bg-yellow-600' : 'bg-gray-700'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${sandboxMode ? 'left-6' : 'left-0.5'}`} />
          </button>
        </div>

        <div className="ml-auto flex gap-4 text-sm">
          <span className="text-green-400">{allowed} allowed</span>
          <span className="text-red-400">{denied} denied</span>
        </div>
      </div>

      {sandboxMode && (
        <div className="bg-yellow-900/30 border border-yellow-800 rounded-lg p-4 mb-6 text-sm text-yellow-300">
          Sandbox mode active -- all file and shell operations are isolated to a temporary directory.
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(toolsByCategory).map(([category, tools]) => (
          <div key={category} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">{category}</h2>
            <div className="space-y-3">
              {tools.map(tool => (
                <div key={tool.name} className="flex items-center justify-between bg-gray-800 rounded px-4 py-3">
                  <div>
                    <span className="font-medium font-mono">{tool.name}</span>
                    <span className="text-gray-500 text-sm ml-3">{tool.description}</span>
                  </div>
                  <button
                    onClick={() => toggleTool(tool.name)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${agentPerms[tool.name] ? 'bg-green-600' : 'bg-gray-700'}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${agentPerms[tool.name] ? 'left-6' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
