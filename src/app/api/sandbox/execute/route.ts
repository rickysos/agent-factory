import { NextRequest, NextResponse } from 'next/server'
import { sandboxStore } from '@/lib/sandbox-store'

export async function POST(request: NextRequest) {
  const body = await request.json()

  if (!body.code || !body.language) {
    return NextResponse.json(
      { success: false, error: 'Code and language are required' },
      { status: 400 }
    )
  }

  const execution = sandboxStore.execute(
    body.code,
    body.language,
    body.agentId,
    {
      ...(body.timeout && { timeout: body.timeout }),
      ...(body.memoryLimit && { memoryLimit: body.memoryLimit }),
    }
  )

  return NextResponse.json({ success: true, data: execution }, { status: 201 })
}
