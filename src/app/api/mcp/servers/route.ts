import { NextRequest, NextResponse } from 'next/server'
import { mcpRegistry } from '@/lib/mcp-registry'

export async function GET() {
  return NextResponse.json({ success: true, data: mcpRegistry.getAll() })
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  if (!body.name || !body.transport) {
    return NextResponse.json(
      { success: false, error: 'Name and transport are required' },
      { status: 400 }
    )
  }

  const server = mcpRegistry.add({
    name: body.name,
    description: body.description || '',
    url: body.url || '',
    transport: body.transport,
    tools: body.tools,
  })

  return NextResponse.json({ success: true, data: server }, { status: 201 })
}
