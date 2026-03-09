'use client'

import { useEffect, useState } from 'react'

interface ProviderModel {
  id: string
  name: string
  free: boolean
  capabilities: string[]
}

interface ProviderInfo {
  id: string
  name: string
  configured: boolean
  envVar: string
  models: ProviderModel[]
}

export default function ProvidersSettingsPage() {
  const [providers, setProviders] = useState<ProviderInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/providers')
      .then(res => res.json())
      .then(data => setProviders(data.providers))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-forge-200 rounded w-64" />
          <div className="h-4 bg-forge-200 rounded w-96" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-forge-200 rounded-md" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-forge-800">
          AI <span className="text-accent-600">Providers</span>
        </h1>
        <p className="text-forge-400 mt-1">View configured providers and available models.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {providers.map(provider => (
          <div
            key={provider.id}
            className="bg-forge-50 rounded-md border border-forge-200  overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-forge-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-forge-800">{provider.name}</h3>
                {provider.configured ? (
                  <span className="flex items-center gap-1.5 text-sm font-medium text-accent-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Configured
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-sm font-medium text-red-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Not Configured
                  </span>
                )}
              </div>
              {!provider.configured && (
                <p className="text-xs text-forge-300 mt-2">
                  Set <code className="bg-forge-200 px-1.5 py-0.5 rounded text-forge-500">{provider.envVar}</code> in .env.local
                </p>
              )}
            </div>

            <div className="px-6 py-4">
              <h4 className="text-xs font-medium text-forge-400 uppercase tracking-wide mb-3">Models</h4>
              <ul className="space-y-2">
                {provider.models.map(model => (
                  <li key={model.id} className="flex items-center justify-between">
                    <span className="text-sm text-forge-600">{model.name}</span>
                    {model.free && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-accent-500/10 text-accent-600">
                        Free
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {provider.models.some(m => m.capabilities.length > 0) && (
              <div className="px-6 py-3 bg-forge-100 border-t border-forge-200">
                <div className="flex flex-wrap gap-1.5">
                  {[...new Set(provider.models.flatMap(m => m.capabilities))].map(cap => (
                    <span
                      key={cap}
                      className="px-2 py-0.5 text-xs rounded-full bg-accent-500/10 text-accent-600 font-medium"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
