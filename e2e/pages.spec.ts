import { test, expect } from '@playwright/test'

const pages = [
  { url: '/', title: 'Agent Factory' },
  { url: '/library', title: 'Agent Library' },
  { url: '/agent-editor', title: 'Agent Definition' },
  { url: '/presets', title: 'Agent Type Presets' },
  { url: '/chat', title: 'Agent Chat' },
  { url: '/playground', title: 'Playground' },
  { url: '/launch', title: 'Agent Launcher' },
  { url: '/maintenance', title: 'Maintenance' },
  { url: '/scoring', title: 'Performance' },
  { url: '/stacks', title: 'Stack Templates' },
  { url: '/templates', title: 'Persona' },
  { url: '/templates/teams', title: 'Team' },
  { url: '/sandbox', title: 'Code Sandbox' },
  { url: '/skill-creator', title: 'Skill Creator' },
  { url: '/workflows', title: 'Workflow' },
  { url: '/agent-routing', title: 'Routing' },
  { url: '/models', title: 'Model' },
  { url: '/local-models', title: 'Local Model' },
  { url: '/skills', title: 'Skill' },
  { url: '/tools', title: 'Tool' },
  { url: '/thinking', title: 'Thinking' },
  { url: '/memory-config', title: 'Memory' },
  { url: '/providers', title: 'Provider' },
  { url: '/config-diff', title: 'Config' },
  { url: '/routing', title: 'Model Routing' },
  { url: '/triggers', title: 'Trigger' },
  { url: '/channels', title: 'Channel' },
  { url: '/messaging', title: 'Messaging' },
  { url: '/mcp', title: 'MCP' },
  { url: '/cron', title: 'Scheduled' },
  { url: '/gateway', title: 'Gateway' },
  { url: '/gateway-config', title: 'Gateway' },
  { url: '/deploy', title: 'Deploy' },
  { url: '/monitoring', title: 'Monitor' },
  { url: '/traces', title: 'Trace' },
  { url: '/sessions', title: 'Session' },
  { url: '/costs', title: 'Cost' },
  { url: '/alerts', title: 'Alert' },
  { url: '/telemetry', title: 'Telemetry' },
  { url: '/memory', title: 'Memory' },
  { url: '/feedback', title: 'Feedback' },
  { url: '/marketplace/templates', title: 'Template' },
  { url: '/marketplace/skills', title: 'Skill' },
  { url: '/settings/sso', title: 'SSO' },
  { url: '/settings/audit', title: 'Audit' },
  { url: '/settings/tenants', title: 'Tenant' },
  { url: '/settings/billing', title: 'Billing' },
  { url: '/environment', title: 'Environment' },
  { url: '/setup', title: 'Setup' },
  { url: '/quick-start', title: 'Quick Start' },
  { url: '/login', title: 'Sign In' },
]

test.describe('All Pages Load', () => {
  for (const { url, title } of pages) {
    test(`${url} loads and contains "${title}"`, async ({ page }) => {
      const res = await page.goto(url)
      expect(res?.status()).toBeLessThan(400)
      await expect(page.locator('body')).toContainText(title, { ignoreCase: true, timeout: 10000 })
    })
  }
})
