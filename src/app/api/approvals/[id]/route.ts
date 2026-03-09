import { NextRequest, NextResponse } from 'next/server'
import { approvalStore } from '@/lib/approval-store'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  if (!body.status || !['approved', 'rejected'].includes(body.status)) {
    return NextResponse.json(
      { success: false, error: 'status must be "approved" or "rejected"' },
      { status: 400 }
    )
  }

  const approval = approvalStore.resolve(id, body.status, body.resolvedBy)
  if (!approval) {
    return NextResponse.json(
      { success: false, error: 'Approval not found or already resolved' },
      { status: 404 }
    )
  }

  return NextResponse.json({ success: true, data: approval })
}
