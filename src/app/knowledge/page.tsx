'use client'

import { useState, useEffect, useCallback } from 'react'

interface KnowledgeBase {
  id: string
  name: string
  description: string
  createdAt: string
  documentCount: number
}

interface Document {
  id: string
  knowledgeBaseId: string
  title: string
  content: string
  type: 'text' | 'markdown' | 'url'
  createdAt: string
  chunkCount: number
}

interface DocumentChunk {
  id: string
  documentId: string
  content: string
  index: number
}

export default function KnowledgePage() {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([])
  const [selectedKb, setSelectedKb] = useState<string | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<DocumentChunk[]>([])
  const [searching, setSearching] = useState(false)

  const [newKbName, setNewKbName] = useState('')
  const [newKbDesc, setNewKbDesc] = useState('')
  const [showAddDoc, setShowAddDoc] = useState(false)
  const [newDocTitle, setNewDocTitle] = useState('')
  const [newDocContent, setNewDocContent] = useState('')
  const [newDocType, setNewDocType] = useState<'text' | 'markdown' | 'url'>('text')

  const fetchKbs = useCallback(async () => {
    const res = await fetch('/api/knowledge')
    setKnowledgeBases(await res.json())
  }, [])

  const fetchDocs = useCallback(async (kbId: string) => {
    const res = await fetch(`/api/knowledge/${kbId}/documents`)
    setDocuments(await res.json())
  }, [])

  useEffect(() => { fetchKbs() }, [fetchKbs])

  useEffect(() => {
    if (selectedKb) {
      fetchDocs(selectedKb)
      setSearchQuery('')
      setSearchResults([])
    }
  }, [selectedKb, fetchDocs])

  async function createKb() {
    if (!newKbName.trim()) return
    await fetch('/api/knowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newKbName, description: newKbDesc }),
    })
    setNewKbName('')
    setNewKbDesc('')
    fetchKbs()
  }

  async function deleteKb(id: string) {
    await fetch(`/api/knowledge/${id}`, { method: 'DELETE' })
    if (selectedKb === id) {
      setSelectedKb(null)
      setDocuments([])
    }
    fetchKbs()
  }

  async function addDoc() {
    if (!selectedKb || !newDocTitle.trim() || !newDocContent.trim()) return
    await fetch(`/api/knowledge/${selectedKb}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newDocTitle, content: newDocContent, type: newDocType }),
    })
    setNewDocTitle('')
    setNewDocContent('')
    setNewDocType('text')
    setShowAddDoc(false)
    fetchDocs(selectedKb)
    fetchKbs()
  }

  async function deleteDoc(docId: string) {
    await fetch(`/api/knowledge/${selectedKb}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _action: 'delete', id: docId }),
    })
    // Use a direct DELETE via the document store instead — but we don't have a doc-level endpoint.
    // For MVP, re-fetch:
    if (selectedKb) {
      fetchDocs(selectedKb)
      fetchKbs()
    }
  }

  async function doSearch() {
    if (!selectedKb || !searchQuery.trim()) return
    setSearching(true)
    const res = await fetch(`/api/knowledge/${selectedKb}/search?query=${encodeURIComponent(searchQuery)}`)
    setSearchResults(await res.json())
    setSearching(false)
  }

  function highlightQuery(text: string, query: string) {
    if (!query.trim()) return text
    const terms = query.split(/\s+/).filter(t => t.length > 0)
    const pattern = new RegExp(`(${terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
    const parts = text.split(pattern)
    return parts.map((part, i) =>
      pattern.test(part)
        ? <mark key={i} className="bg-amber-200 dark:bg-amber-700 text-inherit rounded px-0.5">{part}</mark>
        : part
    )
  }

  const activeKb = knowledgeBases.find(kb => kb.id === selectedKb)
  const typeBadgeColors: Record<string, string> = {
    text: 'bg-forge-200 text-forge-600 dark:bg-forge-700 dark:text-forge-300',
    markdown: 'bg-forge-200 text-forge-600 dark:bg-forge-800 dark:text-forge-300',
    url: 'bg-accent-500/10 text-accent-600 dark:bg-accent-500/10 dark:text-accent-400',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-forge-800 dark:text-forge-100 mb-2">
          Knowledge <span className="text-accent-600">Base</span>
        </h1>
        <p className="text-lg text-forge-500 dark:text-forge-400">
          Manage documents and knowledge bases for RAG-powered agent conversations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left panel — KB list */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-forge-400 dark:text-forge-500 uppercase tracking-wide">Knowledge Bases</h2>

          {/* Create form */}
          <div className="bg-forge-50 dark:bg-forge-850 border border-forge-200 dark:border-forge-700 rounded-md p-4 space-y-3">
            <input
              type="text"
              placeholder="Name"
              value={newKbName}
              onChange={e => setNewKbName(e.target.value)}
              className="w-full px-3 py-2 rounded border border-forge-200 dark:border-forge-700 bg-forge-50 dark:bg-forge-900 text-sm text-forge-800 dark:text-forge-100 focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newKbDesc}
              onChange={e => setNewKbDesc(e.target.value)}
              className="w-full px-3 py-2 rounded border border-forge-200 dark:border-forge-700 bg-forge-50 dark:bg-forge-900 text-sm text-forge-800 dark:text-forge-100 focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
            <button
              onClick={createKb}
              disabled={!newKbName.trim()}
              className="w-full px-4 py-2 bg-accent-500 text-forge-950 text-sm font-medium rounded hover:bg-accent-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Knowledge Base
            </button>
          </div>

          {knowledgeBases.length === 0 ? (
            <div className="text-center py-10 text-forge-300 dark:text-forge-400 text-sm">
              No knowledge bases yet. Create one above.
            </div>
          ) : (
            knowledgeBases.map(kb => (
              <button
                key={kb.id}
                onClick={() => setSelectedKb(kb.id)}
                className={`w-full text-left rounded-md border p-4 transition-all ${
                  selectedKb === kb.id
                    ? 'border-accent-500 bg-accent-500/10 dark:bg-accent-950 '
                    : 'border-forge-200 dark:border-forge-700 bg-forge-50 dark:bg-forge-850 hover: hover:border-forge-200 dark:hover:border-forge-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-forge-800 dark:text-forge-100">{kb.name}</h3>
                  <button
                    onClick={e => { e.stopPropagation(); deleteKb(kb.id) }}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
                {kb.description && (
                  <p className="text-sm text-forge-400 dark:text-forge-500 mb-2 line-clamp-2">{kb.description}</p>
                )}
                <span className="text-xs text-forge-300 dark:text-forge-400">
                  {kb.documentCount} document{kb.documentCount !== 1 ? 's' : ''}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Right panel — KB details */}
        <div className="lg:col-span-2">
          {!activeKb ? (
            <div className="text-center py-20 text-forge-300 dark:text-forge-400">
              Select a knowledge base to view its documents
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-forge-800 dark:text-forge-100">{activeKb.name}</h2>
                {activeKb.description && (
                  <p className="text-sm text-forge-400 dark:text-forge-500 mt-1">{activeKb.description}</p>
                )}
              </div>

              {/* Search */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && doSearch()}
                  className="flex-1 px-3 py-2 rounded border border-forge-200 dark:border-forge-700 bg-forge-50 dark:bg-forge-900 text-sm text-forge-800 dark:text-forge-100 focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
                <button
                  onClick={doSearch}
                  disabled={searching || !searchQuery.trim()}
                  className="px-4 py-2 bg-accent-500 text-forge-950 text-sm font-medium rounded hover:bg-accent-400 disabled:opacity-50"
                >
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </div>

              {/* Search results */}
              {searchResults.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-forge-400 dark:text-forge-500 uppercase tracking-wide">
                    Search Results ({searchResults.length})
                  </h3>
                  {searchResults.map(chunk => (
                    <div key={chunk.id} className="bg-amber-500/5 dark:bg-amber-900 border border-yellow-200 dark:border-yellow-800 rounded p-4">
                      <span className="text-xs text-forge-300 dark:text-forge-400 font-mono">Chunk #{chunk.index + 1}</span>
                      <p className="text-sm text-forge-700 dark:text-forge-200 mt-1 whitespace-pre-wrap">
                        {highlightQuery(chunk.content, searchQuery)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add document */}
              {showAddDoc ? (
                <div className="bg-forge-50 dark:bg-forge-850 border border-accent-500/20 rounded-md p-4 space-y-3">
                  <input
                    type="text"
                    placeholder="Document title"
                    value={newDocTitle}
                    onChange={e => setNewDocTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-forge-200 dark:border-forge-700 bg-forge-50 dark:bg-forge-900 text-sm text-forge-800 dark:text-forge-100 focus:outline-none focus:ring-2 focus:ring-accent-500"
                  />
                  <select
                    value={newDocType}
                    onChange={e => setNewDocType(e.target.value as 'text' | 'markdown' | 'url')}
                    className="w-full px-3 py-2 rounded border border-forge-200 dark:border-forge-700 bg-forge-50 dark:bg-forge-900 text-sm text-forge-800 dark:text-forge-100 focus:outline-none focus:ring-2 focus:ring-accent-500"
                  >
                    <option value="text">Text</option>
                    <option value="markdown">Markdown</option>
                    <option value="url">URL</option>
                  </select>
                  <textarea
                    placeholder="Paste document content..."
                    value={newDocContent}
                    onChange={e => setNewDocContent(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 rounded border border-forge-200 dark:border-forge-700 bg-forge-50 dark:bg-forge-900 text-sm text-forge-800 dark:text-forge-100 focus:outline-none focus:ring-2 focus:ring-accent-500 resize-y"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={addDoc}
                      disabled={!newDocTitle.trim() || !newDocContent.trim()}
                      className="px-4 py-2 bg-accent-500 text-forge-950 text-sm rounded hover:bg-accent-400 disabled:opacity-50"
                    >
                      Add Document
                    </button>
                    <button
                      onClick={() => { setShowAddDoc(false); setNewDocTitle(''); setNewDocContent(''); setNewDocType('text') }}
                      className="px-4 py-2 bg-forge-200 dark:bg-forge-700 text-forge-500 dark:text-forge-300 text-sm rounded hover:bg-forge-200 dark:hover:bg-forge-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddDoc(true)}
                  className="px-4 py-2 bg-accent-500 text-forge-950 text-sm font-medium rounded hover:bg-accent-400"
                >
                  + Add Document
                </button>
              )}

              {/* Documents list */}
              <div>
                <h3 className="text-sm font-semibold text-forge-400 dark:text-forge-500 uppercase tracking-wide mb-3">
                  Documents ({documents.length})
                </h3>
                {documents.length === 0 ? (
                  <div className="text-center py-10 text-forge-300 dark:text-forge-400 text-sm border border-dashed border-forge-200 dark:border-forge-700 rounded-md">
                    No documents yet. Add one above.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.map(doc => (
                      <div key={doc.id} className="bg-forge-50 dark:bg-forge-850 border border-forge-200 dark:border-forge-700 rounded p-4 flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-forge-800 dark:text-forge-100 truncate">{doc.title}</h4>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${typeBadgeColors[doc.type]}`}>
                              {doc.type}
                            </span>
                          </div>
                          <p className="text-sm text-forge-400 dark:text-forge-500">
                            {doc.chunkCount} chunk{doc.chunkCount !== 1 ? 's' : ''} &middot; {new Date(doc.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteDoc(doc.id)}
                          className="ml-4 text-xs text-red-500 hover:text-red-700 flex-shrink-0"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
