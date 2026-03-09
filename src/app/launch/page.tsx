'use client'

import { useState } from 'react'
import { useAgents } from '@/lib/agent-context'

type ProcessStatus = 'idle' | 'starting' | 'running' | 'stopping' | 'errored'

interface AgentProcess {
  id: string
  name: string
  status: ProcessStatus
  cpu: number
  memory: number
  uptime: string
  logs: string[]
}

const statusConfig: Record<ProcessStatus, { color: string; bg: string }> = {
  idle: { color: 'text-gray-600', bg: 'bg-gray-100' },
  starting: { color: 'text-yellow-700', bg: 'bg-yellow-100' },
  running: { color: 'text-green-700', bg: 'bg-green-100' },
  stopping: { color: 'text-orange-700', bg: 'bg-orange-100' },
  errored: { color: 'text-red-700', bg: 'bg-red-100' },
}

const mockProcesses: AgentProcess[] = [
  { id: 'p1', name: 'Code Reviewer', status: 'running', cpu: 12, memory: 256, uptime: '2h 14m', logs: ['[INFO] Agent started', '[INFO] Watching for pull requests', '[INFO] Processed PR #142 - 3 issues found'] },
  { id: 'p2', name: 'Meeting Summarizer', status: 'idle', cpu: 0, memory: 0, uptime: '--', logs: [] },
  { id: 'p3', name: 'Customer Support Bot', status: 'running', cpu: 8, memory: 180, uptime: '5h 02m', logs: ['[INFO] Agent started', '[INFO] Connected to ticket system', '[INFO] Handled 23 tickets today'] },
  { id: 'p4', name: 'Test Generator', status: 'errored', cpu: 0, memory: 0, uptime: '--', logs: ['[INFO] Agent started', '[ERROR] Failed to connect to code repository', '[ERROR] Agent stopped with exit code 1'] },
  { id: 'p5', name: 'Blog Writer', status: 'idle', cpu: 0, memory: 0, uptime: '--', logs: [] },
]

export default function LaunchPage() {
  const [processes, setProcesses] = useState(mockProcesses)
  const [selectedProcess, setSelectedProcess] = useState<string | null>('p1')
  const [launchingAll, setLaunchingAll] = useState(false)

  // Try to use context agents, fall back to mock
  let contextAgents: { name: string }[] = []
  try {
    const ctx = useAgents()
    contextAgents = ctx.agents
  } catch {
    // Not wrapped in provider, use mock data
  }

  const updateStatus = (id: string, status: ProcessStatus) => {
    setProcesses(prev => prev.map(p => {
      if (p.id !== id) return p
      const newLogs = [...p.logs]
      if (status === 'starting') newLogs.push(`[INFO] Starting agent...`)
      if (status === 'running') {
        newLogs.push(`[INFO] Agent started successfully`)
        return { ...p, status, cpu: Math.floor(Math.random() * 20) + 5, memory: Math.floor(Math.random() * 200) + 100, uptime: '0m 01s', logs: newLogs }
      }
      if (status === 'stopping') newLogs.push(`[INFO] Stopping agent...`)
      if (status === 'idle') {
        newLogs.push(`[INFO] Agent stopped`)
        return { ...p, status, cpu: 0, memory: 0, uptime: '--', logs: newLogs }
      }
      return { ...p, status, logs: newLogs }
    }))
  }

  const handleStart = (id: string) => {
    updateStatus(id, 'starting')
    setTimeout(() => updateStatus(id, 'running'), 1500)
  }

  const handleStop = (id: string) => {
    updateStatus(id, 'stopping')
    setTimeout(() => updateStatus(id, 'idle'), 1000)
  }

  const handleRestart = (id: string) => {
    updateStatus(id, 'stopping')
    setTimeout(() => {
      updateStatus(id, 'starting')
      setTimeout(() => updateStatus(id, 'running'), 1500)
    }, 1000)
  }

  const handleLaunchAll = () => {
    setLaunchingAll(true)
    const idleProcesses = processes.filter(p => p.status === 'idle' || p.status === 'errored')
    idleProcesses.forEach((proc, i) => {
      setTimeout(() => handleStart(proc.id), i * 800)
    })
    setTimeout(() => setLaunchingAll(false), idleProcesses.length * 800 + 2000)
  }

  const runningCount = processes.filter(p => p.status === 'running').length
  const totalCpu = processes.reduce((sum, p) => sum + p.cpu, 0)
  const totalMem = processes.reduce((sum, p) => sum + p.memory, 0)
  const selectedLogs = processes.find(p => p.id === selectedProcess)?.logs || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Agent <span className="text-blue-600">Launcher</span>
          </h1>
          <p className="text-lg text-gray-600">{runningCount} of {processes.length} agents running</p>
        </div>
        <button
          onClick={handleLaunchAll}
          disabled={launchingAll}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          {launchingAll ? 'Launching...' : 'Launch All'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-4 border border-gray-100 text-center">
          <div className="text-2xl font-bold text-gray-900">{runningCount}/{processes.length}</div>
          <div className="text-sm text-gray-500">Active Agents</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border border-gray-100 text-center">
          <div className="text-2xl font-bold text-gray-900">{totalCpu}%</div>
          <div className="text-sm text-gray-500">Total CPU</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border border-gray-100 text-center">
          <div className="text-2xl font-bold text-gray-900">{totalMem} MB</div>
          <div className="text-sm text-gray-500">Total Memory</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Agents</h2>
          <div className="space-y-3">
            {processes.map(proc => {
              const cfg = statusConfig[proc.status]
              return (
                <div
                  key={proc.id}
                  onClick={() => setSelectedProcess(proc.id)}
                  className={`bg-white rounded-xl shadow p-4 border cursor-pointer transition ${
                    selectedProcess === proc.id ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        proc.status === 'running' ? 'bg-green-500 animate-pulse' :
                        proc.status === 'errored' ? 'bg-red-500' :
                        proc.status === 'starting' || proc.status === 'stopping' ? 'bg-yellow-500 animate-pulse' :
                        'bg-gray-400'
                      }`} />
                      <span className="font-medium text-gray-900">{proc.name}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${cfg.bg} ${cfg.color}`}>
                      {proc.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {proc.status === 'running' ? (
                        <span>CPU: {proc.cpu}% | Mem: {proc.memory}MB | Up: {proc.uptime}</span>
                      ) : (
                        <span>Not running</span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {(proc.status === 'idle' || proc.status === 'errored') && (
                        <button onClick={e => { e.stopPropagation(); handleStart(proc.id) }} className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700">Start</button>
                      )}
                      {proc.status === 'running' && (
                        <>
                          <button onClick={e => { e.stopPropagation(); handleStop(proc.id) }} className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700">Stop</button>
                          <button onClick={e => { e.stopPropagation(); handleRestart(proc.id) }} className="px-3 py-1 bg-yellow-600 text-white rounded text-xs font-medium hover:bg-yellow-700">Restart</button>
                        </>
                      )}
                      {(proc.status === 'starting' || proc.status === 'stopping') && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded text-xs font-medium">Wait...</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Live Logs {selectedProcess && <span className="text-base font-normal text-gray-500">- {processes.find(p => p.id === selectedProcess)?.name}</span>}
          </h2>
          <div className="bg-gray-900 rounded-xl p-4 h-[500px] overflow-y-auto font-mono text-sm">
            {selectedLogs.length === 0 ? (
              <span className="text-gray-500">No logs. Select a running agent to view logs.</span>
            ) : selectedLogs.map((line, i) => (
              <div key={i} className={
                line.includes('[ERROR]') ? 'text-red-400' :
                line.includes('[WARN]') ? 'text-yellow-400' :
                'text-green-400'
              }>
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
