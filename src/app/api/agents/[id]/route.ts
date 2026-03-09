import { NextRequest, NextResponse } from 'next/server'
import { agentStore } from '@/lib/agent-store'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const agent = agentStore.getById(id)
  if (!agent) {
    return NextResponse.json(
      { success: false, error: 'Agent not found' },
      { status: 404 }
    )
  }
  return NextResponse.json({ success: true, data: agent })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const agent = agentStore.update(id, body)
  if (!agent) {
    return NextResponse.json(
      { success: false, error: 'Agent not found' },
      { status: 404 }
    )
  }
  return NextResponse.json({ success: true, data: agent })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const deleted = agentStore.delete(id)
  if (!deleted) {
    return NextResponse.json(
      { success: false, error: 'Agent not found' },
      { status: 404 }
    )
  }
  return NextResponse.json({ success: true })
}
