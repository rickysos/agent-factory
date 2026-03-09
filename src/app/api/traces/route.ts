import { NextRequest, NextResponse } from 'next/server'
import { traceStore } from '@/lib/trace-store'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const agentId = searchParams.get('agentId')
  const limit = parseInt(searchParams.get('limit') || '20', 10)

  const traces = agentId
    ? traceStore.getTraces(agentId).slice(0, limit)
    : traceStore.getRecentTraces(limit)

  return NextResponse.json({ success: true, data: traces })
}
