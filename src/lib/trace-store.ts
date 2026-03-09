export interface Span {
  id: string
  traceId: string
  name: string
  type: 'llm' | 'tool' | 'delegation' | 'system'
  startedAt: Date
  endedAt?: Date
  duration?: number
  input?: string
  output?: string
  metadata?: Record<string, unknown>
  parentSpanId?: string
}

export interface Trace {
  id: string
  agentId: string
  sessionId: string
  startedAt: Date
  endedAt?: Date
  status: 'running' | 'completed' | 'error'
  spans: Span[]
}

let traces: Trace[] = []
let nextTraceId = 1
let nextSpanId = 1

function genTraceId() {
  return `trace-${String(nextTraceId++).padStart(4, '0')}`
}

function genSpanId() {
  return `span-${String(nextSpanId++).padStart(5, '0')}`
}

export const traceStore = {
  createTrace(agentId: string, sessionId: string): Trace {
    const trace: Trace = {
      id: genTraceId(),
      agentId,
      sessionId,
      startedAt: new Date(),
      status: 'running',
      spans: [],
    }
    traces.push(trace)
    return trace
  },

  addSpan(traceId: string, span: Omit<Span, 'id' | 'traceId'>): Span | null {
    const trace = traces.find(t => t.id === traceId)
    if (!trace) return null
    const full: Span = { ...span, id: genSpanId(), traceId }
    trace.spans.push(full)
    return full
  },

  completeTrace(traceId: string, status: 'completed' | 'error' = 'completed'): Trace | null {
    const trace = traces.find(t => t.id === traceId)
    if (!trace) return null
    trace.status = status
    trace.endedAt = new Date()
    return trace
  },

  getTrace(id: string): Trace | undefined {
    return traces.find(t => t.id === id)
  },

  getTraces(agentId?: string): Trace[] {
    if (agentId) return traces.filter(t => t.agentId === agentId)
    return traces
  },

  getRecentTraces(limit: number = 20): Trace[] {
    return [...traces].sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime()).slice(0, limit)
  },
}

// Pre-seed sample traces
function seed() {
  const now = new Date()
  const ago = (mins: number) => new Date(now.getTime() - mins * 60_000)
  const agoMs = (mins: number, ms: number) => new Date(now.getTime() - mins * 60_000 + ms)

  // Trace 1: Code review - completed
  const t1: Trace = {
    id: genTraceId(),
    agentId: '3',
    sessionId: 'sess-001',
    startedAt: ago(45),
    endedAt: ago(44),
    status: 'completed',
    spans: [],
  }
  const t1s1: Span = { id: genSpanId(), traceId: t1.id, name: 'Parse PR diff', type: 'system', startedAt: ago(45), endedAt: agoMs(45, 120), duration: 120, input: 'PR #482 diff payload', output: '3 files changed: auth.ts, middleware.ts, api/login.ts' }
  const t1s2: Span = { id: genSpanId(), traceId: t1.id, name: 'Analyze security patterns', type: 'llm', startedAt: agoMs(45, 120), endedAt: agoMs(45, 2400), duration: 2280, input: 'Review 3 changed files for security vulnerabilities', output: 'Found SQL injection risk in login.ts:34 and hardcoded JWT secret in auth.ts:12' }
  const t1s3: Span = { id: genSpanId(), traceId: t1.id, name: 'read_file', type: 'tool', startedAt: agoMs(45, 2400), endedAt: agoMs(45, 2500), duration: 100, input: 'src/auth.ts', output: '142 lines read', parentSpanId: t1s2.id }
  const t1s4: Span = { id: genSpanId(), traceId: t1.id, name: 'read_file', type: 'tool', startedAt: agoMs(45, 2500), endedAt: agoMs(45, 2580), duration: 80, input: 'src/api/login.ts', output: '67 lines read', parentSpanId: t1s2.id }
  const t1s5: Span = { id: genSpanId(), traceId: t1.id, name: 'Delegate to security-scanner', type: 'delegation', startedAt: agoMs(45, 2580), endedAt: agoMs(45, 4700), duration: 2120, input: 'Deep scan auth.ts for credential handling issues', output: 'No additional issues found beyond hardcoded secret' }
  const t1s6: Span = { id: genSpanId(), traceId: t1.id, name: 'Generate review summary', type: 'llm', startedAt: agoMs(45, 4700), endedAt: agoMs(45, 5100), duration: 400, input: 'Compile findings into PR review', output: '2 critical findings, 1 warning. Review posted to PR #482.' }
  t1.spans = [t1s1, t1s2, t1s3, t1s4, t1s5, t1s6]

  // Trace 2: Data pipeline ETL - completed
  const t2: Trace = {
    id: genTraceId(),
    agentId: '2',
    sessionId: 'sess-002',
    startedAt: ago(120),
    endedAt: ago(119),
    status: 'completed',
    spans: [],
  }
  const t2s1: Span = { id: genSpanId(), traceId: t2.id, name: 'Initialize pipeline', type: 'system', startedAt: ago(120), endedAt: agoMs(120, 200), duration: 200, input: 'Daily ETL for 2026-03-09', output: 'Pipeline config loaded' }
  const t2s2: Span = { id: genSpanId(), traceId: t2.id, name: 'query_database', type: 'tool', startedAt: agoMs(120, 200), endedAt: agoMs(120, 540), duration: 340, input: 'SELECT count(*) FROM events WHERE date = \'2026-03-09\'', output: '48,291 rows returned' }
  const t2s3: Span = { id: genSpanId(), traceId: t2.id, name: 'Transform metrics', type: 'llm', startedAt: agoMs(120, 540), endedAt: agoMs(120, 2640), duration: 2100, input: '48,291 raw events', output: 'Aggregated into 12 metric buckets' }
  const t2s4: Span = { id: genSpanId(), traceId: t2.id, name: 'write_file', type: 'tool', startedAt: agoMs(120, 2640), endedAt: agoMs(120, 3530), duration: 890, input: 's3://analytics/2026-03-09.parquet', output: 'Written successfully, 12 rows' }
  const t2s5: Span = { id: genSpanId(), traceId: t2.id, name: 'Validate output', type: 'llm', startedAt: agoMs(120, 3530), endedAt: agoMs(120, 3950), duration: 420, input: 'Validate row count and null checks', output: 'Row count matches source. No nulls in required fields.' }
  t2.spans = [t2s1, t2s2, t2s3, t2s4, t2s5]

  // Trace 3: Deploy - error
  const t3: Trace = {
    id: genTraceId(),
    agentId: '1',
    sessionId: 'sess-003',
    startedAt: ago(200),
    endedAt: ago(199),
    status: 'error',
    spans: [],
  }
  const t3s1: Span = { id: genSpanId(), traceId: t3.id, name: 'git_checkout', type: 'tool', startedAt: ago(200), endedAt: agoMs(200, 220), duration: 220, input: 'tag v2.4.1', output: 'Checked out v2.4.1' }
  const t3s2: Span = { id: genSpanId(), traceId: t3.id, name: 'run_tests', type: 'tool', startedAt: agoMs(200, 220), endedAt: agoMs(200, 6420), duration: 6200, input: 'npm test -- --ci', output: '342 tests, 341 passed, 1 failed: integration/payments.test.ts' }
  const t3s3: Span = { id: genSpanId(), traceId: t3.id, name: 'Evaluate test results', type: 'llm', startedAt: agoMs(200, 6420), endedAt: agoMs(200, 6600), duration: 180, input: 'Test suite results with 1 failure', output: 'Test suite failed: integration/payments.test.ts. Aborting deploy.' }
  t3.spans = [t3s1, t3s2, t3s3]

  // Trace 4: Support ticket - completed
  const t4: Trace = {
    id: genTraceId(),
    agentId: '1',
    sessionId: 'sess-004',
    startedAt: ago(300),
    endedAt: ago(298),
    status: 'completed',
    spans: [],
  }
  const t4s1: Span = { id: genSpanId(), traceId: t4.id, name: 'fetch_ticket', type: 'tool', startedAt: ago(300), endedAt: agoMs(300, 180), duration: 180, input: 'Ticket #1094', output: 'Customer: Jane Doe (cust_8821), Plan: Pro' }
  const t4s2: Span = { id: genSpanId(), traceId: t4.id, name: 'query_billing', type: 'tool', startedAt: agoMs(300, 180), endedAt: agoMs(300, 470), duration: 290, input: 'cust_8821 billing history', output: 'Two charges of $49.99 on 2026-03-07. One is duplicate.' }
  const t4s3: Span = { id: genSpanId(), traceId: t4.id, name: 'Draft refund response', type: 'llm', startedAt: agoMs(300, 470), endedAt: agoMs(300, 1870), duration: 1400, input: 'Duplicate charge identified for cust_8821', output: 'Drafted refund approval for $49.99' }
  const t4s4: Span = { id: genSpanId(), traceId: t4.id, name: 'Delegate to billing-agent', type: 'delegation', startedAt: agoMs(300, 1870), endedAt: agoMs(300, 2970), duration: 1100, input: 'Process refund $49.99 for cust_8821', output: 'Refund ref_3391 processed successfully' }
  const t4s5: Span = { id: genSpanId(), traceId: t4.id, name: 'Close ticket', type: 'system', startedAt: agoMs(300, 2970), endedAt: agoMs(300, 3210), duration: 240, input: 'Send response and close ticket #1094', output: 'Customer notified. Ticket resolved.' }
  t4.spans = [t4s1, t4s2, t4s3, t4s4, t4s5]

  // Trace 5: Currently running
  const t5: Trace = {
    id: genTraceId(),
    agentId: '2',
    sessionId: 'sess-005',
    startedAt: ago(2),
    status: 'running',
    spans: [],
  }
  const t5s1: Span = { id: genSpanId(), traceId: t5.id, name: 'Parse content brief', type: 'system', startedAt: ago(2), endedAt: agoMs(2, 300), duration: 300, input: 'Blog post about AI agents in production', output: 'Brief parsed: topic=AI agents, tone=technical, length=1500 words' }
  const t5s2: Span = { id: genSpanId(), traceId: t5.id, name: 'Research topic', type: 'llm', startedAt: agoMs(2, 300), endedAt: agoMs(2, 3500), duration: 3200, input: 'Research current state of AI agents in production environments', output: 'Compiled 8 key points with references' }
  const t5s3: Span = { id: genSpanId(), traceId: t5.id, name: 'web_search', type: 'tool', startedAt: agoMs(2, 3500), endedAt: agoMs(2, 4200), duration: 700, input: 'AI agents production deployment 2026', output: '12 results returned', parentSpanId: t5s2.id }
  t5.spans = [t5s1, t5s2, t5s3]

  traces = [t5, t1, t2, t3, t4]
}

seed()
