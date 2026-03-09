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
    <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center justify-between">
      <div>
        <h3 className="font-semibold text-blue-900 dark:text-blue-100">New to Agent Factory?</h3>
        <p className="text-sm text-blue-700 dark:text-blue-300">Complete the setup wizard to configure providers and create your first agent.</p>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-4">
        <button
          onClick={() => {
            localStorage.setItem('setup-complete', 'true')
            setShow(false)
          }}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
        >
          Dismiss
        </button>
        <Link
          href="/setup"
          className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Complete Setup
        </Link>
      </div>
    </div>
  )
}
