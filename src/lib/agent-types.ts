export type AutonomyLevel = 'full' | 'supervised' | 'manual'

export interface Agent {
  id: string
  name: string
  description: string
  model: string
  status: 'draft' | 'active' | 'inactive' | 'error'
  capabilities: string[]
  autonomyLevel: AutonomyLevel
  createdAt: Date
  lastDeployed?: Date
  deployments: number
  maxConcurrentTasks?: number
  mcpServers?: string[]
}
