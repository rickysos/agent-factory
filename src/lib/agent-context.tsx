'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react'
import { Agent } from './agent-types'

export type { Agent }

interface AgentContextType {
  agents: Agent[]
  addAgent: (agent: Omit<Agent, 'id' | 'createdAt' | 'deployments' | 'autonomyLevel'> & { autonomyLevel?: Agent['autonomyLevel'] }) => Promise<void>
  updateAgent: (id: string, updates: Partial<Agent>) => Promise<void>
  deleteAgent: (id: string) => Promise<void>
  deployAgent: (id: string) => Promise<void>
  isLoading: boolean
  connected: boolean
  refreshAgents: () => Promise<void>
}

const AgentContext = createContext<AgentContextType | undefined>(undefined)

export function AgentProvider({ children }: { children: ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [connected, setConnected] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)

  const refreshAgents = useCallback(async () => {
    const res = await fetch('/api/agents')
    const json = await res.json()
    if (json.success) {
      setAgents(json.data)
    }
  }, [])

  useEffect(() => {
    refreshAgents()
  }, [refreshAgents])

  useEffect(() => {
    const es = new EventSource('/api/events')
    eventSourceRef.current = es

    es.onopen = () => setConnected(true)
    es.onerror = () => setConnected(false)

    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        if (msg.event === 'agent:created' || msg.event === 'agent:updated' || msg.event === 'agent:deployed') {
          setAgents(prev => {
            const exists = prev.find(a => a.id === msg.data.id)
            if (exists) return prev.map(a => a.id === msg.data.id ? msg.data : a)
            return [...prev, msg.data]
          })
        } else if (msg.event === 'agent:deleted') {
          setAgents(prev => prev.filter(a => a.id !== msg.data.id))
        }
      } catch { /* ignore parse errors */ }
    }

    return () => {
      es.close()
      eventSourceRef.current = null
    }
  }, [])

  const addAgent = async (agentData: Omit<Agent, 'id' | 'createdAt' | 'deployments' | 'autonomyLevel'> & { autonomyLevel?: Agent['autonomyLevel'] }) => {
    const res = await fetch('/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agentData),
    })
    const json = await res.json()
    if (json.success) {
      setAgents(prev => [...prev, json.data])
    }
  }

  const updateAgent = async (id: string, updates: Partial<Agent>) => {
    const res = await fetch(`/api/agents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    const json = await res.json()
    if (json.success) {
      setAgents(prev => prev.map(a => a.id === id ? json.data : a))
    }
  }

  const deleteAgent = async (id: string) => {
    const res = await fetch(`/api/agents/${id}`, { method: 'DELETE' })
    const json = await res.json()
    if (json.success) {
      setAgents(prev => prev.filter(a => a.id !== id))
    }
  }

  const deployAgent = async (id: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/agents/${id}/deploy`, { method: 'POST' })
      const json = await res.json()
      if (json.success) {
        setAgents(prev => prev.map(a => a.id === id ? json.data : a))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AgentContext.Provider value={{
      agents,
      addAgent,
      updateAgent,
      deleteAgent,
      deployAgent,
      isLoading,
      connected,
      refreshAgents,
    }}>
      {children}
    </AgentContext.Provider>
  )
}

export function useAgents() {
  const context = useContext(AgentContext)
  if (context === undefined) {
    throw new Error('useAgents must be used within an AgentProvider')
  }
  return context
}
