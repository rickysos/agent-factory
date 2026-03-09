'use client'

import { useState, useEffect, useCallback } from 'react'

interface SandboxExecution {
  id: string
  language: 'javascript' | 'python'
  code: string
  output: string
  error?: string
  status: 'pending' | 'running' | 'completed' | 'error'
  startedAt: string
  completedAt?: string
  duration?: number
}

const EXAMPLE_JS = `const greeting = "Hello from the sandbox!";
console.log(greeting);
const result = [1,2,3].map(x => x * 2);
console.log("Doubled:", result);`

export default function SandboxPage() {
  const [language, setLanguage] = useState<'javascript' | 'python'>('javascript')
  const [code, setCode] = useState(EXAMPLE_JS)
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle')
  const [duration, setDuration] = useState<number | null>(null)
  const [history, setHistory] = useState<SandboxExecution[]>([])

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/sandbox')
      if (res.ok) setHistory(await res.json())
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { fetchHistory() }, [fetchHistory])

  const runCode = async () => {
    setStatus('running')
    setOutput('')
    setError('')
    setDuration(null)

    try {
      const res = await fetch('/api/sandbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, code }),
      })
      const data: SandboxExecution = await res.json()
      setOutput(data.output)
      setError(data.error || '')
      setStatus(data.status === 'error' ? 'error' : 'completed')
      setDuration(data.duration ?? null)
      fetchHistory()
    } catch {
      setError('Failed to connect to sandbox API')
      setStatus('error')
    }
  }

  const loadExecution = (exec: SandboxExecution) => {
    setLanguage(exec.language)
    setCode(exec.code)
    setOutput(exec.output)
    setError(exec.error || '')
    setStatus(exec.status === 'error' ? 'error' : 'completed')
    setDuration(exec.duration ?? null)
  }

  const lineCount = code.split('\n').length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-1">Code Sandbox</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Test agent-generated code in an isolated environment</p>

        {/* Security info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-6 text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
          <span>Code runs in an isolated sandbox with no file system or network access. 5-second timeout.</span>
        </div>

        {/* Editor + Output split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Left: Code Editor */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
            {/* Language tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-800">
              <button
                onClick={() => { setLanguage('javascript'); setCode(EXAMPLE_JS) }}
                className={`px-4 py-2.5 text-sm font-medium transition-colors ${language === 'javascript' ? 'bg-gray-100 dark:bg-gray-800 text-green-600 dark:text-green-400 border-b-2 border-green-500' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                JavaScript
              </button>
              <button
                onClick={() => { setLanguage('python'); setCode('# Python sandbox coming soon') }}
                className={`px-4 py-2.5 text-sm font-medium transition-colors ${language === 'python' ? 'bg-gray-100 dark:bg-gray-800 text-yellow-600 dark:text-yellow-400 border-b-2 border-yellow-500' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                Python
              </button>
            </div>

            {language === 'python' && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2 text-sm text-yellow-700 dark:text-yellow-300">
                Coming soon -- Python sandbox requires Docker
              </div>
            )}

            {/* Code input with line numbers */}
            <div className="relative flex">
              <div className="select-none text-right pr-3 pl-3 py-3 text-xs leading-6 text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 font-mono">
                {Array.from({ length: lineCount }, (_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                spellCheck={false}
                className="flex-1 bg-gray-50 dark:bg-gray-950 p-3 font-mono text-sm leading-6 resize-none focus:outline-none min-h-[240px] text-gray-900 dark:text-gray-100"
                rows={Math.max(10, lineCount)}
              />
            </div>

            {/* Run button */}
            <div className="border-t border-gray-200 dark:border-gray-800 p-3 flex items-center gap-3">
              <button
                onClick={runCode}
                disabled={status === 'running' || (language === 'python')}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {status === 'running' ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>
                )}
                {status === 'running' ? 'Running...' : 'Run'}
              </button>
              <span className="text-xs text-gray-500">Ctrl+Enter</span>
            </div>
          </div>

          {/* Right: Output */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-4 py-2.5">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Output</span>
              <div className="flex items-center gap-3">
                {duration !== null && (
                  <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                    {duration}ms
                  </span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                  status === 'idle' ? 'bg-gray-100 dark:bg-gray-800 text-gray-500' :
                  status === 'running' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                  status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                  'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                }`}>
                  {status === 'idle' ? 'Idle' : status === 'running' ? 'Running' : status === 'completed' ? 'Completed' : 'Error'}
                </span>
              </div>
            </div>

            <div className="flex-1 bg-gray-50 dark:bg-gray-950 p-4 font-mono text-sm min-h-[240px] overflow-auto whitespace-pre-wrap">
              {status === 'running' && (
                <div className="flex items-center gap-2 text-blue-500">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Executing...
                </div>
              )}
              {output && <div className="text-green-600 dark:text-green-400">{output}</div>}
              {error && <div className="text-red-500 dark:text-red-400 mt-2">{error}</div>}
              {status === 'idle' && <span className="text-gray-400">Run code to see output here</span>}
            </div>
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Recent Executions</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 dark:text-gray-500 uppercase border-b border-gray-200 dark:border-gray-800">
                    <th className="px-4 py-2">Time</th>
                    <th className="px-4 py-2">Language</th>
                    <th className="px-4 py-2">Code</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(exec => (
                    <tr
                      key={exec.id}
                      onClick={() => loadExecution(exec)}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">
                        {new Date(exec.startedAt).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${exec.language === 'javascript' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'}`}>
                          {exec.language === 'javascript' ? 'JS' : 'PY'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs text-gray-600 dark:text-gray-400 max-w-xs truncate">
                        {exec.code.slice(0, 50)}{exec.code.length > 50 ? '...' : ''}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs font-medium ${exec.status === 'completed' ? 'text-green-500' : exec.status === 'error' ? 'text-red-500' : 'text-gray-500'}`}>
                          {exec.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-500 text-xs">
                        {exec.duration !== undefined ? `${exec.duration}ms` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
