export type CostTier = 'free' | 'cheap' | 'moderate' | 'expensive' | 'premium'
export type Capability = 'coding' | 'reasoning' | 'fast' | 'cheap' | 'creative' | 'vision' | 'long-context'

export interface ModelProvider {
  id: string
  name: string
  requiresApiKey: boolean
  isLocal: boolean
}

export interface Model {
  id: string
  name: string
  providerId: string
  capabilities: Capability[]
  costTier: CostTier
  contextWindow: number
}

export const providers: ModelProvider[] = [
  { id: 'anthropic', name: 'Anthropic', requiresApiKey: true, isLocal: false },
  { id: 'openai', name: 'OpenAI', requiresApiKey: true, isLocal: false },
  { id: 'google', name: 'Google AI', requiresApiKey: true, isLocal: false },
  { id: 'google-vertex', name: 'Google Vertex', requiresApiKey: true, isLocal: false },
  { id: 'openrouter', name: 'OpenRouter', requiresApiKey: true, isLocal: false },
  { id: 'xai', name: 'xAI', requiresApiKey: true, isLocal: false },
  { id: 'groq', name: 'Groq', requiresApiKey: true, isLocal: false },
  { id: 'cerebras', name: 'Cerebras', requiresApiKey: true, isLocal: false },
  { id: 'mistral', name: 'Mistral', requiresApiKey: true, isLocal: false },
  { id: 'ollama', name: 'Ollama', requiresApiKey: false, isLocal: true },
  { id: 'lmstudio', name: 'LM Studio', requiresApiKey: false, isLocal: true },
  { id: 'generic-local', name: 'Generic Local', requiresApiKey: false, isLocal: true },
]

export const models: Model[] = [
  { id: 'claude-opus-4-6', name: 'Claude Opus 4.6', providerId: 'anthropic', capabilities: ['coding', 'reasoning', 'creative', 'vision', 'long-context'], costTier: 'premium', contextWindow: 200000 },
  { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', providerId: 'anthropic', capabilities: ['coding', 'reasoning', 'creative', 'vision', 'long-context'], costTier: 'expensive', contextWindow: 200000 },
  { id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5', providerId: 'anthropic', capabilities: ['coding', 'fast', 'cheap', 'vision'], costTier: 'cheap', contextWindow: 200000 },

  { id: 'gpt-4o', name: 'GPT-4o', providerId: 'openai', capabilities: ['coding', 'reasoning', 'creative', 'vision'], costTier: 'expensive', contextWindow: 128000 },
  { id: 'gpt-4o-mini', name: 'GPT-4o-mini', providerId: 'openai', capabilities: ['coding', 'fast', 'cheap', 'vision'], costTier: 'cheap', contextWindow: 128000 },
  { id: 'o1', name: 'o1', providerId: 'openai', capabilities: ['reasoning', 'coding', 'long-context'], costTier: 'premium', contextWindow: 200000 },
  { id: 'o1-mini', name: 'o1-mini', providerId: 'openai', capabilities: ['reasoning', 'coding', 'fast'], costTier: 'moderate', contextWindow: 128000 },
  { id: 'o3-mini', name: 'o3-mini', providerId: 'openai', capabilities: ['reasoning', 'coding', 'fast', 'cheap'], costTier: 'cheap', contextWindow: 200000 },

  { id: 'gemini-2-5-pro', name: 'Gemini 2.5 Pro', providerId: 'google', capabilities: ['coding', 'reasoning', 'creative', 'vision', 'long-context'], costTier: 'expensive', contextWindow: 1000000 },
  { id: 'gemini-2-5-flash', name: 'Gemini 2.5 Flash', providerId: 'google', capabilities: ['coding', 'fast', 'vision', 'long-context'], costTier: 'moderate', contextWindow: 1000000 },
  { id: 'gemini-2-5-flash-lite', name: 'Gemini 2.5 Flash Lite', providerId: 'google', capabilities: ['fast', 'cheap', 'vision'], costTier: 'cheap', contextWindow: 1000000 },

  { id: 'vertex-gemini-2-5-pro', name: 'Gemini 2.5 Pro', providerId: 'google-vertex', capabilities: ['coding', 'reasoning', 'creative', 'vision', 'long-context'], costTier: 'expensive', contextWindow: 1000000 },
  { id: 'vertex-gemini-2-5-flash', name: 'Gemini 2.5 Flash', providerId: 'google-vertex', capabilities: ['coding', 'fast', 'vision', 'long-context'], costTier: 'moderate', contextWindow: 1000000 },
  { id: 'vertex-gemini-2-5-flash-lite', name: 'Gemini 2.5 Flash Lite', providerId: 'google-vertex', capabilities: ['fast', 'cheap', 'vision'], costTier: 'cheap', contextWindow: 1000000 },

  { id: 'llama-4-405b', name: 'Meta Llama 4 405B', providerId: 'openrouter', capabilities: ['coding', 'reasoning', 'creative', 'long-context'], costTier: 'moderate', contextWindow: 128000 },
  { id: 'llama-4-70b', name: 'Meta Llama 4 70B', providerId: 'openrouter', capabilities: ['coding', 'reasoning', 'fast'], costTier: 'cheap', contextWindow: 128000 },
  { id: 'mixtral-8x22b', name: 'Mixtral 8x22B', providerId: 'openrouter', capabilities: ['coding', 'reasoning', 'creative'], costTier: 'moderate', contextWindow: 65536 },

  { id: 'grok-2', name: 'Grok-2', providerId: 'xai', capabilities: ['coding', 'reasoning', 'creative', 'vision'], costTier: 'expensive', contextWindow: 131072 },
  { id: 'grok-2-mini', name: 'Grok-2-mini', providerId: 'xai', capabilities: ['coding', 'fast', 'cheap'], costTier: 'moderate', contextWindow: 131072 },

  { id: 'groq-llama-4-70b', name: 'Llama 4 70B (fast)', providerId: 'groq', capabilities: ['coding', 'reasoning', 'fast'], costTier: 'cheap', contextWindow: 128000 },
  { id: 'groq-mixtral-8x7b', name: 'Mixtral 8x7B (fast)', providerId: 'groq', capabilities: ['coding', 'fast', 'cheap'], costTier: 'cheap', contextWindow: 32768 },

  { id: 'cerebras-llama-4-70b', name: 'Llama 4 70B (ultra-fast)', providerId: 'cerebras', capabilities: ['coding', 'reasoning', 'fast'], costTier: 'cheap', contextWindow: 128000 },

  { id: 'mistral-large', name: 'Mistral Large', providerId: 'mistral', capabilities: ['coding', 'reasoning', 'creative', 'long-context'], costTier: 'expensive', contextWindow: 128000 },
  { id: 'mistral-medium', name: 'Mistral Medium', providerId: 'mistral', capabilities: ['coding', 'reasoning'], costTier: 'moderate', contextWindow: 32768 },
  { id: 'codestral', name: 'Codestral', providerId: 'mistral', capabilities: ['coding', 'fast'], costTier: 'moderate', contextWindow: 32768 },

  { id: 'ollama-llama-4', name: 'Llama 4', providerId: 'ollama', capabilities: ['coding', 'reasoning'], costTier: 'free', contextWindow: 128000 },
  { id: 'ollama-codellama', name: 'CodeLlama', providerId: 'ollama', capabilities: ['coding', 'fast'], costTier: 'free', contextWindow: 16384 },
  { id: 'ollama-mistral', name: 'Mistral', providerId: 'ollama', capabilities: ['coding', 'reasoning'], costTier: 'free', contextWindow: 32768 },
  { id: 'ollama-phi-3', name: 'Phi-3', providerId: 'ollama', capabilities: ['coding', 'fast', 'cheap'], costTier: 'free', contextWindow: 4096 },

  { id: 'lmstudio-loaded', name: 'Any Loaded Model', providerId: 'lmstudio', capabilities: ['coding', 'reasoning'], costTier: 'free', contextWindow: 4096 },

  { id: 'generic-local-endpoint', name: 'Custom OpenAI-compatible Endpoint', providerId: 'generic-local', capabilities: ['coding'], costTier: 'free', contextWindow: 4096 },
]

export function getProviderById(id: string): ModelProvider | undefined {
  return providers.find(p => p.id === id)
}

export function getModelsByProvider(providerId: string): Model[] {
  return models.filter(m => m.providerId === providerId)
}
