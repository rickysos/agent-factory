import { agentStore } from './agent-store'

export interface MarketplaceListing {
  id: string
  name: string
  description: string
  author: string
  category: string
  type: 'agent' | 'workflow' | 'skill'
  rating: number
  installs: number
  tags: string[]
  config: Record<string, unknown>
  featured: boolean
}

const listings: MarketplaceListing[] = [
  // Agents
  {
    id: 'mp-agent-1',
    name: 'Customer Support Bot',
    description: 'Handles tier-1 customer inquiries with empathy, resolves common issues from your knowledge base, and escalates complex tickets to human agents with full context.',
    author: 'supportly',
    category: 'support',
    type: 'agent',
    rating: 4.8,
    installs: 31200,
    tags: ['helpdesk', 'tickets', 'chat', 'knowledge-base'],
    config: { model: 'claude-haiku-4-5-20251001', capabilities: ['Q&A', 'Ticket Creation', 'Escalation', 'Knowledge Base'], status: 'draft' as const },
    featured: true,
  },
  {
    id: 'mp-agent-2',
    name: 'Code Reviewer',
    description: 'Analyzes pull requests for bugs, security vulnerabilities, and style issues. Posts inline comments with actionable suggestions and approves clean PRs automatically.',
    author: 'codecheck',
    category: 'development',
    type: 'agent',
    rating: 4.7,
    installs: 28400,
    tags: ['github', 'code-review', 'security', 'quality'],
    config: { model: 'claude-sonnet-4-6', capabilities: ['Code Analysis', 'Security Review', 'Style Check', 'Auto-Approve'], status: 'draft' as const },
    featured: true,
  },
  {
    id: 'mp-agent-3',
    name: 'Content Writer',
    description: 'Creates SEO-optimized blog posts, landing page copy, and marketing emails. Adapts tone and style to your brand voice guidelines.',
    author: 'contentforge',
    category: 'marketing',
    type: 'agent',
    rating: 4.5,
    installs: 19800,
    tags: ['writing', 'seo', 'blog', 'copywriting'],
    config: { model: 'claude-sonnet-4-6', capabilities: ['Blog Writing', 'SEO Optimization', 'Email Copy', 'Landing Pages'], status: 'draft' as const },
    featured: false,
  },
  {
    id: 'mp-agent-4',
    name: 'Data Analyst',
    description: 'Performs statistical analysis on datasets, generates visualizations, and produces executive summaries. Connects to SQL databases and CSV files.',
    author: 'datacraft',
    category: 'data',
    type: 'agent',
    rating: 4.6,
    installs: 14300,
    tags: ['analytics', 'sql', 'visualization', 'reporting'],
    config: { model: 'claude-sonnet-4-6', capabilities: ['SQL Queries', 'Statistical Analysis', 'Chart Generation', 'Report Writing'], status: 'draft' as const },
    featured: false,
  },
  {
    id: 'mp-agent-5',
    name: 'DevOps Monitor',
    description: 'Watches infrastructure health metrics, detects anomalies, auto-remediates common issues, and pages on-call when human intervention is needed.',
    author: 'cloud-ops',
    category: 'devops',
    type: 'agent',
    rating: 4.9,
    installs: 22100,
    tags: ['monitoring', 'alerting', 'kubernetes', 'infrastructure'],
    config: { model: 'claude-haiku-4-5-20251001', capabilities: ['Health Monitoring', 'Anomaly Detection', 'Auto-Remediation', 'Incident Paging'], status: 'draft' as const },
    featured: true,
  },
  {
    id: 'mp-agent-6',
    name: 'SEO Optimizer',
    description: 'Audits pages for SEO issues, suggests keyword improvements, monitors rankings, and generates meta descriptions and structured data.',
    author: 'rankboost',
    category: 'marketing',
    type: 'agent',
    rating: 4.4,
    installs: 11700,
    tags: ['seo', 'keywords', 'rankings', 'meta-tags'],
    config: { model: 'claude-haiku-4-5-20251001', capabilities: ['SEO Audit', 'Keyword Research', 'Rank Tracking', 'Meta Generation'], status: 'draft' as const },
    featured: false,
  },
  // Workflows
  {
    id: 'mp-workflow-1',
    name: 'Bug Triage Pipeline',
    description: 'Automatically classifies incoming bug reports by severity and component, deduplicates against existing issues, enriches with logs, and routes to the right team.',
    author: 'helpdesk-ai',
    category: 'development',
    type: 'workflow',
    rating: 4.8,
    installs: 16500,
    tags: ['bugs', 'triage', 'automation', 'github-issues'],
    config: { model: 'claude-haiku-4-5-20251001', capabilities: ['Bug Classification', 'Duplicate Detection', 'Log Enrichment', 'Team Routing'], status: 'draft' as const },
    featured: true,
  },
  {
    id: 'mp-workflow-2',
    name: 'Content Publishing Flow',
    description: 'End-to-end content pipeline: draft generation, editorial review, SEO check, image creation, CMS upload, and social media scheduling.',
    author: 'contentforge',
    category: 'marketing',
    type: 'workflow',
    rating: 4.5,
    installs: 9400,
    tags: ['content', 'publishing', 'cms', 'social-media'],
    config: { model: 'claude-sonnet-4-6', capabilities: ['Draft Generation', 'Editorial Review', 'CMS Upload', 'Social Scheduling'], status: 'draft' as const },
    featured: false,
  },
  {
    id: 'mp-workflow-3',
    name: 'CI/CD Monitor',
    description: 'Tracks build and deployment pipelines, detects failures, identifies flaky tests, and posts status updates to Slack with actionable remediation steps.',
    author: 'devops-labs',
    category: 'devops',
    type: 'workflow',
    rating: 4.7,
    installs: 12800,
    tags: ['ci-cd', 'builds', 'deployments', 'slack'],
    config: { model: 'claude-haiku-4-5-20251001', capabilities: ['Build Monitoring', 'Failure Detection', 'Flaky Test ID', 'Slack Notifications'], status: 'draft' as const },
    featured: false,
  },
  {
    id: 'mp-workflow-4',
    name: 'Customer Onboarding',
    description: 'Guides new customers through setup with personalized welcome emails, product tours, milestone check-ins, and proactive support outreach.',
    author: 'supportly',
    category: 'support',
    type: 'workflow',
    rating: 4.6,
    installs: 8200,
    tags: ['onboarding', 'email-sequences', 'customer-success'],
    config: { model: 'claude-haiku-4-5-20251001', capabilities: ['Welcome Emails', 'Product Tours', 'Milestone Tracking', 'Proactive Support'], status: 'draft' as const },
    featured: false,
  },
  // Skills
  {
    id: 'mp-skill-1',
    name: 'Web Scraping',
    description: 'Extracts structured data from any webpage using CSS selectors or AI-powered parsing. Handles pagination, authentication, and rate limiting.',
    author: 'scrapekit',
    category: 'data',
    type: 'skill',
    rating: 4.6,
    installs: 24500,
    tags: ['scraping', 'extraction', 'html', 'automation'],
    config: { model: 'claude-haiku-4-5-20251001', capabilities: ['Web Scraping', 'Data Extraction', 'Pagination', 'Auth Handling'], status: 'draft' as const },
    featured: false,
  },
  {
    id: 'mp-skill-2',
    name: 'PDF Parser',
    description: 'Parses PDF documents to extract text, tables, and metadata. Supports scanned documents via OCR and outputs structured JSON.',
    author: 'doctools',
    category: 'productivity',
    type: 'skill',
    rating: 4.5,
    installs: 18200,
    tags: ['pdf', 'parsing', 'ocr', 'documents'],
    config: { model: 'claude-haiku-4-5-20251001', capabilities: ['PDF Parsing', 'Table Extraction', 'OCR', 'Metadata'], status: 'draft' as const },
    featured: false,
  },
  {
    id: 'mp-skill-3',
    name: 'Email Sender',
    description: 'Composes and sends emails with templates, attachments, and open/click tracking. Supports bulk sending with personalization.',
    author: 'mailcraft',
    category: 'productivity',
    type: 'skill',
    rating: 4.3,
    installs: 20300,
    tags: ['email', 'templates', 'tracking', 'outreach'],
    config: { model: 'claude-haiku-4-5-20251001', capabilities: ['Email Sending', 'Templates', 'Tracking', 'Bulk Send'], status: 'draft' as const },
    featured: false,
  },
  {
    id: 'mp-skill-4',
    name: 'Slack Notifier',
    description: 'Sends formatted messages, threads, and rich attachments to Slack channels. Supports interactive buttons and scheduled messages.',
    author: 'slackops',
    category: 'productivity',
    type: 'skill',
    rating: 4.7,
    installs: 28900,
    tags: ['slack', 'notifications', 'messaging', 'integrations'],
    config: { model: 'claude-haiku-4-5-20251001', capabilities: ['Slack Messages', 'Threads', 'Attachments', 'Scheduled Posts'], status: 'draft' as const },
    featured: false,
  },
  {
    id: 'mp-skill-5',
    name: 'Database Query',
    description: 'Executes read-only SQL queries against PostgreSQL, MySQL, and SQLite databases. Returns results as structured JSON with column metadata.',
    author: 'dbtools',
    category: 'data',
    type: 'skill',
    rating: 4.4,
    installs: 15600,
    tags: ['sql', 'database', 'postgres', 'mysql'],
    config: { model: 'claude-haiku-4-5-20251001', capabilities: ['SQL Queries', 'Multi-DB Support', 'Result Formatting', 'Schema Inspection'], status: 'draft' as const },
    featured: false,
  },
]

export const marketplaceStore = {
  getAll(): MarketplaceListing[] {
    return listings
  },

  getByCategory(category: string): MarketplaceListing[] {
    return listings.filter(l => l.category === category)
  },

  getByType(type: 'agent' | 'workflow' | 'skill'): MarketplaceListing[] {
    return listings.filter(l => l.type === type)
  },

  search(query: string): MarketplaceListing[] {
    const q = query.toLowerCase()
    return listings.filter(l =>
      l.name.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q) ||
      l.tags.some(t => t.toLowerCase().includes(q))
    )
  },

  getFeatured(): MarketplaceListing[] {
    return listings.filter(l => l.featured)
  },

  getById(id: string): MarketplaceListing | undefined {
    return listings.find(l => l.id === id)
  },

  install(id: string) {
    const listing = listings.find(l => l.id === id)
    if (!listing) return null
    listing.installs += 1
    const config = listing.config as { model?: string; capabilities?: string[]; status?: string }
    const agent = agentStore.create({
      name: listing.name,
      description: listing.description,
      model: config.model || 'claude-haiku-4-5-20251001',
      status: (config.status as 'draft' | 'active' | 'inactive' | 'error') || 'draft',
      capabilities: config.capabilities || [],
    })
    return agent
  },
}
