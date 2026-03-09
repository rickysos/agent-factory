'use client'

import { useState, useMemo } from 'react'

const actionTypes = ['agent.create', 'agent.update', 'agent.delete', 'user.login', 'user.logout', 'api_key.create', 'api_key.revoke', 'settings.update', 'template.install'] as const

const mockEvents = [
  { id: '1', timestamp: '2026-03-09T14:32:01Z', user: 'ricky@example.com', action: 'agent.create', resource: 'Agent: CI Pipeline Bot', ip: '192.168.1.42' },
  { id: '2', timestamp: '2026-03-09T14:28:15Z', user: 'sarah@example.com', action: 'user.login', resource: 'Session: web', ip: '10.0.0.15' },
  { id: '3', timestamp: '2026-03-09T13:55:44Z', user: 'ricky@example.com', action: 'api_key.create', resource: 'Key: prod-deploy-****', ip: '192.168.1.42' },
  { id: '4', timestamp: '2026-03-09T13:12:30Z', user: 'james@example.com', action: 'agent.update', resource: 'Agent: Support Triage', ip: '172.16.0.8' },
  { id: '5', timestamp: '2026-03-09T12:45:00Z', user: 'sarah@example.com', action: 'template.install', resource: 'Template: Blog Writer Agent', ip: '10.0.0.15' },
  { id: '6', timestamp: '2026-03-09T11:30:22Z', user: 'ricky@example.com', action: 'settings.update', resource: 'Settings: SSO Configuration', ip: '192.168.1.42' },
  { id: '7', timestamp: '2026-03-09T10:15:08Z', user: 'james@example.com', action: 'agent.delete', resource: 'Agent: Legacy Email Bot', ip: '172.16.0.8' },
  { id: '8', timestamp: '2026-03-09T09:50:33Z', user: 'admin@example.com', action: 'user.login', resource: 'Session: web', ip: '203.0.113.50' },
  { id: '9', timestamp: '2026-03-09T09:22:11Z', user: 'sarah@example.com', action: 'api_key.revoke', resource: 'Key: staging-****', ip: '10.0.0.15' },
  { id: '10', timestamp: '2026-03-08T18:05:45Z', user: 'ricky@example.com', action: 'agent.create', resource: 'Agent: Data Analyzer', ip: '192.168.1.42' },
  { id: '11', timestamp: '2026-03-08T16:44:19Z', user: 'admin@example.com', action: 'user.logout', resource: 'Session: web', ip: '203.0.113.50' },
  { id: '12', timestamp: '2026-03-08T15:30:00Z', user: 'james@example.com', action: 'settings.update', resource: 'Settings: Billing Plan', ip: '172.16.0.8' },
]

const users = [...new Set(mockEvents.map((e) => e.user))]

export default function AuditLoggingPage() {
  const [filterUser, setFilterUser] = useState('')
  const [filterAction, setFilterAction] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')

  const filtered = useMemo(() => {
    return mockEvents.filter((event) => {
      if (filterUser && event.user !== filterUser) return false
      if (filterAction && event.action !== filterAction) return false
      if (filterDateFrom && event.timestamp < filterDateFrom) return false
      if (filterDateTo && event.timestamp > filterDateTo + 'T23:59:59Z') return false
      return true
    })
  }, [filterUser, filterAction, filterDateFrom, filterDateTo])

  function handleExport() {
    const header = 'Timestamp,User,Action,Resource,IP Address'
    const rows = filtered.map(
      (e) => `${e.timestamp},${e.user},${e.action},"${e.resource}",${e.ip}`
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'audit-log.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  function formatTimestamp(ts: string) {
    return new Date(ts).toLocaleString()
  }

  const actionColors: Record<string, string> = {
    'agent.create': 'bg-accent-500/10 text-accent-600',
    'agent.update': 'bg-accent-500/10 text-accent-600',
    'agent.delete': 'bg-red-500/50/10 text-red-500',
    'user.login': 'bg-forge-200 text-forge-600',
    'user.logout': 'bg-forge-200 text-forge-500',
    'api_key.create': 'bg-accent-500/10 text-accent-600',
    'api_key.revoke': 'bg-red-500/50/10 text-red-500',
    'settings.update': 'bg-amber-500/10 text-amber-600',
    'template.install': 'bg-forge-200 text-forge-600',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-forge-800">
            Audit <span className="text-accent-600">Log</span>
          </h1>
          <p className="text-forge-400 mt-1">{filtered.length} events</p>
        </div>
        <button
          onClick={handleExport}
          className="px-5 py-2 bg-forge-50 text-forge-600 font-medium rounded border border-forge-200 hover:bg-forge-100 transition self-start"
        >
          Export CSV
        </button>
      </div>

      <div className="bg-forge-50 rounded-md border border-forge-200 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-forge-400 mb-1">User</label>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full px-3 py-2 rounded border border-forge-200 bg-forge-50 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
            >
              <option value="">All users</option>
              {users.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-forge-400 mb-1">Action</label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full px-3 py-2 rounded border border-forge-200 bg-forge-50 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
            >
              <option value="">All actions</option>
              {actionTypes.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-forge-400 mb-1">From</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full px-3 py-2 rounded border border-forge-200 bg-forge-50 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-forge-400 mb-1">To</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full px-3 py-2 rounded border border-forge-200 bg-forge-50 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-forge-50 rounded-md border border-forge-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-forge-200 bg-forge-100">
                <th className="text-left px-4 py-3 font-medium text-forge-400">Timestamp</th>
                <th className="text-left px-4 py-3 font-medium text-forge-400">User</th>
                <th className="text-left px-4 py-3 font-medium text-forge-400">Action</th>
                <th className="text-left px-4 py-3 font-medium text-forge-400">Resource</th>
                <th className="text-left px-4 py-3 font-medium text-forge-400">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((event) => (
                <tr key={event.id} className="border-b border-forge-200 hover:bg-forge-100 transition">
                  <td className="px-4 py-3 text-forge-500 whitespace-nowrap">{formatTimestamp(event.timestamp)}</td>
                  <td className="px-4 py-3 text-forge-800">{event.user}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${actionColors[event.action] || 'bg-forge-200 text-forge-500'}`}>
                      {event.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-forge-500">{event.resource}</td>
                  <td className="px-4 py-3 text-forge-300 font-mono text-xs">{event.ip}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-forge-300">
                    No events match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
