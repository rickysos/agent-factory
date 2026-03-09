import { NextRequest, NextResponse } from 'next/server'
import { evalStore } from '@/lib/eval-store'

export async function GET(request: NextRequest) {
  const agentId = request.nextUrl.searchParams.get('agentId') || undefined
  const suites = evalStore.getSuites(agentId)
  return NextResponse.json({ success: true, data: suites })
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  if (!body.name || !body.agentId || !body.testCases?.length) {
    return NextResponse.json(
      { success: false, error: 'Name, agentId, and at least one test case are required' },
      { status: 400 }
    )
  }

  const suite = evalStore.createSuite({
    name: body.name,
    description: body.description || '',
    agentId: body.agentId,
    testCases: body.testCases,
  })

  return NextResponse.json({ success: true, data: suite }, { status: 201 })
}
