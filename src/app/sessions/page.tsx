'use client'

import { useState } from 'react'

interface SessionStep {
  type: 'input' | 'thinking' | 'tool_call' | 'output'
  content: string
  timestamp: string
}

interface Session {
  id: string
  agentName: string
  startTime: string
  endTime: string
  steps: SessionStep[]
}

const sampleSessions: Session[] = [
  {
    id: 'sess-001',
    agentName: 'code-reviewer',
    startTime: '2026-03-09T14:30:00Z',
    endTime: '2026-03-09T14:32:18Z',
    steps: [
      { type: 'input', content: 'Review PR #482 for security issues. Focus on authentication and input validation.', timestamp: '2026-03-09T14:30:00Z' },
      { type: 'thinking', content: 'I need to examine the PR diff, focusing on auth-related files. Let me start by listing the changed files.', timestamp: '2026-03-09T14:30:01Z' },
      { type: 'tool_call', content: 'list_pr_files(pr=482) -> ["src/auth.ts", "src/middleware.ts", "src/api/login.ts"]', timestamp: '2026-03-09T14:30:02Z' },
      { type: 'thinking', content: 'Three files changed. I will read each one and check for common security issues: SQL injection, XSS, hardcoded secrets, missing input validation.', timestamp: '2026-03-09T14:30:03Z' },
      { type: 'tool_call', content: 'read_file("src/auth.ts") -> 142 lines, JWT implementation with RS256', timestamp: '2026-03-09T14:30:05Z' },
      { type: 'tool_call', content: 'read_file("src/api/login.ts") -> 67 lines, login handler with raw SQL query', timestamp: '2026-03-09T14:30:07Z' },
      { type: 'thinking', content: 'Critical: login.ts line 34 uses string interpolation in SQL query. This is a SQL injection vulnerability. Also, JWT_SECRET is imported from a hardcoded constant.', timestamp: '2026-03-09T14:30:10Z' },
      { type: 'output', content: 'Found 2 critical issues:\n1. SQL injection in src/api/login.ts:34 - use parameterized queries\n2. Hardcoded JWT secret in src/auth.ts:12 - move to environment variable', timestamp: '2026-03-09T14:32:18Z' },
    ],
  },
  {
    id: 'sess-002',
    agentName: 'data-pipeline',
    startTime: '2026-03-09T13:00:00Z',
    endTime: '2026-03-09T13:00:12Z',
    steps: [
      { type: 'input', content: 'Run daily ETL for user metrics (2026-03-09).', timestamp: '2026-03-09T13:00:00Z' },
      { type: 'thinking', content: 'Starting daily ETL pipeline. Steps: extract from events table, transform into metric buckets, load to S3.', timestamp: '2026-03-09T13:00:01Z' },
      { type: 'tool_call', content: 'query_database("SELECT * FROM events WHERE date = \'2026-03-09\'") -> 48,291 rows', timestamp: '2026-03-09T13:00:03Z' },
      { type: 'thinking', content: 'Received 48,291 events. Grouping by event_type and computing aggregates: count, unique users, avg duration.', timestamp: '2026-03-09T13:00:05Z' },
      { type: 'tool_call', content: 'write_file("s3://analytics/2026-03-09.parquet") -> success, 12 metric rows written', timestamp: '2026-03-09T13:00:09Z' },
      { type: 'output', content: 'ETL complete. Processed 48,291 events into 12 metric buckets. Output: s3://analytics/2026-03-09.parquet', timestamp: '2026-03-09T13:00:12Z' },
    ],
  },
  {
    id: 'sess-003',
    agentName: 'support-agent',
    startTime: '2026-03-09T10:40:00Z',
    endTime: '2026-03-09T10:45:22Z',
    steps: [
      { type: 'input', content: 'Handle ticket #1094: Customer reports being charged twice for monthly subscription.', timestamp: '2026-03-09T10:40:00Z' },
      { type: 'thinking', content: 'I need to look up the customer billing history to verify the duplicate charge claim.', timestamp: '2026-03-09T10:40:02Z' },
      { type: 'tool_call', content: 'fetch_ticket(1094) -> Customer: Jane Doe (cust_8821), Plan: Pro, Charge: $49.99 on 2026-03-07', timestamp: '2026-03-09T10:40:04Z' },
      { type: 'tool_call', content: 'query_billing(cust_8821) -> Two charges of $49.99 on 2026-03-07. One is duplicate.', timestamp: '2026-03-09T10:40:08Z' },
      { type: 'thinking', content: 'Confirmed: two identical charges on the same day. This is a duplicate. I should issue a refund and notify the customer.', timestamp: '2026-03-09T10:40:12Z' },
      { type: 'tool_call', content: 'issue_refund(cust_8821, amount=49.99) -> Refund ref_3391 processed', timestamp: '2026-03-09T10:42:00Z' },
      { type: 'output', content: 'Refund of $49.99 issued (ref_3391). Customer notified via email. Ticket #1094 resolved.', timestamp: '2026-03-09T10:45:22Z' },
    ],
  },
]

const stepTypeStyles: Record<string, { bg: string; text: string; label: string }> = {
  input: { bg: 'bg-green-100', text: 'text-green-700', label: 'Input' },
  thinking: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Thinking' },
  tool_call: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Tool Call' },
  output: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Output' },
}

export default function SessionsPage() {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [currentStep, setCurrentStep] = useState(0)

  const openSession = (session: Session) => {
    setSelectedSession(session)
    setCurrentStep(0)
  }

  const step = selectedSession ? selectedSession.steps[currentStep] : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Session Replay</h1>
        <p className="text-gray-600 mt-2">Replay agent sessions step-by-step to understand decisions and actions.</p>
      </div>

      {!selectedSession ? (
        <div className="space-y-3">
          {sampleSessions.map(session => (
            <button
              key={session.id}
              onClick={() => openSession(session)}
              className="w-full bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition"
            >
              <div>
                <p className="font-semibold text-gray-900">{session.agentName}</p>
                <p className="text-sm text-gray-500 mt-0.5">{session.id}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {new Date(session.startTime).toLocaleString()} - {new Date(session.endTime).toLocaleTimeString()}
                </p>
                <p className="text-sm text-gray-400 mt-0.5">{session.steps.length} steps</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <button
            onClick={() => setSelectedSession(null)}
            className="mb-6 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to sessions
          </button>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-gray-900">{selectedSession.agentName}</h2>
              <span className="text-sm text-gray-500">{selectedSession.id}</span>
            </div>
            <p className="text-sm text-gray-500">
              {new Date(selectedSession.startTime).toLocaleString()} - {new Date(selectedSession.endTime).toLocaleTimeString()}
            </p>
          </div>

          <div className="flex items-center gap-2 mb-4">
            {selectedSession.steps.map((s, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`w-full h-2 rounded-full transition ${
                  i === currentStep ? 'bg-blue-600' : i < currentStep ? 'bg-blue-300' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          <div className="text-center text-sm text-gray-500 mb-4">
            Step {currentStep + 1} of {selectedSession.steps.length}
          </div>

          {step && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-2.5 py-1 text-xs font-medium rounded ${stepTypeStyles[step.type].bg} ${stepTypeStyles[step.type].text}`}>
                  {stepTypeStyles[step.type].label}
                </span>
                <span className="text-sm text-gray-400">{new Date(step.timestamp).toLocaleTimeString()}</span>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-gray-800 bg-gray-50 rounded-lg p-4 font-mono leading-relaxed">
                {step.content}
              </pre>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-5 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentStep(Math.min(selectedSession.steps.length - 1, currentStep + 1))}
              disabled={currentStep === selectedSession.steps.length - 1}
              className="px-5 py-2 text-sm font-medium rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
