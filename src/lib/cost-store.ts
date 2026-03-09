import { eventBus } from './event-bus'

export interface UsageRecord {
  id: string
  agentId: string
  sessionId: string
  model: string
  provider: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  cost: number
  timestamp: Date
}

interface ModelPricing {
  promptCostPer1k: number
  completionCostPer1k: number
}

export const MODEL_PRICING: Map<string, ModelPricing> = new Map([
  ['arcee-ai/trinity-large-preview:free', { promptCostPer1k: 0, completionCostPer1k: 0 }],
  ['gpt-4o', { promptCostPer1k: 0.0025, completionCostPer1k: 0.01 }],
  ['gpt-4o-mini', { promptCostPer1k: 0.00015, completionCostPer1k: 0.0006 }],
  ['claude-sonnet-4-20250514', { promptCostPer1k: 0.003, completionCostPer1k: 0.015 }],
  ['claude-haiku-4-5-20251001', { promptCostPer1k: 0.0008, completionCostPer1k: 0.004 }],
])

export function calculateCost(model: string, promptTokens: number, completionTokens: number): number {
  const pricing = MODEL_PRICING.get(model)
  if (!pricing) return 0
  return (promptTokens / 1000) * pricing.promptCostPer1k + (completionTokens / 1000) * pricing.completionCostPer1k
}

let records: UsageRecord[] = []
let nextId = 1

export const costStore = {
  recordUsage(data: Omit<UsageRecord, 'id' | 'timestamp'>): UsageRecord {
    const record: UsageRecord = {
      ...data,
      id: String(nextId++),
      timestamp: new Date(),
    }
    records.push(record)
    eventBus.emit('usage:recorded', record)
    return record
  },

  getUsageByAgent(agentId: string): UsageRecord[] {
    return records.filter(r => r.agentId === agentId)
  },

  getUsageBySession(sessionId: string): UsageRecord[] {
    return records.filter(r => r.sessionId === sessionId)
  },

  getTotalCost(since?: Date): number {
    const filtered = since ? records.filter(r => r.timestamp >= since) : records
    return filtered.reduce((sum, r) => sum + r.cost, 0)
  },

  getDailyCosts(days: number): { date: string; cost: number; tokens: number; requests: number }[] {
    const result: Map<string, { cost: number; tokens: number; requests: number }> = new Map()
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)

    for (const r of records) {
      if (r.timestamp < cutoff) continue
      const date = r.timestamp.toISOString().slice(0, 10)
      const entry = result.get(date) || { cost: 0, tokens: 0, requests: 0 }
      entry.cost += r.cost
      entry.tokens += r.totalTokens
      entry.requests++
      result.set(date, entry)
    }

    return Array.from(result.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))
  },

  getModelBreakdown(): { model: string; requests: number; totalTokens: number; cost: number }[] {
    const byModel: Map<string, { requests: number; totalTokens: number; cost: number }> = new Map()

    for (const r of records) {
      const entry = byModel.get(r.model) || { requests: 0, totalTokens: 0, cost: 0 }
      entry.requests++
      entry.totalTokens += r.totalTokens
      entry.cost += r.cost
      byModel.set(r.model, entry)
    }

    return Array.from(byModel.entries())
      .map(([model, data]) => ({ model, ...data }))
      .sort((a, b) => b.cost - a.cost)
  },

  getAll(): UsageRecord[] {
    return records
  },
}
