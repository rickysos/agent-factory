'use client'

import { useState } from 'react'
import { useAgents } from '@/lib/agent-context'

interface CronJob {
  id: string
  schedule: string
  task: string
  agentId: string
  enabled: boolean
}

const PRESETS = [
  { label: 'Every minute', value: '* * * * *' },
  { label: 'Every 5 minutes', value: '*/5 * * * *' },
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Daily at 8am', value: '0 8 * * *' },
  { label: 'Weekly Monday', value: '0 9 * * 1' },
]

export default function CronPage() {
  const { agents } = useAgents()
  const [jobs, setJobs] = useState<CronJob[]>([])
  const [showForm, setShowForm] = useState(false)
  const [schedule, setSchedule] = useState('0 * * * *')
  const [task, setTask] = useState('')
  const [agentId, setAgentId] = useState('')

  const addJob = () => {
    if (!task || !agentId) return
    setJobs([...jobs, {
      id: `cron_${Date.now()}`,
      schedule,
      task,
      agentId,
      enabled: true,
    }])
    setTask('')
    setAgentId('')
    setShowForm(false)
  }

  const toggleJob = (id: string) => {
    setJobs(jobs.map(j => j.id === id ? { ...j, enabled: !j.enabled } : j))
  }

  const deleteJob = (id: string) => {
    setJobs(jobs.filter(j => j.id !== id))
  }

  const getAgentName = (id: string) => agents.find(a => a.id === id)?.name || id

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Scheduled Tasks</h1>
          <p className="text-gray-600 mt-2">Manage cron jobs for automated agent tasks.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'New Schedule'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Create Scheduled Task</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
              <select
                value={schedule}
                onChange={e => setSchedule(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {PRESETS.map(p => (
                  <option key={p.value} value={p.value}>{p.label} ({p.value})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agent</label>
              <select
                value={agentId}
                onChange={e => setAgentId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select agent...</option>
                {agents.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Description</label>
              <input
                value={task}
                onChange={e => setTask(e.target.value)}
                placeholder="What should the agent do?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <button
            onClick={addJob}
            disabled={!task || !agentId}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Create
          </button>
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <p className="text-gray-500">No scheduled tasks yet. Create one to automate agent work.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schedule</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {jobs.map(job => (
                <tr key={job.id} className={!job.enabled ? 'opacity-50' : ''}>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleJob(job.id)}>
                      <div className={`h-3 w-3 rounded-full ${job.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-900">{job.schedule}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{job.task}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{getAgentName(job.agentId)}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => deleteJob(job.id)} className="text-sm text-red-500 hover:text-red-700">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
