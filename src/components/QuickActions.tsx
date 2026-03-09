'use client'

import Link from 'next/link'

export function QuickActions() {
  const actions = [
    { name: 'View Logs', href: '/traces', shortcut: 'T' },
    { name: 'Settings', href: '/settings/billing', shortcut: 'S' },
    { name: 'API Keys', href: '/settings/billing', shortcut: 'K' },
    { name: 'Costs', href: '/costs', shortcut: 'C' },
  ]

  return (
    <div className="space-y-1.5">
      {actions.map((action) => (
        <Link
          key={action.name}
          href={action.href}
          className="flex items-center justify-between px-3 py-2.5 rounded border border-forge-200 dark:border-forge-700 hover:border-amber-500/40 transition-colors group"
        >
          <span className="text-xs font-mono text-forge-600 dark:text-forge-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            {action.name}
          </span>
          <span className="text-[10px] font-mono text-forge-300 dark:text-forge-600 uppercase">
            {action.shortcut}
          </span>
        </Link>
      ))}
    </div>
  )
}
