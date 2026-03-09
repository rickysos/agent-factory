import { NextRequest, NextResponse } from 'next/server'
import { triggerStore } from '@/lib/trigger-store'

export async function GET() {
  const triggers = triggerStore.getAll()
  return NextResponse.json({ success: true, data: triggers })
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  if (!body.agentId || !body.type || !body.name) {
    return NextResponse.json(
      { success: false, error: 'agentId, type, and name are required' },
      { status: 400 }
    )
  }

  const trigger = triggerStore.create({
    agentId: body.agentId,
    type: body.type,
    name: body.name,
    status: body.status || 'active',
    config: body.config || {},
    secret: body.secret,
  })

  return NextResponse.json({ success: true, data: trigger }, { status: 201 })
}
