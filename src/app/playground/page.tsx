'use client'

import { useState, useRef } from 'react'

const MODELS = [
  { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI' },
  { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic' },
  { id: 'deepseek-coder', name: 'DeepSeek Coder', provider: 'DeepSeek' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI' },
  { id: 'llama-3', name: 'Llama 3', provider: 'Meta' },
]

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface PanelMetrics {
  tokens: number
  timeMs: number
}

const mockResponses: Record<string, (prompt: string) => { text: string; tokens: number }> = {
  'gpt-4': (prompt) => {
    const text = `I've analyzed your request carefully. Here's a comprehensive response:\n\n${prompt.length > 20 ? 'Based on the complexity of your query, ' : ''}I'd recommend a structured approach. First, consider the key variables at play. Then, evaluate the trade-offs between different options. The optimal solution balances efficiency with maintainability.\n\nLet me know if you'd like me to elaborate on any specific aspect.`
    return { text, tokens: text.split(/\s+/).length * 1.3 | 0 }
  },
  'claude-3-sonnet': (prompt) => {
    const text = `Here's my take on this:\n\n${prompt.length > 30 ? 'This is an interesting question. ' : ''}The key insight is that we should focus on the fundamentals first. I'd suggest breaking this down into smaller, manageable steps and tackling each one systematically.\n\nWould you like to explore any particular angle further?`
    return { text, tokens: text.split(/\s+/).length * 1.3 | 0 }
  },
  'claude-3-opus': (prompt) => {
    const text = `Let me provide a thorough analysis.\n\nConsidering the nuances of your request, there are several dimensions worth exploring:\n\n1. **Context** — Understanding the broader landscape is crucial here. ${prompt.length > 15 ? 'Your question touches on several interconnected concepts.' : 'The core concept is straightforward.'}\n\n2. **Implementation** — The practical approach involves careful consideration of constraints and requirements.\n\n3. **Trade-offs** — Every decision carries implications. The key is finding the right balance for your specific use case.\n\nI'm happy to dive deeper into any of these areas.`
    return { text, tokens: text.split(/\s+/).length * 1.3 | 0 }
  },
  'deepseek-coder': (prompt) => {
    const text = `Here's a solution:\n\n\`\`\`\n// Based on your requirements\nfunction solve(input) {\n  // Process the input\n  const result = processData(input);\n  return result;\n}\n\`\`\`\n\n${prompt.length > 20 ? 'This handles edge cases and scales well.' : 'Clean and efficient.'} Let me know if you need modifications.`
    return { text, tokens: text.split(/\s+/).length * 1.3 | 0 }
  },
  'gpt-3.5-turbo': (prompt) => {
    const text = `Sure! ${prompt.length > 25 ? 'That\'s a great question. ' : ''}Here\'s what I think: you should approach this step by step. Start with the basics and build from there. Hope that helps!`
    return { text, tokens: text.split(/\s+/).length * 1.3 | 0 }
  },
  'llama-3': (prompt) => {
    const text = `Great question! Let me help with that.\n\n${prompt.length > 20 ? 'After considering the different aspects, ' : ''}I believe the best approach is to keep things simple and pragmatic. Focus on what matters most and iterate from there.\n\nFeel free to ask follow-up questions.`
    return { text, tokens: text.split(/\s+/).length * 1.3 | 0 }
  },
}

function ChatPanel({
  title,
  model,
  onModelChange,
  messages,
  onSendMessage,
  metrics,
  isLoading,
}: {
  title: string
  model: string
  onModelChange: (m: string) => void
  messages: Message[]
  onSendMessage: (msg: string) => void
  metrics: PanelMetrics | null
  isLoading: boolean
}) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleSend = () => {
    if (!input.trim() || isLoading) return
    onSendMessage(input.trim())
    setInput('')
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 flex flex-col h-[600px]">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          {metrics && (
            <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span>{metrics.tokens} tokens</span>
              <span>{metrics.timeMs}ms</span>
            </div>
          )}
        </div>
        <select
          value={model}
          onChange={(e) => onModelChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.provider})
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-sm">
            Send a message to start testing
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-xl text-sm whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-xl text-sm text-gray-500 dark:text-gray-400">
              <span className="inline-flex gap-1">
                <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PlaygroundPage() {
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful AI assistant.')
  const [showSystemPrompt, setShowSystemPrompt] = useState(true)
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(1024)
  const [modelA, setModelA] = useState('gpt-4')
  const [modelB, setModelB] = useState('claude-3-sonnet')
  const [messagesA, setMessagesA] = useState<Message[]>([])
  const [messagesB, setMessagesB] = useState<Message[]>([])
  const [metricsA, setMetricsA] = useState<PanelMetrics | null>(null)
  const [metricsB, setMetricsB] = useState<PanelMetrics | null>(null)
  const [loadingA, setLoadingA] = useState(false)
  const [loadingB, setLoadingB] = useState(false)
  const [sharedInput, setSharedInput] = useState('')

  const simulateResponse = (
    model: string,
    userMsg: string,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    setMetrics: React.Dispatch<React.SetStateAction<PanelMetrics | null>>,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)
    const start = Date.now()
    const delay = 800 + Math.random() * 1500

    setTimeout(() => {
      const gen = mockResponses[model] || mockResponses['gpt-4']
      const { text, tokens } = gen(userMsg)
      setMessages((prev) => [...prev, { role: 'assistant', content: text }])
      setMetrics({ tokens, timeMs: Date.now() - start })
      setLoading(false)
    }, delay)
  }

  const sendToA = (msg: string) => simulateResponse(modelA, msg, setMessagesA, setMetricsA, setLoadingA)
  const sendToB = (msg: string) => simulateResponse(modelB, msg, setMessagesB, setMetricsB, setLoadingB)

  const sendToBoth = () => {
    if (!sharedInput.trim() || loadingA || loadingB) return
    const msg = sharedInput.trim()
    setSharedInput('')
    sendToA(msg)
    sendToB(msg)
  }

  const clearAll = () => {
    setMessagesA([])
    setMessagesB([])
    setMetricsA(null)
    setMetricsB(null)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Agent Playground</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Test and compare agent configurations side-by-side
        </p>
      </div>

      {/* Config bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setShowSystemPrompt(!showSystemPrompt)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <svg
              className={`w-4 h-4 transition-transform ${showSystemPrompt ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            System Prompt
          </button>
          <button
            onClick={clearAll}
            className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Clear All
          </button>
        </div>

        {showSystemPrompt && (
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y mb-4"
            placeholder="Enter system prompt..."
          />
        )}

        <div className="flex flex-wrap gap-6 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Temperature: {temperature.toFixed(1)}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              <span>0.0</span>
              <span>1.0</span>
              <span>2.0</span>
            </div>
          </div>
          <div className="min-w-[140px]">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Max Tokens
            </label>
            <input
              type="number"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value) || 256)}
              min={1}
              max={128000}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Two-panel comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChatPanel
          title="Model A"
          model={modelA}
          onModelChange={setModelA}
          messages={messagesA}
          onSendMessage={sendToA}
          metrics={metricsA}
          isLoading={loadingA}
        />
        <ChatPanel
          title="Model B"
          model={modelB}
          onModelChange={setModelB}
          messages={messagesB}
          onSendMessage={sendToB}
          metrics={metricsB}
          isLoading={loadingB}
        />
      </div>

      {/* Shared input */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={sharedInput}
            onChange={(e) => setSharedInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendToBoth()}
            placeholder="Send the same message to both models..."
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loadingA || loadingB}
          />
          <button
            onClick={sendToBoth}
            disabled={loadingA || loadingB || !sharedInput.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            Send to Both
          </button>
        </div>
      </div>
    </div>
  )
}
