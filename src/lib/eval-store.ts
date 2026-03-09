export interface TestCase {
  id: string
  input: string
  expectedOutput?: string
  criteria: string
  weight: number
}

export interface EvalSuite {
  id: string
  name: string
  description: string
  agentId: string
  testCases: TestCase[]
  createdAt: Date
}

export interface TestResult {
  testCaseId: string
  input: string
  output: string
  score: number
  passed: boolean
  reasoning: string
}

export interface EvalRun {
  id: string
  suiteId: string
  agentId: string
  status: 'pending' | 'running' | 'completed'
  results: TestResult[]
  score: number
  startedAt: Date
  completedAt?: Date
}

const sampleSuite: EvalSuite = {
  id: 'suite-1',
  name: 'Basic QA',
  description: 'Basic question-answering evaluation suite',
  agentId: '1',
  testCases: [
    {
      id: 'tc-1',
      input: 'What is your name?',
      expectedOutput: 'Support Bot',
      criteria: 'Response should contain the agent name',
      weight: 1,
    },
    {
      id: 'tc-2',
      input: 'How can I reset my password?',
      expectedOutput: 'password reset',
      criteria: 'Response should mention password reset steps',
      weight: 2,
    },
    {
      id: 'tc-3',
      input: 'I need help with billing',
      expectedOutput: 'billing',
      criteria: 'Response should address billing concerns and offer assistance',
      weight: 1,
    },
  ],
  createdAt: new Date('2026-03-08'),
}

let suites: EvalSuite[] = [sampleSuite]
let runs: EvalRun[] = []
let nextSuiteId = 2
let nextRunId = 1
let nextTestCaseId = 4

function scoreTestCase(testCase: TestCase, output: string): { score: number; passed: boolean; reasoning: string } {
  const outputLower = output.toLowerCase()
  let score = 0
  const reasons: string[] = []

  if (testCase.expectedOutput) {
    const keywords = testCase.expectedOutput.toLowerCase().split(/\s+/)
    const matched = keywords.filter(kw => outputLower.includes(kw))
    const keywordScore = keywords.length > 0 ? matched.length / keywords.length : 0
    score += keywordScore * 50
    reasons.push(`Keyword match: ${matched.length}/${keywords.length} keywords found`)
  } else {
    score += 25
    reasons.push('No expected output defined, partial credit given')
  }

  if (testCase.criteria) {
    const criteriaKeywords = testCase.criteria.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3)
    const criteriaMatched = criteriaKeywords.filter(kw => outputLower.includes(kw))
    const criteriaScore = criteriaKeywords.length > 0 ? criteriaMatched.length / criteriaKeywords.length : 0
    score += criteriaScore * 30
    reasons.push(`Criteria relevance: ${criteriaMatched.length}/${criteriaKeywords.length} criteria terms found`)
  }

  if (output.length > 20) {
    score += 10
    reasons.push('Adequate response length')
  } else if (output.length > 5) {
    score += 5
    reasons.push('Short response')
  } else {
    reasons.push('Very short response')
  }

  if (output.length > 10 && !output.includes('error') && !output.includes('Error')) {
    score += 10
    reasons.push('No error indicators')
  }

  score = Math.min(100, Math.round(score))
  const passed = score >= 50

  return { score, passed, reasoning: reasons.join('. ') + '.' }
}

function simulateAgentResponse(input: string, agentId: string): string {
  const responses: Record<string, string> = {
    'What is your name?': `I am an AI assistant agent (ID: ${agentId}). I'm here to help you with your questions and tasks. How can I assist you today?`,
    'How can I reset my password?': 'To reset your password, follow these steps: 1) Go to the login page, 2) Click "Forgot Password", 3) Enter your email address, 4) Check your inbox for the password reset link, 5) Click the link and set a new password. If you need further assistance, please contact our support team.',
    'I need help with billing': 'I understand you need help with billing. I can assist you with viewing your current billing statements, updating payment methods, understanding charges, and resolving billing disputes. Could you please provide more details about what specific billing issue you are experiencing?',
  }
  return responses[input] || `Thank you for your question: "${input}". I'm processing your request and will provide a helpful response based on my capabilities as agent ${agentId}.`
}

export const evalStore = {
  createSuite(data: { name: string; description: string; agentId: string; testCases: Omit<TestCase, 'id'>[] }): EvalSuite {
    const suite: EvalSuite = {
      id: `suite-${nextSuiteId++}`,
      name: data.name,
      description: data.description,
      agentId: data.agentId,
      testCases: data.testCases.map(tc => ({
        ...tc,
        id: `tc-${nextTestCaseId++}`,
      })),
      createdAt: new Date(),
    }
    suites.push(suite)
    return suite
  },

  getSuites(agentId?: string): EvalSuite[] {
    if (agentId) return suites.filter(s => s.agentId === agentId)
    return suites
  },

  getSuite(id: string): EvalSuite | undefined {
    return suites.find(s => s.id === id)
  },

  deleteSuite(id: string): boolean {
    const len = suites.length
    suites = suites.filter(s => s.id !== id)
    runs = runs.filter(r => r.suiteId !== id)
    return suites.length < len
  },

  createRun(suiteId: string, agentId: string): EvalRun | null {
    const suite = suites.find(s => s.id === suiteId)
    if (!suite) return null

    const results: TestResult[] = suite.testCases.map(tc => {
      const output = simulateAgentResponse(tc.input, agentId)
      const { score, passed, reasoning } = scoreTestCase(tc, output)
      return { testCaseId: tc.id, input: tc.input, output, score, passed, reasoning }
    })

    const totalWeight = suite.testCases.reduce((sum, tc) => sum + tc.weight, 0)
    const weightedScore = totalWeight > 0
      ? suite.testCases.reduce((sum, tc, i) => sum + results[i].score * tc.weight, 0) / totalWeight
      : 0

    const run: EvalRun = {
      id: `run-${nextRunId++}`,
      suiteId,
      agentId,
      status: 'completed',
      results,
      score: Math.round(weightedScore),
      startedAt: new Date(),
      completedAt: new Date(),
    }
    runs.push(run)
    return run
  },

  getRuns(suiteId?: string): EvalRun[] {
    if (suiteId) return runs.filter(r => r.suiteId === suiteId)
    return runs
  },

  getRun(id: string): EvalRun | undefined {
    return runs.find(r => r.id === id)
  },
}
