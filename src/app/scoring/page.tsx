'use client'

import { useState, useEffect, useCallback } from 'react'

interface TestCase {
  id: string
  input: string
  expectedOutput?: string
  criteria: string
  weight: number
}

interface EvalSuite {
  id: string
  name: string
  description: string
  agentId: string
  testCases: TestCase[]
  createdAt: string
}

interface TestResult {
  testCaseId: string
  input: string
  output: string
  score: number
  passed: boolean
  reasoning: string
}

interface EvalRun {
  id: string
  suiteId: string
  agentId: string
  status: 'pending' | 'running' | 'completed'
  results: TestResult[]
  score: number
  startedAt: string
  completedAt?: string
}

interface Agent {
  id: string
  name: string
}

interface TestCaseForm {
  input: string
  expectedOutput: string
  criteria: string
  weight: number
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    : score >= 50 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold ${color}`}>
      {score}%
    </span>
  )
}

function PassFailBadge({ passed }: { passed: boolean }) {
  return passed
    ? <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">PASS</span>
    : <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">FAIL</span>
}

export default function ScoringPage() {
  const [suites, setSuites] = useState<EvalSuite[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedSuiteId, setSelectedSuiteId] = useState<string | null>(null)
  const [runs, setRuns] = useState<EvalRun[]>([])
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null)
  const [running, setRunning] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formAgentId, setFormAgentId] = useState('')
  const [formTestCases, setFormTestCases] = useState<TestCaseForm[]>([
    { input: '', expectedOutput: '', criteria: '', weight: 1 },
  ])

  const fetchSuites = useCallback(async () => {
    const res = await fetch('/api/evals')
    const data = await res.json()
    if (data.success) setSuites(data.data)
  }, [])

  const fetchAgents = useCallback(async () => {
    const res = await fetch('/api/agents')
    const data = await res.json()
    if (data.success) setAgents(data.data)
  }, [])

  const fetchRuns = useCallback(async (suiteId: string) => {
    const res = await fetch(`/api/evals/${suiteId}/run`)
    const data = await res.json()
    if (data.success) setRuns(data.data)
  }, [])

  useEffect(() => {
    fetchSuites()
    fetchAgents()
  }, [fetchSuites, fetchAgents])

  useEffect(() => {
    if (selectedSuiteId) fetchRuns(selectedSuiteId)
    else setRuns([])
  }, [selectedSuiteId, fetchRuns])

  const handleCreateSuite = async (e: React.FormEvent) => {
    e.preventDefault()
    const validCases = formTestCases.filter(tc => tc.input.trim())
    if (!formName.trim() || !formAgentId || validCases.length === 0) return

    const res = await fetch('/api/evals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formName,
        description: formDescription,
        agentId: formAgentId,
        testCases: validCases.map(tc => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput || undefined,
          criteria: tc.criteria,
          weight: tc.weight,
        })),
      }),
    })
    const data = await res.json()
    if (data.success) {
      setShowCreateForm(false)
      setFormName('')
      setFormDescription('')
      setFormAgentId('')
      setFormTestCases([{ input: '', expectedOutput: '', criteria: '', weight: 1 }])
      fetchSuites()
    }
  }

  const handleDeleteSuite = async (id: string) => {
    await fetch(`/api/evals/${id}`, { method: 'DELETE' })
    if (selectedSuiteId === id) {
      setSelectedSuiteId(null)
      setRuns([])
    }
    fetchSuites()
  }

  const handleRunEval = async (suiteId: string) => {
    setRunning(true)
    const res = await fetch(`/api/evals/${suiteId}/run`, { method: 'POST' })
    const data = await res.json()
    if (data.success) {
      await fetchRuns(suiteId)
    }
    setRunning(false)
  }

  const addTestCase = () => {
    setFormTestCases([...formTestCases, { input: '', expectedOutput: '', criteria: '', weight: 1 }])
  }

  const removeTestCase = (index: number) => {
    if (formTestCases.length <= 1) return
    setFormTestCases(formTestCases.filter((_, i) => i !== index))
  }

  const updateTestCase = (index: number, field: keyof TestCaseForm, value: string | number) => {
    const updated = [...formTestCases]
    updated[index] = { ...updated[index], [field]: value }
    setFormTestCases(updated)
  }

  const getAgentName = (agentId: string) => {
    return agents.find(a => a.id === agentId)?.name || `Agent ${agentId}`
  }

  const getLastRunScore = (suiteId: string) => {
    const suiteRuns = runs.filter(r => r.suiteId === suiteId)
    if (suiteRuns.length === 0) return null
    return suiteRuns[suiteRuns.length - 1].score
  }

  const selectedSuite = suites.find(s => s.id === selectedSuiteId)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Agent <span className="text-blue-600">Evaluation</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Test suites for evaluating agent responses and scoring performance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Eval Suites Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Eval Suites</h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showCreateForm ? 'Cancel' : 'New Suite'}
            </button>
          </div>

          {showCreateForm && (
            <form onSubmit={handleCreateSuite} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 mb-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Suite name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Optional description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agent</label>
                <select
                  value={formAgentId}
                  onChange={e => setFormAgentId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select an agent</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Test Cases</label>
                  <button type="button" onClick={addTestCase} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    + Add Test Case
                  </button>
                </div>
                <div className="space-y-3">
                  {formTestCases.map((tc, i) => (
                    <div key={i} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Test Case {i + 1}</span>
                        {formTestCases.length > 1 && (
                          <button type="button" onClick={() => removeTestCase(i)} className="text-xs text-red-500 hover:text-red-600 font-medium">
                            Remove
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={tc.input}
                        onChange={e => updateTestCase(i, 'input', e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        placeholder="Input prompt"
                      />
                      <input
                        type="text"
                        value={tc.expectedOutput}
                        onChange={e => updateTestCase(i, 'expectedOutput', e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        placeholder="Expected output (keywords)"
                      />
                      <input
                        type="text"
                        value={tc.criteria}
                        onChange={e => updateTestCase(i, 'criteria', e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        placeholder="Evaluation criteria"
                      />
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500 dark:text-gray-400">Weight:</label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={tc.weight}
                          onChange={e => updateTestCase(i, 'weight', parseInt(e.target.value) || 1)}
                          className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Suite
              </button>
            </form>
          )}

          <div className="space-y-3">
            {suites.length === 0 && !showCreateForm && (
              <p className="text-sm text-gray-500 dark:text-gray-400">No eval suites yet. Create one to get started.</p>
            )}
            {suites.map(suite => {
              const lastScore = getLastRunScore(suite.id)
              return (
                <div
                  key={suite.id}
                  onClick={() => setSelectedSuiteId(suite.id)}
                  className={`bg-white dark:bg-gray-800 border rounded-xl p-4 cursor-pointer transition-colors ${
                    selectedSuiteId === suite.id
                      ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{suite.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{suite.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Agent: <span className="font-medium text-gray-700 dark:text-gray-300">{getAgentName(suite.agentId)}</span>
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {suite.testCases.length} test case{suite.testCases.length !== 1 ? 's' : ''}
                        </span>
                        {lastScore !== null && <ScoreBadge score={lastScore} />}
                      </div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); handleDeleteSuite(suite.id) }}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Delete suite"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Run Results Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {selectedSuite ? `Runs: ${selectedSuite.name}` : 'Run Results'}
            </h2>
            {selectedSuiteId && (
              <button
                onClick={() => handleRunEval(selectedSuiteId)}
                disabled={running}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {running && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {running ? 'Running...' : 'Run Evaluation'}
              </button>
            )}
          </div>

          {!selectedSuiteId && (
            <p className="text-sm text-gray-500 dark:text-gray-400">Select a suite to view its runs.</p>
          )}

          {selectedSuiteId && runs.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">No runs yet. Click &quot;Run Evaluation&quot; to start.</p>
          )}

          <div className="space-y-3">
            {runs.map(run => (
              <div key={run.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <div
                  onClick={() => setExpandedRunId(expandedRunId === run.id ? null : run.id)}
                  className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ScoreBadge score={run.score} />
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        run.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : run.status === 'running' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {run.status}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {run.results.filter(r => r.passed).length}/{run.results.length} passed
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {new Date(run.startedAt).toLocaleString()}
                      </span>
                      <svg className={`h-4 w-4 text-gray-400 transition-transform ${expandedRunId === run.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {expandedRunId === run.id && (
                  <div className="border-t border-gray-200 dark:border-gray-700">
                    {run.results.map((result, i) => (
                      <div key={result.testCaseId} className={`p-4 ${i > 0 ? 'border-t border-gray-100 dark:border-gray-700' : ''}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <PassFailBadge passed={result.passed} />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Score: {result.score}/100</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Input</span>
                            <p className="text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 rounded px-3 py-2 mt-0.5">{result.input}</p>
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Output</span>
                            <p className="text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 rounded px-3 py-2 mt-0.5">{result.output}</p>
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Reasoning</span>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{result.reasoning}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
