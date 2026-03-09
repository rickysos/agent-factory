'use client'

import { useState } from 'react'
import { teamTemplates, TeamTemplate } from '@/data/team-templates'

function CronBadge({ schedule }: { schedule: string }) {
  const labels: Record<string, string> = {
    '0 8 * * *': 'Daily 8:00 AM',
    '0 */2 * * *': 'Every 2 hours',
    '*/30 * * * *': 'Every 30 minutes',
    '0 * * * *': 'Every hour',
    '0 18 * * *': 'Daily 6:00 PM',
    '0 */4 * * *': 'Every 4 hours',
    '0 17 * * *': 'Daily 5:00 PM',
    '*/15 * * * *': 'Every 15 minutes',
  }
  return (
    <span className="px-2 py-0.5 text-xs font-mono bg-gray-100 text-gray-600 rounded">
      {labels[schedule] || schedule}
    </span>
  )
}

function TeamCard({ template }: { template: TeamTemplate }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{template.emoji}</span>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{template.name}</h3>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {template.orchestrator.model}
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">{template.description}</p>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-blue-600" />
            <span className="text-sm font-semibold text-gray-800">{template.orchestrator.name}</span>
            <span className="text-xs text-gray-400">orchestrator</span>
          </div>
          <div className="ml-4 border-l-2 border-blue-200 pl-4 space-y-1.5">
            {template.subAgents.map((agent) => (
              <div key={agent.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-sm text-gray-700">{agent.name}</span>
                <span className="text-xs text-gray-400">{agent.model}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {expanded ? 'Show less' : 'Show details'}
          </button>
          <button className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
            Deploy This Stack
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 p-6 space-y-5">
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-2">Orchestrator</h4>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900 text-sm">{template.orchestrator.name}</span>
                <span className="text-xs font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{template.orchestrator.model}</span>
              </div>
              <p className="text-xs text-gray-600">{template.orchestrator.role}</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-2">Sub-Agents</h4>
            <div className="space-y-2">
              {template.subAgents.map((agent) => (
                <div key={agent.name} className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 text-sm">{agent.name}</span>
                    <span className="text-xs font-mono bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">{agent.model}</span>
                  </div>
                  <p className="text-xs text-gray-600">{agent.role}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-2">Scheduled Tasks</h4>
            <div className="space-y-2">
              {template.cronJobs.map((job, i) => (
                <div key={i} className="bg-white rounded-lg p-3 border border-gray-200 flex items-start gap-3">
                  <CronBadge schedule={job.schedule} />
                  <p className="text-xs text-gray-600 flex-1">{job.task}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function TeamsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Team <span className="text-blue-600">Templates</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Pre-configured agent teams for common business functions. Each team includes an orchestrator,
          specialized sub-agents, and automated scheduled tasks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {teamTemplates.map((template) => (
          <TeamCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  )
}
