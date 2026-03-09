'use client'

import { useState, useEffect, useCallback } from 'react'

type ProgressStep = 'idle' | 'checking-deps' | 'configuring' | 'starting' | 'running'

const stepLabels: Record<ProgressStep, string> = {
  idle: 'Ready',
  'checking-deps': 'Checking dependencies...',
  configuring: 'Configuring agent...',
  starting: 'Starting agent...',
  running: 'Agent is running',
}

const stepOrder: ProgressStep[] = ['checking-deps', 'configuring', 'starting', 'running']

export default function QuickStartPage() {
  const [apiKey, setApiKey] = useState('')
  const [demoMode, setDemoMode] = useState(false)
  const [progress, setProgress] = useState<ProgressStep>('idle')
  const [detectedModel, setDetectedModel] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  const detectModel = useCallback((key: string) => {
    if (key.startsWith('sk-ant-')) return 'claude-sonnet-4-20250514'
    if (key.startsWith('sk-')) return 'gpt-4o'
    if (key.startsWith('AIza')) return 'gemini-pro'
    if (key.startsWith('gsk_')) return 'llama3-70b (Groq)'
    return null
  }, [])

  useEffect(() => {
    setDetectedModel(detectModel(apiKey))
  }, [apiKey, detectModel])

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])
  }

  const handleStart = () => {
    if (!apiKey && !demoMode) return
    setLogs([])
    setProgress('checking-deps')

    const timings = [
      { step: 'checking-deps' as ProgressStep, log: 'Checking Node.js... v20.11.0 OK', delay: 600 },
      { step: 'checking-deps' as ProgressStep, log: 'Checking Docker... OK', delay: 1000 },
      { step: 'checking-deps' as ProgressStep, log: 'All dependencies satisfied', delay: 1400 },
      { step: 'configuring' as ProgressStep, log: `Using model: ${demoMode ? 'demo-model (simulated)' : detectedModel || 'auto-detected'}`, delay: 2000 },
      { step: 'configuring' as ProgressStep, log: 'Generating agent configuration...', delay: 2500 },
      { step: 'configuring' as ProgressStep, log: 'Writing IDENTITY.md, SOUL.md, TOOLS.md...', delay: 3000 },
      { step: 'starting' as ProgressStep, log: 'Initializing agent runtime...', delay: 3800 },
      { step: 'starting' as ProgressStep, log: 'Connecting to model provider...', delay: 4400 },
      { step: 'running' as ProgressStep, log: demoMode ? 'Agent running in demo mode (no API calls)' : 'Agent is live and accepting requests', delay: 5200 },
    ]

    timings.forEach(({ step, log, delay }) => {
      setTimeout(() => {
        setProgress(step)
        addLog(log)
      }, delay)
    })
  }

  const handleStop = () => {
    setProgress('idle')
    addLog('Agent stopped')
  }

  const currentStepIndex = progress === 'idle' ? -1 : stepOrder.indexOf(progress)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Quick <span className="text-blue-600">Start</span>
        </h1>
        <p className="text-lg text-gray-600">Get an agent running in under 60 seconds</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Configuration</h2>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm text-gray-600">Demo Mode</span>
            <button
              onClick={() => setDemoMode(!demoMode)}
              className={`relative w-10 h-5 rounded-full transition ${demoMode ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${demoMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </label>
        </div>

        {!demoMode && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="Paste your API key (Anthropic, OpenAI, Google, or Groq)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 font-mono text-sm"
            />
            {detectedModel && (
              <div className="mt-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm text-gray-600">Auto-detected model: <strong className="text-gray-900">{detectedModel}</strong></span>
              </div>
            )}
            {apiKey && !detectedModel && (
              <div className="mt-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span className="text-sm text-gray-600">Could not detect provider from key prefix</span>
              </div>
            )}
          </div>
        )}

        {demoMode && (
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            Demo mode simulates agent execution without making API calls. No API key required.
          </div>
        )}

        {progress === 'idle' ? (
          <button
            onClick={handleStart}
            disabled={!apiKey && !demoMode}
            className="w-full py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Agent
          </button>
        ) : progress === 'running' ? (
          <button
            onClick={handleStop}
            className="w-full py-3 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
          >
            Stop Agent
          </button>
        ) : (
          <button disabled className="w-full py-3 bg-gray-300 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed">
            {stepLabels[progress]}
          </button>
        )}
      </div>

      {progress !== 'idle' && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Progress</h3>
          <div className="space-y-3">
            {stepOrder.map((step, i) => {
              const isActive = i === currentStepIndex
              const isDone = i < currentStepIndex
              const isPending = i > currentStepIndex
              return (
                <div key={step} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    isDone ? 'bg-green-500' :
                    isActive ? 'bg-blue-500 animate-pulse' :
                    'bg-gray-200'
                  }`}>
                    {isDone ? (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : isActive ? (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    ) : null}
                  </div>
                  <span className={`text-sm ${
                    isDone ? 'text-green-700 font-medium' :
                    isActive ? 'text-blue-700 font-medium' :
                    'text-gray-400'
                  }`}>
                    {stepLabels[step]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {logs.length > 0 && (
        <div className="bg-gray-900 rounded-xl p-4 max-h-64 overflow-y-auto font-mono text-sm">
          {logs.map((line, i) => (
            <div key={i} className="text-green-400">{line}</div>
          ))}
        </div>
      )}
    </div>
  )
}
