'use client'

import { useState, useMemo } from 'react'

const categories = ['DevOps', 'Content', 'Support', 'Research', 'Finance'] as const

const mockTemplates = [
  { id: '1', name: 'CI/CD Pipeline Agent', description: 'Automates build, test, and deploy pipelines with rollback support.', author: 'devops-labs', downloads: 12840, rating: 4.8, category: 'DevOps' },
  { id: '2', name: 'Infrastructure Monitor', description: 'Monitors cloud infrastructure health and auto-remediates common issues.', author: 'cloud-ops', downloads: 9210, rating: 4.6, category: 'DevOps' },
  { id: '3', name: 'Blog Writer Agent', description: 'Generates SEO-optimized blog posts from topic briefs and outlines.', author: 'contentforge', downloads: 18500, rating: 4.7, category: 'Content' },
  { id: '4', name: 'Social Media Scheduler', description: 'Creates and schedules posts across multiple platforms with analytics.', author: 'socialbotco', downloads: 15200, rating: 4.5, category: 'Content' },
  { id: '5', name: 'Ticket Triage Agent', description: 'Classifies, prioritizes, and routes support tickets automatically.', author: 'helpdesk-ai', downloads: 22100, rating: 4.9, category: 'Support' },
  { id: '6', name: 'Customer FAQ Bot', description: 'Answers common customer questions using your knowledge base.', author: 'supportly', downloads: 31000, rating: 4.4, category: 'Support' },
  { id: '7', name: 'Literature Review Agent', description: 'Searches, summarizes, and synthesizes academic papers on a topic.', author: 'scholar-ai', downloads: 8900, rating: 4.7, category: 'Research' },
  { id: '8', name: 'Data Analysis Agent', description: 'Performs statistical analysis and generates visualizations from datasets.', author: 'datacraft', downloads: 14300, rating: 4.6, category: 'Research' },
  { id: '9', name: 'Invoice Processor', description: 'Extracts data from invoices and reconciles with accounting systems.', author: 'fintech-ops', downloads: 7600, rating: 4.5, category: 'Finance' },
  { id: '10', name: 'Expense Report Agent', description: 'Validates expense reports against policy and flags anomalies.', author: 'complibot', downloads: 5400, rating: 4.3, category: 'Finance' },
  { id: '11', name: 'Kubernetes Scaler', description: 'Auto-scales k8s deployments based on custom metrics and predictions.', author: 'k8s-wizards', downloads: 11200, rating: 4.8, category: 'DevOps' },
  { id: '12', name: 'Competitive Intel Agent', description: 'Tracks competitor activity, pricing changes, and market positioning.', author: 'intel-ai', downloads: 6700, rating: 4.4, category: 'Research' },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= Math.round(rating) ? 'text-amber-400' : 'text-forge-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-sm text-forge-400 ml-1">{rating}</span>
    </div>
  )
}

export default function TemplateMarketplacePage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [installed, setInstalled] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    return mockTemplates.filter((t) => {
      const matchesSearch =
        !search ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = !activeCategory || t.category === activeCategory
      return matchesSearch && matchesCategory
    })
  }, [search, activeCategory])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-forge-800">
            Template <span className="text-accent-600">Marketplace</span>
          </h1>
          <p className="text-forge-400 mt-1">{mockTemplates.length} templates available</p>
        </div>
        <input
          type="text"
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72 px-4 py-2 rounded-md border border-forge-200 focus:outline-none focus:ring-2 focus:ring-accent-500 bg-forge-50 "
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
            activeCategory === null
              ? 'bg-accent-500 text-forge-950'
              : 'bg-forge-50 text-forge-500 hover:bg-forge-200 border border-forge-200'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              activeCategory === cat
                ? 'bg-accent-500 text-forge-950'
                : 'bg-forge-50 text-forge-500 hover:bg-forge-200 border border-forge-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-forge-300 py-12">No templates match your search.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((template) => (
          <div
            key={template.id}
            className="bg-forge-50 rounded-md border border-forge-200 p-5 hover: transition-all flex flex-col"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-forge-200 text-forge-500">
                {template.category}
              </span>
              <span className="text-xs text-forge-300">{template.downloads.toLocaleString()} downloads</span>
            </div>
            <h3 className="text-lg font-semibold text-forge-800">{template.name}</h3>
            <p className="text-sm text-forge-400 mt-1 flex-1">{template.description}</p>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-forge-300">by {template.author}</p>
                <StarRating rating={template.rating} />
              </div>
              <button
                onClick={() =>
                  setInstalled((prev) => {
                    const next = new Set(prev)
                    if (next.has(template.id)) next.delete(template.id)
                    else next.add(template.id)
                    return next
                  })
                }
                className={`px-4 py-1.5 rounded text-sm font-medium transition ${
                  installed.has(template.id)
                    ? 'bg-accent-500/10 text-accent-600'
                    : 'bg-accent-500 text-forge-950 hover:bg-accent-400'
                }`}
              >
                {installed.has(template.id) ? 'Installed' : 'Install'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
