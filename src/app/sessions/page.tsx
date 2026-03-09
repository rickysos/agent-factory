'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

interface Session {
  id: string
  agentId: string
  agentName: string
  title: string
  messages: Message[]
  createdAt: string
  updatedAt: string
}

const sampleSessions: Session[] = [
  {
    id: 'sess-001',
    agentId: '3',
    agentName: 'Code Reviewer',
    title: 'PR #482 Security Review',
    createdAt: '2026-03-09T14:30:00Z',
    updatedAt: '2026-03-09T14:32:18Z',
    messages: [
      { role: 'user', content: 'Review PR #482 for security issues. Focus on authentication and input validation.', timestamp: '2026-03-09T14:30:00Z' },
      { role: 'assistant', content: 'I\'ll review PR #482 focusing on security. Let me examine the changed files.', timestamp: '2026-03-09T14:30:01Z' },
      { role: 'assistant', content: 'Found 3 changed files: auth.ts, middleware.ts, api/login.ts. Analyzing each for vulnerabilities.', timestamp: '2026-03-09T14:30:05Z' },
      { role: 'assistant', content: 'Critical findings:\n1. SQL injection in src/api/login.ts:34 - uses string interpolation in SQL query\n2. Hardcoded JWT secret in src/auth.ts:12 - should use environment variable\n\nRecommendation: Block merge until these are fixed.', timestamp: '2026-03-09T14:32:18Z' },
    ],
  },
  {
    id: 'sess-002',
    agentId: '2',
    agentName: 'Content Generator',
    title: 'Daily Metrics ETL',
    createdAt: '2026-03-09T13:00:00Z',
    updatedAt: '2026-03-09T13:00:12Z',
    messages: [
      { role: 'user', content: 'Run daily ETL for user metrics (2026-03-09).', timestamp: '2026-03-09T13:00:00Z' },
      { role: 'assistant', content: 'Starting daily ETL pipeline. Extracting from events table.', timestamp: '2026-03-09T13:00:01Z' },
      { role: 'assistant', content: 'Extracted 48,291 events. Transforming into metric buckets.', timestamp: '2026-03-09T13:00:05Z' },
      { role: 'assistant', content: 'ETL complete. Processed 48,291 events into 12 metric buckets. Output written to s3://analytics/2026-03-09.parquet', timestamp: '2026-03-09T13:00:12Z' },
    ],
  },
  {
    id: 'sess-003',
    agentId: '1',
    agentName: 'Support Bot',
    title: 'Ticket #1094 - Billing Issue',
    createdAt: '2026-03-09T10:40:00Z',
    updatedAt: '2026-03-09T10:45:22Z',
    messages: [
      { role: 'user', content: 'Handle ticket #1094: Customer reports being charged twice for monthly subscription.', timestamp: '2026-03-09T10:40:00Z' },
      { role: 'assistant', content: 'Looking up customer billing history for ticket #1094.', timestamp: '2026-03-09T10:40:02Z' },
      { role: 'assistant', content: 'Confirmed: Two identical charges of $49.99 on 2026-03-07 for customer Jane Doe (cust_8821). One is a duplicate.', timestamp: '2026-03-09T10:40:08Z' },
      { role: 'assistant', content: 'Refund of $49.99 issued (ref_3391). Customer notified via email. Ticket #1094 resolved.', timestamp: '2026-03-09T10:45:22Z' },
    ],
  },
  {
    id: 'sess-004',
    agentId: '1',
    agentName: 'Support Bot',
    title: 'Deploy v2.4.1 to Staging',
    createdAt: '2026-03-09T11:15:44Z',
    updatedAt: '2026-03-09T11:18:00Z',
    messages: [
      { role: 'user', content: 'Deploy v2.4.1 to staging environment.', timestamp: '2026-03-09T11:15:44Z' },
      { role: 'assistant', content: 'Checking out tag v2.4.1 and running test suite.', timestamp: '2026-03-09T11:15:45Z' },
      { role: 'assistant', content: 'Test suite failed: 341/342 passed, 1 failure in integration/payments.test.ts. Aborting deploy.', timestamp: '2026-03-09T11:18:00Z' },
    ],
  },
  {
    id: 'sess-005',
    agentId: '2',
    agentName: 'Content Generator',
    title: 'Blog Post: AI Agents in Production',
    createdAt: '2026-03-09T15:30:00Z',
    updatedAt: '2026-03-09T15:32:00Z',
    messages: [
      { role: 'user', content: 'Write a 1500-word blog post about AI agents in production environments.', timestamp: '2026-03-09T15:30:00Z' },
      { role: 'assistant', content: 'Researching current state of AI agents in production. Gathering data points and references.', timestamp: '2026-03-09T15:30:05Z' },
      { role: 'assistant', content: 'Compiled 8 key points. Drafting article structure with introduction, 4 main sections, and conclusion.', timestamp: '2026-03-09T15:32:00Z' },
    ],
  },
]

const uniqueAgents = Array.from(new Map(sampleSessions.map(s => [s.agentId, { id: s.agentId, name: s.agentName }])).values())

export default function SessionsPage() {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [agentFilter, setAgentFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  const filtered = sampleSessions.filter(s => {
    if (agentFilter !== 'all' && s.agentId !== agentFilter) return false
    if (search && !s.title.toLowerCase().includes(search.toLowerCase()) && !s.agentName.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-forge-800 dark:text-forge-100">Sessions</h1>
        <p className="text-forge-500 dark:text-forge-400 mt-2">View chat sessions and message history for all agents.</p>
      </div>

      {!selectedSession ? (
        <>
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <input
              type="text"
              placeholder="Search sessions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-3 py-1.5 text-sm rounded border border-forge-200 dark:border-forge-700 bg-forge-50 dark:bg-forge-850 text-forge-600 dark:text-forge-200 w-64"
            />
            <select
              value={agentFilter}
              onChange={e => setAgentFilter(e.target.value)}
              className="px-3 py-1.5 text-sm font-medium rounded border border-forge-200 dark:border-forge-700 bg-forge-50 dark:bg-forge-850 text-forge-600 dark:text-forge-200"
            >
              <option value="all">All Agents</option>
              {uniqueAgents.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-forge-400 dark:text-forge-500">No sessions found.</div>
          ) : (
            <div className="space-y-3">
              {filtered.map(session => (
                <button
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className="w-full bg-forge-50 dark:bg-forge-900 rounded-md  border border-forge-200 dark:border-forge-700 px-6 py-4 flex items-center justify-between text-left hover:bg-forge-100 dark:hover:bg-forge-850/50 transition"
                >
                  <div>
                    <p className="font-semibold text-forge-800 dark:text-forge-100">{session.title}</p>
                    <p className="text-sm text-forge-400 dark:text-forge-500 mt-0.5">
                      {session.agentName} -- {session.messages.length} message{session.messages.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-forge-500 dark:text-forge-400">
                      {new Date(session.createdAt).toLocaleString()}
                    </p>
                    <p className="text-xs text-forge-300 dark:text-forge-400 mt-0.5">
                      Updated {new Date(session.updatedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setSelectedSession(null)}
              className="text-sm text-forge-400 dark:text-forge-500 hover:text-forge-600 dark:hover:text-forge-200 flex items-center gap-1 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to sessions
            </button>
            <Link
              href={`/chat/${selectedSession.agentId}`}
              className="px-3 py-1.5 text-sm font-medium rounded bg-accent-500 text-forge-950 hover:bg-accent-400 transition"
            >
              Open in Chat
            </Link>
          </div>

          <div className="bg-forge-50 dark:bg-forge-900 rounded-md  border border-forge-200 dark:border-forge-700 p-6 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-forge-800 dark:text-forge-100">{selectedSession.title}</h2>
              <span className="text-sm text-forge-400 dark:text-forge-500">{selectedSession.id}</span>
            </div>
            <p className="text-sm text-forge-400 dark:text-forge-500">
              {selectedSession.agentName} -- {new Date(selectedSession.createdAt).toLocaleString()} - {new Date(selectedSession.updatedAt).toLocaleTimeString()}
            </p>
          </div>

          <div className="space-y-3">
            {selectedSession.messages.map((msg, i) => (
              <div
                key={i}
                className={`rounded-md p-4 ${
                  msg.role === 'user'
                    ? 'bg-accent-500/10 dark:bg-accent-900/20 border border-accent-500/20'
                    : msg.role === 'system'
                    ? 'bg-forge-100 dark:bg-forge-850 border border-forge-200 dark:border-forge-700'
                    : 'bg-forge-50 dark:bg-forge-900 border border-forge-200 dark:border-forge-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                    msg.role === 'user'
                      ? 'bg-accent-500/10 text-accent-600 dark:bg-accent-500/10 dark:text-accent-400'
                      : msg.role === 'system'
                      ? 'bg-forge-200 text-forge-500 dark:bg-forge-700 dark:text-forge-300'
                      : 'bg-accent-500/10 text-accent-600 dark:bg-accent-500/10 dark:text-accent-400'
                  }`}>
                    {msg.role}
                  </span>
                  <span className="text-xs text-forge-300 dark:text-forge-400">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                </div>
                <pre className="whitespace-pre-wrap text-sm text-forge-700 dark:text-forge-200 font-sans leading-relaxed">{msg.content}</pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
