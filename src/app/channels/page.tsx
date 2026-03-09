'use client'

import { useState } from 'react'
import { useAgents } from '@/lib/agent-context'

interface ChannelBinding {
  id: string
  platform: string
  channelName: string
  agentId: string
  enabled: boolean
  webhookUrl?: string
}

const PLATFORMS = [
  { id: 'slack', name: 'Slack', icon: '#', color: 'bg-purple-100 text-purple-700' },
  { id: 'discord', name: 'Discord', icon: 'D', color: 'bg-indigo-100 text-indigo-700' },
  { id: 'telegram', name: 'Telegram', icon: 'T', color: 'bg-blue-100 text-blue-700' },
  { id: 'email', name: 'Email', icon: '@', color: 'bg-green-100 text-green-700' },
  { id: 'webhook', name: 'Webhook', icon: '>', color: 'bg-orange-100 text-orange-700' },
]

export default function ChannelsPage() {
  const { agents } = useAgents()
  const [bindings, setBindings] = useState<ChannelBinding[]>([])
  const [showForm, setShowForm] = useState(false)
  const [platform, setPlatform] = useState('slack')
  const [channelName, setChannelName] = useState('')
  const [agentId, setAgentId] = useState('')

  const addBinding = () => {
    if (!channelName || !agentId) return
    setBindings([...bindings, {
      id: `ch_${Date.now()}`,
      platform,
      channelName,
      agentId,
      enabled: true,
    }])
    setChannelName('')
    setAgentId('')
    setShowForm(false)
  }

  const toggleBinding = (id: string) => {
    setBindings(bindings.map(b => b.id === id ? { ...b, enabled: !b.enabled } : b))
  }

  const deleteBinding = (id: string) => {
    setBindings(bindings.filter(b => b.id !== id))
  }

  const getAgentName = (id: string) => agents.find(a => a.id === id)?.name || id
  const getPlatform = (id: string) => PLATFORMS.find(p => p.id === id)!

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Channel Bindings</h1>
          <p className="text-gray-600 mt-2">Connect agents to messaging channels (Slack, Discord, Telegram, Email).</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Add Binding'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
              <select value={platform} onChange={e => setPlatform(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                {PLATFORMS.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
              <input
                value={channelName}
                onChange={e => setChannelName(e.target.value)}
                placeholder={platform === 'email' ? 'inbox@company.com' : '#channel-name'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Agent</label>
              <select value={agentId} onChange={e => setAgentId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="">Select agent...</option>
                {agents.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={addBinding}
            disabled={!channelName || !agentId}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Create Binding
          </button>
        </div>
      )}

      {bindings.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <p className="text-gray-500 mb-4">No channel bindings configured yet.</p>
          <div className="flex justify-center gap-3">
            {PLATFORMS.map(p => (
              <span key={p.id} className={`px-3 py-1.5 text-sm font-medium rounded-lg ${p.color}`}>
                {p.icon} {p.name}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bindings.map(b => {
            const plat = getPlatform(b.platform)
            return (
              <div key={b.id} className={`bg-white rounded-xl shadow p-4 border ${b.enabled ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${plat.color}`}>
                    {plat.icon} {plat.name}
                  </span>
                  <button onClick={() => toggleBinding(b.id)}>
                    <div className={`h-3 w-3 rounded-full ${b.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                  </button>
                </div>
                <p className="text-sm font-medium text-gray-900">{b.channelName}</p>
                <p className="text-xs text-gray-500 mt-1">Agent: {getAgentName(b.agentId)}</p>
                <button
                  onClick={() => deleteBinding(b.id)}
                  className="mt-3 text-xs text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
