import { eventBus } from './event-bus'

export interface ChatMessage {
  id: string
  sessionId: string
  agentId: string
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  timestamp: Date
  metadata?: {
    model?: string
    tokens?: number
    toolCalls?: ToolCall[]
    thinking?: string
    delegatedTo?: string
  }
}

export interface ToolCall {
  id: string
  name: string
  input: Record<string, unknown>
  output?: string
  status: 'pending' | 'running' | 'completed' | 'failed'
}

export interface ChatSession {
  id: string
  agentId: string
  title: string
  createdAt: Date
  updatedAt: Date
  messageCount: number
}

let sessions: ChatSession[] = []
let messages: ChatMessage[] = []
let nextSessionId = 1
let nextMsgId = 1

export const chatStore = {
  getSessions(agentId?: string): ChatSession[] {
    if (agentId) return sessions.filter(s => s.agentId === agentId)
    return sessions
  },
  getSession(id: string): ChatSession | undefined {
    return sessions.find(s => s.id === id)
  },
  createSession(agentId: string, title?: string): ChatSession {
    const session: ChatSession = {
      id: String(nextSessionId++),
      agentId,
      title: title || `Chat ${nextSessionId - 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      messageCount: 0,
    }
    sessions.push(session)
    eventBus.emit('chat:session-created', session)
    return session
  },
  getMessages(sessionId: string): ChatMessage[] {
    return messages.filter(m => m.sessionId === sessionId)
  },
  addMessage(data: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    const msg: ChatMessage = {
      ...data,
      id: String(nextMsgId++),
      timestamp: new Date(),
    }
    messages.push(msg)
    const session = sessions.find(s => s.id === data.sessionId)
    if (session) {
      session.updatedAt = new Date()
      session.messageCount++
    }
    eventBus.emit('chat:message', msg)
    return msg
  },
  deleteSession(id: string): boolean {
    const len = sessions.length
    sessions = sessions.filter(s => s.id !== id)
    messages = messages.filter(m => m.sessionId !== id)
    return sessions.length < len
  },
}
