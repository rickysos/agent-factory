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
    'agent.create': 'bg-green-100 text-green-700',
    'agent.update': 'bg-blue-100 text-blue-700',
    'agent.delete': 'bg-red-100 text-red-700',
    'user.login': 'bg-purple-100 text-purple-700',
    'user.logout': 'bg-gray-100 text-gray-600',
    'api_key.create': 'bg-green-100 text-green-700',
    'api_key.revoke': 'bg-red-100 text-red-700',
    'settings.update': 'bg-yellow-100 text-yellow-700',
    'template.install': 'bg-indigo-100 text-indigo-700',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Audit <span className="text-blue-600">Log</span>
          </h1>
          <p className="text-gray-500 mt-1">{filtered.length} events</p>
        </div>
        <button
          onClick={handleExport}
          className="px-5 py-2 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition self-start"
        >
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">User</label>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All users</option>
              {users.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Action</label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All actions</option>
              {actionTypes.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500">Timestamp</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">User</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Action</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Resource</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((event) => (
                <tr key={event.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatTimestamp(event.timestamp)}</td>
                  <td className="px-4 py-3 text-gray-900">{event.user}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${actionColors[event.action] || 'bg-gray-100 text-gray-600'}`}>
                      {event.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{event.resource}</td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{event.ip}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
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
