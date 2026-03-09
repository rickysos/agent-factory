'use client'

import { useState } from 'react'

interface ApiKey {
  id: string
  name: string
  prefix: string
  created: string
  lastUsed: string
  status: 'active' | 'revoked'
}

const initialKeys: ApiKey[] = [
  { id: '1', name: 'Production Deploy', prefix: 'af_prod_****7x2m', created: '2026-02-15', lastUsed: '2026-03-09', status: 'active' },
  { id: '2', name: 'Staging Environment', prefix: 'af_stg_****k9pq', created: '2026-01-20', lastUsed: '2026-03-08', status: 'active' },
  { id: '3', name: 'CI Pipeline', prefix: 'af_ci_****3nwf', created: '2025-12-01', lastUsed: '2026-03-09', status: 'active' },
  { id: '4', name: 'Old Integration', prefix: 'af_int_****h4zr', created: '2025-10-10', lastUsed: '2026-01-15', status: 'revoked' },
]

const usageData = {
  requestsToday: 14283,
  requestsLimit: 50000,
  tokensUsed: 2847500,
  tokensLimit: 10000000,
  costThisMonth: 127.43,
  costLastMonth: 98.21,
  plan: 'Pro' as const,
}

const dailyUsage = [
  { day: 'Mon', requests: 12400 },
  { day: 'Tue', requests: 15800 },
  { day: 'Wed', requests: 13200 },
  { day: 'Thu', requests: 18900 },
  { day: 'Fri', requests: 16500 },
  { day: 'Sat', requests: 8200 },
  { day: 'Sun', requests: 9100 },
]

const maxRequests = Math.max(...dailyUsage.map((d) => d.requests))

export default function BillingPage() {
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys)
  const [showCreate, setShowCreate] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')

  function createKey() {
    if (!newKeyName.trim()) return
    const key: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName.trim(),
      prefix: `af_new_****${Math.random().toString(36).slice(2, 6)}`,
      created: '2026-03-09',
      lastUsed: 'Never',
      status: 'active',
    }
    setKeys((prev) => [key, ...prev])
    setNewKeyName('')
    setShowCreate(false)
  }

  function revokeKey(id: string) {
    setKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status: 'revoked' as const } : k))
    )
  }

  const planFeatures: Record<string, { price: string; limits: string }> = {
    Free: { price: '$0/mo', limits: '1,000 requests/day, 500K tokens' },
    Pro: { price: '$49/mo', limits: '50,000 requests/day, 10M tokens' },
    Enterprise: { price: 'Custom', limits: 'Unlimited requests, unlimited tokens' },
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-forge-800">
          API Keys & <span className="text-accent-600">Billing</span>
        </h1>
        <p className="text-forge-400 mt-1">Manage API access and monitor usage.</p>
      </div>

      {/* Plan Tier */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {Object.entries(planFeatures).map(([plan, info]) => (
          <div
            key={plan}
            className={`rounded-md border-2 p-5 ${
              plan === usageData.plan
                ? 'border-accent-500 bg-accent-500/10'
                : 'border-forge-200 bg-forge-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-forge-800">{plan}</h3>
              {plan === usageData.plan && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-accent-500 text-forge-950">Current</span>
              )}
            </div>
            <p className="text-2xl font-bold text-forge-800">{info.price}</p>
            <p className="text-xs text-forge-400 mt-1">{info.limits}</p>
          </div>
        ))}
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-forge-50 rounded-md border border-forge-200 p-5">
          <p className="text-sm text-forge-400">Requests Today</p>
          <p className="text-2xl font-bold text-forge-800 mt-1">{usageData.requestsToday.toLocaleString()}</p>
          <div className="mt-2 w-full bg-forge-200 rounded-full h-2">
            <div
              className="bg-accent-500 h-2 rounded-full"
              style={{ width: `${(usageData.requestsToday / usageData.requestsLimit) * 100}%` }}
            />
          </div>
          <p className="text-xs text-forge-300 mt-1">{usageData.requestsLimit.toLocaleString()} limit</p>
        </div>
        <div className="bg-forge-50 rounded-md border border-forge-200 p-5">
          <p className="text-sm text-forge-400">Tokens Used (this month)</p>
          <p className="text-2xl font-bold text-forge-800 mt-1">{(usageData.tokensUsed / 1000000).toFixed(1)}M</p>
          <div className="mt-2 w-full bg-forge-200 rounded-full h-2">
            <div
              className="bg-forge-600 h-2 rounded-full"
              style={{ width: `${(usageData.tokensUsed / usageData.tokensLimit) * 100}%` }}
            />
          </div>
          <p className="text-xs text-forge-300 mt-1">{(usageData.tokensLimit / 1000000).toFixed(0)}M limit</p>
        </div>
        <div className="bg-forge-50 rounded-md border border-forge-200 p-5">
          <p className="text-sm text-forge-400">Cost This Month</p>
          <p className="text-2xl font-bold text-forge-800 mt-1">${usageData.costThisMonth.toFixed(2)}</p>
          <p className="text-xs text-forge-300 mt-2">Last month: ${usageData.costLastMonth.toFixed(2)}</p>
        </div>
      </div>

      {/* Usage Chart */}
      <div className="bg-forge-50 rounded-md border border-forge-200 p-5 mb-8">
        <h2 className="text-lg font-semibold text-forge-800 mb-4">Daily Requests (last 7 days)</h2>
        <div className="flex items-end gap-3 h-40">
          {dailyUsage.map((d) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-forge-400">{d.requests.toLocaleString()}</span>
              <div
                className="w-full bg-accent-500 rounded-t-md transition-all"
                style={{ height: `${(d.requests / maxRequests) * 100}%` }}
              />
              <span className="text-xs text-forge-300">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* API Keys */}
      <div className="bg-forge-50 rounded-md border border-forge-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-forge-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-forge-800">API Keys</h2>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="px-4 py-1.5 bg-accent-500 text-forge-950 text-sm font-medium rounded hover:bg-accent-400 transition"
          >
            {showCreate ? 'Cancel' : 'Create Key'}
          </button>
        </div>

        {showCreate && (
          <div className="px-5 py-4 border-b border-forge-200 bg-forge-100 flex gap-3">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Key name (e.g. Production)"
              className="flex-1 px-3 py-2 rounded border border-forge-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
              onKeyDown={(e) => e.key === 'Enter' && createKey()}
            />
            <button
              onClick={createKey}
              className="px-4 py-2 bg-accent-500 text-forge-950 text-sm font-medium rounded hover:bg-accent-400 transition"
            >
              Create
            </button>
          </div>
        )}

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-forge-200 bg-forge-100">
              <th className="text-left px-5 py-3 font-medium text-forge-400">Name</th>
              <th className="text-left px-5 py-3 font-medium text-forge-400">Key</th>
              <th className="text-left px-5 py-3 font-medium text-forge-400">Created</th>
              <th className="text-left px-5 py-3 font-medium text-forge-400">Last Used</th>
              <th className="text-left px-5 py-3 font-medium text-forge-400">Status</th>
              <th className="text-right px-5 py-3 font-medium text-forge-400"></th>
            </tr>
          </thead>
          <tbody>
            {keys.map((key) => (
              <tr key={key.id} className="border-b border-forge-200 hover:bg-forge-100 transition">
                <td className="px-5 py-3 text-forge-800 font-medium">{key.name}</td>
                <td className="px-5 py-3 text-forge-400 font-mono text-xs">{key.prefix}</td>
                <td className="px-5 py-3 text-forge-400">{key.created}</td>
                <td className="px-5 py-3 text-forge-400">{key.lastUsed}</td>
                <td className="px-5 py-3">
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      key.status === 'active' ? 'bg-accent-500/10 text-accent-600' : 'bg-red-500/50/10 text-red-500'
                    }`}
                  >
                    {key.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  {key.status === 'active' && (
                    <button
                      onClick={() => revokeKey(key.id)}
                      className="text-xs text-red-500 hover:text-red-700 transition font-medium"
                    >
                      Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
