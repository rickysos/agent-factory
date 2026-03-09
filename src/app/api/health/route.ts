import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  let dependencyStatus: string | null = null
  try {
    const origin = new URL(request.url).origin
    const res = await fetch(`${origin}/api/health/dependencies`, { cache: 'no-store' })
    const data = await res.json()
    dependencyStatus = data.status
  } catch {
    dependencyStatus = 'unknown'
  }

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    dependencies: dependencyStatus,
  })
}
