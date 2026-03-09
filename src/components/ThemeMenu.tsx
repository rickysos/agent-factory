'use client'

import { useState, useRef, useEffect } from 'react'
import { useTheme, ThemeMode, ColorVision } from '@/lib/theme-context'

const COLOR_VISION_OPTIONS: { value: ColorVision; label: string; desc: string }[] = [
  { value: 'normal', label: 'Default', desc: 'Standard color palette' },
  { value: 'protanopia', label: 'Protanopia', desc: 'Red-blind friendly' },
  { value: 'deuteranopia', label: 'Deuteranopia', desc: 'Green-blind friendly' },
  { value: 'tritanopia', label: 'Tritanopia', desc: 'Blue-blind friendly' },
  { value: 'achromatopsia', label: 'Achromatopsia', desc: 'Monochrome / high contrast' },
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
        className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        title="Theme & Accessibility"
        aria-label="Theme settings"
      >
        {resolvedDark ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-3 z-50">
          <div className="px-4 pb-2">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Theme</p>
          </div>
          <div className="px-3 flex gap-1">
            {(['light', 'dark', 'system'] as ThemeMode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition ${
                  mode === m
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>

          <div className="my-3 border-t border-gray-200 dark:border-gray-700" />

          <div className="px-4 pb-2">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Color Vision</p>
          </div>
          <div className="px-3 space-y-1">
            {COLOR_VISION_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setColorVision(opt.value)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                  colorVision === opt.value
                    ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <span className={`font-medium ${colorVision === opt.value ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'}`}>
                  {opt.label}
                </span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
