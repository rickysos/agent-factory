import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import { AgentProvider } from '@/lib/agent-context'

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
    <html lang="en">
      <body className={inter.className}>
        <AgentProvider>
          <Header />
          <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {children}
          </main>
          <footer className="bg-gray-800 text-white p-8">
            <div className="max-w-7xl mx-auto">
              <p className="text-center">Agent Factory © 2026 - AI Agent Development Platform</p>
            </div>
          </footer>
        </AgentProvider>
      </body>
    </html>
  )
}