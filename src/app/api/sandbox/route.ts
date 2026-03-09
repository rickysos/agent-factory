import { NextRequest, NextResponse } from 'next/server'
import { execute, getRecent } from '@/lib/sandbox-store'

export async function POST(request: NextRequest) {
  try {
    const { language, code } = await request.json()

    if (!language || !code) {
      return NextResponse.json({ error: 'language and code are required' }, { status: 400 })
    }

    if (language !== 'javascript' && language !== 'python') {
      return NextResponse.json({ error: 'Unsupported language' }, { status: 400 })
    }

    if (code.length > 50000) {
      return NextResponse.json({ error: 'Code too long (max 50000 chars)' }, { status: 400 })
    }

    const result = execute(language, code)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  const recent = getRecent(20)
  return NextResponse.json(recent)
}
