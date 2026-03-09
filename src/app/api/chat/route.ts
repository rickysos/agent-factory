import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { resolveModelAndProvider } from '@/lib/provider-registry'

export async function POST(req: NextRequest) {
  try {
    const { messages, agentModel } = await req.json()

    const { modelId, provider } = resolveModelAndProvider(agentModel)
    const apiKey = process.env[provider.envVar]

    if (!apiKey) {
      return NextResponse.json(
        { error: `No API key configured. Set ${provider.envVar} in .env.local` },
        { status: 500 }
      )
    }

    const client = new OpenAI({
      apiKey,
      baseURL: provider.baseURL,
    })

    const completion = await client.chat.completions.create({
      model: modelId,
      messages,
    })

    return NextResponse.json({
      message: completion.choices[0]?.message,
      model: modelId,
      provider: provider.id,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Chat request failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
