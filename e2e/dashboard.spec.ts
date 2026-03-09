import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test('loads homepage with title and agent cards', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1').first()).toContainText('Agent Factory')
    await expect(page.locator('h2', { hasText: 'Your Agents' })).toBeVisible()
  })

  test('displays agent stats cards', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=Total Agents')).toBeVisible()
    await expect(page.locator('text=Active')).toBeVisible()
    await expect(page.locator('text=In Draft')).toBeVisible()
    await expect(page.locator('text=Deployments')).toBeVisible()
  })

  test('shows agent cards from API', async ({ page }) => {
    await page.goto('/')
    // Wait for agents to load from API — at least one agent card should appear
    await expect(page.locator('h3').first()).toBeVisible({ timeout: 10000 })
    const cards = await page.locator('h3').count()
    expect(cards).toBeGreaterThanOrEqual(1)
  })

  test('shows create agent form', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=Create New Agent')).toBeVisible()
    await expect(page.locator('#name')).toBeVisible()
    await expect(page.locator('#description')).toBeVisible()
    await expect(page.locator('#model')).toBeVisible()
  })

  test('shows quick actions', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=Quick Actions')).toBeVisible()
    await expect(page.locator('text=View Logs')).toBeVisible()
    await expect(page.locator('main').locator('text=Settings')).toBeVisible()
  })
})
