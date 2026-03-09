import { NextResponse } from 'next/server'
import { getProviderStatus } from '@/lib/provider-registry'

export async function GET() {
  const statuses = getProviderStatus()

  const result = statuses.map(({ provider, configured }) => ({
    id: provider.id,
    name: provider.name,
    configured,
    envVar: provider.envVar,
    models: provider.models.map(m => ({
      id: m.id,
      name: m.name,
      free: m.free,
      capabilities: m.capabilities,
    })),
  }))

  return NextResponse.json({ providers: result })
}
