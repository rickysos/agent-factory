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
  return NextResponse.json({ success: true, data: trigger })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const trigger = triggerStore.update(id, body)
  if (!trigger) {
    return NextResponse.json(
      { success: false, error: 'Trigger not found' },
      { status: 404 }
    )
  }
  return NextResponse.json({ success: true, data: trigger })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const deleted = triggerStore.delete(id)
  if (!deleted) {
    return NextResponse.json(
      { success: false, error: 'Trigger not found' },
      { status: 404 }
    )
  }
  return NextResponse.json({ success: true })
}
