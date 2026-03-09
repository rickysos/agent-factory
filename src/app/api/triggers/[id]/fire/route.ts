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
      { success: false, error: 'Trigger not found' },
      { status: 404 }
    )
  }

  const body = await request.json().catch(() => ({}))
  const execution = triggerStore.fire(id, body)

  return NextResponse.json({ success: true, data: execution })
}
