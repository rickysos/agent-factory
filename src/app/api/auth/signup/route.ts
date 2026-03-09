import { NextRequest, NextResponse } from 'next/server'
import { authStore } from '@/lib/auth-store'

export async function POST(request: NextRequest) {
  const { email, password, name } = await request.json()

  if (!email || !password || !name) {
    return NextResponse.json({ error: 'Email, password, and name are required' }, { status: 400 })
  }

  if (authStore.findByEmail(email)) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
  }

  const user = authStore.createUser(email, password, name)
  return NextResponse.json({
    success: true,
    data: { id: user.id, email: user.email, name: user.name, role: user.role },
  }, { status: 201 })
}
