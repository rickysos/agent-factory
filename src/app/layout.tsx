import type { Metadata } from 'next'
import { JetBrains_Mono, Outfit } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import { AgentProvider } from '@/lib/agent-context'
import { ThemeProvider } from '@/lib/theme-context'

const outfit = Outfit({ subsets: ['latin'], variable: '--font-display' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'Agent Factory — AI Agent Command Center',
  description: 'Build, deploy, and orchestrate AI agents at scale',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} ${jetbrains.variable} font-sans`}>
        <ThemeProvider>
          <AgentProvider>
            <Header />
            <main className="min-h-screen bg-forge-50 dark:bg-forge-950">
              {children}
            </main>
            <footer className="bg-forge-100 dark:bg-forge-900 border-t border-forge-200 dark:border-forge-800 py-6">
              <div className="max-w-7xl mx-auto px-4">
                <p className="text-center text-xs font-mono text-forge-400 dark:text-forge-500 tracking-wider uppercase">
                  Agent Factory &copy; 2026 — Command Center v2.0
                </p>
              </div>
            </footer>
          </AgentProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
