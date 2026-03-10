import { eventBus } from '@/lib/event-bus'
import { agentRuntime } from '@/lib/agent-runtime'

export async function GET() {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: Record<string, unknown>) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch {
          // stream closed
        }
      }

      // Send initial state
      const processes = agentRuntime.getAllProcesses()
      send({ type: 'init', processes })

      const unsubStatus = eventBus.on('agent:status-change', (data) => {
        send({ type: 'status-change', ...(data as Record<string, unknown>) })
      })

      const unsubCreated = eventBus.on('agent:created', (data) => {
        send({ type: 'agent-created', agent: data })
      })

      const unsubDeleted = eventBus.on('agent:deleted', (data) => {
        send({ type: 'agent-deleted', ...(data as Record<string, unknown>) })
      })

      // Heartbeat
      const heartbeat = setInterval(() => {
        send({ type: 'heartbeat', timestamp: Date.now() })
      }, 15000)

      // Cleanup on close
      const cleanup = () => {
        unsubStatus()
        unsubCreated()
        unsubDeleted()
        clearInterval(heartbeat)
      }

      // Store cleanup for when stream is cancelled
      ;(controller as unknown as { _cleanup: () => void })._cleanup = cleanup
    },
    cancel(controller) {
      const cleanup = (controller as unknown as { _cleanup?: () => void })?._cleanup
      cleanup?.()
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
