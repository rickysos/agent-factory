import { NextRequest, NextResponse } from 'next/server'
import { triggerStore } from '@/lib/trigger-store'

export async function GET(
  _request: NextRequest,
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

  const executions = triggerStore.getExecutions(id)
  return NextResponse.json({ success: true, data: executions })
}
