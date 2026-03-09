import { AgentDashboard } from '@/components/AgentDashboard'
import { CreateAgentForm } from '@/components/CreateAgentForm'
import { QuickActions } from '@/components/QuickActions'

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to <span className="text-blue-600">Agent Factory</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Create, deploy, and manage AI agents with our intuitive platform.
          No coding required - just define your agent's capabilities and let us handle the rest.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Agents</h2>
            <AgentDashboard />
          </div>
        </div>
        
        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Agent</h2>
            <CreateAgentForm />
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
            <QuickActions />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Scale Your AI Operations?</h2>
          <p className="text-xl mb-6">
            Agent Factory helps you build, deploy, and monitor AI agents at scale.
            From simple chatbots to complex autonomous systems.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition">
              View Documentation
            </button>
            <button className="bg-transparent border-2 border-white font-semibold py-3 px-8 rounded-lg hover:bg-white/10 transition">
              Schedule Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}