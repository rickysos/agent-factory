import { NextResponse } from 'next/server'
import { mcpRegistry } from '@/lib/mcp-registry'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const server = mcpRegistry.getById(id)
  if (!server) {
    return NextResponse.json({ success: false, error: 'Server not found' }, { status: 404 })
  }
  return NextResponse.json({ success: true, data: server })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const deleted = mcpRegistry.remove(id)
  if (!deleted) {
    return NextResponse.json({ success: false, error: 'Server not found' }, { status: 404 })
  }
  return NextResponse.json({ success: true })
}
