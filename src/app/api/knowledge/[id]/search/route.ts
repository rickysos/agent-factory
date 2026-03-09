import { NextResponse } from 'next/server'
import { search, getKnowledgeBase } from '@/lib/knowledge-store'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!getKnowledgeBase(id)) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query') || ''
  if (!query.trim()) return NextResponse.json([])
  return NextResponse.json(search(id, query))
}
