'use client'

import { useState } from 'react'

const agents = [
  { id: 'a1', name: 'Code Reviewer' },
  { id: 'a2', name: 'Meeting Summarizer' },
  { id: 'a3', name: 'Customer Support Bot' },
]

type FileTab = 'IDENTITY' | 'SOUL' | 'USER' | 'TOOLS' | 'AGENTS' | 'HEARTBEAT' | 'MEMORY'

const tabs: FileTab[] = ['IDENTITY', 'SOUL', 'USER', 'TOOLS', 'AGENTS', 'HEARTBEAT', 'MEMORY']

const placeholders: Record<FileTab, string> = {
  IDENTITY: `# Agent Identity\n\nYou are a [role]. Your primary function is to [purpose].\n\n## Name\n[Agent Name]\n\n## Role\n[Brief role description]\n\n## Expertise\n- [Domain 1]\n- [Domain 2]`,
  SOUL: `# Agent Soul\n\nDefines the personality, tone, and behavioral guidelines.\n\n## Personality Traits\n- Professional\n- Concise\n- Helpful\n\n## Communication Style\n- Direct and clear\n- Avoids jargon unless appropriate\n\n## Values\n- Accuracy over speed\n- Honesty about limitations`,
  USER: `# User Context\n\nInformation about the user this agent serves.\n\n## User Profile\n- Role: [Developer / Manager / etc.]\n- Experience Level: [Junior / Senior / etc.]\n\n## Preferences\n- Response length: [Brief / Detailed]\n- Code style: [Language conventions]`,
  TOOLS: `# Available Tools\n\nTools this agent can access and use.\n\n## File Operations\n- read_file\n- write_file\n- list_directory\n\n## Code Tools\n- run_tests\n- lint_code\n- search_codebase\n\n## Communication\n- send_message\n- create_ticket`,
  AGENTS: `# Connected Agents\n\nOther agents this agent can delegate to or collaborate with.\n\n## Delegation Rules\n- Delegate code reviews to: code-reviewer\n- Delegate testing to: test-runner\n\n## Communication Protocol\n- Use structured messages\n- Include context with every handoff`,
  HEARTBEAT: `# Heartbeat Configuration\n\nScheduled tasks and periodic checks.\n\n## Interval\nEvery 5 minutes\n\n## Checks\n- Monitor inbox for new messages\n- Check pending tasks\n- Review system health\n\n## On Trigger\n- Process queued items\n- Send status update`,
  MEMORY: `# Memory Configuration\n\nHow this agent stores and retrieves information.\n\n## Short-term Memory\n- Current conversation context\n- Active task state\n\n## Long-term Memory\n- User preferences (persistent)\n- Past decisions and outcomes\n\n## Memory Limits\n- Max context: 100K tokens\n- Summarize after: 50 messages`,
}

export default function AgentEditorPage() {
  const [selectedAgent, setSelectedAgent] = useState(agents[0].id)
  const [activeTab, setActiveTab] = useState<FileTab>('IDENTITY')
  const [files, setFiles] = useState<Record<string, Record<FileTab, { content: string; saved: boolean }>>>(() => {
    const init: Record<string, Record<FileTab, { content: string; saved: boolean }>> = {}
    for (const agent of agents) {
      init[agent.id] = {} as Record<FileTab, { content: string; saved: boolean }>
      for (const tab of tabs) {
        init[agent.id][tab] = { content: placeholders[tab], saved: true }
      }
    }
    return init
  })

  const currentFile = files[selectedAgent]?.[activeTab]

  const handleContentChange = (value: string) => {
    setFiles(prev => ({
      ...prev,
      [selectedAgent]: {
        ...prev[selectedAgent],
        [activeTab]: { content: value, saved: false },
      },
    }))
  }

  const handleSave = () => {
    setFiles(prev => ({
      ...prev,
      [selectedAgent]: {
        ...prev[selectedAgent],
        [activeTab]: { ...prev[selectedAgent][activeTab], saved: true },
      },
    }))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-forge-800 mb-2">
          Agent <span className="text-accent-600">Editor</span>
        </h1>
        <p className="text-lg text-forge-500">Edit agent definition files</p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-forge-600 mb-2">Select Agent</label>
        <select
          value={selectedAgent}
          onChange={e => setSelectedAgent(e.target.value)}
          className="px-4 py-2 border border-forge-200 rounded focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none text-forge-800 bg-forge-50"
        >
          {agents.map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-forge-50 rounded-md  overflow-hidden">
        <div className="border-b border-forge-200 flex overflow-x-auto">
          {tabs.map(tab => {
            const file = files[selectedAgent]?.[tab]
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition flex items-center gap-2 ${
                  activeTab === tab
                    ? 'border-accent-500 text-accent-600 bg-accent-500/10'
                    : 'border-transparent text-forge-400 hover:text-forge-600 hover:border-forge-200'
                }`}
              >
                {tab}.md
                <span className={`w-2 h-2 rounded-full ${file?.saved ? 'bg-accent-400' : 'bg-amber-400'}`} />
              </button>
            )
          })}
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-forge-400">
                {currentFile?.saved ? 'Saved' : 'Unsaved changes'}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                currentFile?.saved ? 'bg-accent-500/10 text-accent-600' : 'bg-amber-500/10 text-amber-600'
              }`}>
                {currentFile?.saved ? 'Up to date' : 'Modified'}
              </span>
            </div>
            <button
              onClick={handleSave}
              disabled={currentFile?.saved}
              className={`px-4 py-2 rounded text-sm font-medium transition ${
                currentFile?.saved
                  ? 'bg-forge-200 text-forge-300 cursor-not-allowed'
                  : 'bg-accent-500 text-forge-950 hover:bg-accent-400'
              }`}
            >
              Save {activeTab}.md
            </button>
          </div>

          <textarea
            value={currentFile?.content || ''}
            onChange={e => handleContentChange(e.target.value)}
            className="w-full h-96 px-4 py-3 border border-forge-200 rounded font-mono text-sm text-forge-800 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none resize-y"
            placeholder={`Enter ${activeTab}.md content...`}
          />
        </div>
      </div>
    </div>
  )
}
