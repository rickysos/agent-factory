'use client'

import { useState } from 'react'
import Link from 'next/link'
import { personaTemplates, PersonaTemplate } from '@/data/persona-templates'

function TemplateModal({ template, onClose }: { template: PersonaTemplate; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'identity' | 'soul'>('identity')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-forge-50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-forge-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{template.emoji}</span>
              <div>
                <h2 className="text-2xl font-bold text-forge-800">{template.name}</h2>
                <p className="text-forge-400 mt-1">{template.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-forge-300 hover:text-forge-500 transition-colors p-1"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('identity')}
              className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                activeTab === 'identity'
                  ? 'bg-accent-500 text-forge-950'
                  : 'bg-forge-200 text-forge-500 hover:bg-forge-200'
              }`}
            >
              IDENTITY.md
            </button>
            <button
              onClick={() => setActiveTab('soul')}
              className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                activeTab === 'soul'
                  ? 'bg-forge-600 text-forge-950'
                  : 'bg-forge-200 text-forge-500 hover:bg-forge-200'
              }`}
            >
              SOUL.md
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <pre className="whitespace-pre-wrap text-sm text-forge-600 font-mono leading-relaxed">
            {activeTab === 'identity' ? template.identity : template.soul}
          </pre>
        </div>

        <div className="p-6 border-t border-forge-200">
          <Link
            href={`/?template=${template.id}`}
            className="block w-full text-center bg-accent-500 text-forge-950 font-semibold py-3 px-6 rounded-md hover:bg-accent-400 transition-all"
          >
            Use This Template
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function TemplatesPage() {
  const [search, setSearch] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<PersonaTemplate | null>(null)

  const filtered = personaTemplates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-forge-800 mb-4">
          Persona <span className="text-accent-600">Templates</span>
        </h1>
        <p className="text-xl text-forge-500 max-w-2xl mx-auto">
          Start with a pre-built persona or create your own from scratch.
          Each template includes a full IDENTITY and SOUL configuration.
        </p>
      </div>

      <div className="max-w-md mx-auto mb-10">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-forge-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-md border border-forge-200 bg-forge-50  focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent text-forge-800 placeholder-gray-400"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-forge-400 text-lg">No templates match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((template) => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template)}
              className="bg-forge-50 rounded-md border border-forge-200 p-5 hover: hover:border-accent-500/20 transition-all text-left group"
            >
              <div className="text-3xl mb-3">{template.emoji}</div>
              <h3 className="text-lg font-semibold text-forge-800 group-hover:text-accent-600 transition-colors">
                {template.name}
              </h3>
              <p className="text-sm text-forge-400 mt-1 line-clamp-2">{template.description}</p>
            </button>
          ))}
        </div>
      )}

      {selectedTemplate && (
        <TemplateModal
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
        />
      )}
    </div>
  )
}
