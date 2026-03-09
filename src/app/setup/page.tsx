'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const steps = ['Environment', 'Providers', 'Create Agent', 'Complete'] as const

interface HealthData {
  status: string
  timestamp: string
  uptime: number
}

interface ProviderInfo {
  id: string
  name: string
  envVar: string
  models: string[]
  freeModels?: string[]
  instructions: string
}

const providers: ProviderInfo[] = [
  {
    id: 'openrouter',
    name: 'OpenRouter',
    envVar: 'OPENROUTER_API_KEY',
    models: ['openai/gpt-4o', 'anthropic/claude-3.5-sonnet', 'google/gemini-pro'],
    freeModels: ['nousresearch/nous-hermes-2-mixtral-8x7b-dpo', 'mistralai/mistral-7b-instruct'],
    instructions: 'Sign up at openrouter.ai and create an API key. Free models available!',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    envVar: 'OPENAI_API_KEY',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
    instructions: 'Get your key from platform.openai.com/api-keys',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    envVar: 'ANTHROPIC_API_KEY',
    models: ['claude-sonnet-4-20250514', 'claude-3-haiku'],
    instructions: 'Get your key from console.anthropic.com/settings/keys',
  },
]

const allModels = [
  'gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo',
  'claude-sonnet-4-20250514', 'claude-3-haiku',
  'gemini-pro', 'deepseek-coder',
  'llama-3-70b', 'mixtral-8x7b',
]

interface CreatedAgent {
  id: string
  name: string
  description: string
  model: string
}

export default function SetupPage() {
  const [stepIndex, setStepIndex] = useState(0)
  const [health, setHealth] = useState<HealthData | null>(null)
  const [healthLoading, setHealthLoading] = useState(true)
  const [healthError, setHealthError] = useState<string | null>(null)
  const [agentName, setAgentName] = useState('My First Agent')
  const [agentDescription, setAgentDescription] = useState('A general-purpose AI assistant')
  const [agentModel, setAgentModel] = useState('gpt-4o')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createdAgent, setCreatedAgent] = useState<CreatedAgent | null>(null)

  const currentStep = steps[stepIndex]

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(data => {
        setHealth(data)
        setHealthLoading(false)
      })
      .catch(() => {
        setHealthError('Could not reach the server')
        setHealthLoading(false)
      })
  }, [])

  const next = () => setStepIndex(i => Math.min(i + 1, steps.length - 1))
  const back = () => setStepIndex(i => Math.max(i - 1, 0))

  const createAgent = async () => {
    setCreating(true)
    setCreateError(null)
    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: agentName,
          description: agentDescription,
          model: agentModel,
          status: 'draft',
          capabilities: [],
        }),
      })
      const data = await res.json()
      if (data.success) {
        setCreatedAgent(data.data)
        if (typeof window !== 'undefined') {
          localStorage.setItem('setup-complete', 'true')
        }
        next()
      } else {
        setCreateError(data.error || 'Failed to create agent')
      }
    } catch {
      setCreateError('Network error creating agent')
    } finally {
      setCreating(false)
    }
  }

  const skipToComplete = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('setup-complete', 'true')
    }
    setStepIndex(steps.length - 1)
  }

  const renderEnvironment = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Welcome to Agent Factory
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        This wizard will help you get set up. First, let&apos;s check that everything is running.
      </p>

      <div className="space-y-3">
        <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          {healthLoading ? (
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : healthError ? (
            <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          <div>
            <div className="font-medium text-gray-900 dark:text-white">Next.js Server</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {healthLoading ? 'Checking...' : healthError ? healthError : `Running (uptime: ${Math.round(health?.uptime || 0)}s)`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">Agent Store</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">In-memory store ready</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <svg className="w-5 h-5 text-yellow-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.072 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">Database</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Optional - using in-memory storage for now</div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderProviders = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">AI Providers</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        These providers power your agents. Configure them via environment variables.
      </p>

      <div className="space-y-4">
        {providers.map(p => (
          <div
            key={p.id}
            className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="font-semibold text-gray-900 dark:text-white">{p.name}</div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                Not configured
              </span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Set <code className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">{p.envVar}</code> in your <code className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs font-mono">.env.local</code> file.
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{p.instructions}</div>
            {p.freeModels && (
              <div className="mt-2 text-sm">
                <span className="text-green-600 dark:text-green-400 font-medium">Free models available: </span>
                <span className="text-gray-600 dark:text-gray-400">{p.freeModels.join(', ')}</span>
              </div>
            )}
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Models: {p.models.join(', ')}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        You can configure providers later. The wizard will let you create an agent with any model name.
      </p>
    </div>
  )

  const renderCreateAgent = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create Your First Agent</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Set up a simple agent to get started. You can customize it later.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agent Name</label>
          <input
            type="text"
            value={agentName}
            onChange={e => setAgentName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea
            value={agentDescription}
            onChange={e => setAgentDescription(e.target.value)}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Model</label>
          <select
            value={agentModel}
            onChange={e => setAgentModel(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            {allModels.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        {createError && (
          <p className="text-sm text-red-600 dark:text-red-400">{createError}</p>
        )}
      </div>
    </div>
  )

  const renderComplete = () => (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Setup Complete!</h2>
      {createdAgent ? (
        <div className="mb-8">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your agent <strong className="text-gray-900 dark:text-white">{createdAgent.name}</strong> has been created.
          </p>
          <div className="inline-block text-left bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <div><span className="font-medium text-gray-900 dark:text-white">Name:</span> {createdAgent.name}</div>
              <div><span className="font-medium text-gray-900 dark:text-white">Model:</span> {createdAgent.model}</div>
              <div><span className="font-medium text-gray-900 dark:text-white">Description:</span> {createdAgent.description}</div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          You&apos;re all set to start using Agent Factory.
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {createdAgent && (
          <Link
            href={`/chat/${createdAgent.id}`}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
          >
            Start Chatting
          </Link>
        )}
        <Link
          href="/"
          className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition border border-gray-200 dark:border-gray-700"
        >
          Go to Dashboard
        </Link>
        <button
          onClick={() => {
            setCreatedAgent(null)
            setAgentName('My First Agent')
            setAgentDescription('A general-purpose AI assistant')
            setAgentModel('gpt-4o')
            setStepIndex(2)
          }}
          className="px-6 py-2.5 text-blue-600 dark:text-blue-400 font-medium rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
        >
          Create Another Agent
        </button>
      </div>
    </div>
  )

  const renderStep = () => {
    switch (currentStep) {
      case 'Environment': return renderEnvironment()
      case 'Providers': return renderProviders()
      case 'Create Agent': return renderCreateAgent()
      case 'Complete': return renderComplete()
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Setup <span className="text-blue-600 dark:text-blue-400">Wizard</span>
        </h1>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center gap-1">
          {steps.map((step, i) => (
            <div key={step} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold shrink-0 ${
                i < stepIndex ? 'bg-blue-600 text-white' :
                i === stepIndex ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900' :
                'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                {i < stepIndex ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-1 rounded ${i < stepIndex ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {steps.map((step, i) => (
            <span key={step} className={`text-xs ${i === stepIndex ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-400 dark:text-gray-500'}`}>
              {step}
            </span>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg dark:shadow-gray-950/50 p-8 mb-6 border border-gray-100 dark:border-gray-800">
        {renderStep()}
      </div>

      {/* Navigation */}
      {currentStep !== 'Complete' && (
        <div className="flex justify-between">
          <button
            onClick={back}
            disabled={stepIndex === 0}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          <div className="flex gap-2">
            {currentStep === 'Create Agent' && (
              <button
                onClick={skipToComplete}
                className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
              >
                Skip
              </button>
            )}
            {currentStep === 'Create Agent' ? (
              <button
                onClick={createAgent}
                disabled={creating || !agentName || !agentModel}
                className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating...' : 'Create Agent'}
              </button>
            ) : (
              <button
                onClick={next}
                className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
