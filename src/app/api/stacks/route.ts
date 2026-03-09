import { NextRequest, NextResponse } from 'next/server'
import { teamTemplates } from '@/data/team-templates'
import { agentStore } from '@/lib/agent-store'

export async function GET() {
  return NextResponse.json({ success: true, data: teamTemplates })
}

export async function POST(request: NextRequest) {
  const { templateId } = await request.json()

  const template = teamTemplates.find(t => t.id === templateId)
  if (!template) {
    return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 })
  }

  const agents = []

  const orchestrator = agentStore.create({
    name: template.orchestrator.name,
    description: template.orchestrator.role,
    model: template.orchestrator.model,
    status: 'draft',
    capabilities: ['orchestration', 'delegation'],
  })
  agents.push(orchestrator)

  for (const sub of template.subAgents) {
    const agent = agentStore.create({
      name: sub.name,
      description: sub.role,
      model: sub.model,
      status: 'draft',
      capabilities: [],
    })
    agents.push(agent)
  }

  return NextResponse.json({
    success: true,
    data: {
      templateId: template.id,
      templateName: template.name,
      agents,
      cronJobs: template.cronJobs,
    },
    message: `Stack "${template.name}" created with ${agents.length} agents`,
  }, { status: 201 })
}
