'use client'

import { useState, useMemo } from 'react'
import { models, providers, getProviderById, type Capability, type CostTier } from '@/data/model-catalog'

const allCapabilities: Capability[] = ['coding', 'reasoning', 'fast', 'cheap', 'creative', 'vision', 'long-context']

const costTierColors: Record<CostTier, string> = {
  free: 'bg-accent-500/10 text-accent-600',
  cheap: 'bg-accent-500/10 text-accent-600',
  moderate: 'bg-amber-500/10 text-amber-600',
  expensive: 'bg-amber-500/10 text-amber-600',
  premium: 'bg-red-500/50/10 text-red-500',
}

const capabilityColors: Record<Capability, string> = {
  coding: 'bg-forge-200 text-forge-600',
  reasoning: 'bg-forge-200 text-forge-600',
  fast: 'bg-accent-500/10 text-accent-600',
  cheap: 'bg-teal-500/10 text-teal-500',
  creative: 'bg-red-500/50/10 text-red-500',
  vision: 'bg-teal-500/10 text-teal-500',
  'long-context': 'bg-amber-500/10 text-amber-600',
}

function formatContextWindow(tokens: number): string {
  if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(0)}M`
  return `${(tokens / 1000).toFixed(0)}K`
}

export default function ModelsPage() {
  const [search, setSearch] = useState('')
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [selectedCapabilities, setSelectedCapabilities] = useState<Capability[]>([])
  const [selectedCostTiers, setSelectedCostTiers] = useState<CostTier[]>([])

  const filteredModels = useMemo(() => {
    return models.filter(model => {
      if (search && !model.name.toLowerCase().includes(search.toLowerCase()) &&
          !getProviderById(model.providerId)?.name.toLowerCase().includes(search.toLowerCase())) {
        return false
      }
      if (selectedProvider && model.providerId !== selectedProvider) return false
      if (selectedCapabilities.length > 0 && !selectedCapabilities.some(c => model.capabilities.includes(c))) return false
      if (selectedCostTiers.length > 0 && !selectedCostTiers.includes(model.costTier)) return false
      return true
    })
  }, [search, selectedProvider, selectedCapabilities, selectedCostTiers])

  const groupedModels = useMemo(() => {
    const groups: Record<string, typeof models> = {}
    for (const model of filteredModels) {
      if (!groups[model.providerId]) groups[model.providerId] = []
      groups[model.providerId].push(model)
    }
    return groups
  }, [filteredModels])

  const toggleCapability = (cap: Capability) => {
    setSelectedCapabilities(prev =>
      prev.includes(cap) ? prev.filter(c => c !== cap) : [...prev, cap]
    )
  }

  const toggleCostTier = (tier: CostTier) => {
    setSelectedCostTiers(prev =>
      prev.includes(tier) ? prev.filter(t => t !== tier) : [...prev, tier]
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-forge-800 mb-2">
          Model <span className="text-accent-600">Catalog</span>
        </h1>
        <p className="text-lg text-forge-500">
          Browse {models.length} models across {providers.length} providers
        </p>
      </div>

      <div className="bg-forge-50 rounded-md  p-6 mb-8">
        <input
          type="text"
          placeholder="Search models or providers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-3 border border-forge-200 rounded focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none text-forge-800 mb-6"
        />

        <div className="mb-4">
          <h3 className="text-sm font-semibold text-forge-400 uppercase tracking-wider mb-2">Providers</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedProvider(null)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                selectedProvider === null
                  ? 'bg-accent-500 text-forge-950'
                  : 'bg-forge-200 text-forge-600 hover:bg-forge-200'
              }`}
            >
              All
            </button>
            {providers.map(provider => (
              <button
                key={provider.id}
                onClick={() => setSelectedProvider(selectedProvider === provider.id ? null : provider.id)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                  selectedProvider === provider.id
                    ? 'bg-accent-500 text-forge-950'
                    : 'bg-forge-200 text-forge-600 hover:bg-forge-200'
                }`}
              >
                {provider.name}
                {provider.isLocal && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-accent-500/10 text-accent-600 text-xs rounded-md font-medium">
                    Local
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-semibold text-forge-400 uppercase tracking-wider mb-2">Capabilities</h3>
          <div className="flex flex-wrap gap-2">
            {allCapabilities.map(cap => (
              <button
                key={cap}
                onClick={() => toggleCapability(cap)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                  selectedCapabilities.includes(cap)
                    ? 'bg-accent-500 text-forge-950'
                    : 'bg-forge-200 text-forge-600 hover:bg-forge-200'
                }`}
              >
                {cap}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-forge-400 uppercase tracking-wider mb-2">Cost Tier</h3>
          <div className="flex flex-wrap gap-2">
            {(['free', 'cheap', 'moderate', 'expensive', 'premium'] as CostTier[]).map(tier => (
              <button
                key={tier}
                onClick={() => toggleCostTier(tier)}
                className={`px-3 py-1.5 rounded text-sm font-medium capitalize transition ${
                  selectedCostTiers.includes(tier)
                    ? 'bg-accent-500 text-forge-950'
                    : `${costTierColors[tier]} hover:opacity-80`
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredModels.length === 0 ? (
        <div className="bg-forge-50 rounded-md  p-12 text-center">
          <p className="text-forge-400 text-lg">No models match your filters.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {providers
            .filter(p => groupedModels[p.id])
            .map(provider => (
              <div key={provider.id}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-2xl font-bold text-forge-700">{provider.name}</h2>
                  {provider.isLocal && (
                    <span className="px-2.5 py-1 bg-accent-500/10 text-accent-600 text-sm rounded font-medium">
                      Local
                    </span>
                  )}
                  <span className={`px-2.5 py-1 text-sm rounded font-medium ${
                    provider.requiresApiKey
                      ? 'bg-forge-200 text-forge-400'
                      : 'bg-accent-500/10 text-accent-600'
                  }`}>
                    {provider.requiresApiKey ? 'API Key Required' : 'No API Key Needed'}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedModels[provider.id].map(model => (
                    <div
                      key={model.id}
                      className="bg-forge-50 rounded-md  p-5 hover: transition border border-forge-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-forge-800 text-lg">{model.name}</h3>
                        <span className={`px-2 py-0.5 rounded-md text-xs font-semibold capitalize ${costTierColors[model.costTier]}`}>
                          {model.costTier}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {model.capabilities.map(cap => (
                          <span
                            key={cap}
                            className={`px-2 py-0.5 rounded-md text-xs font-medium ${capabilityColors[cap]}`}
                          >
                            {cap}
                          </span>
                        ))}
                      </div>
                      <div className="text-sm text-forge-400">
                        Context: <span className="font-medium text-forge-600">{formatContextWindow(model.contextWindow)} tokens</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
