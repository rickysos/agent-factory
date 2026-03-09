'use client'

import { useState, useEffect } from 'react'

interface GatewayStatus {
  status: string
  timestamp: string
  uptime: number
}

export default function GatewayPage() {
  const [health, setHealth] = useState<GatewayStatus | null>(null)
  const [gatewayUrl] = useState(process.env.NEXT_PUBLIC_OPENCLAW_GATEWAY_URL || 'http://localhost:18789')

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(setHealth)
      .catch(() => setHealth(null))
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-forge-800">Gateway</h1>
        <p className="text-forge-500 mt-2">Agent execution gateway and routing status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-forge-50 rounded-2xl  p-6">
          <h2 className="text-lg font-bold text-forge-800 mb-4">API Gateway</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-forge-500">Status</span>
              <span className={`flex items-center gap-1.5 text-sm font-medium ${health ? 'text-accent-600' : 'text-red-500'}`}>
                <div className={`h-2 w-2 rounded-full ${health ? 'bg-accent-500' : 'bg-red-400'}`} />
                {health ? 'Healthy' : 'Unavailable'}
              </span>
            </div>
            {health && (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-forge-500">Uptime</span>
                  <span className="text-sm font-medium text-forge-800">{Math.floor(health.uptime)}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-forge-500">Last Check</span>
                  <span className="text-sm font-medium text-forge-800">{new Date(health.timestamp).toLocaleTimeString()}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-forge-50 rounded-2xl  p-6">
          <h2 className="text-lg font-bold text-forge-800 mb-4">OpenClaw Gateway</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-forge-500">URL</span>
              <span className="text-sm font-mono text-forge-800">{gatewayUrl}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-forge-500">Status</span>
              <span className="flex items-center gap-1.5 text-sm font-medium text-yellow-600">
                <div className="h-2 w-2 rounded-full bg-amber-400" />
                Not Connected
              </span>
            </div>
            <p className="text-xs text-forge-400 mt-2">
              Start the OpenClaw gateway with <code className="bg-forge-200 px-1 rounded">docker-compose up openclaw-gateway</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
