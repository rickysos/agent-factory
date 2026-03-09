export interface MCPTool {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}

export interface MCPServer {
  id: string
  name: string
  description: string
  url: string
  transport: 'stdio' | 'sse'
  status: 'connected' | 'disconnected' | 'error'
  tools: MCPTool[]
}

const initialServers: MCPServer[] = [
  {
    id: 'mcp-1',
    name: 'Filesystem',
    description: 'Read/write files',
    url: 'stdio://mcp-filesystem',
    transport: 'stdio',
    status: 'disconnected',
    tools: [
      { name: 'read_file', description: 'Read file contents', inputSchema: {} },
      { name: 'write_file', description: 'Write to a file', inputSchema: {} },
    ],
  },
  {
    id: 'mcp-2',
    name: 'Web Search',
    description: 'Search the web',
    url: 'http://localhost:3100/sse',
    transport: 'sse',
    status: 'disconnected',
    tools: [
      { name: 'search', description: 'Search the web for information', inputSchema: {} },
    ],
  },
  {
    id: 'mcp-3',
    name: 'GitHub',
    description: 'GitHub operations',
    url: 'stdio://mcp-github',
    transport: 'stdio',
    status: 'disconnected',
    tools: [
      { name: 'list_repos', description: 'List repositories', inputSchema: {} },
      { name: 'create_issue', description: 'Create a GitHub issue', inputSchema: {} },
    ],
  },
]

let servers: MCPServer[] = [...initialServers]
let nextId = 4

export const mcpRegistry = {
  getAll(): MCPServer[] {
    return servers
  },

  getById(id: string): MCPServer | undefined {
    return servers.find(s => s.id === id)
  },

  add(server: Omit<MCPServer, 'id' | 'status' | 'tools'> & { tools?: MCPTool[] }): MCPServer {
    const newServer: MCPServer = {
      ...server,
      id: `mcp-${nextId++}`,
      status: 'disconnected',
      tools: server.tools || [],
    }
    servers.push(newServer)
    return newServer
  },

  remove(id: string): boolean {
    const len = servers.length
    servers = servers.filter(s => s.id !== id)
    return servers.length < len
  },

  getToolsForAgent(agentId: string): MCPTool[] {
    const { agentStore } = require('./agent-store')
    const agent = agentStore.getById(agentId)
    if (!agent?.mcpServers) return []
    return servers
      .filter(s => agent.mcpServers!.includes(s.id))
      .flatMap(s => s.tools)
  },
}
