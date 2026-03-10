import { chatStore } from '@/lib/chat-store'
import { agentStore } from '@/lib/agent-store'
import { agentRuntime } from '@/lib/agent-runtime'
import { resolveModelAndProvider } from '@/lib/provider-registry'
import { costStore, calculateCost } from '@/lib/cost-store'
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
      let thinkingContent = ''
      let promptTokens = 0
      let completionTokens = 0
      let totalTokens = 0

      try {
        // Emit thinking start
        send({ type: 'thinking-start' })

        const completion = await openai.chat.completions.create({
          model: modelId,
          messages,
          stream: true,
        })

        let thinkingEnded = false

        for await (const chunk of completion) {
          const delta = chunk.choices[0]?.delta
          if (delta?.content) {
            // End thinking on first real content token
            if (!thinkingEnded) {
              send({ type: 'thinking', content: 'Analyzing request and formulating response...' })
              send({ type: 'thinking-end' })
              thinkingEnded = true
            }
            send({ type: 'token', content: delta.content })
            fullResponse += delta.content
          }
          if (chunk.usage) {
            promptTokens = chunk.usage.prompt_tokens || 0
            completionTokens = chunk.usage.completion_tokens || 0
            totalTokens = chunk.usage.total_tokens || 0
          }
        }

        if (!thinkingEnded) {
          send({ type: 'thinking-end' })
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Unknown error'
        send({ type: 'thinking-end' })
        send({ type: 'token', content: `Error: ${errMsg}` })
        fullResponse = `Error: ${errMsg}`
      }

      if (!totalTokens) totalTokens = estimateTokens(fullResponse)
      if (!completionTokens) completionTokens = estimateTokens(fullResponse)

      // Track message in runtime
      agentRuntime.recordMessage(agentId)

      // Store assistant message
      chatStore.addMessage({
        sessionId: session!.id,
        agentId,
        role: 'assistant',
        content: fullResponse,
        metadata: {
          model: modelId,
          tokens: totalTokens,
          thinking: thinkingContent || undefined,
        },
      })

      // Record usage for cost tracking
      costStore.recordUsage({
        agentId,
        sessionId: session!.id,
        model: modelId,
        provider: provider.id,
        promptTokens,
        completionTokens,
        totalTokens,
        cost: calculateCost(modelId, promptTokens, completionTokens),
      })

      send({ type: 'done', tokens: totalTokens })
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
