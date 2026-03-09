import { NextResponse } from 'next/server'
import { getKnowledgeBase, deleteKnowledgeBase } from '@/lib/knowledge-store'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const kb = getKnowledgeBase(id)
  if (!kb) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(kb)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const deleted = deleteKnowledgeBase(id)
  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
