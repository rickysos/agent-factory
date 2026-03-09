import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import { AgentProvider } from '@/lib/agent-context'
import { ThemeProvider } from '@/lib/theme-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Agent Factory - AI Agent Development Platform',
  description: 'Create, deploy, and manage AI agents with ease',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AgentProvider>
            <Header />
            <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:to-gray-900">
              {children}
            </main>
            <footer className="bg-gray-800 dark:bg-gray-950 text-white p-8 border-t border-gray-700">
              <div className="max-w-7xl mx-auto">
                <p className="text-center text-gray-400">Agent Factory &copy; 2026 - AI Agent Development Platform</p>
              </div>
            </footer>
          </AgentProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
