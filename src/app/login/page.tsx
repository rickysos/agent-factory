'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error)
          return
        }
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else {
        router.push('/')
        router.refresh()
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-forge-50 rounded-2xl  p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center mx-auto mb-4">
            <span className="text-forge-950 font-bold text-xl">AF</span>
          </div>
          <h2 className="text-2xl font-bold text-forge-800">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h2>
          <p className="text-forge-400 mt-1">Agent Factory Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Full Name"
              required={isSignUp}
              className="w-full px-4 py-3 border border-forge-200 rounded focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
            />
          )}
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full px-4 py-3 border border-forge-200 rounded focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full px-4 py-3 border border-forge-200 rounded focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-accent-500 text-forge-950 font-medium rounded hover:bg-accent-400 disabled:opacity-50"
          >
            {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-forge-400 mt-6">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError('') }}
            className="text-accent-600 hover:underline font-medium"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>

        <div className="mt-4 p-3 bg-forge-100 rounded text-xs text-forge-400">
          <p className="font-medium mb-1">Demo credentials:</p>
          <p>admin@agentfactory.com / admin123</p>
        </div>
      </div>
    </div>
  )
}
