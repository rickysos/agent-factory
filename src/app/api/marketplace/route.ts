import { NextRequest, NextResponse } from 'next/server'
import { marketplaceStore } from '@/lib/marketplace-store'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const type = searchParams.get('type') as 'agent' | 'workflow' | 'skill' | null
  const search = searchParams.get('search')
  const featured = searchParams.get('featured')

  let results = marketplaceStore.getAll()

  if (featured === 'true') {
    results = marketplaceStore.getFeatured()
  }
  if (category) {
    results = results.filter(l => l.category === category)
  }
  if (type) {
    results = results.filter(l => l.type === type)
  }
  if (search) {
    const q = search.toLowerCase()
    results = results.filter(l =>
      l.name.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q) ||
      l.tags.some(t => t.toLowerCase().includes(q))
    )
  }

  return NextResponse.json({ success: true, data: results })
}
