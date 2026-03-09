'use client'

import { useState } from 'react'

interface CustomSkill {
  id: string
  name: string
  content: string
  createdAt: string
}

const defaultContent = `# Skill Name

## Description
Describe what this skill does.

## Instructions
Step-by-step instructions for the agent.

1. First, analyze the input
2. Then, process according to rules
3. Finally, return the result

## Constraints
- Keep responses concise
- Follow the specified format
- Ask for clarification if needed

## Examples

### Input
"Example input here"

### Output
"Expected output here"
`

export default function SkillCreatorPage() {
  const [skillName, setSkillName] = useState('')
  const [content, setContent] = useState(defaultContent)
  const [skills, setSkills] = useState<CustomSkill[]>([
    { id: '1', name: 'Code Review Checklist', content: '# Code Review Checklist\n\n## Steps\n1. Check for bugs\n2. Verify naming conventions\n3. Ensure test coverage', createdAt: '2026-03-08' },
    { id: '2', name: 'API Documentation Generator', content: '# API Documentation Generator\n\n## Instructions\nGenerate OpenAPI-compatible docs from route files.', createdAt: '2026-03-07' },
  ])
  const [showPreview, setShowPreview] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)

  const handleSave = () => {
    if (!skillName.trim()) return
    if (editing) {
      setSkills(prev => prev.map(s => s.id === editing ? { ...s, name: skillName, content } : s))
    } else {
      setSkills(prev => [...prev, {
        id: Date.now().toString(),
        name: skillName,
        content,
        createdAt: '2026-03-09',
      }])
    }
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setSkillName('')
      setContent(defaultContent)
      setEditing(null)
    }, 1500)
  }

  const handleExport = () => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${skillName || 'skill'}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const editSkill = (skill: CustomSkill) => {
    setEditing(skill.id)
    setSkillName(skill.name)
    setContent(skill.content)
    setShowPreview(false)
  }

  const deleteSkill = (id: string) => {
    setSkills(prev => prev.filter(s => s.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-2">Custom Skill Creator</h1>
      <p className="text-gray-400 mb-8">Create and manage SKILL.md files for agents</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <label className="block text-xs text-gray-500 uppercase mb-1">Skill Name</label>
            <input
              type="text"
              value={skillName}
              onChange={e => setSkillName(e.target.value)}
              placeholder="e.g. Code Review Checklist"
              className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
            />
          </div>

          <div className="flex gap-2 mb-2">
            <button
              onClick={() => setShowPreview(false)}
              className={`px-3 py-1 rounded text-sm ${!showPreview ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Editor
            </button>
            <button
              onClick={() => setShowPreview(true)}
              className={`px-3 py-1 rounded text-sm ${showPreview ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Preview
            </button>
          </div>

          {showPreview ? (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 min-h-[400px]">
              <pre className="whitespace-pre-wrap text-sm text-gray-300 font-mono">{content}</pre>
            </div>
          ) : (
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full h-[400px] bg-gray-900 border border-gray-800 rounded-lg p-4 text-sm font-mono resize-none"
            />
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={!skillName.trim()}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                saved ? 'bg-green-600' :
                skillName.trim() ? 'bg-blue-600 hover:bg-blue-700' :
                'bg-gray-800 text-gray-600 cursor-not-allowed'
              }`}
            >
              {saved ? 'Saved' : editing ? 'Update Skill' : 'Save Skill'}
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-medium transition-colors"
            >
              Export .md
            </button>
            {editing && (
              <button
                onClick={() => { setEditing(null); setSkillName(''); setContent(defaultContent) }}
                className="px-4 py-2 text-gray-400 hover:text-white text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Created Skills</h2>
          {skills.length === 0 ? (
            <p className="text-gray-500 text-sm">No custom skills yet.</p>
          ) : (
            <div className="space-y-3">
              {skills.map(skill => (
                <div key={skill.id} className="bg-gray-800 rounded p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-sm">{skill.name}</h3>
                    <span className="text-xs text-gray-500">{skill.createdAt}</span>
                  </div>
                  <p className="text-xs text-gray-500 font-mono mb-3 truncate">{skill.name.toLowerCase().replace(/\s+/g, '-')}.md</p>
                  <div className="flex gap-2">
                    <button onClick={() => editSkill(skill)} className="text-xs text-blue-400 hover:text-blue-300">Edit</button>
                    <button onClick={() => deleteSkill(skill.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
