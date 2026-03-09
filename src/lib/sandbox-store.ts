import vm from 'vm'

export interface SandboxExecution {
  id: string
  language: 'javascript' | 'python'
  code: string
  output: string
  error?: string
  status: 'pending' | 'running' | 'completed' | 'error'
  startedAt: string
  completedAt?: string
  duration?: number
}

const executions: SandboxExecution[] = []
let nextId = 1

function executeJavaScript(code: string): { output: string; error?: string } {
  const logs: string[] = []
  const customConsole = {
    log: (...args: unknown[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
    warn: (...args: unknown[]) => logs.push('[warn] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
    error: (...args: unknown[]) => logs.push('[error] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
    info: (...args: unknown[]) => logs.push('[info] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
  }

  const context = vm.createContext({
    console: customConsole,
    Math,
    Date,
    JSON,
    Array,
    Object,
    String,
    Number,
    Boolean,
    RegExp,
    Map,
    Set,
    Promise,
    setTimeout: (fn: () => void, ms: number) => setTimeout(fn, Math.min(ms, 3000)),
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    undefined,
    NaN,
    Infinity,
  })

  try {
    vm.runInContext(code, context, { timeout: 5000 })
    return { output: logs.join('\n') }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return { output: logs.join('\n'), error: message }
  }
}

export function execute(language: 'javascript' | 'python', code: string): SandboxExecution {
  const id = String(nextId++)
  const execution: SandboxExecution = {
    id,
    language,
    code,
    output: '',
    status: 'running',
    startedAt: new Date().toISOString(),
  }

  if (language === 'python') {
    execution.output = ''
    execution.error = 'Python sandbox coming soon — requires Docker runtime.'
    execution.status = 'error'
    execution.completedAt = new Date().toISOString()
    execution.duration = 0
  } else {
    const start = performance.now()
    const result = executeJavaScript(code)
    const end = performance.now()
    execution.output = result.output
    execution.error = result.error
    execution.status = result.error ? 'error' : 'completed'
    execution.completedAt = new Date().toISOString()
    execution.duration = Math.round(end - start)
  }

  executions.unshift(execution)
  if (executions.length > 100) executions.length = 100

  return execution
}

export function getExecution(id: string): SandboxExecution | undefined {
  return executions.find(e => e.id === id)
}

export function getRecent(limit = 20): SandboxExecution[] {
  return executions.slice(0, limit)
}
