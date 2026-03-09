import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Auth middleware disabled for development — replace with auth check to re-enable
export function middleware(_req: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
