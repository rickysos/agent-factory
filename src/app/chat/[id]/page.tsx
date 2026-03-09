'use client'

import { useState, useRef, useEffect, useCallback, use } from 'react'

interface Agent {
  id: string
  name: string
  model: string
  status: string
  description: string
}

interface ToolCall {
  id: string
  name: string
  input: Record<string, unknown>
  output?: string
  status?: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  thinking?: string
  toolCalls?: ToolCall[]
  tokens?: number
}

type StreamEvent =
  | { type: 'session'; sessionId: string }
  | { type: 'thinking-start' }
  | { type: 'thinking'; content: string }
  | { type: 'thinking-end' }
  | { type: 'tool-start'; tool: { id: string; name: string; input: Record<string, unknown> } }
  | { type: 'tool-end'; tool: { id: string; output: string; status: string } }
  | { type: 'token'; content: string }
  | { type: 'done'; tokens: number }

function renderMarkdown(text: string) {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let inCodeBlock = false
  let codeLines: string[] = []
  let codeLang = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={i} className="bg-forge-900 text-accent-400 rounded p-4 my-2 overflow-x-auto text-sm font-mono">
            <code>{codeLines.join('\n')}</code>
          </pre>
        )
        codeLines = []
        inCodeBlock = false
      } else {
        inCodeBlock = true
        codeLang = line.slice(3).trim()
      }
      continue
    }

    if (inCodeBlock) {
      codeLines.push(line)
      continue
    }

    if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="text-lg font-bold mt-3 mb-1">{processInline(line.slice(4))}</h3>)
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-xl font-bold mt-4 mb-1">{processInline(line.slice(3))}</h2>)
    } else if (line.startsWith('# ')) {
      elements.push(<h1 key={i} className="text-2xl font-bold mt-4 mb-2">{processInline(line.slice(2))}</h1>)
    } else if (line.match(/^[-*] /)) {
      elements.push(<li key={i} className="ml-4 list-disc">{processInline(line.slice(2))}</li>)
    } else if (line.match(/^\d+\. /)) {
      const content = line.replace(/^\d+\.\s/, '')
      elements.push(<li key={i} className="ml-4 list-decimal">{processInline(content)}</li>)
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />)
    } else {
      elements.push(<p key={i} className="my-1">{processInline(line)}</p>)
    }
  }

  if (inCodeBlock && codeLines.length) {
    elements.push(
      <pre key="final-code" className="bg-forge-900 text-accent-400 rounded p-4 my-2 overflow-x-auto text-sm font-mono">
        <code>{codeLines.join('\n')}</code>
      </pre>
    )
  }

  return elements
}

function processInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    const m = match[0]
    if (m.startsWith('`')) {
      parts.push(
        <code key={match.index} className="bg-forge-850 text-pink-400 px-1.5 py-0.5 rounded text-sm font-mono">
          {m.slice(1, -1)}
        </code>
      )
    } else if (m.startsWith('**')) {
      parts.push(<strong key={match.index}>{m.slice(2, -2)}</strong>)
    } else if (m.startsWith('*')) {
      parts.push(<em key={match.index}>{m.slice(1, -1)}</em>)
    }
    lastIndex = match.index + m.length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length === 1 ? parts[0] : parts
}

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: agentId } = use(params)

  const [agent, setAgent] = useState<Agent | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [expandedThinking, setExpandedThinking] = useState<Set<string>>(new Set())
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set())

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    fetch(`/api/agents/${agentId}`)
      .then(r => r.json())
      .then(setAgent)
      .catch(() => setAgent({ id: agentId, name: 'Agent', model: 'unknown', status: 'active', description: '' }))
  }, [agentId])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isThinking, scrollToBottom])

  const toggleThinking = (msgId: string) => {
    setExpandedThinking(prev => {
      const next = new Set(prev)
      next.has(msgId) ? next.delete(msgId) : next.add(msgId)
      return next
    })
  }

  const toggleTool = (toolId: string) => {
    setExpandedTools(prev => {
      const next = new Set(prev)
      next.has(toolId) ? next.delete(toolId) : next.add(toolId)
      return next
    })
  }

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text.trim() }
    const assistantMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: '', thinking: '', toolCalls: [] }

    setMessages(prev => [...prev, userMsg, assistantMsg])
    setInput('')
    setIsStreaming(true)
    setIsThinking(false)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, sessionId, message: text.trim() }),
        signal: controller.signal,
      })

      if (!res.ok || !res.body) throw new Error('Stream failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const dataMatch = line.match(/^data:\s*(.+)$/m)
          if (!dataMatch) continue

          let event: StreamEvent
          try {
            event = JSON.parse(dataMatch[1])
          } catch {
            continue
          }

          switch (event.type) {
            case 'session':
              setSessionId(event.sessionId)
              break

            case 'thinking-start':
              setIsThinking(true)
              break

            case 'thinking':
              setMessages(prev => {
                const next = [...prev]
                const last = { ...next[next.length - 1] }
                last.thinking = (last.thinking || '') + event.content
                next[next.length - 1] = last
                return next
              })
              break

            case 'thinking-end':
              setIsThinking(false)
              break

            case 'tool-start':
              setMessages(prev => {
                const next = [...prev]
                const last = { ...next[next.length - 1] }
                last.toolCalls = [...(last.toolCalls || []), { id: event.tool.id, name: event.tool.name, input: event.tool.input }]
                next[next.length - 1] = last
                return next
              })
              break

            case 'tool-end':
              setMessages(prev => {
                const next = [...prev]
                const last = { ...next[next.length - 1] }
                last.toolCalls = (last.toolCalls || []).map(tc =>
                  tc.id === event.tool.id ? { ...tc, output: event.tool.output, status: event.tool.status } : tc
                )
                next[next.length - 1] = last
                return next
              })
              break

            case 'token':
              setMessages(prev => {
                const next = [...prev]
                const last = { ...next[next.length - 1] }
                last.content = last.content + event.content
                next[next.length - 1] = last
                return next
              })
              break

            case 'done':
              setMessages(prev => {
                const next = [...prev]
                const last = { ...next[next.length - 1] }
                last.tokens = event.tokens
                next[next.length - 1] = last
                return next
              })
              break
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        // user stopped
      } else {
        setMessages(prev => {
          const next = [...prev]
          const last = { ...next[next.length - 1] }
          last.content = last.content || 'An error occurred while generating the response.'
          next[next.length - 1] = last
          return next
        })
      }
    } finally {
      setIsStreaming(false)
      setIsThinking(false)
      abortRef.current = null
    }
  }, [agentId, sessionId, isStreaming])

  const stopGeneration = () => {
    abortRef.current?.abort()
  }

  const retryLast = () => {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')
    if (!lastUserMsg) return
    setMessages(prev => {
      const lastUserIdx = prev.map(m => m.role).lastIndexOf('user')
      return prev.slice(0, lastUserIdx)
    })
    sendMessage(lastUserMsg.content)
  }

  const newConversation = () => {
    setMessages([])
    setSessionId(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const statusColor = agent?.status === 'active' ? 'bg-accent-500' : agent?.status === 'error' ? 'bg-red-500/50' : 'bg-amber-400'

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] max-w-5xl mx-auto px-4">
      {/* Agent Header */}
      <div className="flex items-center justify-between py-3 border-b border-forge-200 dark:border-forge-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-forge-950 font-bold text-lg">
            {agent?.name?.[0] || '?'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-forge-800 dark:text-forge-100">{agent?.name || 'Loading...'}</h1>
              <span className={`w-2 h-2 rounded-full ${statusColor}`} />
            </div>
            <p className="text-xs text-forge-400 dark:text-forge-500">{agent?.model || ''}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={newConversation}
            className="px-3 py-1.5 text-sm rounded bg-forge-200 dark:bg-forge-800 text-forge-600 dark:text-forge-300 hover:bg-forge-200 dark:hover:bg-forge-800 transition-colors"
          >
            New Chat
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-forge-300 dark:text-forge-500">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </div>
              <p className="text-lg font-medium">Start a conversation with {agent?.name || 'this agent'}</p>
              <p className="text-sm mt-1">Type a message below to begin.</p>
            </div>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-1' : ''}`}>
              {/* User message */}
              {msg.role === 'user' && (
                <div className="bg-accent-500 text-forge-950 rounded-2xl rounded-br-md px-4 py-3 text-sm whitespace-pre-wrap">
                  {msg.content}
                </div>
              )}

              {/* Assistant message */}
              {msg.role === 'assistant' && (
                <div className="space-y-2">
                  {/* Thinking */}
                  {msg.thinking && (
                    <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-md overflow-hidden">
                      <button
                        onClick={() => toggleThinking(msg.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                      >
                        <svg
                          className={`w-3 h-3 transition-transform ${expandedThinking.has(msg.id) ? 'rotate-90' : ''}`}
                          fill="currentColor" viewBox="0 0 20 20"
                        >
                          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                        </svg>
                        Thinking
                      </button>
                      {expandedThinking.has(msg.id) && (
                        <div className="px-3 pb-3 text-xs text-amber-800 dark:text-amber-300/80 whitespace-pre-wrap font-mono">
                          {msg.thinking}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tool calls */}
                  {msg.toolCalls?.map(tc => (
                    <div key={tc.id} className="border border-forge-200 dark:border-forge-700 rounded-md overflow-hidden bg-forge-100 dark:bg-forge-900">
                      <button
                        onClick={() => toggleTool(tc.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-forge-200 dark:hover:bg-forge-800 transition-colors"
                      >
                        <svg
                          className={`w-3 h-3 text-forge-500 transition-transform ${expandedTools.has(tc.id) ? 'rotate-90' : ''}`}
                          fill="currentColor" viewBox="0 0 20 20"
                        >
                          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium text-forge-600 dark:text-forge-400">{tc.name}</span>
                        {tc.status && (
                          <span className={`ml-auto px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            tc.status === 'success'
                              ? 'bg-accent-500/10 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400'
                              : 'bg-red-500/50/10 dark:bg-red-500/50/10 text-red-700 dark:text-red-400'
                          }`}>
                            {tc.status}
                          </span>
                        )}
                        {!tc.status && (
                          <span className="ml-auto">
                            <span className="inline-flex gap-0.5">
                              <span className="w-1 h-1 rounded-full bg-forge-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="w-1 h-1 rounded-full bg-forge-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="w-1 h-1 rounded-full bg-forge-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                            </span>
                          </span>
                        )}
                      </button>
                      {expandedTools.has(tc.id) && (
                        <div className="border-t border-forge-200 dark:border-forge-700 px-3 py-2 space-y-2">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-forge-500 dark:text-forge-400 mb-1">Input</p>
                            <pre className="text-xs bg-forge-900 text-forge-300 rounded p-2 overflow-x-auto font-mono">
                              {JSON.stringify(tc.input, null, 2)}
                            </pre>
                          </div>
                          {tc.output && (
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-forge-500 dark:text-forge-400 mb-1">Output</p>
                              <pre className="text-xs bg-forge-900 text-forge-300 rounded p-2 overflow-x-auto font-mono max-h-48 overflow-y-auto">
                                {tc.output}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Response content */}
                  {msg.content && (
                    <div className="bg-forge-50 dark:bg-forge-850 border border-forge-200 dark:border-forge-700 rounded-2xl rounded-bl-md px-4 py-3 text-sm text-forge-800 dark:text-forge-100">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        {renderMarkdown(msg.content)}
                      </div>
                    </div>
                  )}

                  {/* Token count */}
                  {msg.tokens != null && (
                    <p className="text-[10px] text-forge-300 dark:text-forge-500 ml-1">{msg.tokens} tokens</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Thinking indicator */}
        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-md px-4 py-2.5 flex items-center gap-2">
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
              <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Controls bar */}
      {messages.length > 0 && !isStreaming && (
        <div className="flex justify-center gap-2 pb-2 shrink-0">
          <button
            onClick={retryLast}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded bg-forge-200 dark:bg-forge-800 text-forge-500 dark:text-forge-400 hover:bg-forge-200 dark:hover:bg-forge-800 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.992 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            Retry
          </button>
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-forge-200 dark:border-forge-800 py-3 shrink-0">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => {
                setInput(e.target.value)
                const el = e.target
                el.style.height = 'auto'
                el.style.height = Math.min(el.scrollHeight, 200) + 'px'
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="w-full resize-none rounded-md border border-forge-200 dark:border-forge-700 bg-forge-50 dark:bg-forge-850 px-4 py-3 text-sm text-forge-800 dark:text-forge-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
            />
          </div>
          {isStreaming ? (
            <button
              onClick={stopGeneration}
              className="shrink-0 p-3 rounded-md bg-red-600 hover:bg-red-700 text-forge-950 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="1" />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              className="shrink-0 p-3 rounded-md bg-accent-500 hover:bg-accent-400 disabled:opacity-40 disabled:cursor-not-allowed text-forge-950 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          )}
        </div>
        <p className="text-[10px] text-forge-300 dark:text-forge-500 mt-1.5 text-center">
          Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
