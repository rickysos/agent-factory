import { costStore } from '@/lib/cost-store'
import { agentStore } from '@/lib/agent-store'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const agentId = searchParams.get('agentId')
  const days = parseInt(searchParams.get('days') || '7', 10)

  const allRecords = agentId
    ? costStore.getUsageByAgent(agentId)
    : costStore.getAll()

  const since = new Date()
  since.setDate(since.getDate() - days)
  const filtered = allRecords.filter(r => r.timestamp >= since)

  const totalCost = filtered.reduce((s, r) => s + r.cost, 0)
  const totalTokens = filtered.reduce((s, r) => s + r.totalTokens, 0)

  // By agent
  const agentMap = new Map<string, { tokens: number; cost: number; requests: number; lastUsed: Date }>()
  for (const r of filtered) {
    const entry = agentMap.get(r.agentId) || { tokens: 0, cost: 0, requests: 0, lastUsed: new Date(0) }
    entry.tokens += r.totalTokens
    entry.cost += r.cost
    entry.requests++
    if (r.timestamp > entry.lastUsed) entry.lastUsed = r.timestamp
    agentMap.set(r.agentId, entry)
  }
  const byAgent = Array.from(agentMap.entries()).map(([id, data]) => {
    const agent = agentStore.getById(id)
    return { agentId: id, agentName: agent?.name || id, ...data }
  })

  const byModel = costStore.getModelBreakdown()
  const daily = costStore.getDailyCosts(days)

  return Response.json({
    totalCost,
    totalTokens,
    byAgent,
    byModel,
    daily,
  })
}
