import { test, expect } from '@playwright/test'

test.describe('API Endpoints', () => {
  test('GET /api/health returns ok', async ({ request }) => {
    const res = await request.get('/api/health')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('ok')
    expect(body.timestamp).toBeTruthy()
    expect(body.uptime).toBeGreaterThan(0)
  })

  test('GET /api/agents returns agent list', async ({ request }) => {
    const res = await request.get('/api/agents')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
    expect(body.data.length).toBeGreaterThanOrEqual(3)
  })

  test('POST /api/agents creates an agent', async ({ request }) => {
    const res = await request.post('/api/agents', {
      data: {
        name: 'E2E Test Agent',
        description: 'Created by e2e test',
        model: 'gpt-4',
        capabilities: ['testing'],
      },
    })
    expect(res.status()).toBe(201)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.name).toBe('E2E Test Agent')
    expect(body.data.id).toBeTruthy()
    expect(body.data.status).toBe('draft')
  })

  test('POST /api/agents rejects missing name', async ({ request }) => {
    const res = await request.post('/api/agents', {
      data: { model: 'gpt-4' },
    })
    expect(res.status()).toBe(400)
  })

  test('GET /api/agents/:id returns a single agent', async ({ request }) => {
    // Create an agent to fetch
    const createRes = await request.post('/api/agents', {
      data: { name: 'Fetch Test Agent', description: 'For get-by-id test', model: 'gpt-4' },
    })
    const { data: created } = await createRes.json()

    const res = await request.get(`/api/agents/${created.id}`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.id).toBe(created.id)
  })

  test('GET /api/agents/:id returns 404 for missing agent', async ({ request }) => {
    const res = await request.get('/api/agents/99999')
    expect(res.status()).toBe(404)
  })

  test('PUT /api/agents/:id updates an agent', async ({ request }) => {
    const createRes = await request.post('/api/agents', {
      data: { name: 'Update Test Agent', description: 'Original', model: 'gpt-4' },
    })
    const { data: created } = await createRes.json()

    const res = await request.put(`/api/agents/${created.id}`, {
      data: { description: 'Updated description' },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data.description).toBe('Updated description')
  })

  test('POST /api/agents/:id/deploy deploys an agent', async ({ request }) => {
    const createRes = await request.post('/api/agents', {
      data: { name: 'Deploy Test Agent', description: 'For deploy test', model: 'gpt-4' },
    })
    const { data: created } = await createRes.json()

    const res = await request.post(`/api/agents/${created.id}/deploy`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.status).toBe('active')
    expect(body.data.deployments).toBeGreaterThanOrEqual(1)
  })

  test('DELETE /api/agents/:id deletes an agent', async ({ request }) => {
    // Create one first
    const createRes = await request.post('/api/agents', {
      data: { name: 'To Delete', description: 'Will be deleted', model: 'gpt-4' },
    })
    const { data } = await createRes.json()

    const res = await request.delete(`/api/agents/${data.id}`)
    expect(res.status()).toBe(200)

    const getRes = await request.get(`/api/agents/${data.id}`)
    expect(getRes.status()).toBe(404)
  })

  test('GET /api/tasks returns queue stats', async ({ request }) => {
    const res = await request.get('/api/tasks')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data).toHaveProperty('totalTasks')
    expect(body.data).toHaveProperty('pending')
  })

  test('POST /api/tasks enqueues a task', async ({ request }) => {
    const res = await request.post('/api/tasks', {
      data: {
        title: 'E2E test task',
        category: 'general',
        priority: 'medium',
      },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.taskId).toBeTruthy()
  })

  test('POST /api/tasks rejects missing title', async ({ request }) => {
    const res = await request.post('/api/tasks', {
      data: { category: 'general' },
    })
    expect(res.status()).toBe(400)
  })

  test('GET /api/stacks returns team templates', async ({ request }) => {
    const res = await request.get('/api/stacks')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.length).toBeGreaterThanOrEqual(6)
  })

  test('GET /api/events returns SSE stream', async ({ page }) => {
    await page.goto('/')
    const res = await page.evaluate(async () => {
      const controller = new AbortController()
      setTimeout(() => controller.abort(), 2000)
      try {
        const r = await fetch('/api/events', { signal: controller.signal })
        const reader = r.body!.getReader()
        const { value } = await reader.read()
        const text = new TextDecoder().decode(value)
        return { status: r.status, contentType: r.headers.get('content-type'), text }
      } catch {
        return null
      }
    })
    expect(res).toBeTruthy()
    expect(res!.status).toBe(200)
    expect(res!.contentType).toContain('text/event-stream')
    expect(res!.text).toContain('connected')
  })
})
