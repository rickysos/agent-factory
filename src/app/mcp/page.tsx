'use client'

import { useState } from 'react'

interface McpServer {
  id: string
  name: string
  url: string
  status: 'connected' | 'disconnected' | 'error'
  tools: string[]
}

const EXAMPLE_SERVERS: McpServer[] = [
  { id: '1', name: 'Filesystem', url: 'stdio://mcp-filesystem', status: 'disconnected', tools: ['read_file', 'write_file', 'list_directory'] },
  { id: '2', name: 'GitHub', url: 'stdio://mcp-github', status: 'disconnected', tools: ['create_issue', 'list_prs', 'merge_pr'] },
  { id: '3', name: 'Postgres', url: 'stdio://mcp-postgres', status: 'disconnected', tools: ['query', 'list_tables', 'describe_table'] },
]

export default function McpPage() {
  const [servers, setServers] = useState<McpServer[]>(EXAMPLE_SERVERS)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newUrl, setNewUrl] = useState('')

  const addServer = () => {
    if (!newName || !newUrl) return
    setServers([...servers, {
      id: `mcp_${Date.now()}`,
      name: newName,
      url: newUrl,
      status: 'disconnected',
      tools: [],
    }])
    setNewName('')
    setNewUrl('')
    setShowAdd(false)
  }

  const toggleConnection = (id: string) => {
    setServers(servers.map(s =>
      s.id === id ? { ...s, status: s.status === 'connected' ? 'disconnected' : 'connected' } : s
    ))
  }

  const removeServer = (id: string) => {
    setServers(servers.filter(s => s.id !== id))
  }

  const statusColors = {
    connected: 'bg-green-100 text-green-700',
    disconnected: 'bg-gray-100 text-gray-700',
    error: 'bg-red-100 text-red-700',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">MCP Servers</h1>
          <p className="text-gray-600 mt-2">Model Context Protocol servers for tool sharing between agents.</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          {showAdd ? 'Cancel' : 'Add Server'}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Server Name</label>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g., My Custom Tools"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Server URL</label>
              <input
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                placeholder="stdio://mcp-server or http://localhost:3100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <button
            onClick={addServer}
            disabled={!newName || !newUrl}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Add Server
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servers.map(server => (
          <div key={server.id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold text-gray-900">{server.name}</h3>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[server.status]}`}>
                {server.status}
              </span>
            </div>
            <p className="text-sm font-mono text-gray-500 mb-4">{server.url}</p>

            {server.tools.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 mb-1">Tools</p>
                <div className="flex flex-wrap gap-1">
                  {server.tools.map(tool => (
                    <span key={tool} className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => toggleConnection(server.id)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg ${
                  server.status === 'connected'
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                }`}
              >
                {server.status === 'connected' ? 'Disconnect' : 'Connect'}
              </button>
              <button
                onClick={() => removeServer(server.id)}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
