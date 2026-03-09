'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export function SetupBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const complete = localStorage.getItem('setup-complete')
    if (!complete) {
      setShow(true)
    }
  }, [])

  if (!show) return null

  return (
    <div className="mb-8 px-5 py-4 bg-accent-500/5 border border-accent-500/20 rounded-md flex items-center justify-between">
      <div>
        <h3 className="text-sm font-display font-semibold text-forge-800 dark:text-forge-100">New to the Factory?</h3>
        <p className="text-xs font-mono text-forge-400 dark:text-forge-500 mt-0.5">Complete setup to configure providers and forge your first agent.</p>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-4">
        <button
          onClick={() => {
            localStorage.setItem('setup-complete', 'true')
            setShow(false)
          }}
          className="text-xs font-mono uppercase tracking-wider text-forge-400 dark:text-forge-500 hover:text-forge-600 dark:hover:text-forge-300 transition-colors"
        >
          Dismiss
        </button>
        <Link
          href="/setup"
          className="px-4 py-1.5 text-xs font-mono font-medium uppercase tracking-wider bg-accent-500 text-forge-950 rounded hover:bg-accent-400 transition-colors"
        >
          Setup
        </Link>
      </div>
    </div>
  )
}
