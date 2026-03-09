'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'
export type ColorVision = 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia'

interface ThemeContextType {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  colorVision: ColorVision
  setColorVision: (cv: ColorVision) => void
  resolvedDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('system')
  const [colorVision, setColorVisionState] = useState<ColorVision>('normal')
  const [systemDark, setSystemDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('af-theme') as ThemeMode | null
    if (saved) setModeState(saved)
    const savedCv = localStorage.getItem('af-color-vision') as ColorVision | null
    if (savedCv) setColorVisionState(savedCv)

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    setSystemDark(mq.matches)
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const resolvedDark = mode === 'dark' || (mode === 'system' && systemDark)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', resolvedDark)
  }, [resolvedDark])

  useEffect(() => {
    document.documentElement.dataset.colorVision = colorVision
  }, [colorVision])

  const setMode = (m: ThemeMode) => {
    setModeState(m)
    localStorage.setItem('af-theme', m)
  }

  const setColorVision = (cv: ColorVision) => {
    setColorVisionState(cv)
    localStorage.setItem('af-color-vision', cv)
  }

  return (
    <ThemeContext.Provider value={{ mode, setMode, colorVision, setColorVision, resolvedDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
