import { NextRequest, NextResponse } from 'next/server'
import { evalStore } from '@/lib/eval-store'

export async function POST(
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

  const run = evalStore.createRun(id, suite.agentId)
  if (!run) {
    return NextResponse.json(
      { success: false, error: 'Failed to create run' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, data: run }, { status: 201 })
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const runs = evalStore.getRuns(id)
  return NextResponse.json({ success: true, data: runs })
}
