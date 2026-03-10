import { NextRequest, NextResponse } from 'next/server'
import { agentRuntime } from '@/lib/agent-runtime'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const proc = await agentRuntime.start(id)
    return NextResponse.json({ success: true, data: proc })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to start'
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}
