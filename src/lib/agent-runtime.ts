import { agentStore } from './agent-store'
import { eventBus } from './event-bus'

export type RuntimeStatus = 'stopped' | 'starting' | 'running' | 'stopping' | 'error'

export interface AgentProcess {
  agentId: string
  status: RuntimeStatus
  startedAt?: Date
  stoppedAt?: Date
  uptime: number
  messagesProcessed: number
  lastError?: string
  pid?: number
}

const processes = new Map<string, AgentProcess>()

function createProcess(agentId: string): AgentProcess {
  return {
    agentId,
    status: 'stopped',
    uptime: 0,
    messagesProcessed: 0,
  }
}

export const agentRuntime = {
  getProcess(agentId: string): AgentProcess | undefined {
    return processes.get(agentId)
  },

  getAllProcesses(): AgentProcess[] {
    return Array.from(processes.values())
  },

  getRunningProcesses(): AgentProcess[] {
    return Array.from(processes.values()).filter(p => p.status === 'running')
  },

  async start(agentId: string): Promise<AgentProcess> {
    const agent = agentStore.getById(agentId)
    if (!agent) throw new Error('Agent not found')

    let proc = processes.get(agentId)
    if (proc?.status === 'running') return proc

    proc = createProcess(agentId)
    proc.status = 'starting'
    processes.set(agentId, proc)
    eventBus.emit('agent:status-change', { agentId, status: 'starting' })

    // Simulate startup (model validation, config check)
    await new Promise(r => setTimeout(r, 800))

    proc.status = 'running'
    proc.startedAt = new Date()
    proc.pid = Math.floor(Math.random() * 90000) + 10000

    agentStore.update(agentId, { status: 'active' })
    eventBus.emit('agent:status-change', { agentId, status: 'running' })

    return proc
  },

  async stop(agentId: string): Promise<AgentProcess> {
    let proc = processes.get(agentId)
    if (!proc) {
      // Agent may have been started before hot reload — create a stub and stop it
      proc = createProcess(agentId)
      processes.set(agentId, proc)
    }

    proc.status = 'stopping'
    eventBus.emit('agent:status-change', { agentId, status: 'stopping' })

    await new Promise(r => setTimeout(r, 300))

    proc.status = 'stopped'
    proc.stoppedAt = new Date()
    if (proc.startedAt) {
      proc.uptime += Date.now() - proc.startedAt.getTime()
    }
    proc.pid = undefined

    agentStore.update(agentId, { status: 'inactive' })
    eventBus.emit('agent:status-change', { agentId, status: 'stopped' })

    return proc
  },

  async restart(agentId: string): Promise<AgentProcess> {
    const proc = processes.get(agentId)
    if (proc?.status === 'running') {
      await this.stop(agentId)
    }
    return this.start(agentId)
  },

  isRunning(agentId: string): boolean {
    return processes.get(agentId)?.status === 'running'
  },

  recordMessage(agentId: string) {
    const proc = processes.get(agentId)
    if (proc) proc.messagesProcessed++
  },

  getStatus(agentId: string): RuntimeStatus {
    return processes.get(agentId)?.status || 'stopped'
  },

  getUptime(agentId: string): number {
    const proc = processes.get(agentId)
    if (!proc) return 0
    if (proc.status === 'running' && proc.startedAt) {
      return proc.uptime + (Date.now() - proc.startedAt.getTime())
    }
    return proc.uptime
  },
}
