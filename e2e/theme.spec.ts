import { test, expect } from '@playwright/test'

test.describe('Theme & Accessibility', () => {
  test('opens theme menu and switches to dark mode', async ({ page }) => {
    await page.goto('/')

    await page.locator('button[title="Theme & Accessibility"]').click()
    await expect(page.locator('text=Theme')).toBeVisible()

    await page.locator('button', { hasText: 'Dark' }).click()
    await expect(page.locator('html')).toHaveClass(/dark/)
  })

  test('switches to light mode', async ({ page }) => {
    await page.goto('/')

    await page.locator('button[title="Theme & Accessibility"]').click()
    await page.locator('button', { hasText: 'Light' }).click()
    await expect(page.locator('html')).not.toHaveClass(/dark/)
  })

  test('switches to system mode', async ({ page }) => {
    await page.goto('/')

    await page.locator('button[title="Theme & Accessibility"]').click()
    await page.locator('button', { hasText: 'System' }).click()

    // System mode should be set — just verify the button is active
    const systemBtn = page.locator('button', { hasText: 'System' })
    await expect(systemBtn).toHaveClass(/bg-blue/)
  })

  test('selects protanopia colorblind mode', async ({ page }) => {
    await page.goto('/')

    await page.locator('button[title="Theme & Accessibility"]').click()
    await page.locator('button', { hasText: 'Protanopia' }).click()

    await expect(page.locator('html')).toHaveAttribute('data-color-vision', 'protanopia')
  })

  test('selects deuteranopia colorblind mode', async ({ page }) => {
    await page.goto('/')

    await page.locator('button[title="Theme & Accessibility"]').click()
    await page.locator('button', { hasText: 'Deuteranopia' }).click()

    await expect(page.locator('html')).toHaveAttribute('data-color-vision', 'deuteranopia')
  })

  test('selects tritanopia colorblind mode', async ({ page }) => {
    await page.goto('/')

    await page.locator('button[title="Theme & Accessibility"]').click()
    await page.locator('button', { hasText: 'Tritanopia' }).click()

    await expect(page.locator('html')).toHaveAttribute('data-color-vision', 'tritanopia')
  })

  test('selects achromatopsia colorblind mode', async ({ page }) => {
    await page.goto('/')

    await page.locator('button[title="Theme & Accessibility"]').click()
    await page.locator('button', { hasText: 'Achromatopsia' }).click()

    await expect(page.locator('html')).toHaveAttribute('data-color-vision', 'achromatopsia')
  })

  test('resets to default color vision', async ({ page }) => {
    await page.goto('/')

    await page.locator('button[title="Theme & Accessibility"]').click()
    await page.locator('button', { hasText: 'Achromatopsia' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-color-vision', 'achromatopsia')

    // Menu may have stayed open — click Default directly if visible, otherwise re-open
    const defaultBtn = page.locator('button', { hasText: 'Default' })
    if (!(await defaultBtn.isVisible())) {
      await page.locator('button[title="Theme & Accessibility"]').click()
    }
    await defaultBtn.click()
    await expect(page.locator('html')).toHaveAttribute('data-color-vision', 'normal')
  })

  test('theme persists across page navigations', async ({ page }) => {
    await page.goto('/')

    await page.locator('button[title="Theme & Accessibility"]').click()
    await page.locator('button', { hasText: 'Dark' }).click()
    await expect(page.locator('html')).toHaveClass(/dark/)

    await page.goto('/monitoring')
    await expect(page.locator('html')).toHaveClass(/dark/)
  })

  test('closes theme menu on outside click', async ({ page }) => {
    await page.goto('/')

    await page.locator('button[title="Theme & Accessibility"]').click()
    await expect(page.locator('text=Color Vision')).toBeVisible()

    await page.locator('main').click({ position: { x: 100, y: 100 } })
    await expect(page.locator('text=Color Vision')).not.toBeVisible()
  })
})
