'use client'

import { useState, useMemo } from 'react'
import { models, providers, getProviderById, type Capability, type CostTier } from '@/data/model-catalog'

const allCapabilities: Capability[] = ['coding', 'reasoning', 'fast', 'cheap', 'creative', 'vision', 'long-context']

const costTierColors: Record<CostTier, string> = {
  free: 'bg-green-100 text-green-800',
  cheap: 'bg-blue-100 text-blue-800',
  moderate: 'bg-yellow-100 text-yellow-800',
  expensive: 'bg-orange-100 text-orange-800',
  premium: 'bg-red-100 text-red-800',
}

const capabilityColors: Record<Capability, string> = {
  coding: 'bg-indigo-100 text-indigo-700',
  reasoning: 'bg-purple-100 text-purple-700',
  fast: 'bg-emerald-100 text-emerald-700',
  cheap: 'bg-teal-100 text-teal-700',
  creative: 'bg-pink-100 text-pink-700',
  vision: 'bg-sky-100 text-sky-700',
  'long-context': 'bg-amber-100 text-amber-700',
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
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Model <span className="text-blue-600">Catalog</span>
        </h1>
        <p className="text-lg text-gray-600">
          Browse {models.length} models across {providers.length} providers
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <input
          type="text"
          placeholder="Search models or providers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 mb-6"
        />

        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Providers</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedProvider(null)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                selectedProvider === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {providers.map(provider => (
              <button
                key={provider.id}
                onClick={() => setSelectedProvider(selectedProvider === provider.id ? null : provider.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  selectedProvider === provider.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {provider.name}
                {provider.isLocal && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-md font-medium">
                    Local
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Capabilities</h3>
          <div className="flex flex-wrap gap-2">
            {allCapabilities.map(cap => (
              <button
                key={cap}
                onClick={() => toggleCapability(cap)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  selectedCapabilities.includes(cap)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cap}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Cost Tier</h3>
          <div className="flex flex-wrap gap-2">
            {(['free', 'cheap', 'moderate', 'expensive', 'premium'] as CostTier[]).map(tier => (
              <button
                key={tier}
                onClick={() => toggleCostTier(tier)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition ${
                  selectedCostTiers.includes(tier)
                    ? 'bg-blue-600 text-white'
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
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <p className="text-gray-500 text-lg">No models match your filters.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {providers
            .filter(p => groupedModels[p.id])
            .map(provider => (
              <div key={provider.id}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">{provider.name}</h2>
                  {provider.isLocal && (
                    <span className="px-2.5 py-1 bg-green-100 text-green-700 text-sm rounded-lg font-medium">
                      Local
                    </span>
                  )}
                  <span className={`px-2.5 py-1 text-sm rounded-lg font-medium ${
                    provider.requiresApiKey
                      ? 'bg-gray-100 text-gray-500'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {provider.requiresApiKey ? 'API Key Required' : 'No API Key Needed'}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedModels[provider.id].map(model => (
                    <div
                      key={model.id}
                      className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition border border-gray-100"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-900 text-lg">{model.name}</h3>
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
                      <div className="text-sm text-gray-500">
                        Context: <span className="font-medium text-gray-700">{formatContextWindow(model.contextWindow)} tokens</span>
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
