'use client'

import { useState, useEffect, useCallback } from 'react'

type Language = 'python' | 'javascript' | 'typescript' | 'shell'

interface Execution {
  id: string
  language: Language
  code: string
  stdout: string
  stderr: string
  exit_code: number
  status: 'completed' | 'failed' | 'running' | 'cancelled' | 'timeout'
  duration_ms: number
  created_at: string
}

interface Stats {
  total_executions: number
  success_rate: number
  avg_time_ms: number
  running: number
}

const PLACEHOLDERS: Record<Language, string> = {
  python: '# Python 3.x sandbox\nprint("Hello, sandbox!")',
  javascript: '// Node.js sandbox\nconsole.log("Hello, sandbox!");',
  typescript: '// TypeScript sandbox\nconst msg: string = "Hello, sandbox!";\nconsole.log(msg);',
  shell: '# Bash sandbox\necho "Hello, sandbox!"',
}

const LANGUAGE_LABELS: Record<Language, string> = {
  python: 'Python',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  shell: 'Shell',
}

const STATUS_COLORS: Record<string, string> = {
  completed: 'text-green-400 bg-green-400/10',
  failed: 'text-red-400 bg-red-400/10',
  running: 'text-yellow-400 bg-yellow-400/10',
  cancelled: 'text-gray-400 bg-gray-400/10',
  timeout: 'text-orange-400 bg-orange-400/10',
}

export default function SandboxPage() {
  const [language, setLanguage] = useState<Language>('python')
  const [code, setCode] = useState(PLACEHOLDERS.python)
  const [running, setRunning] = useState(false)
  const [output, setOutput] = useState<{ stdout: string; stderr: string; exit_code: number; duration_ms: number } | null>(null)
  const [executions, setExecutions] = useState<Execution[]>([])
  const [stats, setStats] = useState<Stats>({ total_executions: 0, success_rate: 0, avg_time_ms: 0, running: 0 })
  const [timeout, setTimeout_] = useState(30)
  const [memoryLimit, setMemoryLimit] = useState(256)
  const [networkAccess, setNetworkAccess] = useState(false)

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/sandbox')
      if (res.ok) setExecutions(await res.json())
    } catch {}
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/sandbox/stats')
      if (res.ok) setStats(await res.json())
    } catch {}
  }, [])

  useEffect(() => {
    fetchHistory()
    fetchStats()
  }, [fetchHistory, fetchStats])

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang)
    setCode(PLACEHOLDERS[lang])
  }

  const handleRun = async () => {
    setRunning(true)
    setOutput(null)
    try {
      const res = await fetch('/api/sandbox/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code, timeout, memory_limit: memoryLimit, network_access: networkAccess }),
      })
      const data = await res.json()
      setOutput({ stdout: data.stdout || '', stderr: data.stderr || '', exit_code: data.exit_code ?? -1, duration_ms: data.duration_ms ?? 0 })
      fetchHistory()
      fetchStats()
    } catch (err) {
      setOutput({ stdout: '', stderr: `Request failed: ${err}`, exit_code: -1, duration_ms: 0 })
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Code <span className="text-blue-400">Sandbox</span>
        </h1>
        <p className="text-lg text-gray-400">
          Execute code in isolated sandbox environments
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Executions', value: stats.total_executions },
          { label: 'Success Rate', value: `${stats.success_rate.toFixed(1)}%` },
          { label: 'Avg Time', value: `${stats.avg_time_ms.toFixed(0)}ms` },
          { label: 'Running', value: stats.running },
        ].map((s) => (
          <div key={s.label} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <p className="text-sm text-gray-400">{s.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Main Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Left: Editor */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          {/* Language Tabs */}
          <div className="flex border-b border-gray-800">
            {(Object.keys(LANGUAGE_LABELS) as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`px-5 py-3 text-sm font-medium transition-colors ${
                  language === lang
                    ? 'bg-gray-800 text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`}
              >
                {LANGUAGE_LABELS[lang]}
              </button>
            ))}
          </div>

          {/* Code Editor */}
          <div className="relative">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="w-full h-64 bg-gray-950 text-green-300 font-mono text-sm p-4 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500/50 placeholder-gray-600"
              placeholder={PLACEHOLDERS[language]}
            />
          </div>

          {/* Config Panel */}
          <div className="border-t border-gray-800 p-4 space-y-4">
            <div className="flex items-center gap-6">
              {/* Timeout */}
              <div className="flex-1">
                <label className="text-xs text-gray-400 block mb-1">
                  Timeout: {timeout}s
                </label>
                <input
                  type="range"
                  min={1}
                  max={60}
                  value={timeout}
                  onChange={(e) => setTimeout_(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              {/* Memory */}
              <div>
                <label className="text-xs text-gray-400 block mb-1">Memory</label>
                <select
                  value={memoryLimit}
                  onChange={(e) => setMemoryLimit(Number(e.target.value))}
                  className="bg-gray-800 text-gray-200 text-sm rounded-lg px-3 py-1.5 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {[128, 256, 512, 1024].map((mb) => (
                    <option key={mb} value={mb}>{mb} MB</option>
                  ))}
                </select>
              </div>

              {/* Network */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-400">Network</label>
                <button
                  onClick={() => setNetworkAccess(!networkAccess)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    networkAccess ? 'bg-blue-500' : 'bg-gray-700'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      networkAccess ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Run / Cancel */}
            <div className="flex gap-3">
              <button
                onClick={handleRun}
                disabled={running || !code.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {running ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Running...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                    Run Code
                  </>
                )}
              </button>
              {running && (
                <button
                  onClick={() => setRunning(false)}
                  className="bg-red-600/20 text-red-400 hover:bg-red-600/30 font-semibold py-2.5 px-6 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Output */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b border-gray-800">
            <h3 className="text-sm font-semibold text-gray-300">Output</h3>
          </div>
          <div className="flex-1 bg-gray-950 p-4 font-mono text-sm min-h-[16rem] overflow-auto">
            {output ? (
              <>
                {output.stdout && (
                  <pre className="text-green-400 whitespace-pre-wrap mb-2">{output.stdout}</pre>
                )}
                {output.stderr && (
                  <pre className="text-red-400 whitespace-pre-wrap">{output.stderr}</pre>
                )}
                {!output.stdout && !output.stderr && (
                  <p className="text-gray-600 italic">No output</p>
                )}
              </>
            ) : (
              <p className="text-gray-600 italic">Run code to see output here...</p>
            )}
          </div>
          {output && (
            <div className="px-5 py-3 border-t border-gray-800 flex items-center gap-4 text-sm">
              <span className={`font-medium ${output.exit_code === 0 ? 'text-green-400' : 'text-red-400'}`}>
                Exit code: {output.exit_code}
              </span>
              <span className="text-gray-500">|</span>
              <span className="text-gray-400">
                Time: {output.duration_ms}ms
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Execution History */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Execution History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-left">
                <th className="px-6 py-3 font-medium">Time</th>
                <th className="px-6 py-3 font-medium">Language</th>
                <th className="px-6 py-3 font-medium">Code Preview</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Exit Code</th>
                <th className="px-6 py-3 font-medium">Duration</th>
              </tr>
            </thead>
            <tbody>
              {executions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-600">
                    No executions yet. Run some code to see history here.
                  </td>
                </tr>
              ) : (
                executions.map((ex) => (
                  <tr key={ex.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-3 text-gray-400 whitespace-nowrap">
                      {new Date(ex.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-gray-300">
                      {LANGUAGE_LABELS[ex.language] || ex.language}
                    </td>
                    <td className="px-6 py-3 text-gray-400 font-mono text-xs max-w-[200px] truncate">
                      {ex.code.split('\n')[0]}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[ex.status] || 'text-gray-400'}`}>
                        {ex.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-300 font-mono">{ex.exit_code}</td>
                    <td className="px-6 py-3 text-gray-400">{ex.duration_ms}ms</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
