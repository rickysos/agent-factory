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
      { name: 'Launch & Run', href: '/launch' },
      { name: 'Maintenance', href: '/maintenance' },
      { name: 'Scoring', href: '/scoring' },
    ],
  },
  {
    label: 'Build',
    items: [
      { name: 'Stacks', href: '/stacks' },
      { name: 'Templates', href: '/templates' },
      { name: 'Team Templates', href: '/templates/teams' },
      { name: 'Persona Templates', href: '/templates' },
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
      { name: 'Memory Config', href: '/memory-config' },
      { name: 'Providers', href: '/providers' },
      { name: 'Config Diff', href: '/config-diff' },
      { name: 'Smart Routing', href: '/routing' },
    ],
  },
  {
    label: 'Connect',
    items: [
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
        className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition inline-flex items-center gap-1"
      >
        {group.label}
        <svg className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 mt-1 w-52 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
          {group.items.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400"
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
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="w-full py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">AF</span>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  <Link href="/">Agent Factory</Link>
                </h1>
              </div>
            </div>

            <div className="hidden lg:ml-8 lg:flex lg:items-center lg:space-x-1">
              {navGroups.map(group => (
                <Dropdown key={group.label} group={group} />
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-1.5" title={connected ? 'Connected' : 'Disconnected'}>
              <div className={`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-400'}`} />
              <span className="text-xs text-gray-400">{connected ? 'Live' : 'Offline'}</span>
            </div>

            <ThemeMenu />

            <Link
              href="/quick-start"
              className="hidden md:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Agent
            </Link>

            <div className="relative hidden md:block">
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-gray-700 dark:text-gray-200 font-medium text-sm">RB</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 py-4 max-h-[70vh] overflow-y-auto">
            <div className="px-2 space-y-1">
              {navGroups.map(group => (
                <div key={group.label}>
                  <button
                    onClick={() => setMobileExpanded(mobileExpanded === group.label ? null : group.label)}
                    className="w-full flex justify-between items-center px-3 py-2 text-base font-medium text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    {group.label}
                    <svg className={`h-4 w-4 transition-transform ${mobileExpanded === group.label ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {mobileExpanded === group.label && (
                    <div className="pl-4 space-y-1">
                      {group.items.map(item => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link
                href="/quick-start"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full mt-4 text-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Create Agent
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
