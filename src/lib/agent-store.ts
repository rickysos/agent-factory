import { Agent } from './agent-types'
import { eventBus } from './event-bus'

const initialAgents: Agent[] = [
  {
    id: '1',
    name: 'Support Bot',
    description: 'Handles customer support inquiries',
    model: 'gpt-4',
    status: 'active',
    capabilities: ['Q&A', 'Ticket Creation', 'Escalation'],
    createdAt: new Date('2026-03-01'),
    lastDeployed: new Date('2026-03-08'),
    deployments: 3,
  },
  {
    id: '2',
    name: 'Content Generator',
    description: 'Creates blog posts and social media content',
    model: 'claude-3',
    status: 'active',
    capabilities: ['Content Writing', 'SEO Optimization', 'Social Media'],
    createdAt: new Date('2026-03-05'),
    lastDeployed: new Date('2026-03-07'),
    deployments: 2,
  },
  {
    id: '3',
    name: 'Code Reviewer',
    description: 'Reviews pull requests and suggests improvements',
    model: 'deepseek-coder',
    status: 'draft',
    capabilities: ['Code Analysis', 'Security Review', 'Best Practices'],
    createdAt: new Date('2026-03-08'),
    deployments: 0,
  },
]

let agents: Agent[] = [...initialAgents]
let nextId = 4

export const agentStore = {
  getAll(): Agent[] {
    return agents
  },

  getById(id: string): Agent | undefined {
    return agents.find(a => a.id === id)
  },

  create(data: Omit<Agent, 'id' | 'createdAt' | 'deployments'>): Agent {
    const agent: Agent = {
      ...data,
      id: String(nextId++),
      createdAt: new Date(),
      deployments: 0,
    }
    agents.push(agent)
    eventBus.emit('agent:created', agent)
    return agent
  },

  update(id: string, updates: Partial<Agent>): Agent | null {
    const index = agents.findIndex(a => a.id === id)
    if (index === -1) return null
    agents[index] = { ...agents[index], ...updates, id }
    eventBus.emit('agent:updated', agents[index])
    return agents[index]
  },

  delete(id: string): boolean {
    const len = agents.length
    agents = agents.filter(a => a.id !== id)
    const deleted = agents.length < len
    if (deleted) eventBus.emit('agent:deleted', { id })
    return deleted
  },

  deploy(id: string): Agent | null {
    const agent = agents.find(a => a.id === id)
    if (!agent) return null
    agent.status = 'active'
    agent.lastDeployed = new Date()
    agent.deployments += 1
    eventBus.emit('agent:deployed', agent)
    return agent
  },
}
