export interface TeamTemplate {
  id: string
  name: string
  description: string
  emoji: string
  orchestrator: {
    name: string
    model: string
    role: string
  }
  subAgents: {
    name: string
    model: string
    role: string
  }[]
  cronJobs: {
    schedule: string
    task: string
    agentId: string
  }[]
}

export const teamTemplates: TeamTemplate[] = [
  {
    id: 'personal-productivity',
    name: 'Personal Productivity',
    description: 'An AI-powered personal assistant team that manages your calendar, email, and daily workflow to keep you organized and on track.',
    emoji: '📋',
    orchestrator: {
      name: 'Productivity Orchestrator',
      model: 'claude-opus-4-6',
      role: 'Coordinates calendar and email agents, prioritizes tasks, resolves scheduling conflicts, and synthesizes daily briefings from all personal productivity data sources.',
    },
    subAgents: [
      {
        name: 'Calendar Manager',
        model: 'claude-sonnet-4-6',
        role: 'Manages calendar events, detects scheduling conflicts, suggests optimal meeting times based on energy patterns, and sends reminders for upcoming commitments.',
      },
      {
        name: 'Email Manager',
        model: 'claude-sonnet-4-6',
        role: 'Triages incoming emails by urgency and category, drafts contextual replies, flags action items, and maintains inbox zero through smart archival rules.',
      },
    ],
    cronJobs: [
      {
        schedule: '0 8 * * *',
        task: 'Generate daily agenda briefing with calendar events, priority tasks, and weather context',
        agentId: 'productivity-orchestrator',
      },
      {
        schedule: '0 */2 * * *',
        task: 'Scan inbox for new messages, triage by priority, and surface urgent items requiring immediate attention',
        agentId: 'email-manager',
      },
    ],
  },
  {
    id: 'software-development',
    name: 'Software Development',
    description: 'A development team that automates code review, testing, and CI/CD monitoring to accelerate your software delivery pipeline.',
    emoji: '💻',
    orchestrator: {
      name: 'Dev Orchestrator',
      model: 'claude-opus-4-6',
      role: 'Coordinates code review and testing workflows, manages PR pipelines, tracks build health, and escalates critical failures to the appropriate team members.',
    },
    subAgents: [
      {
        name: 'Code Reviewer',
        model: 'claude-sonnet-4-6',
        role: 'Performs automated code reviews on pull requests, checks for security vulnerabilities, enforces coding standards, and suggests performance improvements.',
      },
      {
        name: 'Testing Agent',
        model: 'claude-sonnet-4-6',
        role: 'Runs test suites, generates coverage reports, identifies flaky tests, and creates regression test cases for newly discovered bugs.',
      },
    ],
    cronJobs: [
      {
        schedule: '*/30 * * * *',
        task: 'Check for new and updated pull requests, assign reviewers, and run automated code analysis',
        agentId: 'code-reviewer',
      },
      {
        schedule: '0 * * * *',
        task: 'Execute full test suite, compare coverage against thresholds, and report failures to the dev channel',
        agentId: 'testing-agent',
      },
    ],
  },
  {
    id: 'financial-analyst',
    name: 'Financial Analyst',
    description: 'A finance team that monitors markets, analyzes data trends, and generates comprehensive reports for informed decision-making.',
    emoji: '📊',
    orchestrator: {
      name: 'Finance Orchestrator',
      model: 'claude-opus-4-6',
      role: 'Coordinates market data collection and report generation, identifies cross-asset correlations, and synthesizes insights from multiple financial data streams into actionable intelligence.',
    },
    subAgents: [
      {
        name: 'Data Analyst',
        model: 'claude-sonnet-4-6',
        role: 'Collects and processes market data feeds, performs statistical analysis on price movements, identifies anomalies, and maintains historical data warehouses.',
      },
      {
        name: 'Report Generator',
        model: 'claude-sonnet-4-6',
        role: 'Produces formatted financial reports with charts and visualizations, generates executive summaries, and distributes reports to stakeholders on schedule.',
      },
    ],
    cronJobs: [
      {
        schedule: '0 * * * *',
        task: 'Pull latest market data, compute key indicators, and flag significant price movements or volume anomalies',
        agentId: 'data-analyst',
      },
      {
        schedule: '0 18 * * *',
        task: 'Compile end-of-day financial report with performance summaries, risk metrics, and next-day outlook',
        agentId: 'report-generator',
      },
    ],
  },
  {
    id: 'social-media-manager',
    name: 'Social Media Manager',
    description: 'A social media team that researches trends, creates engaging content, and schedules posts across platforms to grow your online presence.',
    emoji: '📱',
    orchestrator: {
      name: 'Social Hub',
      model: 'claude-opus-4-6',
      role: 'Coordinates content strategy across platforms, aligns research insights with content creation, manages the editorial calendar, and tracks engagement metrics to optimize posting strategy.',
    },
    subAgents: [
      {
        name: 'Research Agent',
        model: 'claude-sonnet-4-6',
        role: 'Monitors trending topics and hashtags across platforms, analyzes competitor content strategies, identifies viral content patterns, and surfaces timely opportunities for engagement.',
      },
      {
        name: 'Content Creator',
        model: 'claude-sonnet-4-6',
        role: 'Generates platform-optimized content including copy, captions, and thread structures, adapts tone for each audience, and creates A/B test variants for high-priority posts.',
      },
    ],
    cronJobs: [
      {
        schedule: '0 */2 * * *',
        task: 'Scan trending topics across Twitter, LinkedIn, and Reddit to identify relevant content opportunities',
        agentId: 'research-agent',
      },
      {
        schedule: '0 */4 * * *',
        task: 'Review content queue, schedule upcoming posts for optimal engagement windows, and requeue underperforming content',
        agentId: 'content-creator',
      },
    ],
  },
  {
    id: 'crm',
    name: 'CRM',
    description: 'A customer relationship team that manages contacts, tracks interactions, and automates follow-ups to keep your pipeline healthy and moving.',
    emoji: '🤝',
    orchestrator: {
      name: 'CRM Orchestrator',
      model: 'claude-opus-4-6',
      role: 'Oversees the entire customer relationship pipeline, coordinates contact management with follow-up scheduling, scores leads, and ensures no opportunities fall through the cracks.',
    },
    subAgents: [
      {
        name: 'Contact Manager',
        model: 'claude-sonnet-4-6',
        role: 'Maintains and enriches contact records, deduplicates entries, tracks interaction history, and segments contacts by engagement level and deal stage.',
      },
      {
        name: 'Follow-up Agent',
        model: 'claude-sonnet-4-6',
        role: 'Schedules and drafts personalized follow-up messages, tracks response rates, escalates stale deals, and suggests next-best-action for each contact based on interaction patterns.',
      },
    ],
    cronJobs: [
      {
        schedule: '0 * * * *',
        task: 'Scan for overdue follow-ups, draft reminder messages, and flag high-priority contacts requiring immediate outreach',
        agentId: 'follow-up-agent',
      },
      {
        schedule: '0 17 * * *',
        task: 'Generate daily CRM summary with new leads, pipeline changes, closed deals, and at-risk opportunities',
        agentId: 'crm-orchestrator',
      },
    ],
  },
  {
    id: 'customer-support',
    name: 'Customer Support',
    description: 'A support team that triages incoming tickets, drafts responses, and escalates critical issues to ensure fast, consistent customer service.',
    emoji: '🎧',
    orchestrator: {
      name: 'Support Orchestrator',
      model: 'claude-opus-4-6',
      role: 'Manages the full support ticket lifecycle, routes tickets to appropriate agents, monitors SLA compliance, and coordinates escalations to ensure timely resolution of all customer issues.',
    },
    subAgents: [
      {
        name: 'Ticket Triage',
        model: 'claude-sonnet-4-6',
        role: 'Classifies incoming tickets by category and severity, detects duplicate issues, enriches tickets with customer history context, and assigns priority scores based on impact and urgency.',
      },
      {
        name: 'Response Drafter',
        model: 'claude-sonnet-4-6',
        role: 'Generates contextual response drafts using knowledge base articles, personalizes tone based on customer sentiment, and suggests relevant help documentation for self-service resolution.',
      },
    ],
    cronJobs: [
      {
        schedule: '*/15 * * * *',
        task: 'Check for new support tickets, classify by urgency, and auto-assign to appropriate queue based on category and agent availability',
        agentId: 'ticket-triage',
      },
      {
        schedule: '0 * * * *',
        task: 'Review tickets approaching SLA breach, escalate critical unresolved issues, and notify on-call support for P0 incidents',
        agentId: 'support-orchestrator',
      },
    ],
  },
]
