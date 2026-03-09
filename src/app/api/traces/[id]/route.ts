import { NextRequest, NextResponse } from 'next/server'
import { traceStore } from '@/lib/trace-store'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const trace = traceStore.getTrace(id)
  if (!trace) {
    return NextResponse.json({ success: false, error: 'Trace not found' }, { status: 404 })
  }
  return NextResponse.json({ success: true, data: trace })
}
