import { NextRequest, NextResponse } from 'next/server'
import { agentStore } from '@/lib/agent-store'

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
  return NextResponse.json({ success: true, data: agent })
}
