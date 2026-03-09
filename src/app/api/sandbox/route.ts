import { NextRequest, NextResponse } from 'next/server'
import { sandboxStore } from '@/lib/sandbox-store'

export async function GET(request: NextRequest) {
  const agentId = request.nextUrl.searchParams.get('agentId')
  const executions = agentId
    ? sandboxStore.getByAgent(agentId)
    : sandboxStore.getAll()
  return NextResponse.json({ success: true, data: executions })
}
