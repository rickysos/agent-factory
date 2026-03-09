'use client'

import { useState, useEffect, useCallback } from 'react'

interface Check {
  name: string
  status: 'ok' | 'warning' | 'error'
  message: string
  required: boolean
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  checks: Check[]
}

const statusStyles = {
  ok: { dot: 'bg-green-500', bg: 'bg-green-900/20', border: 'border-green-800', text: 'text-green-400', label: 'OK' },
  warning: { dot: 'bg-yellow-500', bg: 'bg-yellow-900/20', border: 'border-yellow-800', text: 'text-yellow-400', label: 'Warning' },
  error: { dot: 'bg-red-500', bg: 'bg-red-900/20', border: 'border-red-800', text: 'text-red-400', label: 'Error' },
}

const overallStyles = {
  healthy: { bg: 'bg-green-900/30', border: 'border-green-700', text: 'text-green-400', label: 'All Systems Healthy' },
  degraded: { bg: 'bg-yellow-900/30', border: 'border-yellow-700', text: 'text-yellow-400', label: 'Degraded — Optional Dependencies Missing' },
  unhealthy: { bg: 'bg-red-900/30', border: 'border-red-700', text: 'text-red-400', label: 'Unhealthy — Required Dependencies Failing' },
}

function CheckCard({ check }: { check: Check }) {
  const s = statusStyles[check.status]
  return (
    <div className={`${s.bg} border ${s.border} rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
          <span className="font-medium text-gray-100">{check.name}</span>
        </div>
        <span className={`text-xs font-medium ${s.text}`}>{s.label}</span>
      </div>
      <p className="text-sm text-gray-400 ml-[18px]">{check.message}</p>
    </div>
  )
}

export default function StatusPage() {
  const [data, setData] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchHealth = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/health/dependencies', { cache: 'no-store' })
      setData(await res.json())
    } catch {
      setData({ status: 'unhealthy', checks: [{ name: 'API', status: 'error', message: 'Failed to reach health endpoint', required: true }] })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchHealth() }, [fetchHealth])

  const required = data?.checks.filter(c => c.required) ?? []
  const optional = data?.checks.filter(c => !c.required) ?? []
  const overall = data ? overallStyles[data.status] : null

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">System Status</h1>
          <button
            onClick={fetchHealth}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? 'Checking...' : 'Re-check'}
          </button>
        </div>

        {overall && (
          <div className={`${overall.bg} border ${overall.border} rounded-lg p-4 mb-8`}>
            <span className={`font-semibold ${overall.text}`}>{overall.label}</span>
          </div>
        )}

        {required.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-300 mb-3">Required</h2>
            <div className="space-y-3">
              {required.map(c => <CheckCard key={c.name} check={c} />)}
            </div>
          </section>
        )}

        {optional.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-300 mb-3">Optional</h2>
            <div className="space-y-3">
              {optional.map(c => <CheckCard key={c.name} check={c} />)}
            </div>
          </section>
        )}

        {loading && !data && (
          <div className="text-center text-gray-500 py-12">Running dependency checks...</div>
        )}
      </div>
    </div>
  )
}
