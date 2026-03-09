'use client'

import { useState } from 'react'

type Plan = 'free' | 'pro' | 'enterprise'

interface Tenant {
  id: string
  name: string
  members: string[]
  agentCount: number
  plan: Plan
}

const initialTenants: Tenant[] = [
  { id: '1', name: 'Acme Corp', members: ['ricky@acme.com', 'sarah@acme.com', 'james@acme.com'], agentCount: 12, plan: 'enterprise' },
  { id: '2', name: 'StartupXYZ', members: ['alice@startupxyz.com', 'bob@startupxyz.com'], agentCount: 5, plan: 'pro' },
  { id: '3', name: 'DevTeam Alpha', members: ['dev1@alpha.io'], agentCount: 2, plan: 'free' },
  { id: '4', name: 'Marketing Dept', members: ['lead@marketing.co', 'content@marketing.co', 'social@marketing.co', 'analytics@marketing.co'], agentCount: 8, plan: 'pro' },
]

const planColors: Record<Plan, string> = {
  free: 'bg-forge-200 text-forge-500',
  pro: 'bg-accent-500/10 text-accent-600',
  enterprise: 'bg-forge-200 text-forge-600',
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPlan, setNewPlan] = useState<Plan>('free')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [newMemberEmail, setNewMemberEmail] = useState('')

  function createTenant() {
    if (!newName.trim()) return
    const tenant: Tenant = {
      id: Date.now().toString(),
      name: newName.trim(),
      members: [],
      agentCount: 0,
      plan: newPlan,
    }
    setTenants((prev) => [...prev, tenant])
    setNewName('')
    setNewPlan('free')
    setShowCreate(false)
  }

  function addMember(tenantId: string) {
    if (!newMemberEmail.trim()) return
    setTenants((prev) =>
      prev.map((t) =>
        t.id === tenantId ? { ...t, members: [...t.members, newMemberEmail.trim()] } : t
      )
    )
    setNewMemberEmail('')
  }

  function removeMember(tenantId: string, email: string) {
    setTenants((prev) =>
      prev.map((t) =>
        t.id === tenantId ? { ...t, members: t.members.filter((m) => m !== email) } : t
      )
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-forge-800">
            Multi-tenant <span className="text-accent-600">Management</span>
          </h1>
          <p className="text-forge-400 mt-1">{tenants.length} tenants</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-5 py-2 bg-accent-500 text-forge-950 font-medium rounded hover:bg-accent-400 transition"
        >
          {showCreate ? 'Cancel' : 'Create Tenant'}
        </button>
      </div>

      {showCreate && (
        <div className="bg-forge-50 rounded-md border border-forge-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-forge-800 mb-4">New Tenant</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-forge-600 mb-1">Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Tenant name"
                className="w-full px-4 py-2 rounded border border-forge-200 focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-forge-600 mb-1">Plan</label>
              <select
                value={newPlan}
                onChange={(e) => setNewPlan(e.target.value as Plan)}
                className="w-full px-4 py-2 rounded border border-forge-200 bg-forge-50 focus:outline-none focus:ring-2 focus:ring-accent-500"
              >
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>
          <button
            onClick={createTenant}
            className="mt-4 px-5 py-2 bg-accent-500 text-forge-950 font-medium rounded hover:bg-accent-400 transition"
          >
            Create
          </button>
        </div>
      )}

      <div className="space-y-4">
        {tenants.map((tenant) => (
          <div key={tenant.id} className="bg-forge-50 rounded-md border border-forge-200 overflow-hidden">
            <button
              onClick={() => setExpandedId(expandedId === tenant.id ? null : tenant.id)}
              className="w-full p-5 flex items-center justify-between text-left hover:bg-forge-100 transition"
            >
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-forge-800">{tenant.name}</h3>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${planColors[tenant.plan]}`}>
                  {tenant.plan}
                </span>
              </div>
              <div className="flex items-center gap-6 text-sm text-forge-400">
                <span>{tenant.members.length} members</span>
                <span>{tenant.agentCount} agents</span>
                <svg
                  className={`w-5 h-5 text-forge-300 transition-transform ${expandedId === tenant.id ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {expandedId === tenant.id && (
              <div className="px-5 pb-5 border-t border-forge-200 pt-4">
                <h4 className="text-sm font-medium text-forge-600 mb-3">Members</h4>
                {tenant.members.length === 0 && (
                  <p className="text-sm text-forge-300 mb-3">No members yet.</p>
                )}
                <div className="space-y-2 mb-4">
                  {tenant.members.map((email) => (
                    <div key={email} className="flex items-center justify-between bg-forge-100 rounded px-3 py-2">
                      <span className="text-sm text-forge-600">{email}</span>
                      <button
                        onClick={() => removeMember(tenant.id, email)}
                        className="text-xs text-red-500 hover:text-red-700 transition"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={expandedId === tenant.id ? newMemberEmail : ''}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="flex-1 px-3 py-2 rounded border border-forge-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                    onKeyDown={(e) => e.key === 'Enter' && addMember(tenant.id)}
                  />
                  <button
                    onClick={() => addMember(tenant.id)}
                    className="px-4 py-2 bg-accent-500 text-forge-950 text-sm font-medium rounded hover:bg-accent-400 transition"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
