import { NextRequest, NextResponse } from 'next/server'
import { evalStore } from '@/lib/eval-store'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const suite = evalStore.getSuite(id)
  if (!suite) {
    return NextResponse.json(
      { success: false, error: 'Eval suite not found' },
      { status: 404 }
    )
  }
  return NextResponse.json({ success: true, data: suite })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const deleted = evalStore.deleteSuite(id)
  if (!deleted) {
    return NextResponse.json(
      { success: false, error: 'Eval suite not found' },
      { status: 404 }
    )
  }
  return NextResponse.json({ success: true })
}
