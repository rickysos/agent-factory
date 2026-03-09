'use client'

import { useState } from 'react'

interface Provider {
  id: string
  name: string
  envVar: string
  keyPrefix: string
  docsUrl: string
  connected: boolean
}

const initialProviders: Provider[] = [
  { id: 'anthropic', name: 'Anthropic', envVar: 'ANTHROPIC_API_KEY', keyPrefix: 'sk-ant-', docsUrl: 'console.anthropic.com', connected: false },
  { id: 'openai', name: 'OpenAI', envVar: 'OPENAI_API_KEY', keyPrefix: 'sk-', docsUrl: 'platform.openai.com', connected: false },
  { id: 'google', name: 'Google AI', envVar: 'GOOGLE_API_KEY', keyPrefix: 'AIza', docsUrl: 'aistudio.google.dev', connected: false },
  { id: 'deepseek', name: 'DeepSeek', envVar: 'DEEPSEEK_API_KEY', keyPrefix: 'sk-', docsUrl: 'platform.deepseek.com', connected: false },
  { id: 'ollama', name: 'Ollama', envVar: 'OLLAMA_BASE_URL', keyPrefix: 'http', docsUrl: 'ollama.com', connected: false },
  { id: 'groq', name: 'Groq', envVar: 'GROQ_API_KEY', keyPrefix: 'gsk_', docsUrl: 'console.groq.com', connected: false },
  { id: 'together', name: 'Together AI', envVar: 'TOGETHER_API_KEY', keyPrefix: '', docsUrl: 'api.together.xyz', connected: false },
  { id: 'mistral', name: 'Mistral', envVar: 'MISTRAL_API_KEY', keyPrefix: '', docsUrl: 'console.mistral.ai', connected: false },
]

export default function ProvidersPage() {
  const [providerState, setProviderState] = useState<Record<string, { key: string; visible: boolean; testing: boolean; status: 'idle' | 'success' | 'error' }>>(
    () => Object.fromEntries(initialProviders.map(p => [p.id, { key: '', visible: false, testing: false, status: 'idle' as const }]))
  )

  const handleTest = (id: string) => {
    setProviderState(prev => ({ ...prev, [id]: { ...prev[id], testing: true, status: 'idle' } }))
    setTimeout(() => {
      const hasKey = providerState[id].key.length > 5
      setProviderState(prev => ({
        ...prev,
        [id]: { ...prev[id], testing: false, status: hasKey ? 'success' : 'error' },
      }))
    }, 1200)
  }

  const envPreview = initialProviders
    .filter(p => providerState[p.id].key)
    .map(p => `${p.envVar}=${providerState[p.id].key}`)
    .join('\n')

  const handleExport = () => {
    const blob = new Blob([envPreview], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '.env'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Provider <span className="text-blue-600">Configuration</span>
        </h1>
        <p className="text-lg text-gray-600">Configure API keys for your AI providers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {initialProviders.map(provider => {
            const state = providerState[provider.id]
            return (
              <div key={provider.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{provider.name}</h3>
                    <span className="text-sm text-gray-500">{provider.docsUrl}</span>
                  </div>
                  {state.status !== 'idle' && (
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      state.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {state.status === 'success' ? 'Connected' : 'Failed'}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type={state.visible ? 'text' : 'password'}
                      value={state.key}
                      onChange={e => setProviderState(prev => ({
                        ...prev,
                        [provider.id]: { ...prev[provider.id], key: e.target.value, status: 'idle' },
                      }))}
                      placeholder={`${provider.envVar}...`}
                      className="w-full px-4 py-2 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 text-sm font-mono"
                    />
                    <button
                      onClick={() => setProviderState(prev => ({
                        ...prev,
                        [provider.id]: { ...prev[provider.id], visible: !prev[provider.id].visible },
                      }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
                    >
                      {state.visible ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <button
                    onClick={() => handleTest(provider.id)}
                    disabled={!state.key || state.testing}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {state.testing ? 'Testing...' : 'Test Connection'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 sticky top-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">.env Preview</h3>
              <button
                onClick={handleExport}
                disabled={!envPreview}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Export .env
              </button>
            </div>
            <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-sm font-mono overflow-x-auto min-h-[200px] whitespace-pre-wrap">
              {envPreview || '# No keys configured yet\n# Add API keys to see preview'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
