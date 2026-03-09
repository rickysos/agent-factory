'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useAgents } from '@/lib/agent-context'
import { ThemeMenu } from './ThemeMenu'

interface NavGroup {
  label: string
  items: { name: string; href: string }[]
}

const navGroups: NavGroup[] = [
  {
    label: 'Agents',
    items: [
      { name: 'Dashboard', href: '/' },
      { name: 'Agent Library', href: '/library' },
      { name: 'Agent Editor', href: '/agent-editor' },
      { name: 'Presets', href: '/presets' },
      { name: 'Chat', href: '/chat' },
      { name: 'Playground', href: '/playground' },
      { name: 'Launch & Run', href: '/launch' },
      { name: 'Maintenance', href: '/maintenance' },
      { name: 'Scoring', href: '/scoring' },
      { name: 'Approvals', href: '/approvals' },
    ],
  },
  {
    label: 'Build',
    items: [
      { name: 'Stacks', href: '/stacks' },
      { name: 'Templates', href: '/templates' },
      { name: 'Team Templates', href: '/templates/teams' },
      { name: 'Persona Templates', href: '/templates' },
      { name: 'Sandbox', href: '/sandbox' },
      { name: 'Skill Creator', href: '/skill-creator' },
      { name: 'Workflows', href: '/workflows' },
      { name: 'Agent Routing', href: '/agent-routing' },
    ],
  },
  {
    label: 'Configure',
    items: [
      { name: 'Models', href: '/models' },
      { name: 'Local Models', href: '/local-models' },
      { name: 'Skills Catalog', href: '/skills' },
      { name: 'Tools & Permissions', href: '/tools' },
      { name: 'Thinking Level', href: '/thinking' },
      { name: 'Knowledge Base', href: '/knowledge' },
      { name: 'Memory Config', href: '/memory-config' },
      { name: 'Providers', href: '/providers' },
      { name: 'Config Diff', href: '/config-diff' },
      { name: 'Smart Routing', href: '/routing' },
    ],
  },
  {
    label: 'Connect',
    items: [
      { name: 'Triggers', href: '/triggers' },
      { name: 'Channels', href: '/channels' },
      { name: 'Messaging', href: '/messaging' },
      { name: 'MCP Servers', href: '/mcp' },
      { name: 'Cron Jobs', href: '/cron' },
      { name: 'Gateway', href: '/gateway' },
      { name: 'Gateway Config', href: '/gateway-config' },
      { name: 'Deploy', href: '/deploy' },
    ],
  },
  {
    label: 'Observe',
    items: [
      { name: 'Monitoring', href: '/monitoring' },
      { name: 'Traces', href: '/traces' },
      { name: 'Sessions', href: '/sessions' },
      { name: 'Costs', href: '/costs' },
      { name: 'Alerts', href: '/alerts' },
      { name: 'Telemetry', href: '/telemetry' },
      { name: 'Memory', href: '/memory' },
      { name: 'Feedback', href: '/feedback' },
    ],
  },
  {
    label: 'Marketplace',
    items: [
      { name: 'Browse All', href: '/marketplace' },
      { name: 'Templates', href: '/marketplace/templates' },
      { name: 'Skills', href: '/marketplace/skills' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { name: 'Environment', href: '/environment' },
      { name: 'SSO', href: '/settings/sso' },
      { name: 'Audit Log', href: '/settings/audit' },
      { name: 'Tenants', href: '/settings/tenants' },
      { name: 'Billing & Keys', href: '/settings/billing' },
      { name: 'System Status', href: '/status' },
      { name: 'Setup Wizard', href: '/setup' },
      { name: 'Quick Start', href: '/quick-start' },
    ],
  },
]

function Dropdown({ group }: { group: NavGroup }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-forge-500 dark:text-forge-400 hover:text-amber-600 dark:hover:text-amber-400 px-2.5 py-1.5 text-xs font-mono font-medium uppercase tracking-wider transition inline-flex items-center gap-1"
      >
        {group.label}
        <svg className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 mt-1 w-52 bg-forge-50 dark:bg-forge-850 border border-forge-200 dark:border-forge-700 rounded-md py-1 z-50">
          {group.items.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-1.5 text-sm text-forge-600 dark:text-forge-300 hover:bg-amber-50 dark:hover:bg-amber-900/10 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const { connected } = useAgents()

  return (
    <header className="bg-forge-50/80 dark:bg-forge-950/80 backdrop-blur-md border-b border-forge-200 dark:border-forge-800 sticky top-0 z-40">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="w-full py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-8 w-8 bg-amber-500 dark:bg-amber-400 rounded flex items-center justify-center transition-all group-hover:glow-amber">
                <span className="text-forge-950 font-mono font-black text-sm">AF</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-display font-bold text-forge-800 dark:text-forge-100 tracking-tight">
                  Agent Factory
                </span>
                <span className="hidden sm:inline text-[10px] font-mono text-forge-400 dark:text-forge-500 uppercase tracking-widest">
                  v2.0
                </span>
              </div>
            </Link>

            <div className="hidden lg:ml-8 lg:flex lg:items-center">
              {navGroups.map(group => (
                <Dropdown key={group.label} group={group} />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5" title={connected ? 'Connected' : 'Disconnected'}>
              <div className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-amber-400 animate-pulse' : 'bg-forge-400'}`} />
              <span className="text-[10px] font-mono uppercase tracking-wider text-forge-400 dark:text-forge-500">
                {connected ? 'Live' : 'Off'}
              </span>
            </div>

            <ThemeMenu />

            <Link
              href="/quick-start"
              className="hidden md:inline-flex items-center px-3 py-1.5 text-xs font-mono font-medium uppercase tracking-wider rounded bg-amber-500 dark:bg-amber-400 text-forge-950 hover:bg-amber-400 dark:hover:bg-amber-300 transition-colors"
            >
              + New Agent
            </Link>

            <div className="hidden md:flex items-center">
              <div className="h-7 w-7 bg-forge-200 dark:bg-forge-700 rounded flex items-center justify-center">
                <span className="text-forge-600 dark:text-forge-300 font-mono text-xs font-bold">RB</span>
              </div>
            </div>

            <button
              type="button"
              className="lg:hidden p-1.5 rounded text-forge-400 hover:text-forge-600 dark:hover:text-forge-200 hover:bg-forge-100 dark:hover:bg-forge-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-forge-200 dark:border-forge-800 py-3 max-h-[70vh] overflow-y-auto">
            <div className="px-2 space-y-1">
              {navGroups.map(group => (
                <div key={group.label}>
                  <button
                    onClick={() => setMobileExpanded(mobileExpanded === group.label ? null : group.label)}
                    className="w-full flex justify-between items-center px-3 py-2 text-xs font-mono font-medium uppercase tracking-wider text-forge-600 dark:text-forge-300 rounded hover:bg-forge-100 dark:hover:bg-forge-800"
                  >
                    {group.label}
                    <svg className={`h-3 w-3 transition-transform ${mobileExpanded === group.label ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {mobileExpanded === group.label && (
                    <div className="pl-4 space-y-0.5">
                      {group.items.map(item => (
                        <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} className="block px-3 py-1.5 rounded text-sm text-forge-500 dark:text-forge-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-forge-100 dark:hover:bg-forge-800">
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link href="/quick-start" onClick={() => setMobileMenuOpen(false)} className="block w-full mt-3 text-center px-4 py-2 text-xs font-mono font-medium uppercase tracking-wider rounded bg-amber-500 text-forge-950 hover:bg-amber-400">
                + New Agent
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
