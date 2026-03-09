'use client'

import { useState } from 'react'

interface Server {
  id: string
  host: string
  port: string
  user: string
  status: 'untested' | 'connected' | 'failed'
}

interface Deployment {
  id: string
  agent: string
  server: string
  status: 'success' | 'failed' | 'in-progress'
  timestamp: string
}

const mockAgents = ['Code Reviewer', 'Meeting Summarizer', 'Customer Support Bot', 'Test Generator']

const mockHistory: Deployment[] = [
  { id: 'd1', agent: 'Code Reviewer', server: 'prod-1.example.com', status: 'success', timestamp: '2026-03-09 14:23:01' },
  { id: 'd2', agent: 'Customer Support Bot', server: 'prod-1.example.com', status: 'success', timestamp: '2026-03-09 13:10:45' },
  { id: 'd3', agent: 'Meeting Summarizer', server: 'staging.example.com', status: 'failed', timestamp: '2026-03-08 09:55:22' },
  { id: 'd4', agent: 'Test Generator', server: 'prod-2.example.com', status: 'success', timestamp: '2026-03-07 16:42:10' },
]

const mockLogs = [
  '[14:23:00] Connecting to prod-1.example.com:22...',
  '[14:23:01] SSH connection established',
  '[14:23:02] Uploading agent configuration...',
  '[14:23:04] Installing dependencies...',
  '[14:23:08] Running pre-deploy checks...',
  '[14:23:10] Starting agent process...',
  '[14:23:12] Agent "Code Reviewer" deployed successfully',
  '[14:23:12] Health check passed',
]

export default function DeployPage() {
  const [servers, setServers] = useState<Server[]>([
    { id: 's1', host: 'prod-1.example.com', port: '22', user: 'deploy', status: 'connected' },
    { id: 's2', host: 'staging.example.com', port: '22', user: 'deploy', status: 'untested' },
  ])
  const [newHost, setNewHost] = useState('')
  const [newPort, setNewPort] = useState('22')
  const [newUser, setNewUser] = useState('deploy')
  const [logs, setLogs] = useState<string[]>(mockLogs)
  const [deploying, setDeploying] = useState<string | null>(null)
  const [history] = useState(mockHistory)

  const addServer = () => {
    if (!newHost) return
    setServers(prev => [...prev, {
      id: `s${Date.now()}`,
      host: newHost,
      port: newPort,
      user: newUser,
      status: 'untested',
    }])
    setNewHost('')
    setNewPort('22')
    setNewUser('deploy')
  }

  const testConnection = (id: string) => {
    setServers(prev => prev.map(s => s.id === id ? { ...s, status: 'untested' } : s))
    setTimeout(() => {
      setServers(prev => prev.map(s => s.id === id ? { ...s, status: 'connected' } : s))
    }, 1500)
  }

  const handleDeploy = (agent: string) => {
    setDeploying(agent)
    setLogs([])
    const logLines = [
      `[${new Date().toLocaleTimeString()}] Preparing deployment for "${agent}"...`,
      `[${new Date().toLocaleTimeString()}] Connecting to server...`,
      `[${new Date().toLocaleTimeString()}] SSH connection established`,
      `[${new Date().toLocaleTimeString()}] Uploading agent configuration...`,
      `[${new Date().toLocaleTimeString()}] Installing dependencies...`,
      `[${new Date().toLocaleTimeString()}] Starting agent process...`,
      `[${new Date().toLocaleTimeString()}] Deployment complete`,
    ]
    logLines.forEach((line, i) => {
      setTimeout(() => {
        setLogs(prev => [...prev, line])
        if (i === logLines.length - 1) setDeploying(null)
      }, (i + 1) * 600)
    })
  }

  const statusColors = { untested: 'bg-forge-200 text-forge-500', connected: 'bg-accent-500/10 text-accent-600', failed: 'bg-red-500/50/10 text-red-500' }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-forge-800 mb-2">
          Remote <span className="text-accent-600">Deployment</span>
        </h1>
        <p className="text-lg text-forge-500">Deploy agents to remote servers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-xl font-bold text-forge-700 mb-4">Servers</h2>
          <div className="space-y-3 mb-4">
            {servers.map(server => (
              <div key={server.id} className="bg-forge-50 rounded-md shadow p-4 border border-forge-200 flex items-center justify-between">
                <div>
                  <div className="font-medium text-forge-800">{server.user}@{server.host}:{server.port}</div>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold capitalize ${statusColors[server.status]}`}>
                    {server.status}
                  </span>
                </div>
                <button
                  onClick={() => testConnection(server.id)}
                  className="px-3 py-1.5 bg-forge-200 text-forge-600 rounded text-sm font-medium hover:bg-forge-200 transition"
                >
                  Test SSH
                </button>
              </div>
            ))}
          </div>

          <div className="bg-forge-50 rounded-md shadow p-4 border border-forge-200">
            <h3 className="font-medium text-forge-600 mb-3">Add Server</h3>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <input
                value={newHost}
                onChange={e => setNewHost(e.target.value)}
                placeholder="hostname"
                className="px-3 py-2 border border-forge-200 rounded text-sm text-forge-800 focus:ring-2 focus:ring-accent-500 outline-none"
              />
              <input
                value={newPort}
                onChange={e => setNewPort(e.target.value)}
                placeholder="port"
                className="px-3 py-2 border border-forge-200 rounded text-sm text-forge-800 focus:ring-2 focus:ring-accent-500 outline-none"
              />
              <input
                value={newUser}
                onChange={e => setNewUser(e.target.value)}
                placeholder="user"
                className="px-3 py-2 border border-forge-200 rounded text-sm text-forge-800 focus:ring-2 focus:ring-accent-500 outline-none"
              />
            </div>
            <button onClick={addServer} className="w-full py-2 bg-accent-500 text-forge-950 rounded text-sm font-medium hover:bg-accent-400 transition">
              Add Server
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-forge-700 mb-4">Deploy Agent</h2>
          <div className="space-y-2 mb-4">
            {mockAgents.map(agent => (
              <div key={agent} className="bg-forge-50 rounded-md shadow p-4 border border-forge-200 flex items-center justify-between">
                <span className="font-medium text-forge-800">{agent}</span>
                <button
                  onClick={() => handleDeploy(agent)}
                  disabled={deploying !== null}
                  className="px-4 py-1.5 bg-accent-500 text-forge-950 rounded text-sm font-medium hover:bg-accent-400 transition disabled:opacity-50"
                >
                  {deploying === agent ? 'Deploying...' : 'Deploy'}
                </button>
              </div>
            ))}
          </div>

          <h3 className="font-medium text-forge-600 mb-2">Deployment Log</h3>
          <div className="bg-forge-900 rounded-md p-4 h-48 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <span className="text-forge-400">No deployment logs yet.</span>
            ) : logs.map((line, i) => (
              <div key={i} className="text-accent-400">{line}</div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-forge-700 mb-4">Deployment History</h2>
        <div className="bg-forge-50 rounded-md  overflow-hidden">
          <table className="w-full">
            <thead className="bg-forge-100 border-b border-forge-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-forge-400 uppercase">Agent</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-forge-400 uppercase">Server</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-forge-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-forge-400 uppercase">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.map(d => (
                <tr key={d.id}>
                  <td className="px-4 py-3 text-sm text-forge-800 font-medium">{d.agent}</td>
                  <td className="px-4 py-3 text-sm text-forge-500 font-mono">{d.server}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${
                      d.status === 'success' ? 'bg-accent-500/10 text-accent-600' :
                      d.status === 'failed' ? 'bg-red-500/50/10 text-red-500' :
                      'bg-amber-500/10 text-amber-600'
                    }`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-forge-400">{d.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
