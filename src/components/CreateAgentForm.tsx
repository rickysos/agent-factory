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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Agent Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., Customer Support Bot"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Describe what this agent does..."
          required
        />
      </div>

      <div>
        <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          AI Model
        </label>
        <select
          id="model"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {models.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Capabilities
        </label>
        <div className="grid grid-cols-2 gap-2">
          {capabilityOptions.map((capability) => (
            <label
              key={capability}
              className={`flex items-center p-2 border rounded-lg cursor-pointer transition ${
                selectedCapabilities.includes(capability)
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 dark:border-blue-600'
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedCapabilities.includes(capability)}
                onChange={() => toggleCapability(capability)}
                className="mr-2"
              />
              <span className="text-sm text-gray-900 dark:text-gray-100">{capability}</span>
            </label>
          ))}
        </div>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Selected: {selectedCapabilities.length} capability{selectedCapabilities.length !== 1 ? 'ies' : ''}
        </p>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting || !name || !description}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating...
            </span>
          ) : (
            'Create Agent'
          )}
        </button>
      </div>
    </form>
  )
}
