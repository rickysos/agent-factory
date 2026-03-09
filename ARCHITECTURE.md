# Agent Factory Architecture
## Based on OpenClaw Orchestrator Patterns

## Overview
Agent Factory is a multi-agent development platform inspired by OpenClaw's orchestrator architecture. It enables users to create, deploy, and manage AI agents with built-in delegation, monitoring, and automation.

## Core Architecture

### 1. Agent Hierarchy (Based on OpenClaw)
```
┌─────────────────────────────────┐
│        Orchestrator (Gir)       │ ← Top-level coordinator
├─────────────────────────────────┤
│  ┌─────┬─────┬──────┬────────┐  │
│  │Coder│Vigil│Security│Market│  │ ← Specialist agents
│  └─────┴─────┴──────┴────────┘  │
└─────────────────────────────────┘
```

### 2. Key Components (Inspired by OpenClaw)

#### 2.1 Agent Configuration
```yaml
# Based on ~/.openclaw/openclaw.json pattern
agents:
  defaults:
    model: deepseek-v3.2
    workspace: /workspace
    maxConcurrent: 8
  list:
    - id: orchestrator
      model: deepseek-v3.2
      tools: [read, write, exec, delegate]
    - id: coder
      model: deepseek-v3.2
      tools: [read, write, exec, web]
```

#### 2.2 Environment Configuration
```bash
# Based on .claw/.env pattern
GITHUB_TOKEN=xxx
SENTRY_AUTH_TOKEN=xxx
VERCEL_TOKEN=xxx
SUPABASE_ACCESS_TOKEN=xxx
```

#### 2.3 Delegation Engine
- **Rule-based delegation** (task → agent mapping)
- **Load balancing** (max concurrent tasks per agent)
- **Fallback handling** (escalation when agents fail)
- **Result synthesis** (combine outputs from multiple agents)

#### 2.4 Monitoring & Cron Jobs
```json
// Based on OpenClaw cron/jobs.json
{
  "jobs": [
    {
      "agentId": "coder",
      "schedule": "every 30m",
      "task": "Check GitHub issues"
    },
    {
      "agentId": "vigil",
      "schedule": "every 5m", 
      "task": "Health check"
    }
  ]
}
```

## Feature Comparison

### OpenClaw (Source of Inspiration)
- ✅ Multi-agent orchestration
- ✅ Skill-based architecture  
- ✅ Environment configuration
- ✅ Cron scheduling
- ✅ Delegation system
- ❌ No user-facing UI
- ❌ No agent creation UI
- ❌ Limited monitoring dashboards

### Agent Factory (Our Implementation)
- ✅ Multi-agent orchestration (inherited)
- ✅ Skill-based architecture (enhanced)
- ✅ Environment configuration (inherited)
- ✅ Cron scheduling (inherited)
- ✅ Delegation system (enhanced)
- ✅ User-facing UI (new)
- ✅ Agent creation UI (new)
- ✅ Monitoring dashboards (new)
- ✅ Template system (new)
- ✅ Deployment management (new)

## Technical Stack

### Frontend (Agent Factory Specific)
- Next.js 15 with TypeScript
- React 19 with Server Components
- Tailwind CSS for styling
- React Context for state management

### Backend (Inspired by OpenClaw)
- Node.js with Express
- SQLite for agent/task tracking
- Redis for task queues (planned)
- WebSocket for real-time updates

### Agent Infrastructure (OpenClaw Pattern)
- OpenClaw-compatible agent definitions
- Environment variable management
- Tool permission system
- Model configuration per agent

## Integration Points

### 1. OpenClaw Compatibility
```javascript
// Agent Factory agents can run in OpenClaw
{
  "id": "agent-factory-coder",
  "model": "deepseek-v3.2",
  "workspace": "/agent-factory",
  "tools": ["read", "write", "exec"]
}
```

### 2. External Services (OpenClaw Pattern)
- **GitHub**: Issue tracking, PR management
- **Sentry**: Error monitoring
- **Vercel**: Deployment management
- **Supabase**: Database operations

### 3. AI Models (OpenClaw Pattern)
- DeepSeek V3.2 (default for coding/security)
- Gemini 2.5 Flash Lite (marketing)
- GLM-4.5-AIR (monitoring)
- Claude 3.5 Sonnet (planned premium tier)

## Deployment Architecture

### Development
```
localhost:3000 → Agent Factory UI
localhost:3001 → Agent Factory API
OpenClaw Gateway → Agent execution
```

### Production (Vercel + OpenClaw)
```
agent-factory.vercel.app → Frontend
api.agent-factory.com → Backend API
openclaw-gateway → Agent orchestration
```

## Expanded Architecture

### 5. Agent Stack System
Rather than creating individual agents, Agent Factory creates **agent stacks** — complete multi-agent systems with pre-configured delegation rules, cron jobs, and tool permissions.

```
┌─────────────────────────────────────────┐
│            Agent Stack Template         │
├─────────────────────────────────────────┤
│  Orchestrator                           │
│  ├── Coder Agent (DeepSeek V3.2)        │
│  ├── Security Agent (DeepSeek V3.2)     │
│  ├── Vigil Agent (GLM-4.5-AIR)          │
│  └── Marketing Agent (Gemini 2.5 Flash) │
├─────────────────────────────────────────┤
│  Delegation Rules                       │
│  Cron Jobs                              │
│  Environment Variables                  │
│  Tool Permissions                       │
│  Channel Bindings (Slack, Discord, etc) │
└─────────────────────────────────────────┘
```

### 6. Protocol Support (Planned)
- **MCP (Model Context Protocol)**: Standardized tool/resource sharing between agents
- **A2A (Agent-to-Agent)**: Cross-framework agent communication (AG2 pattern)
- **OpenClaw Gateway API**: Native runtime execution

### 7. Agent Memory & State (Planned)
Inspired by Letta's memory-first architecture:
- **Context Repositories**: Git-like versioned agent memory
- **Shared Memory**: Cross-agent state for collaborative tasks
- **Sleep-time Learning**: Offline processing during idle periods

### 8. Observability Stack (Planned)
Inspired by LangSmith and AgentOps:
- **Execution Traces**: Full trace of agent decision chains
- **Session Replay**: Replay agent sessions for debugging (AgentOps pattern)
- **Custom Dashboards**: Token usage, latency (P50/P99), error rates, cost
- **OpenTelemetry Export**: Standard observability integration

### 9. Visual Workflow Builder (Planned)
Inspired by Flowise and CrewAI:
- **Drag-and-drop agent composition**: Visual agent stack builder
- **Flow editor**: Define delegation rules visually
- **Template library**: Pre-built stacks for common use cases

## Roadmap

### Phase 1: Core MVP (Current)
- [x] Agent creation UI
- [x] Basic dashboard
- [x] Delegation engine (in-memory)
- [x] OpenClaw configuration export
- [x] Docker Compose setup
- [x] Database schema (PostgreSQL)

### Phase 2: Foundation (Next)
- [ ] Real backend API (replace mocked context)
- [ ] PostgreSQL integration (use existing schema)
- [ ] Redis task queue (replace in-memory queue)
- [ ] WebSocket real-time updates
- [ ] Authentication & RBAC
- [ ] Agent stack templates (pre-built configs)

### Phase 3: Orchestration
- [ ] Live OpenClaw gateway integration
- [ ] Visual workflow/delegation editor
- [ ] Cron job management UI
- [ ] Agent-to-agent communication
- [ ] MCP protocol support
- [ ] Channel bindings management (Slack, Discord)

### Phase 4: Observability
- [ ] Execution trace viewer
- [ ] Session replay for debugging
- [ ] Custom monitoring dashboards
- [ ] Cost tracking per agent/task
- [ ] OpenTelemetry export
- [ ] Alerting (PagerDuty, Slack webhooks)

### Phase 5: Intelligence
- [ ] Agent memory system (context repositories)
- [ ] Feedback loops (human-in-the-loop training)
- [ ] Auto-scaling agent concurrency
- [ ] Smart model routing (cost vs capability)
- [ ] Agent performance scoring

### Phase 6: Marketplace & Enterprise
- [ ] Template marketplace (share/sell agent stacks)
- [ ] Skill marketplace (reusable agent capabilities)
- [ ] SSO integration (Okta, MS Entra)
- [ ] Audit logging
- [ ] Multi-tenant support
- [ ] API keys and usage billing

## Success Metrics (Inspired by OpenClaw)

### Operational Metrics
- Task completion rate (>90%)
- Average task completion time (<30m)
- Agent utilization rate (60-80%)
- Error rate (<5%)

### User Metrics
- Agents created per user (>3)
- Tasks completed per day (>5)
- User retention (>80% weekly)
- Feature adoption rate (>60%)

## Competitive Advantage

### vs. CrewAI ($25/mo, 60% Fortune 500)
- **Stack-level**: Create entire agent teams, not individual agents
- **OpenClaw-native**: First-class runtime integration, not another abstraction layer
- **Cost-optimized**: Route to cheapest capable model per task
- **Self-hosted**: No per-execution pricing, run on your infrastructure

### vs. LangGraph/LangSmith (code-first)
- **Visual**: UI-driven agent creation, no Python required
- **Batteries included**: Delegation, scheduling, monitoring in one platform
- **Stack templates**: Pre-built multi-agent configs for common use cases

### vs. Flowise/Dify (visual builders)
- **Multi-agent first**: Built for agent teams, not single chatbot flows
- **Runtime integration**: Direct OpenClaw gateway execution
- **Production patterns**: Battle-tested orchestration from OpenClaw ecosystem

### vs. AG2/AutoGen (framework interop)
- **Simpler**: No framework complexity, just configure and deploy
- **UI-first**: Visual management vs code-first approach

### vs. Relevance AI (no-code enterprise)
- **Open-source**: Full control, no vendor lock-in
- **General purpose**: Not limited to GTM/sales workflows
- **Transparent pricing**: Self-host free

See [docs/COMPETITIVE-ANALYSIS.md](docs/COMPETITIVE-ANALYSIS.md) for detailed competitor profiles.