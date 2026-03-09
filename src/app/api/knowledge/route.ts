import { NextResponse } from 'next/server'
import { getKnowledgeBases, createKnowledgeBase } from '@/lib/knowledge-store'

export async function GET() {
  return NextResponse.json(getKnowledgeBases())
}

export async function POST(request: Request) {
  const { name, description } = await request.json()
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }
  const kb = createKnowledgeBase(name.trim(), (description || '').trim())
  return NextResponse.json(kb, { status: 201 })
}
