'use client'

import { useState, useMemo } from 'react'

type Category = 'productivity' | 'development' | 'creative' | 'support'

interface LibraryAgent {
  id: string
  name: string
  category: Category
  description: string
  model: string
  tags: string[]
}

const libraryAgents: LibraryAgent[] = [
  { id: 'la-1', name: 'Code Reviewer', category: 'development', description: 'Reviews pull requests, checks for bugs, style issues, and security vulnerabilities.', model: 'claude-sonnet-4-20250514', tags: ['code-review', 'security', 'linting'] },
  { id: 'la-2', name: 'Meeting Summarizer', category: 'productivity', description: 'Processes meeting transcripts and produces structured summaries with action items.', model: 'gpt-4o', tags: ['summarization', 'notes', 'action-items'] },
  { id: 'la-3', name: 'Blog Writer', category: 'creative', description: 'Generates long-form blog posts from outlines with SEO optimization.', model: 'claude-sonnet-4-20250514', tags: ['writing', 'seo', 'content'] },
  { id: 'la-4', name: 'Customer Support Bot', category: 'support', description: 'Handles tier-1 customer inquiries using knowledge base lookups.', model: 'gpt-4o-mini', tags: ['customer-service', 'knowledge-base', 'tickets'] },
  { id: 'la-5', name: 'Test Generator', category: 'development', description: 'Generates unit and integration tests for provided source code.', model: 'claude-sonnet-4-20250514', tags: ['testing', 'automation', 'coverage'] },
  { id: 'la-6', name: 'Email Drafter', category: 'productivity', description: 'Drafts professional emails from bullet points and context.', model: 'gpt-4o-mini', tags: ['email', 'communication', 'drafting'] },
  { id: 'la-7', name: 'Image Prompt Crafter', category: 'creative', description: 'Generates detailed prompts for image generation models from brief descriptions.', model: 'claude-haiku', tags: ['prompting', 'image-gen', 'creative'] },
  { id: 'la-8', name: 'Ticket Triager', category: 'support', description: 'Classifies and prioritizes incoming support tickets automatically.', model: 'gpt-4o-mini', tags: ['triage', 'classification', 'priority'] },
  { id: 'la-9', name: 'Data Pipeline Monitor', category: 'development', description: 'Monitors data pipeline health and alerts on anomalies.', model: 'claude-haiku', tags: ['monitoring', 'alerting', 'data'] },
  { id: 'la-10', name: 'Social Media Manager', category: 'creative', description: 'Schedules and drafts social media posts across platforms.', model: 'gpt-4o', tags: ['social-media', 'scheduling', 'content'] },
]

const categories: Category[] = ['productivity', 'development', 'creative', 'support']

const categoryColors: Record<Category, string> = {
  productivity: 'bg-blue-100 text-blue-700',
  development: 'bg-indigo-100 text-indigo-700',
  creative: 'bg-pink-100 text-pink-700',
  support: 'bg-green-100 text-green-700',
}

export default function LibraryPage() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [cloned, setCloned] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    return libraryAgents.filter(a => {
      if (selectedCategory && a.category !== selectedCategory) return false
      if (search) {
        const q = search.toLowerCase()
        return a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.tags.some(t => t.includes(q))
      }
      return true
    })
  }, [search, selectedCategory])

  const handleClone = (id: string) => {
    setCloned(prev => new Set(prev).add(id))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Agent <span className="text-blue-600">Library</span>
        </h1>
        <p className="text-lg text-gray-600">
          Browse {libraryAgents.length} pre-built agent definitions ready to clone
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <input
          type="text"
          placeholder="Search agents by name, description, or tag..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 mb-4"
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              selectedCategory === null ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition ${
                selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <p className="text-gray-500 text-lg">No agents match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(agent => (
            <div key={agent.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition border border-gray-100 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-lg">{agent.name}</h3>
                <span className={`px-2 py-0.5 rounded-md text-xs font-semibold capitalize ${categoryColors[agent.category]}`}>
                  {agent.category}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-3 flex-1">{agent.description}</p>
              <div className="text-sm text-gray-500 mb-3">
                Model: <span className="font-medium text-gray-700">{agent.model}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {agent.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                    {tag}
                  </span>
                ))}
              </div>
              <button
                onClick={() => handleClone(agent.id)}
                disabled={cloned.has(agent.id)}
                className={`w-full py-2 rounded-lg text-sm font-medium transition ${
                  cloned.has(agent.id)
                    ? 'bg-green-100 text-green-700 cursor-default'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {cloned.has(agent.id) ? 'Cloned' : 'Clone Agent'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
