import { AgentDashboard } from '@/components/AgentDashboard'
import { CreateAgentForm } from '@/components/CreateAgentForm'
import { QuickActions } from '@/components/QuickActions'
import { SetupBanner } from '@/components/SetupBanner'

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SetupBanner />

      <div className="mb-10">
        <h1 className="text-3xl font-display font-bold text-forge-800 dark:text-forge-100 tracking-tight mb-2">
          Command Center
        </h1>
        <p className="text-sm font-mono text-forge-400 dark:text-forge-500 uppercase tracking-wider">
          Agent orchestration &amp; monitoring
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2">
          <div className="bg-forge-100/50 dark:bg-forge-900/50 border border-forge-200 dark:border-forge-800 rounded-md p-6 bg-grid">
            <h2 className="text-sm font-mono font-medium text-forge-500 dark:text-forge-400 uppercase tracking-wider mb-5">Active Agents</h2>
            <AgentDashboard />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-forge-100/50 dark:bg-forge-900/50 border border-forge-200 dark:border-forge-800 rounded-md p-6">
            <h2 className="text-sm font-mono font-medium text-forge-500 dark:text-forge-400 uppercase tracking-wider mb-5">Forge New Agent</h2>
            <CreateAgentForm />
          </div>

          <div className="bg-forge-100/50 dark:bg-forge-900/50 border border-forge-200 dark:border-forge-800 rounded-md p-6">
            <h2 className="text-sm font-mono font-medium text-forge-500 dark:text-forge-400 uppercase tracking-wider mb-5">Quick Actions</h2>
            <QuickActions />
          </div>
        </div>
      </div>

      <div className="bg-forge-800 dark:bg-forge-850 border border-forge-700 dark:border-forge-700 rounded-md p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-accent-500/10 border border-accent-500/20">
            <div className="h-1.5 w-1.5 rounded-full bg-accent-400 animate-pulse" />
            <span className="text-xs font-mono text-accent-400 uppercase tracking-wider">Production Ready</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-forge-100 mb-3 tracking-tight">Scale Your AI Operations</h2>
          <p className="text-forge-400 mb-6 max-w-xl mx-auto">
            From simple chatbots to complex autonomous systems. Build, deploy, and monitor agent fleets from a single command center.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="px-6 py-2.5 text-sm font-mono font-medium uppercase tracking-wider bg-accent-500 text-forge-950 rounded hover:bg-accent-400 transition-colors">
              View Docs
            </button>
            <button className="px-6 py-2.5 text-sm font-mono font-medium uppercase tracking-wider border border-forge-600 text-forge-300 rounded hover:border-forge-500 hover:text-forge-100 transition-colors">
              Explore Templates
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
