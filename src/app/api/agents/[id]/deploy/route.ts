import { NextRequest, NextResponse } from 'next/server'
import { agentStore } from '@/lib/agent-store'
import { agentRuntime } from '@/lib/agent-runtime'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const agent = agentStore.deploy(id)
  if (!agent) {
    return NextResponse.json(
      { success: false, error: 'Agent not found' },
      { status: 404 }
    )
  }

  // Auto-start agent runtime on deploy
  try {
    await agentRuntime.start(id)
  } catch {
    // non-fatal — agent is deployed even if runtime fails to start
  }

  return NextResponse.json({ success: true, data: agent })
}
