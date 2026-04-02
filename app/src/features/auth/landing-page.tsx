import { useState } from 'react'
import { AuthForms } from './auth-forms'

type LandingPageProps = {
  busy: boolean
  onSignIn: (email: string, password: string) => Promise<void>
  onSignUp: (email: string, password: string) => Promise<void>
}

export function LandingPage({ busy, onSignIn, onSignUp }: LandingPageProps) {
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in')

  if (showAuth) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <button
            type="button"
            onClick={() => setShowAuth(false)}
            className="mb-6 text-sm text-zinc-400 hover:text-white transition"
          >
            ← Back
          </button>
          <h2 className="mb-6 text-2xl font-semibold text-white">
            {authMode === 'sign-in' ? 'Sign In' : 'Create Account'}
          </h2>
          <AuthForms
            mode={authMode}
            busy={busy}
            onSubmit={async (values) => {
              if (authMode === 'sign-in') {
                await onSignIn(values.email, values.password)
              } else {
                await onSignUp(values.email, values.password)
              }
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-surface-raised to-surface flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl text-center space-y-8">
        {/* Logo/Title */}
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-accent/10 border border-accent/20">
            <span className="text-3xl font-bold text-accent">C</span>
          </div>
          <h1 className="font-display text-5xl font-bold text-white">Circle</h1>
          <p className="text-xl text-zinc-400">
            Authentic social network for meaningful connections
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-8">
          <div className="space-y-2">
            <div className="text-2xl">🤝</div>
            <h3 className="font-semibold text-white">Connect</h3>
            <p className="text-sm text-zinc-500">Build genuine friendships</p>
          </div>
          <div className="space-y-2">
            <div className="text-2xl">🌐</div>
            <h3 className="font-semibold text-white">Explore</h3>
            <p className="text-sm text-zinc-500">Visualize your network</p>
          </div>
          <div className="space-y-2">
            <div className="text-2xl">💬</div>
            <h3 className="font-semibold text-white">Share</h3>
            <p className="text-sm text-zinc-500">Post with your circle</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <button
            type="button"
            onClick={() => {
              setAuthMode('sign-up')
              setShowAuth(true)
            }}
            className="px-8 py-3 rounded-lg bg-accent text-white font-semibold transition hover:bg-accent-hover"
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('sign-in')
              setShowAuth(true)
            }}
            className="px-8 py-3 rounded-lg border border-border text-white font-semibold transition hover:border-accent hover:text-accent"
          >
            Log In
          </button>
        </div>

        {/* Footer */}
        <p className="text-xs text-zinc-600 pt-8">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
