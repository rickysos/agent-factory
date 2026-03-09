'use client'

import { useState, useMemo, useCallback } from 'react'
import type { MarketplaceListing } from '@/lib/marketplace-store'

const categories = ['all', 'productivity', 'development', 'marketing', 'support', 'data', 'devops'] as const
const types = ['all', 'agent', 'workflow', 'skill'] as const

const categoryLabels: Record<string, string> = {
  all: 'All',
  productivity: 'Productivity',
  development: 'Development',
  marketing: 'Marketing',
  support: 'Support',
  data: 'Data',
  devops: 'DevOps',
}

const typeColors: Record<string, string> = {
  agent: 'bg-accent-500/10 text-accent-600 dark:bg-accent-500/10 dark:text-accent-400',
  workflow: 'bg-forge-200 text-forge-600 dark:bg-forge-700 dark:text-forge-300',
  skill: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
}

const categoryColors: Record<string, string> = {
  productivity: 'bg-accent-500/10 text-accent-600 dark:bg-accent-500/10 dark:text-accent-400',
  development: 'bg-teal-500/10 text-teal-500 dark:bg-teal-500/10 dark:text-teal-400',
  marketing: 'bg-red-500/50/10 text-red-500 dark:bg-red-500/50/10 dark:text-red-400',
  support: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  data: 'bg-forge-200 text-forge-600 dark:bg-forge-700 dark:text-forge-300',
  devops: 'bg-red-500/50/10 text-red-500 dark:bg-red-500/50/10 dark:text-red-400',
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= Math.round(rating) ? 'text-amber-400' : 'text-forge-200 dark:text-forge-500'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-sm text-forge-400 dark:text-forge-500 ml-1">{rating}</span>
    </div>
  )
}

function ListingCard({ listing, installed, onInstall, installing, featured }: {
  listing: MarketplaceListing
  installed: boolean
  onInstall: () => void
  installing: boolean
  featured?: boolean
}) {
  return (
    <div className={`bg-forge-50 dark:bg-forge-900 rounded-md border border-forge-200 dark:border-forge-700 p-5 hover: dark:hover:shadow-gray-950/30 transition-all flex flex-col ${featured ? 'ring-2 ring-blue-400 dark:ring-accent-500' : ''}`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex gap-2">
          <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${typeColors[listing.type]}`}>
            {listing.type}
          </span>
          <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${categoryColors[listing.category] || 'bg-forge-200 text-forge-500'}`}>
            {categoryLabels[listing.category] || listing.category}
          </span>
        </div>
        {featured && (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
            Featured
          </span>
        )}
      </div>
      <h3 className="text-lg font-semibold text-forge-800 dark:text-forge-100">{listing.name}</h3>
      <p className="text-sm text-forge-400 dark:text-forge-500 mt-1 flex-1 line-clamp-2">{listing.description}</p>
      <div className="flex flex-wrap gap-1.5 mt-3">
        {listing.tags.slice(0, 3).map(tag => (
          <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-forge-200 dark:bg-forge-800 text-forge-400 dark:text-forge-500">
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-forge-300 dark:text-forge-400">by {listing.author}</p>
          <div className="flex items-center gap-3 mt-1">
            <StarRating rating={listing.rating} />
            <span className="text-xs text-forge-300 dark:text-forge-400">{listing.installs.toLocaleString()} installs</span>
          </div>
        </div>
        <button
          onClick={onInstall}
          disabled={installed || installing}
          className={`px-4 py-1.5 rounded text-sm font-medium transition ${
            installed
              ? 'bg-accent-500/10 text-accent-600 dark:bg-accent-500/10 dark:text-accent-400 cursor-default'
              : installing
                ? 'bg-forge-200 text-forge-300 dark:bg-forge-850 dark:text-forge-400 cursor-wait'
                : 'bg-accent-500 text-forge-950 hover:bg-accent-400 dark:bg-accent-500 dark:hover:bg-accent-400'
          }`}
        >
          {installed ? (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Installed
            </span>
          ) : installing ? (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              Installing...
            </span>
          ) : 'Install'}
        </button>
      </div>
    </div>
  )
}

export default function MarketplacePage() {
  const [listings, setListings] = useState<MarketplaceListing[]>([])
  const [loaded, setLoaded] = useState(false)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [activeType, setActiveType] = useState<string>('all')
  const [installed, setInstalled] = useState<Set<string>>(new Set())
  const [installing, setInstalling] = useState<Set<string>>(new Set())

  if (!loaded) {
    fetch('/api/marketplace')
      .then(r => r.json())
      .then(data => {
        setListings(data.data)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }

  const filtered = useMemo(() => {
    return listings.filter(l => {
      const matchesSearch = !search ||
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.description.toLowerCase().includes(search.toLowerCase()) ||
        l.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
      const matchesCategory = activeCategory === 'all' || l.category === activeCategory
      const matchesType = activeType === 'all' || l.type === activeType
      return matchesSearch && matchesCategory && matchesType
    })
  }, [listings, search, activeCategory, activeType])

  const featuredListings = useMemo(() => listings.filter(l => l.featured), [listings])

  const handleInstall = useCallback(async (id: string) => {
    setInstalling(prev => new Set(prev).add(id))
    try {
      const res = await fetch(`/api/marketplace/${id}/install`, { method: 'POST' })
      if (res.ok) {
        setInstalled(prev => new Set(prev).add(id))
      }
    } finally {
      setInstalling(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-forge-800 dark:text-forge-100 mb-3">
          Agent <span className="text-accent-600 dark:text-accent-400">Marketplace</span>
        </h1>
        <p className="text-lg text-forge-500 dark:text-forge-400 max-w-2xl mx-auto">
          Browse and install pre-built agents, workflows, and skills. Get started in seconds with production-ready templates.
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <input
          type="text"
          placeholder="Search marketplace..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80 px-4 py-2 rounded-md border border-forge-200 dark:border-forge-700 focus:outline-none focus:ring-2 focus:ring-accent-500 bg-forge-50 dark:bg-forge-850 dark:text-forge-950 "
        />
      </div>

      {/* Type tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {types.map(t => (
          <button
            key={t}
            onClick={() => setActiveType(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              activeType === t
                ? 'bg-accent-500 text-forge-950 dark:bg-accent-500'
                : 'bg-forge-50 dark:bg-forge-850 text-forge-500 dark:text-forge-300 hover:bg-forge-200 dark:hover:bg-forge-800 border border-forge-200 dark:border-forge-700'
            }`}
          >
            {t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1) + 's'}
          </button>
        ))}
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-10">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              activeCategory === cat
                ? 'bg-forge-900 text-forge-950 dark:bg-forge-50 dark:text-forge-800'
                : 'bg-forge-50 dark:bg-forge-850 text-forge-500 dark:text-forge-300 hover:bg-forge-200 dark:hover:bg-forge-800 border border-forge-200 dark:border-forge-700'
            }`}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* Featured section */}
      {activeCategory === 'all' && activeType === 'all' && !search && featuredListings.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-forge-800 dark:text-forge-100 mb-6">Featured</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredListings.map(listing => (
              <ListingCard
                key={listing.id}
                listing={listing}
                installed={installed.has(listing.id)}
                installing={installing.has(listing.id)}
                onInstall={() => handleInstall(listing.id)}
                featured
              />
            ))}
          </div>
        </div>
      )}

      {/* All listings */}
      <div>
        <h2 className="text-2xl font-bold text-forge-800 dark:text-forge-100 mb-6">
          {activeCategory === 'all' && activeType === 'all' && !search ? 'All Listings' : `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}
        </h2>

        {!loaded ? (
          <div className="text-center py-16">
            <svg className="w-8 h-8 animate-spin text-accent-500 mx-auto" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            <p className="text-forge-300 mt-3">Loading marketplace...</p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-forge-300 dark:text-forge-400 py-16">No listings match your filters.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(listing => (
              <ListingCard
                key={listing.id}
                listing={listing}
                installed={installed.has(listing.id)}
                installing={installing.has(listing.id)}
                onInstall={() => handleInstall(listing.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
