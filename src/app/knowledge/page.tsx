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
        ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 text-inherit rounded px-0.5">{part}</mark>
        : part
    )
  }

  const activeKb = knowledgeBases.find(kb => kb.id === selectedKb)
  const typeBadgeColors: Record<string, string> = {
    text: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    markdown: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    url: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Knowledge <span className="text-blue-600">Base</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Manage documents and knowledge bases for RAG-powered agent conversations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left panel — KB list */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Knowledge Bases</h2>

          {/* Create form */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
            <input
              type="text"
              placeholder="Name"
              value={newKbName}
              onChange={e => setNewKbName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newKbDesc}
              onChange={e => setNewKbDesc(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={createKb}
              disabled={!newKbName.trim()}
              className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Knowledge Base
            </button>
          </div>

          {knowledgeBases.length === 0 ? (
            <div className="text-center py-10 text-gray-400 dark:text-gray-500 text-sm">
              No knowledge bases yet. Create one above.
            </div>
          ) : (
            knowledgeBases.map(kb => (
              <button
                key={kb.id}
                onClick={() => setSelectedKb(kb.id)}
                className={`w-full text-left rounded-xl border p-4 transition-all ${
                  selectedKb === kb.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 shadow-md'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{kb.name}</h3>
                  <button
                    onClick={e => { e.stopPropagation(); deleteKb(kb.id) }}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
                {kb.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">{kb.description}</p>
                )}
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {kb.documentCount} document{kb.documentCount !== 1 ? 's' : ''}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Right panel — KB details */}
        <div className="lg:col-span-2">
          {!activeKb ? (
            <div className="text-center py-20 text-gray-400 dark:text-gray-500">
              Select a knowledge base to view its documents
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{activeKb.name}</h2>
                {activeKb.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{activeKb.description}</p>
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
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={doSearch}
                  disabled={searching || !searchQuery.trim()}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </div>

              {/* Search results */}
              {searchResults.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Search Results ({searchResults.length})
                  </h3>
                  {searchResults.map(chunk => (
                    <div key={chunk.id} className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">Chunk #{chunk.index + 1}</span>
                      <p className="text-sm text-gray-800 dark:text-gray-200 mt-1 whitespace-pre-wrap">
                        {highlightQuery(chunk.content, searchQuery)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add document */}
              {showAddDoc ? (
                <div className="bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 rounded-xl p-4 space-y-3">
                  <input
                    type="text"
                    placeholder="Document title"
                    value={newDocTitle}
                    onChange={e => setNewDocTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={newDocType}
                    onChange={e => setNewDocType(e.target.value as 'text' | 'markdown' | 'url')}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={addDoc}
                      disabled={!newDocTitle.trim() || !newDocContent.trim()}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Add Document
                    </button>
                    <button
                      onClick={() => { setShowAddDoc(false); setNewDocTitle(''); setNewDocContent(''); setNewDocType('text') }}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddDoc(true)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                >
                  + Add Document
                </button>
              )}

              {/* Documents list */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  Documents ({documents.length})
                </h3>
                {documents.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 dark:text-gray-500 text-sm border border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
                    No documents yet. Add one above.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.map(doc => (
                      <div key={doc.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900 dark:text-white truncate">{doc.title}</h4>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${typeBadgeColors[doc.type]}`}>
                              {doc.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
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
