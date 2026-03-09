'use client'

import { useState } from 'react'

interface Channel {
  id: string
  name: string
  status: 'connected' | 'disconnected' | 'error'
  botToken: string
  allowlist: string
  dmPolicy: 'open' | 'allowlist' | 'disabled'
}

const initialChannels: Channel[] = [
  { id: 'telegram', name: 'Telegram', status: 'disconnected', botToken: '', allowlist: '', dmPolicy: 'allowlist' },
  { id: 'whatsapp', name: 'WhatsApp', status: 'disconnected', botToken: '', allowlist: '', dmPolicy: 'disabled' },
  { id: 'slack', name: 'Slack', status: 'connected', botToken: 'xoxb-****-****-****', allowlist: '@ricky, @team-dev', dmPolicy: 'allowlist' },
  { id: 'discord', name: 'Discord', status: 'disconnected', botToken: '', allowlist: '', dmPolicy: 'open' },
]

export default function MessagingPage() {
  const [channels, setChannels] = useState<Channel[]>(initialChannels)
  const [testSent, setTestSent] = useState<string | null>(null)

  const updateChannel = (id: string, updates: Partial<Channel>) => {
    setChannels(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  const toggleConnection = (id: string) => {
    setChannels(prev => prev.map(c => {
      if (c.id !== id) return c
      return { ...c, status: c.status === 'connected' ? 'disconnected' : 'connected' }
    }))
  }

  const sendTest = (id: string) => {
    setTestSent(id)
    setTimeout(() => setTestSent(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-2">Messaging Channel Integration</h1>
      <p className="text-gray-400 mb-8">Configure messaging platforms for agent communication</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {channels.map(channel => (
          <div key={channel.id} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{channel.name}</h2>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  channel.status === 'connected' ? 'bg-green-400' :
                  channel.status === 'error' ? 'bg-red-400' : 'bg-gray-600'
                }`} />
                <span className={`text-xs ${
                  channel.status === 'connected' ? 'text-green-400' :
                  channel.status === 'error' ? 'text-red-400' : 'text-gray-500'
                }`}>
                  {channel.status}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 uppercase mb-1">Bot Token / API Key</label>
                <input
                  type="password"
                  value={channel.botToken}
                  onChange={e => updateChannel(channel.id, { botToken: e.target.value })}
                  placeholder="Enter token..."
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 uppercase mb-1">User Allowlist</label>
                <input
                  type="text"
                  value={channel.allowlist}
                  onChange={e => updateChannel(channel.id, { allowlist: e.target.value })}
                  placeholder="@user1, @user2"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 uppercase mb-1">DM Policy</label>
                <select
                  value={channel.dmPolicy}
                  onChange={e => updateChannel(channel.id, { dmPolicy: e.target.value as Channel['dmPolicy'] })}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                >
                  <option value="open">Open (anyone can DM)</option>
                  <option value="allowlist">Allowlist Only</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => toggleConnection(channel.id)}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  channel.status === 'connected'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {channel.status === 'connected' ? 'Disconnect' : 'Connect'}
              </button>
              <button
                onClick={() => sendTest(channel.id)}
                disabled={channel.status !== 'connected'}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 rounded text-sm font-medium transition-colors"
              >
                {testSent === channel.id ? 'Sent' : 'Test Message'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
