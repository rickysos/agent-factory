import { test, expect } from '@playwright/test'

const navPages = [
  { menu: 'Agents', item: 'Agent Library', url: '/library', heading: 'Agent Library' },
  { menu: 'Agents', item: 'Presets', url: '/presets', heading: 'Agent Type Presets' },
  { menu: 'Agents', item: /^Chat$/, url: '/chat', heading: 'Agent Chat' },
  { menu: 'Agents', item: /^Playground$/, url: '/playground', heading: 'Playground' },
  { menu: 'Agents', item: 'Launch & Run', url: '/launch', heading: 'Agent Launcher' },
  { menu: 'Agents', item: 'Scoring', url: '/scoring', heading: 'Agent Scoring' },
  { menu: 'Build', item: 'Stacks', url: '/stacks', heading: 'Agent Stack Templates' },
  { menu: 'Build', item: /^Sandbox$/, url: '/sandbox', heading: 'Code Sandbox' },
  { menu: 'Build', item: 'Skill Creator', url: '/skill-creator', heading: 'Skill Creator' },
  { menu: 'Build', item: 'Workflows', url: '/workflows', heading: 'Workflow Editor' },
  { menu: 'Configure', item: /^Models$/, url: '/models', heading: 'Model' },
  { menu: 'Configure', item: 'Skills Catalog', url: '/skills', heading: 'Skill' },
  { menu: 'Configure', item: 'Tools & Permissions', url: '/tools', heading: 'Tool Permission' },
  { menu: 'Configure', item: 'Providers', url: '/providers', heading: 'Provider' },
  { menu: 'Connect', item: /^Triggers$/, url: '/triggers', heading: 'Trigger' },
  { menu: 'Connect', item: 'Channels', url: '/channels', heading: 'Channel Binding' },
  { menu: 'Connect', item: 'MCP Servers', url: '/mcp', heading: 'MCP' },
  { menu: 'Connect', item: 'Cron Jobs', url: '/cron', heading: 'Scheduled' },
  { menu: 'Connect', item: /^Gateway$/, url: '/gateway', heading: 'Gateway' },
  { menu: 'Connect', item: 'Deploy', url: '/deploy', heading: 'Deploy' },
  { menu: 'Observe', item: 'Monitoring', url: '/monitoring', heading: 'Monitor' },
  { menu: 'Observe', item: 'Traces', url: '/traces', heading: 'Trace' },
  { menu: 'Observe', item: 'Sessions', url: '/sessions', heading: 'Session' },
  { menu: 'Observe', item: 'Costs', url: '/costs', heading: 'Cost' },
  { menu: 'Observe', item: 'Alerts', url: '/alerts', heading: 'Alert' },
  { menu: 'Observe', item: 'Feedback', url: '/feedback', heading: 'Feedback' },
  { menu: 'Settings', item: 'Environment', url: '/environment', heading: 'Environment' },
  { menu: 'Settings', item: 'Quick Start', url: '/quick-start', heading: 'Quick Start' },
]

test.describe('Navigation', () => {
  for (const { menu, item, url, heading } of navPages) {
    const label = typeof item === 'string' ? item : item.source
    test(`navigates to ${menu} > ${label}`, async ({ page }) => {
      await page.goto('/')
      await page.locator('header button', { hasText: menu }).click()
      await page.locator('header a', { hasText: item }).click()
      await expect(page).toHaveURL(url)
      await expect(page.locator('main h1').first()).toContainText(heading, { ignoreCase: true })
    })
  }
})
