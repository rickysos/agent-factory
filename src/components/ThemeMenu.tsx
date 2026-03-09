'use client'

import { useState, useRef, useEffect } from 'react'
import { useTheme, ThemeMode, ColorVision } from '@/lib/theme-context'

const COLOR_VISION_OPTIONS: { value: ColorVision; label: string; desc: string }[] = [
  { value: 'normal', label: 'Default', desc: 'Standard palette' },
  { value: 'protanopia', label: 'Protanopia', desc: 'Red-blind' },
  { value: 'deuteranopia', label: 'Deuteranopia', desc: 'Green-blind' },
  { value: 'tritanopia', label: 'Tritanopia', desc: 'Blue-blind' },
  { value: 'achromatopsia', label: 'Achromatopsia', desc: 'Monochrome' },
]

export function ThemeMenu() {
  const { mode, setMode, colorVision, setColorVision, resolvedDark } = useTheme()
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
        className="p-1.5 rounded text-forge-400 dark:text-forge-500 hover:text-accent-600 dark:hover:text-accent-400 hover:bg-forge-100 dark:hover:bg-forge-800 transition-colors"
        title="Theme & Accessibility"
        aria-label="Theme settings"
      >
        {resolvedDark ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-56 bg-forge-50 dark:bg-forge-850 border border-forge-200 dark:border-forge-700 rounded-md py-3 z-50">
          <div className="px-4 pb-2">
            <p className="text-[10px] font-mono font-medium text-forge-400 dark:text-forge-500 uppercase tracking-wider">Theme</p>
          </div>
          <div className="px-3 flex gap-1">
            {(['light', 'dark', 'system'] as ThemeMode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-1.5 text-xs font-mono uppercase tracking-wider rounded transition-colors ${
                  mode === m
                    ? 'bg-accent-500/10 text-accent-600 dark:text-accent-400 border border-accent-500/20'
                    : 'text-forge-500 dark:text-forge-400 border border-transparent hover:text-forge-700 dark:hover:text-forge-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="my-3 border-t border-forge-200 dark:border-forge-700" />

          <div className="px-4 pb-2">
            <p className="text-[10px] font-mono font-medium text-forge-400 dark:text-forge-500 uppercase tracking-wider">Color Vision</p>
          </div>
          <div className="px-3 space-y-0.5">
            {COLOR_VISION_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setColorVision(opt.value)}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  colorVision === opt.value
                    ? 'bg-accent-500/10 border border-accent-500/20'
                    : 'border border-transparent hover:bg-forge-100 dark:hover:bg-forge-800'
                }`}
              >
                <span className={`text-xs font-mono ${colorVision === opt.value ? 'text-accent-600 dark:text-accent-400' : 'text-forge-700 dark:text-forge-200'}`}>
                  {opt.label}
                </span>
                <span className="block text-[10px] font-mono text-forge-400 dark:text-forge-500">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
