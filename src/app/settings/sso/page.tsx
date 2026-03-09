'use client'

import { useState } from 'react'

type Provider = 'okta' | 'azure' | 'google'

const providers: { id: Provider; name: string; fields: string[] }[] = [
  { id: 'okta', name: 'Okta', fields: ['Client ID', 'Client Secret', 'Domain'] },
  { id: 'azure', name: 'Microsoft Entra', fields: ['Client ID', 'Client Secret', 'Tenant ID'] },
  { id: 'google', name: 'Google Workspace', fields: ['Client ID', 'Client Secret', 'Domain'] },
]

type SSOConfig = {
  provider: Provider
  values: Record<string, string>
  status: 'not_configured' | 'configured' | 'testing' | 'error'
}

export default function SSOPage() {
  const [selectedProvider, setSelectedProvider] = useState<Provider>('okta')
  const [configs, setConfigs] = useState<Record<Provider, SSOConfig>>({
    okta: { provider: 'okta', values: {}, status: 'not_configured' },
    azure: { provider: 'azure', values: {}, status: 'configured' },
    google: { provider: 'google', values: {}, status: 'not_configured' },
  })

  const provider = providers.find((p) => p.id === selectedProvider)!
  const config = configs[selectedProvider]

  function updateField(field: string, value: string) {
    setConfigs((prev) => ({
      ...prev,
      [selectedProvider]: {
        ...prev[selectedProvider],
        values: { ...prev[selectedProvider].values, [field]: value },
      },
    }))
  }

  function handleSave() {
    setConfigs((prev) => ({
      ...prev,
      [selectedProvider]: { ...prev[selectedProvider], status: 'configured' },
    }))
  }

  function handleTest() {
    setConfigs((prev) => ({
      ...prev,
      [selectedProvider]: { ...prev[selectedProvider], status: 'testing' },
    }))
    setTimeout(() => {
      setConfigs((prev) => ({
        ...prev,
        [selectedProvider]: { ...prev[selectedProvider], status: 'configured' },
      }))
    }, 1500)
  }

  const statusColors: Record<string, string> = {
    not_configured: 'bg-forge-200 text-forge-500',
    configured: 'bg-accent-500/10 text-accent-600',
    testing: 'bg-amber-500/10 text-amber-600',
    error: 'bg-red-500/50/10 text-red-500',
  }

  const statusLabels: Record<string, string> = {
    not_configured: 'Not Configured',
    configured: 'Configured',
    testing: 'Testing...',
    error: 'Error',
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-forge-800">
          SSO <span className="text-accent-600">Integration</span>
        </h1>
        <p className="text-forge-400 mt-1">Configure single sign-on for your organization.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {providers.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedProvider(p.id)}
            className={`p-4 rounded-md border-2 text-left transition ${
              selectedProvider === p.id
                ? 'border-accent-500 bg-accent-500/10'
                : 'border-forge-200 bg-forge-50 hover:border-forge-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-forge-800">{p.name}</h3>
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[configs[p.id].status]}`}
              >
                {statusLabels[configs[p.id].status]}
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-forge-50 rounded-md border border-forge-200 p-6">
        <h2 className="text-xl font-semibold text-forge-800 mb-6">{provider.name} Configuration</h2>

        <div className="space-y-4">
          {provider.fields.map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-forge-600 mb-1">{field}</label>
              <input
                type={field.toLowerCase().includes('secret') ? 'password' : 'text'}
                value={config.values[field] || ''}
                onChange={(e) => updateField(field, e.target.value)}
                placeholder={`Enter ${field.toLowerCase()}`}
                className="w-full px-4 py-2 rounded border border-forge-200 focus:outline-none focus:ring-2 focus:ring-accent-500 bg-forge-50"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-forge-200">
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-accent-500 text-forge-950 font-medium rounded hover:bg-accent-400 transition"
          >
            Save Configuration
          </button>
          <button
            onClick={handleTest}
            className="px-5 py-2 bg-forge-50 text-forge-600 font-medium rounded border border-forge-200 hover:bg-forge-100 transition"
          >
            Test Connection
          </button>
          {config.status === 'testing' && (
            <span className="text-sm text-yellow-600">Testing connection...</span>
          )}
        </div>
      </div>
    </div>
  )
}
