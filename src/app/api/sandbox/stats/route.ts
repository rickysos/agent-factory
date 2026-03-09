import { NextResponse } from 'next/server'
import { sandboxStore } from '@/lib/sandbox-store'

export async function GET() {
  return NextResponse.json({ success: true, data: sandboxStore.getStats() })
}
