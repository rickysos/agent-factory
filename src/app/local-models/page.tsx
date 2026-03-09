'use client'

import { useState } from 'react'

interface ModelServer {
  name: string
  endpoint: string
  status: 'unknown' | 'online' | 'offline'
  models: string[]
}

interface DiscoveredModel {
  name: string
  server: string
  size: string
}

const initialServers: ModelServer[] = [
  { name: 'Ollama', endpoint: 'http://localhost:11434', status: 'unknown', models: [] },
  { name: 'LM Studio', endpoint: 'http://localhost:1234', status: 'unknown', models: [] },
]

const mockModels: Record<string, DiscoveredModel[]> = {
  'Ollama': [
    { name: 'llama3.1:8b', server: 'Ollama', size: '4.7 GB' },
    { name: 'codellama:13b', server: 'Ollama', size: '7.4 GB' },
    { name: 'mistral:7b', server: 'Ollama', size: '4.1 GB' },
  ],
  'LM Studio': [
    { name: 'deepseek-coder-v2:16b', server: 'LM Studio', size: '9.1 GB' },
    { name: 'phi-3-mini', server: 'LM Studio', size: '2.3 GB' },
  ],
}

export default function LocalModelsPage() {
  const [servers, setServers] = useState<ModelServer[]>(initialServers)
  const [customEndpoint, setCustomEndpoint] = useState('')
  const [customName, setCustomName] = useState('')
  const [checking, setChecking] = useState<string | null>(null)

  const checkServer = (index: number) => {
    const server = servers[index]
    setChecking(server.name)
    setTimeout(() => {
      setServers(prev => prev.map((s, i) => i === index ? {
        ...s,
        status: 'online',
        models: (mockModels[s.name] || []).map(m => m.name),
      } : s))
      setChecking(null)
    }, 1200)
  }

  const addCustomServer = () => {
    if (!customEndpoint || !customName) return
    setServers(prev => [...prev, {
      name: customName,
      endpoint: customEndpoint,
      status: 'unknown',
      models: [],
    }])
    setCustomEndpoint('')
    setCustomName('')
  }

  const allModels = servers
    .filter(s => s.status === 'online')
    .flatMap(s => (mockModels[s.name] || []))

  return (
    <div className="min-h-screen bg-forge-950 text-forge-100 p-8">
      <h1 className="text-3xl font-bold mb-2">Local Model Auto-Detection</h1>
      <p className="text-forge-300 mb-8">Detect and manage locally running model servers</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {servers.map((server, i) => (
          <div key={i} className="bg-forge-900 border border-forge-800 rounded p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold">{server.name}</h2>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                server.status === 'online' ? 'bg-accent-800 text-green-300' :
                server.status === 'offline' ? 'bg-red-900 text-red-300' :
                'bg-forge-850 text-forge-300'
              }`}>
                {server.status}
              </span>
            </div>
            <p className="text-forge-300 text-sm mb-4 font-mono">{server.endpoint}</p>
            <button
              onClick={() => checkServer(i)}
              disabled={checking === server.name}
              className="px-4 py-2 bg-accent-500 hover:bg-accent-400 disabled:bg-forge-700 rounded text-sm font-medium transition-colors"
            >
              {checking === server.name ? 'Detecting...' : 'Check Status'}
            </button>
            {server.status === 'online' && server.models.length > 0 && (
              <div className="mt-4 space-y-1">
                <p className="text-xs text-forge-400 uppercase tracking-wide">Models found:</p>
                {server.models.map(m => (
                  <p key={m} className="text-sm text-forge-300">{m}</p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-forge-900 border border-forge-800 rounded p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Add Custom OpenAI-Compatible Server</h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Server name"
            value={customName}
            onChange={e => setCustomName(e.target.value)}
            className="flex-1 bg-forge-850 border border-forge-700 rounded px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder="http://localhost:8080"
            value={customEndpoint}
            onChange={e => setCustomEndpoint(e.target.value)}
            className="flex-[2] bg-forge-850 border border-forge-700 rounded px-3 py-2 text-sm font-mono"
          />
          <button
            onClick={addCustomServer}
            className="px-4 py-2 bg-accent-500 hover:bg-accent-600 rounded text-sm font-medium transition-colors"
          >
            Add Server
          </button>
        </div>
      </div>

      {allModels.length > 0 && (
        <div className="bg-forge-900 border border-forge-800 rounded p-6">
          <h2 className="text-xl font-semibold mb-4">Discovered Models</h2>
          <div className="space-y-3">
            {allModels.map((model, i) => (
              <div key={i} className="flex items-center justify-between bg-forge-850 rounded px-4 py-3">
                <div>
                  <span className="font-medium">{model.name}</span>
                  <span className="text-forge-300 text-sm ml-3">{model.server}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-forge-400 text-sm">{model.size}</span>
                  <span className="px-2 py-0.5 bg-forge-800 text-forge-300 rounded text-xs font-medium">Local</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
