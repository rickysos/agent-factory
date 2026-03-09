import { NextRequest, NextResponse } from 'next/server'
import { approvalStore } from '@/lib/approval-store'

export async function GET(request: NextRequest) {
  const agentId = request.nextUrl.searchParams.get('agentId') || undefined
  const pending = approvalStore.getPending(agentId)
  return NextResponse.json({ success: true, data: pending })
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  if (!body.agentId || !body.action || !body.description) {
    return NextResponse.json(
      { success: false, error: 'agentId, action, and description are required' },
      { status: 400 }
    )
  }

  const approval = approvalStore.createApproval({
    agentId: body.agentId,
    sessionId: body.sessionId || '',
    action: body.action,
    description: body.description,
    risk: body.risk || 'medium',
  })

  return NextResponse.json({ success: true, data: approval }, { status: 201 })
}
