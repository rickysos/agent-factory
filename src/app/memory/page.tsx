'use client'

import { useState } from 'react'

interface MemoryEntry {
  key: string
  value: string
  timestamp: string
  version: number
}

interface MemoryRepo {
  agentId: string
  agentName: string
  shared: boolean
  sleepLearning: boolean
  entries: MemoryEntry[]
}

const mockRepos: MemoryRepo[] = [
  {
    agentId: 'agent-1',
    agentName: 'CodeBot',
    shared: false,
    sleepLearning: true,
    entries: [
      { key: 'preferred_language', value: 'TypeScript', timestamp: '2026-03-09T10:30:00Z', version: 3 },
      { key: 'code_style', value: 'functional', timestamp: '2026-03-08T14:20:00Z', version: 2 },
      { key: 'test_framework', value: 'vitest', timestamp: '2026-03-07T09:00:00Z', version: 1 },
      { key: 'max_file_length', value: '300 lines', timestamp: '2026-03-06T16:45:00Z', version: 1 },
    ],
  },
  {
    agentId: 'agent-2',
    agentName: 'ResearchBot',
    shared: true,
    sleepLearning: false,
    entries: [
      { key: 'search_depth', value: '3 levels', timestamp: '2026-03-09T08:00:00Z', version: 5 },
      { key: 'source_priority', value: 'academic > news > blog', timestamp: '2026-03-08T11:30:00Z', version: 2 },
      { key: 'citation_format', value: 'APA', timestamp: '2026-03-05T10:00:00Z', version: 1 },
    ],
  },
  {
    agentId: 'agent-3',
    agentName: 'OpsBot',
    shared: true,
    sleepLearning: true,
    entries: [
      { key: 'alert_threshold', value: '95% CPU for 5min', timestamp: '2026-03-09T06:00:00Z', version: 4 },
      { key: 'escalation_chain', value: 'slack > pager > phone', timestamp: '2026-03-07T12:00:00Z', version: 3 },
    ],
  },
]

const keyHistory: Record<string, MemoryEntry[]> = {
  preferred_language: [
    { key: 'preferred_language', value: 'TypeScript', timestamp: '2026-03-09T10:30:00Z', version: 3 },
    { key: 'preferred_language', value: 'JavaScript', timestamp: '2026-03-04T08:00:00Z', version: 2 },
    { key: 'preferred_language', value: 'Python', timestamp: '2026-02-28T12:00:00Z', version: 1 },
  ],
  search_depth: [
    { key: 'search_depth', value: '3 levels', timestamp: '2026-03-09T08:00:00Z', version: 5 },
    { key: 'search_depth', value: '2 levels', timestamp: '2026-03-06T08:00:00Z', version: 4 },
    { key: 'search_depth', value: '4 levels', timestamp: '2026-03-03T08:00:00Z', version: 3 },
    { key: 'search_depth', value: '1 level', timestamp: '2026-02-25T08:00:00Z', version: 2 },
    { key: 'search_depth', value: '2 levels', timestamp: '2026-02-20T08:00:00Z', version: 1 },
  ],
}

export default function MemoryPage() {
  const [repos, setRepos] = useState(mockRepos)
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null)
  const [historyKey, setHistoryKey] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')

  const activeRepo = repos.find((r) => r.agentId === selectedRepo)

  function toggleShared(agentId: string) {
    setRepos((prev) =>
      prev.map((r) => (r.agentId === agentId ? { ...r, shared: !r.shared } : r))
    )
  }

  function toggleSleepLearning(agentId: string) {
    setRepos((prev) =>
      prev.map((r) => (r.agentId === agentId ? { ...r, sleepLearning: !r.sleepLearning } : r))
    )
  }

  function addEntry() {
    if (!selectedRepo || !newKey.trim() || !newValue.trim()) return
    setRepos((prev) =>
      prev.map((r) =>
        r.agentId === selectedRepo
          ? {
              ...r,
              entries: [
                { key: newKey, value: newValue, timestamp: new Date().toISOString(), version: 1 },
                ...r.entries,
              ],
            }
          : r
      )
    )
    setNewKey('')
    setNewValue('')
    setShowAddForm(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Agent <span className="text-blue-600">Memory</span>
        </h1>
        <p className="text-lg text-gray-600">
          Persistent memory repositories for each agent. Version-tracked key-value storage.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Repo list */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Repositories</h2>
          {repos.map((repo) => (
            <button
              key={repo.agentId}
              onClick={() => { setSelectedRepo(repo.agentId); setHistoryKey(null); setShowAddForm(false) }}
              className={`w-full text-left rounded-xl border p-4 transition-all ${
                selectedRepo === repo.agentId
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:shadow-md hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{repo.agentName}</h3>
                <span className="text-xs text-gray-500">{repo.entries.length} entries</span>
              </div>
              <div className="flex gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${repo.shared ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {repo.shared ? 'Shared' : 'Private'}
                </span>
                {repo.sleepLearning && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">Sleep Learning</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Entries */}
        <div className="lg:col-span-2">
          {!activeRepo ? (
            <div className="text-center py-20 text-gray-400">Select a repository to view entries</div>
          ) : historyKey ? (
            <div>
              <button
                onClick={() => setHistoryKey(null)}
                className="text-sm text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back to entries
              </button>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                History: <span className="text-blue-600 font-mono">{historyKey}</span>
              </h2>
              <div className="space-y-3">
                {(keyHistory[historyKey] || []).map((entry, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono text-gray-400">v{entry.version}</span>
                      <p className="text-gray-900 font-medium">{entry.value}</p>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(entry.timestamp).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">{activeRepo.agentName}</h2>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Shared</span>
                    <button
                      onClick={() => toggleShared(activeRepo.agentId)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${activeRepo.shared ? 'bg-green-500' : 'bg-gray-300'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${activeRepo.shared ? 'translate-x-5' : ''}`} />
                    </button>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Sleep Learning</span>
                    <button
                      onClick={() => toggleSleepLearning(activeRepo.agentId)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${activeRepo.sleepLearning ? 'bg-purple-500' : 'bg-gray-300'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${activeRepo.sleepLearning ? 'translate-x-5' : ''}`} />
                    </button>
                  </label>
                </div>
              </div>

              {showAddForm ? (
                <div className="bg-white border border-blue-200 rounded-xl p-4 mb-4 space-y-3">
                  <input
                    type="text"
                    placeholder="Key"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-2">
                    <button onClick={addEntry} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">Save</button>
                    <button onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200">Cancel</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mb-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                >
                  + Add Entry
                </button>
              )}

              <div className="space-y-2">
                {activeRepo.entries.map((entry, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:border-gray-300 transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-semibold text-gray-900">{entry.key}</span>
                        <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">v{entry.version}</span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{entry.value}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(entry.timestamp).toLocaleDateString()}</span>
                      {keyHistory[entry.key] && (
                        <button
                          onClick={() => setHistoryKey(entry.key)}
                          className="text-xs text-blue-600 hover:text-blue-800 whitespace-nowrap"
                        >
                          History
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
