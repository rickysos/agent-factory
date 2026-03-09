'use client'

import { useState } from 'react'

interface LogEntry {
  timestamp: string
  operation: string
  status: 'success' | 'error' | 'running'
  message: string
}

const mockAgents = [
  { id: '1', name: 'DevBot 9000' },
  { id: '2', name: 'Alfred' },
  { id: '3', name: 'Atlas' },
]

const operations = [
  { id: 'reconfigure', label: 'Reconfigure', description: 'Rebuild agent configuration from source files', color: 'bg-blue-600 hover:bg-blue-700' },
  { id: 'doctor', label: 'Doctor Repair', description: 'Diagnose and fix common configuration issues', color: 'bg-green-600 hover:bg-green-700' },
  { id: 'security', label: 'Security Audit', description: 'Check for permission leaks and unsafe tool access', color: 'bg-yellow-600 hover:bg-yellow-700' },
  { id: 'update', label: 'Update', description: 'Pull latest model and skill definitions', color: 'bg-purple-600 hover:bg-purple-700' },
  { id: 'uninstall', label: 'Uninstall', description: 'Remove agent and all associated data', color: 'bg-red-600 hover:bg-red-700' },
]

const mockResults: Record<string, LogEntry[]> = {
  reconfigure: [
    { timestamp: '14:32:01', operation: 'Reconfigure', status: 'success', message: 'Loaded CLAUDE.md configuration' },
    { timestamp: '14:32:02', operation: 'Reconfigure', status: 'success', message: 'Parsed 5 skills from SKILLS.md' },
    { timestamp: '14:32:03', operation: 'Reconfigure', status: 'success', message: 'Tool permissions updated (12 tools)' },
    { timestamp: '14:32:04', operation: 'Reconfigure', status: 'success', message: 'Agent reconfigured successfully' },
  ],
  doctor: [
    { timestamp: '14:33:01', operation: 'Doctor', status: 'success', message: 'Checking configuration integrity...' },
    { timestamp: '14:33:02', operation: 'Doctor', status: 'success', message: 'CLAUDE.md: valid' },
    { timestamp: '14:33:03', operation: 'Doctor', status: 'error', message: 'SKILLS.md: missing "Testing" skill reference' },
    { timestamp: '14:33:04', operation: 'Doctor', status: 'success', message: 'Auto-repaired: added missing skill reference' },
  ],
  security: [
    { timestamp: '14:34:01', operation: 'Security', status: 'success', message: 'Scanning tool permissions...' },
    { timestamp: '14:34:02', operation: 'Security', status: 'success', message: 'File access: scoped to project directory' },
    { timestamp: '14:34:03', operation: 'Security', status: 'success', message: 'Shell access: sandbox mode enabled' },
    { timestamp: '14:34:04', operation: 'Security', status: 'success', message: 'No security issues found' },
  ],
  update: [
    { timestamp: '14:35:01', operation: 'Update', status: 'success', message: 'Checking for updates...' },
    { timestamp: '14:35:02', operation: 'Update', status: 'success', message: 'Model definition: up to date' },
    { timestamp: '14:35:03', operation: 'Update', status: 'success', message: 'Skills: 1 update available' },
    { timestamp: '14:35:04', operation: 'Update', status: 'success', message: 'Applied skill update: Code Review v2.1' },
  ],
  uninstall: [
    { timestamp: '14:36:01', operation: 'Uninstall', status: 'running', message: 'Preparing uninstall...' },
    { timestamp: '14:36:02', operation: 'Uninstall', status: 'error', message: 'Uninstall cancelled: confirmation required' },
  ],
}

export default function MaintenancePage() {
  const [selectedAgent, setSelectedAgent] = useState(mockAgents[0].id)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [running, setRunning] = useState<string | null>(null)
  const [completedOps, setCompletedOps] = useState<Set<string>>(new Set())

  const runOperation = (opId: string) => {
    if (opId === 'uninstall' && !confirm('Are you sure you want to uninstall this agent?')) return

    setRunning(opId)
    setLogs([])

    const entries = mockResults[opId] || []
    entries.forEach((entry, i) => {
      setTimeout(() => {
        setLogs(prev => [...prev, entry])
        if (i === entries.length - 1) {
          setRunning(null)
          setCompletedOps(prev => new Set(prev).add(opId))
        }
      }, (i + 1) * 600)
    })
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-2">Agent Maintenance Operations</h1>
      <p className="text-gray-400 mb-8">Manage, repair, and update agents</p>

      <div className="mb-8">
        <label className="block text-xs text-gray-500 uppercase mb-1">Agent</label>
        <select
          value={selectedAgent}
          onChange={e => { setSelectedAgent(e.target.value); setLogs([]); setCompletedOps(new Set()) }}
          className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
        >
          {mockAgents.map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          {operations.map(op => (
            <div key={op.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-center justify-between">
              <div>
                <h3 className="font-medium">{op.label}</h3>
                <p className="text-sm text-gray-500">{op.description}</p>
              </div>
              <div className="flex items-center gap-3">
                {completedOps.has(op.id) && (
                  <span className="text-xs text-green-400">done</span>
                )}
                <button
                  onClick={() => runOperation(op.id)}
                  disabled={running !== null}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${op.color}`}
                >
                  {running === op.id ? 'Running...' : 'Run'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Operation Log</h2>
          {logs.length === 0 ? (
            <p className="text-gray-500 text-sm">Run an operation to see results here.</p>
          ) : (
            <div className="space-y-2 font-mono text-sm">
              {logs.map((entry, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-gray-600 shrink-0">{entry.timestamp}</span>
                  <span className={`shrink-0 ${
                    entry.status === 'success' ? 'text-green-400' :
                    entry.status === 'error' ? 'text-red-400' :
                    'text-yellow-400'
                  }`}>
                    [{entry.status}]
                  </span>
                  <span className="text-gray-300">{entry.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
