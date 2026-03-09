import { NextRequest, NextResponse } from 'next/server'
import { sandboxStore } from '@/lib/sandbox-store'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const execution = sandboxStore.getById(id)
  if (!execution) {
    return NextResponse.json(
      { success: false, error: 'Execution not found' },
      { status: 404 }
    )
  }
  return NextResponse.json({ success: true, data: execution })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cancelled = sandboxStore.cancel(id)
  if (!cancelled) {
    return NextResponse.json(
      { success: false, error: 'Execution not found or not running' },
      { status: 404 }
    )
  }
  return NextResponse.json({ success: true })
}
