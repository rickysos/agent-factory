'use client'

import { useState } from 'react'

const steps = ['Welcome', 'Provider', 'API Keys', 'First Agent', 'Review', 'Done'] as const
type Step = typeof steps[number]

const providers = [
  { id: 'anthropic', name: 'Anthropic', models: ['claude-sonnet-4-20250514', 'claude-haiku'] },
  { id: 'openai', name: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini'] },
  { id: 'google', name: 'Google AI', models: ['gemini-pro', 'gemini-flash'] },
  { id: 'deepseek', name: 'DeepSeek', models: ['deepseek-chat', 'deepseek-coder'] },
  { id: 'ollama', name: 'Ollama (Local)', models: ['llama3', 'codellama', 'mistral'] },
]

export default function SetupPage() {
  const [stepIndex, setStepIndex] = useState(0)
  const [selectedProviders, setSelectedProviders] = useState<string[]>([])
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({})
  const [agentName, setAgentName] = useState('')
  const [agentModel, setAgentModel] = useState('')
  const [agentDescription, setAgentDescription] = useState('')

  const currentStep = steps[stepIndex]

  const next = () => setStepIndex(i => Math.min(i + 1, steps.length - 1))
  const back = () => setStepIndex(i => Math.max(i - 1, 0))
  const skip = () => next()

  const toggleProvider = (id: string) => {
    setSelectedProviders(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const availableModels = providers.filter(p => selectedProviders.includes(p.id)).flatMap(p => p.models)

  const renderStep = () => {
    switch (currentStep) {
      case 'Welcome':
        return (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Agent Factory</h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto mb-8">
              This wizard will help you configure your environment, connect to AI providers,
              and create your first agent in just a few steps.
            </p>
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto text-sm">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="font-semibold text-blue-700">Step 1</div>
                <div className="text-blue-600">Choose providers</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="font-semibold text-blue-700">Step 2</div>
                <div className="text-blue-600">Add API keys</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="font-semibold text-blue-700">Step 3</div>
                <div className="text-blue-600">Create agent</div>
              </div>
            </div>
          </div>
        )
      case 'Provider':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Select AI Providers</h2>
            <p className="text-gray-600 mb-6">Choose which providers you want to use. You can add more later.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {providers.map(p => (
                <button
                  key={p.id}
                  onClick={() => toggleProvider(p.id)}
                  className={`p-4 rounded-xl border-2 text-left transition ${
                    selectedProviders.includes(p.id)
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900">{p.name}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Models: {p.models.join(', ')}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )
      case 'API Keys':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter API Keys</h2>
            <p className="text-gray-600 mb-6">Add API keys for your selected providers. Keys are stored locally.</p>
            {selectedProviders.length === 0 ? (
              <p className="text-gray-500">No providers selected. Go back to select providers first.</p>
            ) : (
              <div className="space-y-4">
                {providers.filter(p => selectedProviders.includes(p.id)).map(p => (
                  <div key={p.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{p.name} API Key</label>
                    <input
                      type="password"
                      value={apiKeys[p.id] || ''}
                      onChange={e => setApiKeys(prev => ({ ...prev, [p.id]: e.target.value }))}
                      placeholder={p.id === 'ollama' ? 'No key needed for local' : `Enter ${p.name} API key...`}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      case 'First Agent':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your First Agent</h2>
            <p className="text-gray-600 mb-6">Define a simple agent to get started.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agent Name</label>
                <input
                  type="text"
                  value={agentName}
                  onChange={e => setAgentName(e.target.value)}
                  placeholder="My First Agent"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <select
                  value={agentModel}
                  onChange={e => setAgentModel(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 bg-white"
                >
                  <option value="">Select a model...</option>
                  {availableModels.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={agentDescription}
                  onChange={e => setAgentDescription(e.target.value)}
                  placeholder="Describe what this agent does..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 resize-none"
                />
              </div>
            </div>
          </div>
        )
      case 'Review':
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Configuration</h2>
            <p className="text-gray-600 mb-6">Confirm your setup before finishing.</p>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-2">Providers</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProviders.length > 0 ? selectedProviders.map(id => {
                    const p = providers.find(pr => pr.id === id)
                    return (
                      <span key={id} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                        {p?.name}
                      </span>
                    )
                  }) : <span className="text-gray-500 text-sm">None selected</span>}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-2">API Keys</h3>
                <div className="space-y-1">
                  {selectedProviders.map(id => {
                    const p = providers.find(pr => pr.id === id)
                    const hasKey = !!apiKeys[id]
                    return (
                      <div key={id} className="flex items-center gap-2 text-sm">
                        <span className={`w-2 h-2 rounded-full ${hasKey ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-gray-700">{p?.name}: {hasKey ? 'Configured' : 'Not set'}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-2">First Agent</h3>
                {agentName ? (
                  <div className="text-sm text-gray-700">
                    <div><strong>Name:</strong> {agentName}</div>
                    <div><strong>Model:</strong> {agentModel || 'Not selected'}</div>
                    <div><strong>Description:</strong> {agentDescription || 'None'}</div>
                  </div>
                ) : (
                  <span className="text-gray-500 text-sm">No agent configured</span>
                )}
              </div>
            </div>
          </div>
        )
      case 'Done':
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Setup Complete</h2>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              Your Agent Factory is configured and ready to use. Head to the dashboard to manage your agents.
            </p>
          </div>
        )
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Guided <span className="text-blue-600">Setup</span>
        </h1>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-1">
          {steps.map((step, i) => (
            <div key={step} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold shrink-0 ${
                i < stepIndex ? 'bg-blue-600 text-white' :
                i === stepIndex ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
                'bg-gray-200 text-gray-500'
              }`}>
                {i < stepIndex ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-1 rounded ${i < stepIndex ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {steps.map((step, i) => (
            <span key={step} className={`text-xs ${i === stepIndex ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
              {step}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
        {renderStep()}
      </div>

      {currentStep !== 'Done' && (
        <div className="flex justify-between">
          <button
            onClick={back}
            disabled={stepIndex === 0}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          <div className="flex gap-2">
            {currentStep !== 'Review' && (
              <button
                onClick={skip}
                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition"
              >
                Skip
              </button>
            )}
            <button
              onClick={next}
              className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {currentStep === 'Review' ? 'Finish Setup' : 'Next'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
