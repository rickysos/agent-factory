import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { authStore } from '@/lib/auth-store'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as { id: string }).id
  const user = authStore.findById(userId)
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const keys = user.apiKeys.map(k => ({
    id: k.id,
    name: k.name,
    prefix: k.key.substring(0, 10) + '...',
    createdAt: k.createdAt,
    lastUsed: k.lastUsed,
  }))

  return NextResponse.json({ success: true, data: keys })
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { name } = await request.json()
  if (!name) {
    return NextResponse.json({ error: 'Key name is required' }, { status: 400 })
  }

  const userId = (session.user as { id: string }).id
  const apiKey = authStore.generateApiKey(userId, name)
  if (!apiKey) {
    return NextResponse.json({ error: 'Failed to generate key' }, { status: 500 })
  }

  return NextResponse.json({ success: true, data: apiKey }, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const keyId = searchParams.get('id')
  if (!keyId) {
    return NextResponse.json({ error: 'Key ID is required' }, { status: 400 })
  }

  const userId = (session.user as { id: string }).id
  const deleted = authStore.deleteApiKey(userId, keyId)
  if (!deleted) {
    return NextResponse.json({ error: 'Key not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
