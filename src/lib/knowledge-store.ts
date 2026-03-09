export interface KnowledgeBase {
  id: string
  name: string
  description: string
  createdAt: Date
  documentCount: number
}

export interface Document {
  id: string
  knowledgeBaseId: string
  title: string
  content: string
  type: 'text' | 'markdown' | 'url'
  createdAt: Date
  chunkCount: number
}

export interface DocumentChunk {
  id: string
  documentId: string
  content: string
  index: number
}

let knowledgeBases: KnowledgeBase[] = []
let documents: Document[] = []
let chunks: DocumentChunk[] = []
let nextId = 1

function genId(): string {
  return `kb-${nextId++}-${Date.now().toString(36)}`
}

function chunkContent(content: string, chunkSize = 500): string[] {
  const result: string[] = []
  let i = 0
  while (i < content.length) {
    let end = Math.min(i + chunkSize, content.length)
    if (end < content.length) {
      const lastSpace = content.lastIndexOf(' ', end)
      if (lastSpace > i) end = lastSpace
    }
    result.push(content.slice(i, end).trim())
    i = end
  }
  return result.filter(c => c.length > 0)
}

export function createKnowledgeBase(name: string, description: string): KnowledgeBase {
  const kb: KnowledgeBase = {
    id: genId(),
    name,
    description,
    createdAt: new Date(),
    documentCount: 0,
  }
  knowledgeBases.push(kb)
  return kb
}

export function getKnowledgeBases(): KnowledgeBase[] {
  return knowledgeBases.map(kb => ({
    ...kb,
    documentCount: documents.filter(d => d.knowledgeBaseId === kb.id).length,
  }))
}

export function getKnowledgeBase(id: string): KnowledgeBase | undefined {
  const kb = knowledgeBases.find(k => k.id === id)
  if (!kb) return undefined
  return {
    ...kb,
    documentCount: documents.filter(d => d.knowledgeBaseId === kb.id).length,
  }
}

export function deleteKnowledgeBase(id: string): boolean {
  const idx = knowledgeBases.findIndex(k => k.id === id)
  if (idx === -1) return false
  knowledgeBases.splice(idx, 1)
  const docIds = documents.filter(d => d.knowledgeBaseId === id).map(d => d.id)
  documents = documents.filter(d => d.knowledgeBaseId !== id)
  chunks = chunks.filter(c => !docIds.includes(c.documentId))
  return true
}

export function addDocument(
  knowledgeBaseId: string,
  title: string,
  content: string,
  type: 'text' | 'markdown' | 'url'
): Document | null {
  const kb = knowledgeBases.find(k => k.id === knowledgeBaseId)
  if (!kb) return null

  const docId = genId()
  const contentChunks = chunkContent(content)

  const doc: Document = {
    id: docId,
    knowledgeBaseId,
    title,
    content,
    type,
    createdAt: new Date(),
    chunkCount: contentChunks.length,
  }
  documents.push(doc)

  contentChunks.forEach((text, index) => {
    chunks.push({
      id: genId(),
      documentId: docId,
      content: text,
      index,
    })
  })

  return doc
}

export function getDocuments(knowledgeBaseId: string): Document[] {
  return documents.filter(d => d.knowledgeBaseId === knowledgeBaseId)
}

export function deleteDocument(id: string): boolean {
  const idx = documents.findIndex(d => d.id === id)
  if (idx === -1) return false
  documents.splice(idx, 1)
  chunks = chunks.filter(c => c.documentId !== id)
  return true
}

export function search(knowledgeBaseId: string, query: string): DocumentChunk[] {
  const kbDocIds = new Set(
    documents.filter(d => d.knowledgeBaseId === knowledgeBaseId).map(d => d.id)
  )
  const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 0)
  if (terms.length === 0) return []

  const scored = chunks
    .filter(c => kbDocIds.has(c.documentId))
    .map(chunk => {
      const lower = chunk.content.toLowerCase()
      let score = 0
      for (const term of terms) {
        const matches = lower.split(term).length - 1
        score += matches
      }
      return { chunk, score }
    })
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  return scored.map(s => s.chunk)
}

// Pre-seed
const seedKb = createKnowledgeBase(
  'Getting Started',
  'Introduction to Agent Factory and basic concepts'
)
addDocument(
  seedKb.id,
  'Welcome to Agent Factory',
  `Agent Factory is an AI agent development platform that lets you create, deploy, and manage AI agents with ease. Agents can be configured with different models, capabilities, and tools to handle a wide variety of tasks.

Getting started is simple: navigate to the Dashboard to see your existing agents, or use the Quick Start wizard to create your first agent. Each agent has a unique configuration that includes its model, skills, memory settings, and deployment options.

Key concepts to understand: Agents are the core building blocks. Each agent has a model (like GPT-4 or Claude) that powers its reasoning. Skills define what an agent can do — from code generation to data analysis. Memory allows agents to retain context across conversations. Workflows let you chain multiple agents together for complex tasks.

The Knowledge Base system (this feature!) lets you upload documents that agents can reference during conversations. This is the foundation for Retrieval-Augmented Generation (RAG), where agents search relevant documents to provide more accurate, grounded responses.

To add documents to a knowledge base, simply paste text content or markdown. Documents are automatically split into chunks for efficient retrieval. When an agent is connected to a knowledge base, it can search these chunks to find relevant context for answering questions.`,
  'text'
)
