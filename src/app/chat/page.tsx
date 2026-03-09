'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Agent {
  id: string
  name: string
  model: string
  status: 'active' | 'draft'
  capabilities: string[]
  description: string
}

interface ChatSession {
  id: string
  agentId: string
  agentName: string
  title: string
  messageCount: number
  createdAt: string
  updatedAt: string
}

const fallbackAgents: Agent[] = [
  { id: 'code-reviewer', name: 'Code Reviewer', model: 'claude-opus-4-20250514', status: 'active', capabilities: ['code-analysis', 'security-audit'], description: 'Reviews PRs for bugs and security issues' },
  { id: 'support-agent', name: 'Support Agent', model: 'claude-sonnet-4-20250514', status: 'active', capabilities: ['ticket-handling', 'billing'], description: 'Handles customer support tickets' },
  { id: 'data-pipeline', name: 'Data Pipeline', model: 'claude-sonnet-4-20250514', status: 'draft', capabilities: ['etl', 'sql'], description: 'Runs ETL jobs and data transformations' },
]

const fallbackSessions: ChatSession[] = [
  { id: 'chat-001', agentId: 'code-reviewer', agentName: 'Code Reviewer', title: 'Review auth middleware changes', messageCount: 12, createdAt: '2026-03-09T14:30:00Z', updatedAt: '2026-03-09T14:45:00Z' },
  { id: 'chat-002', agentId: 'code-reviewer', agentName: 'Code Reviewer', title: 'Audit SQL injection vectors', messageCount: 8, createdAt: '2026-03-08T10:00:00Z', updatedAt: '2026-03-08T10:22:00Z' },
  { id: 'chat-003', agentId: 'support-agent', agentName: 'Support Agent', title: 'Duplicate billing charge #1094', messageCount: 6, createdAt: '2026-03-09T10:40:00Z', updatedAt: '2026-03-09T10:45:00Z' },
]

export default function ChatPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [agentsRes, sessionsRes] = await Promise.allSettled([
          fetch('/api/agents'),
          fetch('/api/chat'),
        ])
        const agentsData = agentsRes.status === 'fulfilled' && agentsRes.value.ok
          ? await agentsRes.value.json()
          : fallbackAgents
        const sessionsData = sessionsRes.status === 'fulfilled' && sessionsRes.value.ok
          ? await sessionsRes.value.json()
          : fallbackSessions
        setAgents(Array.isArray(agentsData) ? agentsData : fallbackAgents)
        setSessions(Array.isArray(sessionsData) ? sessionsData : fallbackSessions)
      } catch {
        setAgents(fallbackAgents)
        setSessions(fallbackSessions)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const sessionsByAgent = sessions.reduce<Record<string, ChatSession[]>>((acc, session) => {
    const key = session.agentId
    if (!acc[key]) acc[key] = []
    acc[key].push(session)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            <div className="lg:col-span-2 h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Agent Chat</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Start conversations with your agents or resume previous sessions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Agent list */}
        <div className="col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Agents</h2>
          <div className="space-y-3">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{agent.name}</h3>
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      agent.status === 'active'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {agent.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{agent.description}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">{agent.model}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {agent.capabilities.map((cap) => (
                    <span
                      key={cap}
                      className="px-2 py-0.5 text-xs bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/chat/${agent.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition w-full justify-center"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  New Chat
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recent sessions */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Conversations</h2>
          {sessions.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No conversations yet</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Select an agent and start a new chat to get going.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(sessionsByAgent).map(([agentId, agentSessions]) => (
                <div key={agentId}>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                    {agentSessions[0].agentName}
                  </h3>
                  <div className="space-y-2">
                    {agentSessions.map((session) => (
                      <Link
                        key={session.id}
                        href={`/chat/${session.agentId}?session=${session.id}`}
                        className="block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{session.title}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                              {session.messageCount} messages
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-400 dark:text-gray-500">
                              {new Date(session.updatedAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                              {new Date(session.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
