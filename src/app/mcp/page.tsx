'use client'

import { useState, useEffect, useCallback } from 'react'

interface MCPTool {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}

interface MCPServer {
  id: string
  name: string
  description: string
  url: string
  transport: 'stdio' | 'sse'
  status: 'connected' | 'disconnected' | 'error'
  tools: MCPTool[]
}

interface Agent {
  id: string
  name: string
  mcpServers?: string[]
}

export default function McpPage() {
  const [servers, setServers] = useState<MCPServer[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [expandedServer, setExpandedServer] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newTransport, setNewTransport] = useState<'stdio' | 'sse'>('stdio')

  const fetchServers = useCallback(async () => {
    const res = await fetch('/api/mcp/servers')
    const json = await res.json()
    if (json.success) setServers(json.data)
  }, [])

  const fetchAgents = useCallback(async () => {
    const res = await fetch('/api/agents')
    const json = await res.json()
    if (json.success) setAgents(json.data)
  }, [])

  useEffect(() => {
    fetchServers()
    fetchAgents()
  }, [fetchServers, fetchAgents])

  const addServer = async () => {
    if (!newName || !newTransport) return
    await fetch('/api/mcp/servers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newName,
        description: newDescription,
        url: newUrl,
        transport: newTransport,
      }),
    })
    setNewName('')
    setNewDescription('')
    setNewUrl('')
    setNewTransport('stdio')
    setShowAdd(false)
    fetchServers()
  }

  const removeServer = async (id: string) => {
    await fetch(`/api/mcp/servers/${id}`, { method: 'DELETE' })
    fetchServers()
  }

  const statusBorderColor = {
    connected: 'border-l-green-500',
    disconnected: 'border-l-gray-400',
    error: 'border-l-red-500',
  }

  const statusDotColor = {
    connected: 'bg-green-500',
    disconnected: 'bg-gray-400',
    error: 'bg-red-500',
  }

  const transportBadge = {
    stdio: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    sse: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  }

  const agentsUsingServer = (serverId: string) =>
    agents.filter(a => a.mcpServers?.includes(serverId))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">MCP Servers</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Model Context Protocol servers provide tools for your agents.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
        >
          {showAdd ? 'Cancel' : 'Add Server'}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add MCP Server</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g., My Custom Tools"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL</label>
              <input
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                placeholder="stdio://mcp-server or http://localhost:3100/sse"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <input
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                placeholder="What does this server provide?"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Transport</label>
              <select
                value={newTransport}
                onChange={e => setNewTransport(e.target.value as 'stdio' | 'sse')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="stdio">stdio</option>
                <option value="sse">sse</option>
              </select>
            </div>
          </div>
          <button
            onClick={addServer}
            disabled={!newName}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            Add Server
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {servers.map(server => (
          <div
            key={server.id}
            className={`bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 border-l-4 ${statusBorderColor[server.status]} overflow-hidden`}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{server.name}</h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${transportBadge[server.transport]}`}>
                    {server.transport}
                  </span>
                  <div className="flex items-center gap-1">
                    <div className={`h-2 w-2 rounded-full ${statusDotColor[server.status]}`} />
                    <span className="text-xs text-gray-500 dark:text-gray-400">{server.status}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{server.description}</p>
              <p className="text-xs font-mono text-gray-400 dark:text-gray-500 mb-4">{server.url}</p>

              <button
                onClick={() => setExpandedServer(expandedServer === server.id ? null : server.id)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-3"
              >
                {server.tools.length} tool{server.tools.length !== 1 ? 's' : ''}{' '}
                {expandedServer === server.id ? '(hide)' : '(show)'}
              </button>

              {expandedServer === server.id && server.tools.length > 0 && (
                <div className="mt-2 space-y-2">
                  {server.tools.map(tool => (
                    <div key={tool.name} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                      <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white">{tool.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{tool.description}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => removeServer(server.id)}
                  className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Agent - Server Assignments</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Shows which agents are configured to use which MCP servers.
        </p>
        {servers.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">No servers configured yet.</p>
        ) : (
          <div className="space-y-3">
            {servers.map(server => {
              const assigned = agentsUsingServer(server.id)
              return (
                <div key={server.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{server.name}</span>
                  <div className="flex gap-2">
                    {assigned.length > 0 ? (
                      assigned.map(a => (
                        <span key={a.id} className="px-2 py-0.5 text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full">
                          {a.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-500">No agents assigned</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
