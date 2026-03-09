'use client'

import { useState } from 'react'

type CheckStatus = 'pass' | 'warn' | 'fail'

interface DepCheck {
  name: string
  category: 'runtime' | 'api-key'
  status: CheckStatus
  version?: string
  detail: string
  installHint?: string
}

const initialChecks: DepCheck[] = [
  { name: 'Node.js', category: 'runtime', status: 'pass', version: 'v20.11.0', detail: 'Required version >= 18.0.0' },
  { name: 'Docker', category: 'runtime', status: 'pass', version: '24.0.7', detail: 'Docker Engine running' },
  { name: 'Git', category: 'runtime', status: 'pass', version: '2.43.0', detail: 'Git is installed' },
  { name: 'npm', category: 'runtime', status: 'pass', version: '10.2.4', detail: 'npm is available' },
  { name: 'Python', category: 'runtime', status: 'warn', version: '3.9.7', detail: 'Recommended >= 3.11 for optimal performance', installHint: 'brew install python@3.12 or download from python.org' },
  { name: 'Docker Compose', category: 'runtime', status: 'fail', detail: 'Not found in PATH', installHint: 'Install via: brew install docker-compose or download from docs.docker.com/compose/install/' },
  { name: 'Anthropic API Key', category: 'api-key', status: 'pass', detail: 'ANTHROPIC_API_KEY is set and valid (sk-ant-...r4Xm)' },
  { name: 'OpenAI API Key', category: 'api-key', status: 'fail', detail: 'OPENAI_API_KEY is not set', installHint: 'Get your key at platform.openai.com/api-keys and add to .env' },
  { name: 'Google AI API Key', category: 'api-key', status: 'warn', detail: 'GOOGLE_API_KEY is set but could not be validated', installHint: 'Verify your key at console.cloud.google.com' },
  { name: 'DeepSeek API Key', category: 'api-key', status: 'fail', detail: 'DEEPSEEK_API_KEY is not set', installHint: 'Get your key at platform.deepseek.com and add to .env' },
]

const statusConfig: Record<CheckStatus, { color: string; bg: string; label: string }> = {
  pass: { color: 'text-green-700', bg: 'bg-green-100', label: 'Pass' },
  warn: { color: 'text-yellow-700', bg: 'bg-yellow-100', label: 'Warning' },
  fail: { color: 'text-red-700', bg: 'bg-red-100', label: 'Fail' },
}

export default function EnvironmentPage() {
  const [checks, setChecks] = useState(initialChecks)
  const [checking, setChecking] = useState(false)
  const [expandedHint, setExpandedHint] = useState<string | null>(null)

  const handleRecheck = () => {
    setChecking(true)
    setTimeout(() => {
      setChecks([...initialChecks])
      setChecking(false)
    }, 1500)
  }

  const runtimeChecks = checks.filter(c => c.category === 'runtime')
  const apiChecks = checks.filter(c => c.category === 'api-key')
  const passCount = checks.filter(c => c.status === 'pass').length
  const warnCount = checks.filter(c => c.status === 'warn').length
  const failCount = checks.filter(c => c.status === 'fail').length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Environment <span className="text-blue-600">Check</span>
          </h1>
          <p className="text-lg text-gray-600">Verify dependencies and API key configuration</p>
        </div>
        <button
          onClick={handleRecheck}
          disabled={checking}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          {checking ? 'Checking...' : 'Re-check All'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-green-50 rounded-xl p-4 text-center border border-green-200">
          <div className="text-3xl font-bold text-green-700">{passCount}</div>
          <div className="text-sm text-green-600">Passed</div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 text-center border border-yellow-200">
          <div className="text-3xl font-bold text-yellow-700">{warnCount}</div>
          <div className="text-sm text-yellow-600">Warnings</div>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center border border-red-200">
          <div className="text-3xl font-bold text-red-700">{failCount}</div>
          <div className="text-sm text-red-600">Failed</div>
        </div>
      </div>

      <div className="space-y-8">
        {[{ title: 'Runtime Dependencies', items: runtimeChecks }, { title: 'API Key Validation', items: apiChecks }].map(group => (
          <div key={group.title}>
            <h2 className="text-xl font-bold text-gray-800 mb-4">{group.title}</h2>
            <div className="bg-white rounded-xl shadow-lg divide-y divide-gray-100">
              {group.items.map(check => {
                const cfg = statusConfig[check.status]
                return (
                  <div key={check.name} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-3 h-3 rounded-full ${check.status === 'pass' ? 'bg-green-500' : check.status === 'warn' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                        <span className="font-medium text-gray-900">{check.name}</span>
                        {check.version && (
                          <span className="text-sm text-gray-500">{check.version}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                        {check.installHint && (
                          <button
                            onClick={() => setExpandedHint(expandedHint === check.name ? null : check.name)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            {expandedHint === check.name ? 'Hide fix' : 'How to fix'}
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 ml-6">{check.detail}</p>
                    {expandedHint === check.name && check.installHint && (
                      <div className="mt-3 ml-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <code className="text-sm text-gray-800">{check.installHint}</code>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
