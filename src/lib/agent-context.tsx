'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface Agent {
  id: string
  name: string
  description: string
  model: string
  status: 'draft' | 'active' | 'inactive' | 'error'
  capabilities: string[]
  createdAt: Date
  lastDeployed?: Date
  deployments: number
}

interface AgentContextType {
  agents: Agent[]
  addAgent: (agent: Omit<Agent, 'id' | 'createdAt' | 'deployments'>) => void
  updateAgent: (id: string, updates: Partial<Agent>) => void
  deleteAgent: (id: string) => void
  deployAgent: (id: string) => Promise<void>
  isLoading: boolean
}

const AgentContext = createContext<AgentContextType | undefined>(undefined)

// Mock initial agents
const initialAgents: Agent[] = [
  {
    id: '1',
    name: 'Support Bot',
    description: 'Handles customer support inquiries',
    model: 'gpt-4',
    status: 'active',
    capabilities: ['Q&A', 'Ticket Creation', 'Escalation'],
    createdAt: new Date('2026-03-01'),
    lastDeployed: new Date('2026-03-08'),
    deployments: 3,
  },
  {
    id: '2',
    name: 'Content Generator',
    description: 'Creates blog posts and social media content',
    model: 'claude-3',
    status: 'active',
    capabilities: ['Content Writing', 'SEO Optimization', 'Social Media'],
    createdAt: new Date('2026-03-05'),
    lastDeployed: new Date('2026-03-07'),
    deployments: 2,
  },
  {
    id: '3',
    name: 'Code Reviewer',
    description: 'Reviews pull requests and suggests improvements',
    model: 'deepseek-coder',
    status: 'draft',
    capabilities: ['Code Analysis', 'Security Review', 'Best Practices'],
    createdAt: new Date('2026-03-08'),
    deployments: 0,
  },
]

export function AgentProvider({ children }: { children: ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>(initialAgents)
  const [isLoading, setIsLoading] = useState(false)

  const addAgent = (agentData: Omit<Agent, 'id' | 'createdAt' | 'deployments'>) => {
    const newAgent: Agent = {
      ...agentData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      deployments: 0,
    }
    setAgents([...agents, newAgent])
  }

  const updateAgent = (id: string, updates: Partial<Agent>) => {
    setAgents(agents.map(agent => 
      agent.id === id ? { ...agent, ...updates } : agent
    ))
  }

  const deleteAgent = (id: string) => {
    setAgents(agents.filter(agent => agent.id !== id))
  }

  const deployAgent = async (id: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setAgents(agents.map(agent => 
        agent.id === id 
          ? { 
              ...agent, 
              status: 'active' as const,
              lastDeployed: new Date(),
              deployments: agent.deployments + 1
            } 
          : agent
      ))
    } catch (error) {
      console.error('Deployment failed:', error)
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
      isLoading 
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