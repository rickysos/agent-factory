import { NextRequest, NextResponse } from 'next/server'
import { agentStore } from '@/lib/agent-store'

export async function GET() {
  const agents = agentStore.getAll()
  return NextResponse.json({ success: true, data: agents })
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  if (!body.name || !body.model) {
    return NextResponse.json(
      { success: false, error: 'Name and model are required' },
      { status: 400 }
    )
  }

  const agent = agentStore.create({
    name: body.name,
    description: body.description || '',
    model: body.model,
    status: body.status || 'draft',
    capabilities: body.capabilities || [],
  })

  return NextResponse.json({ success: true, data: agent }, { status: 201 })
}
