import { eventBus } from './event-bus'

export type SandboxLanguage = 'python' | 'javascript' | 'shell' | 'typescript'
export type ExecutionStatus = 'queued' | 'running' | 'completed' | 'failed' | 'timeout' | 'cancelled'

export interface SandboxExecution {
  id: string
  agentId?: string
  language: SandboxLanguage
  code: string
  status: ExecutionStatus
  stdout: string
  stderr: string
  exitCode: number | null
  executionTime: number | null
  createdAt: Date
  completedAt?: Date
  config: SandboxConfig
}

export interface SandboxConfig {
  timeout: number      // ms, default 30000
  memoryLimit: number  // MB, default 256
  cpuLimit: number     // cores, default 1
  networkAccess: boolean
}

export interface SandboxSession {
  id: string
  agentId: string
  language: SandboxLanguage
  status: 'active' | 'closed'
  executions: string[]
  createdAt: Date
  lastUsedAt: Date
}

const defaultConfig: SandboxConfig = {
  timeout: 30000, memoryLimit: 256, cpuLimit: 1, networkAccess: false,
}

// Mock execution outputs for different languages
const mockOutputs: Record<SandboxLanguage, (code: string) => { stdout: string; stderr: string; exitCode: number }> = {
  python: (code) => {
    if (code.includes('print')) {
      const match = code.match(/print\(["'](.+?)["']\)/)
      return { stdout: (match?.[1] || 'Hello, World!') + '\n', stderr: '', exitCode: 0 }
    }
    if (code.includes('import')) return { stdout: '', stderr: '', exitCode: 0 }
    if (code.includes('error') || code.includes('raise')) return { stdout: '', stderr: 'Traceback (most recent call last):\n  File "<stdin>", line 1\nRuntimeError: Test error\n', exitCode: 1 }
    return { stdout: '>>> OK\n', stderr: '', exitCode: 0 }
  },
  javascript: (code) => {
    if (code.includes('console.log')) {
      const match = code.match(/console\.log\(["'](.+?)["']\)/)
      return { stdout: (match?.[1] || 'Hello, World!') + '\n', stderr: '', exitCode: 0 }
    }
    if (code.includes('throw')) return { stdout: '', stderr: 'Error: Test error\n    at Object.<anonymous> (script.js:1:1)\n', exitCode: 1 }
    return { stdout: 'undefined\n', stderr: '', exitCode: 0 }
  },
  typescript: (code) => {
    if (code.includes('console.log')) {
      const match = code.match(/console\.log\(["'](.+?)["']\)/)
      return { stdout: (match?.[1] || 'Hello, World!') + '\n', stderr: '', exitCode: 0 }
    }
    return { stdout: 'undefined\n', stderr: '', exitCode: 0 }
  },
  shell: (code) => {
    if (code.includes('echo')) {
      const match = code.match(/echo ["']?(.+?)["']?\s*$/)
      return { stdout: (match?.[1] || 'hello') + '\n', stderr: '', exitCode: 0 }
    }
    if (code.includes('ls')) return { stdout: 'file1.txt\nfile2.txt\nREADME.md\n', stderr: '', exitCode: 0 }
    return { stdout: '', stderr: '', exitCode: 0 }
  },
}

let executions: SandboxExecution[] = [
  { id: '1', agentId: '1', language: 'python', code: 'print("Hello from sandbox!")', status: 'completed', stdout: 'Hello from sandbox!\n', stderr: '', exitCode: 0, executionTime: 245, createdAt: new Date('2026-03-09T10:00:00'), completedAt: new Date('2026-03-09T10:00:00'), config: defaultConfig },
  { id: '2', agentId: '2', language: 'javascript', code: 'const data = [1,2,3];\nconsole.log(data.reduce((a,b) => a+b, 0));', status: 'completed', stdout: '6\n', stderr: '', exitCode: 0, executionTime: 120, createdAt: new Date('2026-03-09T11:00:00'), completedAt: new Date('2026-03-09T11:00:00'), config: defaultConfig },
  { id: '3', agentId: '1', language: 'python', code: 'import pandas as pd\ndf = pd.DataFrame({"a": [1,2,3]})\nprint(df.describe())', status: 'failed', stdout: '', stderr: "ModuleNotFoundError: No module named 'pandas'\n", exitCode: 1, executionTime: 180, createdAt: new Date('2026-03-09T12:00:00'), completedAt: new Date('2026-03-09T12:00:00'), config: defaultConfig },
  { id: '4', language: 'shell', code: 'echo "System info:" && uname -a', status: 'completed', stdout: 'System info:\nLinux sandbox-4 5.15.0 #1 SMP x86_64 GNU/Linux\n', stderr: '', exitCode: 0, executionTime: 50, createdAt: new Date('2026-03-09T13:00:00'), completedAt: new Date('2026-03-09T13:00:00'), config: defaultConfig },
]
let sessions: SandboxSession[] = []
let nextExecId = 5
let nextSessionId = 1

export const sandboxStore = {
  execute(code: string, language: SandboxLanguage, agentId?: string, config?: Partial<SandboxConfig>): SandboxExecution {
    const exec: SandboxExecution = {
      id: String(nextExecId++),
      agentId,
      language,
      code,
      status: 'running',
      stdout: '',
      stderr: '',
      exitCode: null,
      executionTime: null,
      createdAt: new Date(),
      config: { ...defaultConfig, ...config },
    }
    executions.push(exec)
    eventBus.emit('sandbox:started', exec)

    // Simulate execution
    const delay = 200 + Math.random() * 800
    setTimeout(() => {
      const result = mockOutputs[language](code)
      exec.stdout = result.stdout
      exec.stderr = result.stderr
      exec.exitCode = result.exitCode
      exec.status = result.exitCode === 0 ? 'completed' : 'failed'
      exec.executionTime = Math.round(delay)
      exec.completedAt = new Date()
      eventBus.emit('sandbox:completed', exec)
    }, delay)

    return exec
  },
  getAll(): SandboxExecution[] { return executions },
  getById(id: string): SandboxExecution | undefined { return executions.find(e => e.id === id) },
  getByAgent(agentId: string): SandboxExecution[] { return executions.filter(e => e.agentId === agentId) },
  cancel(id: string): boolean {
    const exec = executions.find(e => e.id === id)
    if (!exec || exec.status !== 'running') return false
    exec.status = 'cancelled'
    exec.completedAt = new Date()
    return true
  },
  getStats() {
    const total = executions.length
    const completed = executions.filter(e => e.status === 'completed').length
    const failed = executions.filter(e => e.status === 'failed').length
    const running = executions.filter(e => e.status === 'running').length
    const avgTime = executions.filter(e => e.executionTime).reduce((s, e) => s + (e.executionTime || 0), 0) / (completed + failed || 1)
    return { total, completed, failed, running, avgTime: Math.round(avgTime), successRate: total > 0 ? Math.round((completed / total) * 100) : 0 }
  },
}
