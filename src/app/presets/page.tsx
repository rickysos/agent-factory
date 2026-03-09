'use client'

import { useState } from 'react'

interface Preset {
  id: string
  name: string
  agentName: string
  description: string
  model: string
  skills: string[]
  tools: string[]
  markdownFiles: string[]
}

const presets: Preset[] = [
  {
    id: 'coding',
    name: 'Coding Assistant',
    agentName: 'DevBot 9000',
    description: 'Full-stack development assistant with code generation, review, and debugging capabilities. Preconfigured with Git, shell, and file operation tools.',
    model: 'claude-sonnet-4-20250514',
    skills: ['Code Generation', 'Code Review', 'Debugging', 'Refactoring', 'Testing'],
    tools: ['Read', 'Write', 'Edit', 'Bash', 'Grep', 'Glob', 'Git'],
    markdownFiles: ['CLAUDE.md', 'SKILLS.md'],
  },
  {
    id: 'office',
    name: 'Office Assistant',
    agentName: 'Alfred',
    description: 'Handles scheduling, email drafting, document summarization, and general office productivity tasks.',
    model: 'claude-sonnet-4-20250514',
    skills: ['Email Drafting', 'Scheduling', 'Summarization', 'Data Entry'],
    tools: ['Read', 'Write', 'WebFetch'],
    markdownFiles: ['CLAUDE.md', 'SKILLS.md', 'TEMPLATES.md'],
  },
  {
    id: 'travel',
    name: 'Travel Planner',
    agentName: 'Atlas',
    description: 'Plans itineraries, compares flights and hotels, manages travel documents, and provides destination research.',
    model: 'claude-haiku-4-20250514',
    skills: ['Itinerary Planning', 'Price Comparison', 'Destination Research'],
    tools: ['Read', 'Write', 'WebFetch', 'WebSearch'],
    markdownFiles: ['CLAUDE.md', 'SKILLS.md'],
  },
]

export default function PresetsPage() {
  const [applied, setApplied] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  const applyPreset = (id: string) => {
    setApplied(id)
    setTimeout(() => setApplied(null), 2000)
  }

  return (
    <div className="min-h-screen bg-forge-950 text-forge-100 p-8">
      <h1 className="text-3xl font-bold mb-2">Agent Type Presets</h1>
      <p className="text-forge-300 mb-8">Quick-start templates to create preconfigured agents</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {presets.map(preset => (
          <div key={preset.id} className="bg-forge-900 border border-forge-800 rounded p-6 flex flex-col">
            <div className="mb-1 text-sm text-forge-400 uppercase tracking-wide">{preset.name}</div>
            <h2 className="text-xl font-bold mb-2">{preset.agentName}</h2>
            <p className="text-forge-300 text-sm mb-4 flex-1">{preset.description}</p>

            <div className="flex gap-4 text-sm text-forge-300 mb-4">
              <span>{preset.skills.length} skills</span>
              <span>{preset.tools.length} tools</span>
            </div>

            <div className="text-xs text-forge-400 mb-4 font-mono">Model: {preset.model}</div>

            <button
              onClick={() => setExpanded(expanded === preset.id ? null : preset.id)}
              className="text-sm text-accent-400 hover:text-accent-400 mb-3 text-left"
            >
              {expanded === preset.id ? 'Hide details' : 'Show what gets configured'}
            </button>

            {expanded === preset.id && (
              <div className="bg-forge-850 rounded p-4 mb-4 text-sm space-y-3">
                <div>
                  <p className="text-forge-400 text-xs uppercase mb-1">Model</p>
                  <p className="font-mono text-forge-300">{preset.model}</p>
                </div>
                <div>
                  <p className="text-forge-400 text-xs uppercase mb-1">Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {preset.skills.map(s => (
                      <span key={s} className="px-2 py-0.5 bg-forge-700 rounded text-forge-300 text-xs">{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-forge-400 text-xs uppercase mb-1">Tools</p>
                  <div className="flex flex-wrap gap-1">
                    {preset.tools.map(t => (
                      <span key={t} className="px-2 py-0.5 bg-forge-700 rounded text-forge-300 text-xs">{t}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-forge-400 text-xs uppercase mb-1">Markdown Files</p>
                  <div className="flex flex-wrap gap-1">
                    {preset.markdownFiles.map(f => (
                      <span key={f} className="px-2 py-0.5 bg-forge-700 rounded text-forge-300 text-xs font-mono">{f}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => applyPreset(preset.id)}
              className={`w-full py-2 rounded font-medium text-sm transition-colors ${
                applied === preset.id
                  ? 'bg-accent-500 text-forge-950'
                  : 'bg-accent-500 hover:bg-accent-400 text-forge-950'
              }`}
            >
              {applied === preset.id ? 'Agent Created' : 'Apply Preset'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
