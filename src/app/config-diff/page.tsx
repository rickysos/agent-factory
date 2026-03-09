'use client'

import { useState } from 'react'

interface ConfigField {
  key: string
  before: string
  after: string
  changed: boolean
}

const mockDiff: ConfigField[] = [
  { key: 'name', before: 'DevBot 9000', after: 'DevBot 9000', changed: false },
  { key: 'model', before: 'claude-sonnet-4-20250514', after: 'claude-opus-4-20250514', changed: true },
  { key: 'description', before: 'Full-stack development assistant', after: 'Full-stack development assistant', changed: false },
  { key: 'status', before: 'active', after: 'active', changed: false },
  { key: 'maxConcurrentTasks', before: '3', after: '3', changed: false },
  { key: 'skills', before: '["Code Generation", "Code Review", "Debugging"]', after: '["Code Generation", "Code Review", "Debugging", "Performance Optimization"]', changed: true },
  { key: 'tools.Bash', before: 'true', after: 'true', changed: false },
  { key: 'tools.WebSearch', before: 'false', after: 'true', changed: true },
  { key: 'thinking', before: 'adaptive', after: 'high', changed: true },
]

export default function ConfigDiffPage() {
  const [diff] = useState<ConfigField[]>(mockDiff)
  const [deployed, setDeployed] = useState(false)

  const hasChanges = diff.some(f => f.changed)
  const changedCount = diff.filter(f => f.changed).length

  const handleDeploy = () => {
    setDeployed(true)
    setTimeout(() => setDeployed(false), 3000)
  }

  return (
    <div className="min-h-screen bg-forge-950 text-forge-100 p-8">
      <h1 className="text-3xl font-bold mb-2">Config Change Detection</h1>
      <p className="text-forge-300 mb-8">Review configuration changes before deploying</p>

      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-forge-300">
          {changedCount} field{changedCount !== 1 ? 's' : ''} changed
        </div>
        <button
          onClick={handleDeploy}
          disabled={!hasChanges || deployed}
          className={`px-6 py-2 rounded font-medium text-sm transition-colors ${
            deployed ? 'bg-accent-500 text-forge-950' :
            hasChanges ? 'bg-accent-500 hover:bg-accent-400 text-forge-950' :
            'bg-forge-850 text-forge-500 cursor-not-allowed'
          }`}
        >
          {deployed ? 'Changes Deployed' : 'Deploy Changes'}
        </button>
      </div>

      <div className="bg-forge-900 border border-forge-800 rounded overflow-hidden">
        <div className="grid grid-cols-[200px_1fr_1fr] text-xs text-forge-400 uppercase tracking-wide px-6 py-3 border-b border-forge-800">
          <div>Field</div>
          <div>Before</div>
          <div>After</div>
        </div>

        {diff.map(field => (
          <div
            key={field.key}
            className={`grid grid-cols-[200px_1fr_1fr] px-6 py-3 border-b border-forge-800 text-sm ${
              field.changed ? 'bg-amber-500/10' : ''
            }`}
          >
            <div className="font-mono font-medium flex items-center gap-2">
              {field.key}
              {field.changed && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
            </div>
            <div className={`font-mono ${field.changed ? 'text-red-400 line-through' : 'text-forge-300'}`}>
              {field.before}
            </div>
            <div className={`font-mono ${field.changed ? 'text-accent-400' : 'text-forge-300'}`}>
              {field.after}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-forge-900 border border-forge-800 rounded p-6">
        <h2 className="text-lg font-semibold mb-3">Change Summary</h2>
        <ul className="space-y-2 text-sm">
          {diff.filter(f => f.changed).map(field => (
            <li key={field.key} className="flex items-start gap-2">
              <span className="text-amber-400 mt-0.5">*</span>
              <span>
                <span className="font-mono text-forge-300">{field.key}</span>
                <span className="text-forge-400"> changed from </span>
                <span className="font-mono text-red-400">{field.before}</span>
                <span className="text-forge-400"> to </span>
                <span className="font-mono text-accent-400">{field.after}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
