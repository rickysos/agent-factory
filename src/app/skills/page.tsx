'use client'

import { useState, useMemo } from 'react'
import { skillsCatalog, categories } from '@/data/skills-catalog'
import type { Skill } from '@/data/skills-catalog'

const authLabels: Record<string, string> = {
  api_key: 'API Key',
  oauth: 'OAuth',
  token: 'Token',
}

export default function SkillsPage() {
  const [enabledSkills, setEnabledSkills] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return skillsCatalog.filter((skill) => {
      const matchesSearch =
        !search ||
        skill.name.toLowerCase().includes(search.toLowerCase()) ||
        skill.description.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = !activeCategory || skill.category === activeCategory
      return matchesSearch && matchesCategory
    })
  }, [search, activeCategory])

  const grouped = useMemo(() => {
    const map = new Map<string, Skill[]>()
    for (const skill of filtered) {
      const list = map.get(skill.category) || []
      list.push(skill)
      map.set(skill.category, list)
    }
    return map
  }, [filtered])

  function toggleSkill(skill: Skill) {
    setEnabledSkills((prev) => {
      const next = new Set(prev)
      if (next.has(skill.id)) {
        next.delete(skill.id)
      } else {
        if (skill.requiresAuth) {
          const confirmed = window.confirm(
            `${skill.name} requires ${authLabels[skill.authType!]} authentication. Enable and configure later?`
          )
          if (!confirmed) return prev
        }
        next.add(skill.id)
      }
      return next
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-forge-800">
            Skills <span className="text-accent-600">Catalog</span>
          </h1>
          <p className="text-forge-400 mt-1">
            {enabledSkills.size} of {skillsCatalog.length} skills enabled
          </p>
        </div>
        <input
          type="text"
          placeholder="Search skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72 px-4 py-2 rounded-md border border-forge-200 focus:outline-none focus:ring-2 focus:ring-accent-500 bg-forge-50 "
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
            activeCategory === null
              ? 'bg-accent-500 text-forge-950'
              : 'bg-forge-50 text-forge-500 hover:bg-forge-200 border border-forge-200'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              activeCategory === cat
                ? 'bg-accent-500 text-forge-950'
                : 'bg-forge-50 text-forge-500 hover:bg-forge-200 border border-forge-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {grouped.size === 0 && (
        <p className="text-center text-forge-300 py-12">No skills match your search.</p>
      )}

      <div className="space-y-10">
        {categories
          .filter((cat) => grouped.has(cat))
          .map((cat) => (
            <section key={cat}>
              <h2 className="text-xl font-semibold text-forge-700 mb-4">{cat}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {grouped.get(cat)!.map((skill) => {
                  const enabled = enabledSkills.has(skill.id)
                  return (
                    <div
                      key={skill.id}
                      className={`relative rounded-md  p-5 transition cursor-pointer border-2 ${
                        enabled
                          ? 'bg-accent-500/10 border-accent-500'
                          : 'bg-forge-50 border-transparent hover:border-forge-200'
                      }`}
                      onClick={() => toggleSkill(skill)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-forge-800 truncate">{skill.name}</h3>
                            {skill.requiresAuth && (
                              <svg
                                className="w-4 h-4 text-amber-500 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                              </svg>
                            )}
                          </div>
                          <p className="text-sm text-forge-400 mt-1">{skill.description}</p>
                          {skill.requiresAuth && skill.authType && (
                            <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-500/10 text-amber-600">
                              {authLabels[skill.authType]}
                            </span>
                          )}
                        </div>
                        <div
                          className={`w-11 h-6 rounded-full flex-shrink-0 transition relative ${
                            enabled ? 'bg-accent-500' : 'bg-forge-300'
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 w-5 h-5 rounded-full bg-forge-50 shadow transition-transform ${
                              enabled ? 'translate-x-5' : 'translate-x-0.5'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
      </div>
    </div>
  )
}
