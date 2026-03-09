import { NextRequest, NextResponse } from 'next/server'
import { triggerStore } from '@/lib/trigger-store'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const trigger = triggerStore.getById(id)

  if (!trigger) {
    return NextResponse.json(
      { success: false, error: 'Webhook not found' },
      { status: 404 }
    )
  }

  if (trigger.type !== 'webhook') {
    return NextResponse.json(
      { success: false, error: 'Trigger is not a webhook' },
      { status: 400 }
    )
  }

  if (trigger.status !== 'active') {
    return NextResponse.json(
      { success: false, error: 'Webhook is not active' },
      { status: 400 }
    )
  }

  const body = await request.json().catch(() => ({}))
  const execution = triggerStore.fire(id, body)

  return NextResponse.json({ success: true, data: { executionId: execution!.id } })
}
