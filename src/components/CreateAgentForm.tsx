'use client'

import { useState } from 'react'
import { useAgents } from '@/lib/agent-context'

const models = [
  'gpt-4',
  'gpt-3.5-turbo',
  'claude-3-opus',
  'claude-3-sonnet',
  'claude-3-haiku',
  'gemini-pro',
  'llama-3-70b',
  'mixtral-8x7b',
  'deepseek-coder',
  'custom',
]

const capabilityOptions = [
  'Q&A',
  'Content Generation',
  'Code Review',
  'Data Analysis',
  'Customer Support',
  'Translation',
  'Summarization',
  'Research',
  'Creative Writing',
  'Technical Writing',
  'Social Media',
  'SEO Optimization',
  'Security Analysis',
  'Bug Detection',
  'Performance Review',
]

export function CreateAgentForm() {
  const { addAgent } = useAgents()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedModel, setSelectedModel] = useState(models[0])
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await addAgent({
        name,
        description,
        model: selectedModel,
        status: 'draft',
        capabilities: selectedCapabilities,
      })

      setName('')
      setDescription('')
      setSelectedModel(models[0])
      setSelectedCapabilities([])

      alert('Agent created successfully!')
    } catch (error) {
      console.error('Error creating agent:', error)
      alert('Failed to create agent. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleCapability = (capability: string) => {
    setSelectedCapabilities(prev =>
      prev.includes(capability)
        ? prev.filter(c => c !== capability)
        : [...prev, capability]
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className="block text-[10px] font-mono uppercase tracking-wider text-forge-400 dark:text-forge-500 mb-1.5">
          Agent Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 text-sm font-mono bg-forge-50 dark:bg-forge-900 border border-forge-200 dark:border-forge-700 rounded text-forge-800 dark:text-forge-100 placeholder:text-forge-300 dark:placeholder:text-forge-600 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500/20 transition-colors"
          placeholder="e.g., Support Bot"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-[10px] font-mono uppercase tracking-wider text-forge-400 dark:text-forge-500 mb-1.5">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 text-sm font-mono bg-forge-50 dark:bg-forge-900 border border-forge-200 dark:border-forge-700 rounded text-forge-800 dark:text-forge-100 placeholder:text-forge-300 dark:placeholder:text-forge-600 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500/20 transition-colors resize-none"
          placeholder="What does this agent do..."
          required
        />
      </div>

      <div>
        <label htmlFor="model" className="block text-[10px] font-mono uppercase tracking-wider text-forge-400 dark:text-forge-500 mb-1.5">
          Model
        </label>
        <select
          id="model"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="w-full px-3 py-2 text-sm font-mono bg-forge-50 dark:bg-forge-900 border border-forge-200 dark:border-forge-700 rounded text-forge-800 dark:text-forge-100 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500/20 transition-colors"
        >
          {models.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[10px] font-mono uppercase tracking-wider text-forge-400 dark:text-forge-500 mb-1.5">
          Capabilities
        </label>
        <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto">
          {capabilityOptions.map((capability) => (
            <button
              key={capability}
              type="button"
              onClick={() => toggleCapability(capability)}
              className={`text-left px-2.5 py-1.5 text-xs font-mono rounded border transition-colors ${
                selectedCapabilities.includes(capability)
                  ? 'bg-accent-500/10 border-accent-500/30 text-accent-600 dark:text-accent-400'
                  : 'bg-forge-50 dark:bg-forge-900 border-forge-200 dark:border-forge-700 text-forge-500 dark:text-forge-400 hover:border-forge-300 dark:hover:border-forge-600'
              }`}
            >
              {capability}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-[10px] font-mono text-forge-400 dark:text-forge-500 uppercase tracking-wider">
          {selectedCapabilities.length} selected
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !name || !description}
        className="w-full py-2.5 text-xs font-mono font-medium uppercase tracking-wider bg-accent-500 text-forge-950 rounded hover:bg-accent-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'Forging...' : 'Forge Agent'}
      </button>
    </form>
  )
}
