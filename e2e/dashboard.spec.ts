import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test('loads homepage with title', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1').first()).toContainText('Command Center')
    await expect(page.locator('h2', { hasText: 'Active Agents' })).toBeVisible()
  })

  test('displays agent stats cards', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=Total')).toBeVisible()
    await expect(page.getByText('Active', { exact: true })).toBeVisible()
    await expect(page.locator('text=Draft')).toBeVisible()
    await expect(page.locator('text=Deploys')).toBeVisible()
  })

  test('shows agent cards from API', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h3').first()).toBeVisible({ timeout: 10000 })
    const cards = await page.locator('h3').count()
    expect(cards).toBeGreaterThanOrEqual(1)
  })

  test('shows create agent form', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h2', { hasText: 'Forge New Agent' })).toBeVisible()
    await expect(page.locator('#name')).toBeVisible()
    await expect(page.locator('#description')).toBeVisible()
    await expect(page.locator('#model')).toBeVisible()
  })

  test('shows quick actions', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h2', { hasText: 'Quick Actions' })).toBeVisible()
    await expect(page.locator('text=View Logs')).toBeVisible()
    await expect(page.locator('main').locator('text=Settings')).toBeVisible()
  })
})
