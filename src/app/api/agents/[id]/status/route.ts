import { NextRequest, NextResponse } from 'next/server'
import { agentRuntime } from '@/lib/agent-runtime'
import { agentStore } from '@/lib/agent-store'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const agent = agentStore.getById(id)
  if (!agent) {
    return NextResponse.json({ success: false, error: 'Agent not found' }, { status: 404 })
  }

  const proc = agentRuntime.getProcess(id)
  return NextResponse.json({
    success: true,
    data: {
      agentId: id,
      runtimeStatus: agentRuntime.getStatus(id),
      uptime: agentRuntime.getUptime(id),
      messagesProcessed: proc?.messagesProcessed || 0,
      pid: proc?.pid,
      startedAt: proc?.startedAt,
      stoppedAt: proc?.stoppedAt,
    },
  })
}
