import { Agent } from './agent-types'

export interface Task {
  id: string
  title: string
  description: string
  category: 'coding' | 'security' | 'marketing' | 'monitoring' | 'general'
  priority: 'low' | 'medium' | 'high' | 'critical'
  estimatedComplexity: number // 1-10 scale
  assignedTo?: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
}

export interface DelegationRule {
  fromAgent: string
  toAgent: string
  condition: (task: Task) => boolean
  priority: number
}

export class DelegationEngine {
  private agents: Map<string, Agent>
  private delegationRules: DelegationRule[]
  private activeTasks: Map<string, Task>
  private maxConcurrent: number = 8

  constructor(agents: Agent[], rules: DelegationRule[] = []) {
    this.agents = new Map(agents.map(agent => [agent.id, agent]))
    this.delegationRules = rules
    this.activeTasks = new Map()
  }

  public async delegateTask(task: Task): Promise<string | null> {
    // Find appropriate agent
    const targetAgentId = this.findAgentForTask(task)
    
    if (!targetAgentId) {
      console.warn(`No agent found for task: ${task.title}`)
      return null
    }

    // Check agent capacity
    const agentLoad = this.getAgentLoad(targetAgentId)
    const agent = this.agents.get(targetAgentId)
    
    if (!agent || agentLoad >= (agent.maxConcurrentTasks || 3)) {
      console.warn(`Agent ${targetAgentId} at capacity (load: ${agentLoad})`)
      return null
    }

    // Create task instance
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const activeTask: Task = {
      ...task,
      id: taskId,
      assignedTo: targetAgentId,
      status: 'in_progress',
      startedAt: new Date()
    }

    this.activeTasks.set(taskId, activeTask)
    
    // Simulate delegation (in real implementation, this would call agent API)
    console.log(`Delegating task "${task.title}" to ${targetAgentId}`)
    
    return taskId
  }

  private findAgentForTask(task: Task): string | null {
    // Apply delegation rules
    for (const rule of this.delegationRules) {
      if (rule.condition(task)) {
        return rule.toAgent
      }
    }

    // Default delegation based on category
    switch (task.category) {
      case 'coding':
        return 'coder'
      case 'security':
        return 'security'
      case 'marketing':
        return 'marketing'
      case 'monitoring':
        return 'vigil'
      default:
        return 'coder' // Default to coder for general tasks
    }
  }

  private getAgentLoad(agentId: string): number {
    let load = 0
    for (const task of this.activeTasks.values()) {
      if (task.assignedTo === agentId && task.status === 'in_progress') {
        load++
      }
    }
    return load
  }

  public completeTask(taskId: string, result: any): void {
    const task = this.activeTasks.get(taskId)
    if (task) {
      task.status = 'completed'
      task.completedAt = new Date()
      console.log(`Task "${task.title}" completed by ${task.assignedTo}`)
      console.log(`Result:`, result)
    }
  }

  public failTask(taskId: string, error: string): void {
    const task = this.activeTasks.get(taskId)
    if (task) {
      task.status = 'failed'
      console.error(`Task "${task.title}" failed:`, error)
    }
  }

  public getAgentStats(): Record<string, { active: number; completed: number; failed: number }> {
    const stats: Record<string, { active: number; completed: number; failed: number }> = {}
    
    for (const [agentId, agent] of this.agents) {
      stats[agentId] = { active: 0, completed: 0, failed: 0 }
    }

    for (const task of this.activeTasks.values()) {
      if (task.assignedTo) {
        const agentStats = stats[task.assignedTo]
        if (agentStats) {
          if (task.status === 'in_progress') agentStats.active++
          else if (task.status === 'completed') agentStats.completed++
          else if (task.status === 'failed') agentStats.failed++
        }
      }
    }

    return stats
  }
}

// Default delegation rules based on OpenClaw orchestrator pattern
export const defaultDelegationRules: DelegationRule[] = [
  {
    fromAgent: 'orchestrator',
    toAgent: 'coder',
    condition: (task) => 
      task.category === 'coding' || 
      task.title.toLowerCase().includes('github') ||
      task.title.toLowerCase().includes('fix') ||
      task.title.toLowerCase().includes('deploy'),
    priority: 1
  },
  {
    fromAgent: 'orchestrator',
    toAgent: 'security',
    condition: (task) => 
      task.category === 'security' ||
      task.title.toLowerCase().includes('audit') ||
      task.title.toLowerCase().includes('vulnerability') ||
      task.title.toLowerCase().includes('cve'),
    priority: 2
  },
  {
    fromAgent: 'orchestrator', 
    toAgent: 'vigil',
    condition: (task) =>
      task.category === 'monitoring' ||
      task.title.toLowerCase().includes('health') ||
      task.title.toLowerCase().includes('status') ||
      task.title.toLowerCase().includes('sentry'),
    priority: 3
  }
]