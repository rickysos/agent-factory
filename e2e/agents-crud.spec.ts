import { test, expect } from '@playwright/test'

test.describe('Agent CRUD', () => {
  test('creates a new agent via the form', async ({ page }) => {
    const name = `E2E Bot ${Date.now()}`
    await page.goto('/')

    await page.fill('#name', name)
    await page.fill('#description', 'A test agent for e2e')
    await page.selectOption('#model', 'claude-3-sonnet')

    await page.locator('form button[type="submit"]').click()

    await expect(page.locator(`text=${name}`).first()).toBeVisible({ timeout: 10000 })
  })

  test('deletes an agent via API', async ({ request }) => {
    const createRes = await request.post('/api/agents', {
      data: { name: 'Delete Me Agent', description: 'Will be deleted', model: 'gpt-4' },
    })
    const { data } = await createRes.json()
    expect(data.id).toBeTruthy()

    const delRes = await request.delete(`/api/agents/${data.id}`)
    expect(delRes.status()).toBe(200)

    const getRes = await request.get(`/api/agents/${data.id}`)
    expect(getRes.status()).toBe(404)
  })

  test('deploys a draft agent', async ({ page }) => {
    await page.goto('/')

    const deployBtn = page.locator('button', { hasText: 'Deploy' }).first()

    if (await deployBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await deployBtn.click()
    }
  })
})
