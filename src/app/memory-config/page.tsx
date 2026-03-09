'use client'

import { useState } from 'react'

const mockAgents = [
  { id: '1', name: 'DevBot 9000' },
  { id: '2', name: 'Alfred' },
  { id: '3', name: 'Atlas' },
]

const mockDailyLogs = [
  { date: '2026-03-09', size: '2.4 KB', entries: 12 },
  { date: '2026-03-08', size: '3.1 KB', entries: 18 },
  { date: '2026-03-07', size: '1.8 KB', entries: 9 },
  { date: '2026-03-06', size: '4.2 KB', entries: 24 },
  { date: '2026-03-05', size: '2.0 KB', entries: 11 },
]

const defaultMemoryMd = `# Agent Memory

## User Preferences
- Prefers short, direct responses
- Uses semantic commit prefixes
- Designs in code (React + Tailwind)

## Project Context
- Agent Factory: Next.js platform for managing AI agents
- Uses TypeScript with strict mode
- Dark theme UI with gray-950 backgrounds

## Learned Patterns
- Always use absolute file paths
- Never create documentation unless asked
- Prefer editing existing files over creating new ones
`

export default function MemoryConfigPage() {
  const [selectedAgent, setSelectedAgent] = useState(mockAgents[0].id)
  const [memoryEnabled, setMemoryEnabled] = useState<Record<string, boolean>>({
    '1': true, '2': true, '3': false,
  })
  const [memoryContent, setMemoryContent] = useState(defaultMemoryMd)
  const [flushDays, setFlushDays] = useState(7)
  const [compactEnabled, setCompactEnabled] = useState(true)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleFlush = () => {
    alert('Daily logs older than ' + flushDays + ' days will be compacted into MEMORY.md')
  }

  return (
    <div className="min-h-screen bg-forge-950 text-forge-100 p-8">
      <h1 className="text-3xl font-bold mb-2">Memory System Configuration</h1>
      <p className="text-forge-300 mb-8">Manage agent memory storage and compaction</p>

      <div className="flex items-center gap-6 mb-8">
        <div>
          <label className="block text-xs text-forge-400 uppercase mb-1">Agent</label>
          <select
            value={selectedAgent}
            onChange={e => setSelectedAgent(e.target.value)}
            className="bg-forge-850 border border-forge-700 rounded px-3 py-2 text-sm"
          >
            {mockAgents.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm text-forge-300">Memory Enabled</label>
          <button
            onClick={() => setMemoryEnabled(prev => ({ ...prev, [selectedAgent]: !prev[selectedAgent] }))}
            className={`w-12 h-6 rounded-full transition-colors relative ${memoryEnabled[selectedAgent] ? 'bg-accent-500' : 'bg-forge-700'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-forge-50 rounded-full transition-transform ${memoryEnabled[selectedAgent] ? 'left-6' : 'left-0.5'}`} />
          </button>
        </div>
      </div>

      {memoryEnabled[selectedAgent] && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-forge-900 border border-forge-800 rounded p-6">
              <h2 className="text-lg font-semibold mb-4">Daily Logs</h2>
              <p className="text-forge-300 text-sm mb-4">Automatic daily session logs stored as YYYY-MM-DD.md</p>
              <div className="space-y-2">
                {mockDailyLogs.map(log => (
                  <div key={log.date} className="flex items-center justify-between bg-forge-850 rounded px-4 py-2 text-sm">
                    <span className="font-mono">{log.date}.md</span>
                    <div className="flex gap-4 text-forge-400">
                      <span>{log.entries} entries</span>
                      <span>{log.size}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-forge-900 border border-forge-800 rounded p-6">
              <h2 className="text-lg font-semibold mb-4">Flush / Compaction</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-forge-400 uppercase mb-1">Compact logs older than (days)</label>
                  <input
                    type="number"
                    value={flushDays}
                    onChange={e => setFlushDays(Number(e.target.value))}
                    min={1}
                    className="bg-forge-850 border border-forge-700 rounded px-3 py-2 text-sm w-24"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm text-forge-300">Auto-compact</label>
                  <button
                    onClick={() => setCompactEnabled(!compactEnabled)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${compactEnabled ? 'bg-accent-500' : 'bg-forge-700'}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-forge-50 rounded-full transition-transform ${compactEnabled ? 'left-6' : 'left-0.5'}`} />
                  </button>
                </div>
                <button
                  onClick={handleFlush}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded text-sm font-medium transition-colors"
                >
                  Flush Now
                </button>
              </div>
            </div>
          </div>

          <div className="bg-forge-900 border border-forge-800 rounded p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">MEMORY.md</h2>
              <span className="text-xs text-forge-400">Curated long-term memory</span>
            </div>
            <textarea
              value={memoryContent}
              onChange={e => setMemoryContent(e.target.value)}
              className="w-full h-80 bg-forge-850 border border-forge-700 rounded p-4 text-sm font-mono resize-none"
            />
            <button
              onClick={handleSave}
              className={`mt-4 px-4 py-2 rounded text-sm font-medium transition-colors ${
                saved ? 'bg-accent-500' : 'bg-accent-500 hover:bg-accent-400'
              }`}
            >
              {saved ? 'Saved' : 'Save MEMORY.md'}
            </button>
          </div>
        </div>
      )}

      {!memoryEnabled[selectedAgent] && (
        <div className="bg-forge-900 border border-forge-800 rounded p-12 text-center text-forge-400">
          Memory is disabled for this agent. Enable it to configure storage and compaction settings.
        </div>
      )}
    </div>
  )
}
