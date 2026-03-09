export interface Agent {
  id: string
  name: string
  description: string
  model: string
  status: 'draft' | 'active' | 'inactive' | 'error'
  capabilities: string[]
  createdAt: Date
  lastDeployed?: Date
  deployments: number
  maxConcurrentTasks?: number
  knowledgeBases?: string[]
}
