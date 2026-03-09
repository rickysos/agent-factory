import { NextResponse } from 'next/server'
import { getDocuments, addDocument, getKnowledgeBase } from '@/lib/knowledge-store'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!getKnowledgeBase(id)) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(getDocuments(id))
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { title, content, type } = await request.json()
  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
  }
  const validTypes = ['text', 'markdown', 'url'] as const
  const docType = validTypes.includes(type) ? type : 'text'
  const doc = addDocument(id, title.trim(), content.trim(), docType)
  if (!doc) return NextResponse.json({ error: 'Knowledge base not found' }, { status: 404 })
  return NextResponse.json(doc, { status: 201 })
}
