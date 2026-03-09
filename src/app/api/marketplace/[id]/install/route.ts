import { NextRequest, NextResponse } from 'next/server'
import { marketplaceStore } from '@/lib/marketplace-store'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const agent = marketplaceStore.install(id)

  if (!agent) {
    return NextResponse.json(
      { success: false, error: 'Listing not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({ success: true, data: agent }, { status: 201 })
}
