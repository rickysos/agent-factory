import { chatStore } from '@/lib/chat-store'
import { agentStore } from '@/lib/agent-store'
import { resolveModelAndProvider } from '@/lib/provider-registry'
import OpenAI from 'openai'

export async function POST(req: Request) {
  const body = await req.json()
  const { agentId, sessionId, message } = body

  if (!agentId || !message) {
    return Response.json({ error: 'agentId and message required' }, { status: 400 })
  }

  const agent = agentStore.getById(agentId)
  if (!agent) {
    return Response.json({ error: 'Agent not found' }, { status: 404 })
  }

  // Resolve model and provider dynamically
  const { modelId, provider } = resolveModelAndProvider(agent.model)
  const apiKey = process.env[provider.envVar]

  if (!apiKey) {
    return Response.json({ error: `No API key configured. Set ${provider.envVar} in .env.local` }, { status: 500 })
  }

  const openai = new OpenAI({
    baseURL: provider.baseURL,
    apiKey,
  })

  // Create or use existing session
  let session = sessionId ? chatStore.getSession(sessionId) : null
  if (!session) {
    session = chatStore.createSession(agentId, message.slice(0, 50))
  }

  // Store user message
  chatStore.addMessage({
    sessionId: session.id,
    agentId,
    role: 'user',
    content: message,
  })

  // Build conversation history
  const history = chatStore.getMessages(session.id)
  const systemPrompt = buildSystemPrompt(agent.name, agent.description, agent.capabilities || [])
  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...history.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  ]

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      send({ type: 'session', sessionId: session!.id })

      let fullResponse = ''
      let totalTokens = 0

      try {
        const completion = await openai.chat.completions.create({
          model: modelId,
          messages,
          stream: true,
        })

        for await (const chunk of completion) {
          const delta = chunk.choices[0]?.delta
          if (delta?.content) {
            send({ type: 'token', content: delta.content })
            fullResponse += delta.content
          }
          if (chunk.usage) {
            totalTokens = chunk.usage.total_tokens || 0
          }
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Unknown error'
        send({ type: 'token', content: `Error: ${errMsg}` })
        fullResponse = `Error: ${errMsg}`
      }

      // Store assistant message
      chatStore.addMessage({
        sessionId: session!.id,
        agentId,
        role: 'assistant',
        content: fullResponse,
        metadata: {
          model: modelId,
          tokens: totalTokens || estimateTokens(fullResponse),
        },
      })

      send({ type: 'done', tokens: totalTokens || estimateTokens(fullResponse) })
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const agentId = searchParams.get('agentId')
  const sessionId = searchParams.get('sessionId')

  if (sessionId) {
    const messages = chatStore.getMessages(sessionId)
    return Response.json({ success: true, data: messages })
  }

  const sessions = chatStore.getSessions(agentId || undefined)
  return Response.json({ success: true, data: sessions })
}

function buildSystemPrompt(name: string, description: string, capabilities: string[]): string {
  const caps = capabilities.length > 0
    ? `Your capabilities include: ${capabilities.join(', ')}.`
    : ''
  return `You are ${name}, an AI agent. ${description} ${caps} Be helpful, concise, and direct.`
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}
