export interface ProviderModel {
  id: string
  name: string
  free: boolean
  capabilities: string[]
}

export interface ProviderConfig {
  id: string
  name: string
  baseURL: string
  envVar: string
  models: ProviderModel[]
}

const providers: ProviderConfig[] = [
  {
    id: 'openrouter',
    name: 'OpenRouter',
    baseURL: 'https://openrouter.ai/api/v1',
    envVar: 'OPENROUTER_API_KEY',
    models: [
      { id: 'arcee-ai/trinity-large-preview:free', name: 'Arcee Trinity Large (Free)', free: true, capabilities: ['coding', 'reasoning', 'creative'] },
      { id: 'meta-llama/llama-4-scout:free', name: 'Llama 4 Scout (Free)', free: true, capabilities: ['coding', 'reasoning'] },
      { id: 'google/gemini-2.5-pro-exp-03-25:free', name: 'Gemini 2.5 Pro Exp (Free)', free: true, capabilities: ['coding', 'reasoning', 'creative'] },
      { id: 'deepseek/deepseek-chat-v3-0324:free', name: 'DeepSeek Chat v3 (Free)', free: true, capabilities: ['coding', 'reasoning'] },
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    baseURL: 'https://api.openai.com/v1',
    envVar: 'OPENAI_API_KEY',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', free: false, capabilities: ['coding', 'reasoning', 'creative', 'vision'] },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', free: false, capabilities: ['coding', 'fast', 'cheap'] },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', free: false, capabilities: ['coding', 'fast', 'cheap'] },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    baseURL: 'https://api.anthropic.com/v1',
    envVar: 'ANTHROPIC_API_KEY',
    models: [
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', free: false, capabilities: ['coding', 'reasoning', 'creative', 'vision'] },
      { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', free: false, capabilities: ['coding', 'fast', 'vision'] },
    ],
  },
]

const DEFAULT_MODEL = 'arcee-ai/trinity-large-preview:free'

const modelToProviderMap = new Map<string, ProviderConfig>()
for (const provider of providers) {
  for (const model of provider.models) {
    modelToProviderMap.set(model.id, provider)
  }
}

export function getProviderForModel(modelId: string): ProviderConfig | undefined {
  return modelToProviderMap.get(modelId)
}

export function getAvailableModels(): (ProviderModel & { providerId: string; providerName: string })[] {
  const available: (ProviderModel & { providerId: string; providerName: string })[] = []
  for (const provider of providers) {
    if (process.env[provider.envVar]) {
      for (const model of provider.models) {
        available.push({ ...model, providerId: provider.id, providerName: provider.name })
      }
    }
  }
  return available
}

export function resolveModelAndProvider(requestedModel?: string): { modelId: string; provider: ProviderConfig } {
  if (requestedModel) {
    const provider = getProviderForModel(requestedModel)
    if (provider && process.env[provider.envVar]) {
      return { modelId: requestedModel, provider }
    }
  }

  const defaultProvider = getProviderForModel(DEFAULT_MODEL)!
  return { modelId: DEFAULT_MODEL, provider: defaultProvider }
}

export function getAllProviders(): ProviderConfig[] {
  return providers
}

export function getProviderStatus(): { provider: ProviderConfig; configured: boolean }[] {
  return providers.map(p => ({ provider: p, configured: !!process.env[p.envVar] }))
}
