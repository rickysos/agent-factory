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
    not_configured: 'bg-gray-100 text-gray-600',
    configured: 'bg-green-100 text-green-700',
    testing: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
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
        <h1 className="text-3xl font-bold text-gray-900">
          SSO <span className="text-blue-600">Integration</span>
        </h1>
        <p className="text-gray-500 mt-1">Configure single sign-on for your organization.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {providers.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedProvider(p.id)}
            className={`p-4 rounded-xl border-2 text-left transition ${
              selectedProvider === p.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{p.name}</h3>
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[configs[p.id].status]}`}
              >
                {statusLabels[configs[p.id].status]}
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">{provider.name} Configuration</h2>

        <div className="space-y-4">
          {provider.fields.map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field}</label>
              <input
                type={field.toLowerCase().includes('secret') ? 'password' : 'text'}
                value={config.values[field] || ''}
                onChange={(e) => updateField(field, e.target.value)}
                placeholder={`Enter ${field.toLowerCase()}`}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-100">
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
          >
            Save Configuration
          </button>
          <button
            onClick={handleTest}
            className="px-5 py-2 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition"
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
