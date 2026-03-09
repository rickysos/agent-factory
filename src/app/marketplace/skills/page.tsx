'use client'

import { useState, useMemo } from 'react'

const sidebarCategories = ['Productivity', 'Development', 'Communication', 'AI/ML'] as const

const mockSkills = [
  { id: '1', name: 'Web Scraper', description: 'Extract structured data from any webpage with CSS selectors or AI parsing.', category: 'Productivity', author: 'scrapekit', installs: 24500 },
  { id: '2', name: 'PDF Parser', description: 'Parse and extract text, tables, and metadata from PDF documents.', category: 'Productivity', author: 'doctools', installs: 18200 },
  { id: '3', name: 'Calendar Manager', description: 'Create, update, and query calendar events across providers.', category: 'Productivity', author: 'schedulebot', installs: 12800 },
  { id: '4', name: 'Code Reviewer', description: 'Analyze pull requests for bugs, style issues, and security vulnerabilities.', category: 'Development', author: 'codecheck', installs: 31400 },
  { id: '5', name: 'Test Generator', description: 'Generate unit and integration tests from source code automatically.', category: 'Development', author: 'testforge', installs: 19700 },
  { id: '6', name: 'Database Query', description: 'Execute read-only SQL queries against configured database connections.', category: 'Development', author: 'dbtools', installs: 15600 },
  { id: '7', name: 'Git Operations', description: 'Clone, branch, commit, and manage git repositories programmatically.', category: 'Development', author: 'gitbot', installs: 22100 },
  { id: '8', name: 'Slack Notifier', description: 'Send formatted messages, threads, and attachments to Slack channels.', category: 'Communication', author: 'slackops', installs: 28900 },
  { id: '9', name: 'Email Sender', description: 'Compose and send emails with templates, attachments, and tracking.', category: 'Communication', author: 'mailcraft', installs: 20300 },
  { id: '10', name: 'Webhook Caller', description: 'Make HTTP requests to external APIs with auth and retry logic.', category: 'Communication', author: 'hooksmith', installs: 16400 },
  { id: '11', name: 'Text Classifier', description: 'Classify text into custom categories using fine-tuned models.', category: 'AI/ML', author: 'classify-ai', installs: 14200 },
  { id: '12', name: 'Embedding Search', description: 'Semantic search over documents using vector embeddings.', category: 'AI/ML', author: 'vectra', installs: 21800 },
  { id: '13', name: 'Image Analyzer', description: 'Extract text, objects, and descriptions from images using vision models.', category: 'AI/ML', author: 'visionkit', installs: 17500 },
  { id: '14', name: 'Sentiment Analyzer', description: 'Detect sentiment, emotion, and tone in text content.', category: 'AI/ML', author: 'sentimentco', installs: 11900 },
]

export default function SkillMarketplacePage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [added, setAdded] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    return mockSkills.filter((s) => {
      const matchesSearch =
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = !activeCategory || s.category === activeCategory
      return matchesSearch && matchesCategory
    })
  }, [search, activeCategory])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-forge-800">
          Skill <span className="text-accent-600">Marketplace</span>
        </h1>
        <p className="text-forge-400 mt-1">{mockSkills.length} skills available</p>
      </div>

      <div className="flex gap-8">
        <aside className="hidden md:block w-48 flex-shrink-0">
          <h2 className="text-sm font-semibold text-forge-300 uppercase tracking-wider mb-3">Categories</h2>
          <nav className="space-y-1">
            <button
              onClick={() => setActiveCategory(null)}
              className={`block w-full text-left px-3 py-2 rounded text-sm font-medium transition ${
                activeCategory === null ? 'bg-accent-500/10 text-accent-600' : 'text-forge-500 hover:bg-forge-100'
              }`}
            >
              All Skills
            </button>
            {sidebarCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={`block w-full text-left px-3 py-2 rounded text-sm font-medium transition ${
                  activeCategory === cat ? 'bg-accent-500/10 text-accent-600' : 'text-forge-500 hover:bg-forge-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex-1 min-w-0">
          <input
            type="text"
            placeholder="Search skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-80 px-4 py-2 rounded-md border border-forge-200 focus:outline-none focus:ring-2 focus:ring-accent-500 bg-forge-50  mb-6"
          />

          <div className="flex flex-wrap gap-2 mb-6 md:hidden">
            {sidebarCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  activeCategory === cat
                    ? 'bg-accent-500 text-forge-950'
                    : 'bg-forge-50 text-forge-500 border border-forge-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-forge-300 py-12">No skills match your search.</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((skill) => (
              <div
                key={skill.id}
                className="bg-forge-50 rounded-md border border-forge-200 p-5 hover: transition-all flex flex-col"
              >
                <span className="inline-block self-start px-2 py-0.5 text-xs font-medium rounded-full bg-forge-200 text-forge-500 mb-2">
                  {skill.category}
                </span>
                <h3 className="text-lg font-semibold text-forge-800">{skill.name}</h3>
                <p className="text-sm text-forge-400 mt-1 flex-1">{skill.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-forge-300">by {skill.author}</p>
                    <p className="text-xs text-forge-300">{skill.installs.toLocaleString()} installs</p>
                  </div>
                  <button
                    onClick={() =>
                      setAdded((prev) => {
                        const next = new Set(prev)
                        if (next.has(skill.id)) next.delete(skill.id)
                        else next.add(skill.id)
                        return next
                      })
                    }
                    className={`px-4 py-1.5 rounded text-sm font-medium transition ${
                      added.has(skill.id)
                        ? 'bg-accent-500/10 text-accent-600'
                        : 'bg-accent-500 text-forge-950 hover:bg-accent-400'
                    }`}
                  >
                    {added.has(skill.id) ? 'Added' : 'Add to Agent'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
