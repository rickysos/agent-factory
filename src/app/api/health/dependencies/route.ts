import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import net from 'net'

interface Check {
  name: string
  status: 'ok' | 'warning' | 'error'
  message: string
  required: boolean
}

function tryTcpConnect(host: string, port: number, timeoutMs = 2000): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket()
    socket.setTimeout(timeoutMs)
    socket.once('connect', () => { socket.destroy(); resolve(true) })
    socket.once('error', () => { socket.destroy(); resolve(false) })
    socket.once('timeout', () => { socket.destroy(); resolve(false) })
    socket.connect(port, host)
  })
}

function execPromise(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, { timeout: 5000 }, (err, stdout) => {
      if (err) reject(err)
      else resolve(stdout.trim())
    })
  })
}

function parseUrl(url: string): { host: string; port: number } | null {
  try {
    const u = new URL(url)
    return { host: u.hostname, port: parseInt(u.port) || (u.protocol === 'https:' ? 443 : 80) }
  } catch {
    return null
  }
}

async function checkOpenRouterKey(): Promise<Check> {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) {
    return { name: 'OpenRouter API Key', status: 'error', message: 'OPENROUTER_API_KEY is not set. Add it to .env.local', required: true }
  }
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(5000),
    })
    if (res.ok) {
      return { name: 'OpenRouter API Key', status: 'ok', message: 'OPENROUTER_API_KEY is set and valid', required: true }
    }
    return { name: 'OpenRouter API Key', status: 'error', message: `OPENROUTER_API_KEY returned ${res.status}. Check your key.`, required: true }
  } catch {
    return { name: 'OpenRouter API Key', status: 'warning', message: 'OPENROUTER_API_KEY is set but could not validate (network error)', required: true }
  }
}

async function checkEnvKey(name: string, envVar: string, required: boolean): Promise<Check> {
  const val = process.env[envVar]
  if (val) {
    return { name, status: 'ok', message: `${envVar} is set`, required }
  }
  return { name, status: required ? 'error' : 'warning', message: `${envVar} is not set${required ? '. Add it to .env.local' : ' (optional)'}`, required }
}

async function checkNodeVersion(): Promise<Check> {
  const version = process.versions.node
  const major = parseInt(version.split('.')[0])
  if (major >= 20) {
    return { name: 'Node.js', status: 'ok', message: `v${version} (>= 20 required)`, required: true }
  }
  return { name: 'Node.js', status: 'error', message: `v${version} — Node.js >= 20 is required`, required: true }
}

async function checkDocker(): Promise<Check> {
  try {
    const output = await execPromise('docker --version')
    return { name: 'Docker', status: 'ok', message: output, required: false }
  } catch {
    return { name: 'Docker', status: 'warning', message: 'Docker is not available. Install Docker to use containerized features.', required: false }
  }
}

async function checkRedis(): Promise<Check> {
  const url = process.env.REDIS_URL
  let host = 'localhost'
  let port = 6379
  if (url) {
    const parsed = parseUrl(url)
    if (parsed) { host = parsed.host; port = parsed.port }
  }
  const reachable = await tryTcpConnect(host, port)
  if (reachable) {
    return { name: 'Redis', status: 'ok', message: `Reachable at ${host}:${port}`, required: false }
  }
  return { name: 'Redis', status: 'warning', message: `Cannot connect to Redis at ${host}:${port}. Set REDIS_URL or start Redis.`, required: false }
}

async function checkPostgres(): Promise<Check> {
  const url = process.env.DATABASE_URL
  if (!url) {
    return { name: 'PostgreSQL', status: 'warning', message: 'DATABASE_URL is not set. Set it to enable database features.', required: false }
  }
  const parsed = parseUrl(url)
  if (!parsed) {
    return { name: 'PostgreSQL', status: 'warning', message: 'DATABASE_URL is not a valid URL', required: false }
  }
  const reachable = await tryTcpConnect(parsed.host, parsed.port || 5432)
  if (reachable) {
    return { name: 'PostgreSQL', status: 'ok', message: `Reachable at ${parsed.host}:${parsed.port || 5432}`, required: false }
  }
  return { name: 'PostgreSQL', status: 'warning', message: `Cannot connect to PostgreSQL at ${parsed.host}:${parsed.port || 5432}`, required: false }
}

export async function GET() {
  const checks = await Promise.all([
    checkOpenRouterKey(),
    checkEnvKey('Anthropic API Key', 'ANTHROPIC_API_KEY', false),
    checkEnvKey('OpenAI API Key', 'OPENAI_API_KEY', false),
    checkEnvKey('Auth Secret', 'AUTH_SECRET', true),
    checkNodeVersion(),
    checkDocker(),
    checkRedis(),
    checkPostgres(),
  ])

  const hasRequiredError = checks.some(c => c.required && c.status === 'error')
  const hasWarning = checks.some(c => c.status === 'warning' || (!c.required && c.status === 'error'))

  const status = hasRequiredError ? 'unhealthy' : hasWarning ? 'degraded' : 'healthy'

  return NextResponse.json({ status, checks })
}
