import { chatStore } from '@/lib/chat-store'
import { agentStore } from '@/lib/agent-store'

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

  // Generate mock streaming response
  const encoder = new TextEncoder()
  const thinkingText = generateThinking(message, agent.name)
  const responseText = generateResponse(message, agent.name, agent.capabilities || [])
  const toolCalls = generateToolCalls(message)

  const stream = new ReadableStream({
    async start(controller) {
      // Send session info
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'session', sessionId: session!.id })}\n\n`))

      // Send thinking phase
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'thinking-start' })}\n\n`))
      await delay(300)
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'thinking', content: thinkingText })}\n\n`))
      await delay(500)
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'thinking-end' })}\n\n`))

      // Send tool calls if applicable
      for (const tool of toolCalls) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'tool-start', tool: { id: tool.id, name: tool.name, input: tool.input } })}\n\n`))
        await delay(400)
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'tool-end', tool: { id: tool.id, output: tool.output, status: 'completed' } })}\n\n`))
        await delay(200)
      }

      // Stream response tokens
      const words = responseText.split(' ')
      for (let i = 0; i < words.length; i++) {
        const token = (i === 0 ? '' : ' ') + words[i]
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'token', content: token })}\n\n`))
        await delay(30 + Math.random() * 50)
      }

      // Store the complete assistant message
      chatStore.addMessage({
        sessionId: session!.id,
        agentId,
        role: 'assistant',
        content: responseText,
        metadata: {
          model: agent.model,
          tokens: words.length * 2,
          toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
          thinking: thinkingText,
        },
      })

      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', tokens: words.length * 2 })}\n\n`))
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

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function generateThinking(message: string, agentName: string): string {
  const topics = ['analyzing the request', 'considering available tools', 'planning my response approach', 'reviewing relevant context']
  const selected = topics.slice(0, 2 + Math.floor(Math.random() * 2))
  return `As ${agentName}, I need to process this request. Let me start by ${selected.join(', then ')}. The user is asking about "${message.slice(0, 40)}..." — I'll provide a comprehensive response.`
}

function generateResponse(message: string, agentName: string, capabilities: string[]): string {
  const lower = message.toLowerCase()
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return `Hello! I'm **${agentName}**, ready to help. My capabilities include ${capabilities.length > 0 ? capabilities.join(', ') : 'general assistance'}. What would you like me to help you with today?`
  }
  if (lower.includes('code') || lower.includes('function') || lower.includes('implement')) {
    return `I'll help with that. Here's my approach:\n\n1. **Analyze the requirements** — Understanding what you need\n2. **Design the solution** — Planning the implementation\n3. **Write the code** — Implementing with best practices\n\n\`\`\`typescript\n// Example implementation\nexport function processRequest(input: string): Result {\n  const validated = validate(input)\n  const processed = transform(validated)\n  return { success: true, data: processed }\n}\n\`\`\`\n\nWould you like me to elaborate on any part of this?`
  }
  if (lower.includes('help') || lower.includes('what can')) {
    return `I'm **${agentName}** and I can help you with:\n\n${capabilities.map((c, i) => `${i + 1}. **${c}** — Ready to assist`).join('\n')}\n\nJust describe what you need and I'll get started!`
  }
  return `I've analyzed your request. Here's what I found:\n\n**Summary:** Your message has been processed and I've considered multiple approaches.\n\n**Key Points:**\n- I reviewed the context of your request\n- Considered ${capabilities.length || 3} different strategies\n- Selected the optimal approach based on the requirements\n\nWould you like me to go deeper on any specific aspect?`
}

function generateToolCalls(message: string): { id: string; name: string; input: Record<string, unknown>; output: string; status: 'completed' }[] {
  const lower = message.toLowerCase()
  const calls: { id: string; name: string; input: Record<string, unknown>; output: string; status: 'completed' }[] = []
  if (lower.includes('search') || lower.includes('find') || lower.includes('look')) {
    calls.push({
      id: 'tc_' + Date.now(),
      name: 'search',
      input: { query: message.slice(0, 50) },
      output: 'Found 3 relevant results matching the query.',
      status: 'completed',
    })
  }
  if (lower.includes('file') || lower.includes('read') || lower.includes('code')) {
    calls.push({
      id: 'tc_' + (Date.now() + 1),
      name: 'read_file',
      input: { path: 'src/example.ts' },
      output: 'File contents loaded successfully (42 lines).',
      status: 'completed',
    })
  }
  return calls
}
