import { eventBus } from './event-bus'

export type TriggerType = 'webhook' | 'cron' | 'github' | 'slack' | 'email' | 'polling'
export type TriggerStatus = 'active' | 'paused' | 'error'

export interface Trigger {
  id: string
  agentId: string
  type: TriggerType
  name: string
  status: TriggerStatus
  config: Record<string, unknown>
  createdAt: Date
  lastFiredAt?: Date
  fireCount: number
  secret?: string
}

export interface TriggerExecution {
  id: string
  triggerId: string
  agentId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  input: Record<string, unknown>
  output?: string
  startedAt: Date
  completedAt?: Date
  duration?: number
}

const initialTriggers: Trigger[] = [
  {
    id: '1', agentId: '1', type: 'webhook', name: 'Stripe Payment Webhook',
    status: 'active', config: { url: '/api/webhooks/t1', events: ['payment.completed', 'payment.failed'] },
    createdAt: new Date('2026-03-01'), lastFiredAt: new Date('2026-03-09T10:30:00'), fireCount: 147,
    secret: 'whsec_test123',
  },
  {
    id: '2', agentId: '1', type: 'cron', name: 'Daily Report',
    status: 'active', config: { expression: '0 9 * * *', timezone: 'America/New_York', description: 'Every day at 9:00 AM' },
    createdAt: new Date('2026-03-02'), lastFiredAt: new Date('2026-03-09T09:00:00'), fireCount: 7,
  },
  {
    id: '3', agentId: '2', type: 'github', name: 'PR Review Trigger',
    status: 'active', config: { repo: 'org/main-app', events: ['pull_request.opened', 'pull_request.synchronize'] },
    createdAt: new Date('2026-03-03'), lastFiredAt: new Date('2026-03-09T14:22:00'), fireCount: 53,
  },
  {
    id: '4', agentId: '3', type: 'slack', name: 'Support Channel Monitor',
    status: 'paused', config: { channel: '#customer-support', events: ['message', 'reaction_added'] },
    createdAt: new Date('2026-03-04'), fireCount: 0,
  },
  {
    id: '5', agentId: '2', type: 'cron', name: 'Weekly Code Scan',
    status: 'active', config: { expression: '0 2 * * 1', timezone: 'UTC', description: 'Every Monday at 2:00 AM UTC' },
    createdAt: new Date('2026-03-05'), lastFiredAt: new Date('2026-03-03T02:00:00'), fireCount: 1,
  },
  {
    id: '6', agentId: '1', type: 'polling', name: 'API Health Check',
    status: 'active', config: { url: 'https://api.example.com/health', interval: 300, method: 'GET' },
    createdAt: new Date('2026-03-06'), lastFiredAt: new Date('2026-03-09T15:00:00'), fireCount: 288,
  },
]

const initialExecutions: TriggerExecution[] = [
  { id: '1', triggerId: '1', agentId: '1', status: 'completed', input: { event: 'payment.completed', amount: 99.99 }, output: 'Processed payment notification', startedAt: new Date('2026-03-09T10:30:00'), completedAt: new Date('2026-03-09T10:30:02'), duration: 2000 },
  { id: '2', triggerId: '3', agentId: '2', status: 'completed', input: { action: 'opened', pr: 142, repo: 'org/main-app' }, output: 'Review started for PR #142', startedAt: new Date('2026-03-09T14:22:00'), completedAt: new Date('2026-03-09T14:22:15'), duration: 15000 },
  { id: '3', triggerId: '2', agentId: '1', status: 'completed', input: { scheduled: true, expression: '0 9 * * *' }, output: 'Daily report generated and sent', startedAt: new Date('2026-03-09T09:00:00'), completedAt: new Date('2026-03-09T09:00:30'), duration: 30000 },
  { id: '4', triggerId: '6', agentId: '1', status: 'failed', input: { url: 'https://api.example.com/health' }, output: 'Health check failed: timeout after 30s', startedAt: new Date('2026-03-09T14:55:00'), completedAt: new Date('2026-03-09T14:55:30'), duration: 30000 },
  { id: '5', triggerId: '1', agentId: '1', status: 'running', input: { event: 'payment.failed', amount: 49.99 }, startedAt: new Date('2026-03-09T15:01:00') },
]

let triggers = [...initialTriggers]
let executions = [...initialExecutions]
let nextTriggerId = 7
let nextExecId = 6

export const triggerStore = {
  getAll(): Trigger[] { return triggers },
  getByAgent(agentId: string): Trigger[] { return triggers.filter(t => t.agentId === agentId) },
  getById(id: string): Trigger | undefined { return triggers.find(t => t.id === id) },
  create(data: Omit<Trigger, 'id' | 'createdAt' | 'fireCount'>): Trigger {
    const trigger: Trigger = { ...data, id: String(nextTriggerId++), createdAt: new Date(), fireCount: 0 }
    triggers.push(trigger)
    eventBus.emit('trigger:created', trigger)
    return trigger
  },
  update(id: string, updates: Partial<Trigger>): Trigger | null {
    const idx = triggers.findIndex(t => t.id === id)
    if (idx === -1) return null
    triggers[idx] = { ...triggers[idx], ...updates, id }
    return triggers[idx]
  },
  delete(id: string): boolean {
    const len = triggers.length
    triggers = triggers.filter(t => t.id !== id)
    return triggers.length < len
  },
  fire(id: string, input: Record<string, unknown>): TriggerExecution | null {
    const trigger = triggers.find(t => t.id === id)
    if (!trigger) return null
    trigger.lastFiredAt = new Date()
    trigger.fireCount++
    const exec: TriggerExecution = {
      id: String(nextExecId++), triggerId: id, agentId: trigger.agentId,
      status: 'running', input, startedAt: new Date(),
    }
    executions.push(exec)
    setTimeout(() => {
      exec.status = 'completed'
      exec.completedAt = new Date()
      exec.duration = Date.now() - exec.startedAt.getTime()
      exec.output = `Trigger "${trigger.name}" executed successfully`
      eventBus.emit('trigger:executed', exec)
    }, 1000 + Math.random() * 2000)
    eventBus.emit('trigger:fired', { trigger, execution: exec })
    return exec
  },
  getExecutions(triggerId?: string): TriggerExecution[] {
    if (triggerId) return executions.filter(e => e.triggerId === triggerId)
    return executions
  },
}
