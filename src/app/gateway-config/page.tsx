'use client'

import { useState } from 'react'

interface TokenRotation {
  id: string
  date: string
  action: string
  tokenPrefix: string
  preservedDuringReconfig: boolean
}

const mockHistory: TokenRotation[] = [
  { id: '1', date: '2026-03-09 14:22', action: 'Token generated', tokenPrefix: 'gw_9f3a', preservedDuringReconfig: false },
  { id: '2', date: '2026-03-07 09:15', action: 'Preserved during reconfigure', tokenPrefix: 'gw_9f3a', preservedDuringReconfig: true },
  { id: '3', date: '2026-03-05 16:40', action: 'Token regenerated', tokenPrefix: 'gw_9f3a', preservedDuringReconfig: false },
  { id: '4', date: '2026-03-01 10:00', action: 'Preserved during reconfigure', tokenPrefix: 'gw_7b2e', preservedDuringReconfig: true },
  { id: '5', date: '2026-02-28 08:30', action: 'Token generated (initial)', tokenPrefix: 'gw_7b2e', preservedDuringReconfig: false },
]

export default function GatewayConfigPage() {
  const [token] = useState('gw_9f3a****************************')
  const [showToken, setShowToken] = useState(false)
  const [preserveOnReconfig, setPreserveOnReconfig] = useState(true)
  const [history, setHistory] = useState<TokenRotation[]>(mockHistory)
  const [confirmRegenerate, setConfirmRegenerate] = useState(false)
  const [regenerated, setRegenerated] = useState(false)

  const handleRegenerate = () => {
    if (!confirmRegenerate) {
      setConfirmRegenerate(true)
      return
    }
    const newPrefix = 'gw_' + Math.random().toString(36).substring(2, 6)
    setHistory(prev => [{
      id: Date.now().toString(),
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      action: 'Token regenerated',
      tokenPrefix: newPrefix,
      preservedDuringReconfig: false,
    }, ...prev])
    setConfirmRegenerate(false)
    setRegenerated(true)
    setTimeout(() => setRegenerated(false), 3000)
  }

  return (
    <div className="min-h-screen bg-forge-950 text-forge-100 p-8">
      <h1 className="text-3xl font-bold mb-2">Gateway Token Preservation</h1>
      <p className="text-forge-300 mb-8">Manage gateway authentication tokens and rotation</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-forge-900 border border-forge-800 rounded p-6">
            <h2 className="text-lg font-semibold mb-4">Current Gateway Token</h2>
            <div className="bg-forge-850 rounded px-4 py-3 font-mono text-sm flex items-center justify-between mb-4">
              <span className={showToken ? 'text-forge-300' : 'text-forge-400'}>
                {showToken ? 'gw_9f3a8c2d1e5f7b4a9c0d2e3f4a5b6c7d' : token}
              </span>
              <button
                onClick={() => setShowToken(!showToken)}
                className="text-xs text-accent-400 hover:text-accent-400 ml-4"
              >
                {showToken ? 'Hide' : 'Reveal'}
              </button>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium">Preserve during reconfigure</p>
                <p className="text-xs text-forge-400">Keep the same token when agent is reconfigured</p>
              </div>
              <button
                onClick={() => setPreserveOnReconfig(!preserveOnReconfig)}
                className={`w-12 h-6 rounded-full transition-colors relative ${preserveOnReconfig ? 'bg-accent-500' : 'bg-forge-700'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-forge-50 rounded-full transition-transform ${preserveOnReconfig ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>

            <div className={`rounded p-3 text-sm mb-4 ${
              preserveOnReconfig
                ? 'bg-accent-500/10 border border-green-800 text-green-300'
                : 'bg-amber-500/10 border border-yellow-800 text-yellow-300'
            }`}>
              {preserveOnReconfig
                ? 'Token will be preserved during agent reconfiguration. Connected clients will not need to re-authenticate.'
                : 'Token will be regenerated on reconfigure. All connected clients will need to re-authenticate.'}
            </div>

            <div>
              {confirmRegenerate ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-red-400">This will invalidate the current token. Continue?</span>
                  <button
                    onClick={handleRegenerate}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setConfirmRegenerate(false)}
                    className="px-4 py-2 text-forge-300 hover:text-forge-950 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleRegenerate}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    regenerated ? 'bg-accent-500' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {regenerated ? 'Token Regenerated' : 'Regenerate Token'}
                </button>
              )}
            </div>
          </div>

          <div className="bg-forge-900 border border-forge-800 rounded p-6">
            <h2 className="text-lg font-semibold mb-2">Token Status</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-forge-850 rounded p-3">
                <p className="text-forge-400 text-xs uppercase mb-1">Created</p>
                <p className="font-mono">2026-03-09</p>
              </div>
              <div className="bg-forge-850 rounded p-3">
                <p className="text-forge-400 text-xs uppercase mb-1">Last Used</p>
                <p className="font-mono">2 minutes ago</p>
              </div>
              <div className="bg-forge-850 rounded p-3">
                <p className="text-forge-400 text-xs uppercase mb-1">Reconfigs Survived</p>
                <p className="font-mono">3</p>
              </div>
              <div className="bg-forge-850 rounded p-3">
                <p className="text-forge-400 text-xs uppercase mb-1">Total Rotations</p>
                <p className="font-mono">{history.filter(h => h.action.includes('regenerated') || h.action.includes('generated')).length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-forge-900 border border-forge-800 rounded p-6">
          <h2 className="text-lg font-semibold mb-4">Token Rotation History</h2>
          <div className="space-y-3">
            {history.map(entry => (
              <div key={entry.id} className="bg-forge-850 rounded p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{entry.action}</span>
                  <span className="text-xs text-forge-400">{entry.date}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-mono text-forge-300">{entry.tokenPrefix}****</span>
                  {entry.preservedDuringReconfig && (
                    <span className="px-2 py-0.5 bg-accent-800 text-green-300 rounded">preserved</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
