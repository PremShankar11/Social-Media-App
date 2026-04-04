import { useState } from 'react'
import { AuthForms } from './auth-forms'

type LandingPageProps = {
  busy: boolean
  message: string | null
  cooldownSeconds: number
  onSignIn: (email: string, password: string) => Promise<void>
  onSignUp: (email: string, password: string) => Promise<void>
}

export function LandingPage({ busy, message, cooldownSeconds, onSignIn, onSignUp }: LandingPageProps) {
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in')

  if (showAuth) {
    return (
      <div className="flex min-h-screen">
        {/* Left branding panel */}
        <div className="hidden w-1/2 lg:flex flex-col justify-center items-center bg-gradient-to-br from-[#0f0f17] via-[#1a1028] to-[#0f0f17] p-12 relative overflow-hidden">
          {/* Floating gradient orbs */}
          <div className="pointer-events-none absolute -left-20 top-1/4 h-[400px] w-[400px] rounded-full bg-accent/10 blur-[100px]" />
          <div className="pointer-events-none absolute -right-20 bottom-1/4 h-[400px] w-[400px] rounded-full bg-secondary/10 blur-[100px]" />

          <div className="relative z-10 max-w-md text-center animate-fade-in">
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-accent to-accent-hover shadow-glow-accent animate-glow-pulse">
              <span className="text-4xl font-bold text-white">C</span>
            </div>
            <h1 className="font-display text-4xl font-bold text-text-primary">
              Welcome to Circle
            </h1>
            <p className="mt-4 text-lg text-text-secondary">
              Your authentic social network for meaningful connections
            </p>
            <div className="mt-12 grid grid-cols-3 gap-4">
              <div className="glass p-4 text-center">
                <p className="text-2xl mb-1">🤝</p>
                <p className="text-xs font-medium text-text-secondary">Connect</p>
              </div>
              <div className="glass p-4 text-center">
                <p className="text-2xl mb-1">🌐</p>
                <p className="text-xs font-medium text-text-secondary">Explore</p>
              </div>
              <div className="glass p-4 text-center">
                <p className="text-2xl mb-1">💬</p>
                <p className="text-xs font-medium text-text-secondary">Share</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex w-full lg:w-1/2 items-center justify-center bg-surface p-8">
          <div className="w-full max-w-md animate-slide-up">
            <button
              type="button"
              onClick={() => setShowAuth(false)}
              className="mb-8 flex items-center gap-2 text-sm font-medium text-text-muted transition-colors hover:text-accent"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back
            </button>

            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 lg:hidden">
              <span className="text-xl font-bold text-accent">C</span>
            </div>

            <h2 className="mb-2 font-display text-3xl font-bold text-text-primary">
              {authMode === 'sign-in' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="mb-8 text-sm text-text-secondary">
              {authMode === 'sign-in'
                ? 'Sign in to your Circle account'
                : 'Join Circle and start connecting'}
            </p>

            <div className="glass p-8">
              <AuthForms
                mode={authMode}
                busy={busy}
                cooldownSeconds={cooldownSeconds}
                serverMessage={message}
                onSubmit={async (values) => {
                  if (authMode === 'sign-in') {
                    await onSignIn(values.email, values.password)
                  } else {
                    await onSignUp(values.email, values.password)
                  }
                }}
              />
            </div>

            <p className="mt-6 text-center text-sm text-text-muted">
              {authMode === 'sign-in' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('sign-up')}
                    className="font-semibold text-accent transition hover:text-accent-hover"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('sign-in')}
                    className="font-semibold text-accent transition hover:text-accent-hover"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-surface">
      {/* Background gradient orbs */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-accent/8 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 top-1/3 h-[700px] w-[700px] rounded-full bg-secondary/8 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-accent/5 blur-[100px]" />

      <div className="relative flex min-h-screen flex-col items-center justify-center p-6">
        <div className="max-w-2xl text-center animate-slide-up">
          {/* Logo */}
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-accent to-[#ff5500] shadow-glow-accent animate-glow-pulse">
            <span className="text-5xl font-bold text-white">C</span>
          </div>

          <h1 className="font-display text-6xl font-bold tracking-tight text-text-primary">
            Circle
          </h1>
          <p className="mt-4 text-xl text-text-secondary">
            Authentic social network for meaningful connections
          </p>

          {/* Feature cards */}
          <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="glass p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-glow">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-2xl">
                🤝
              </div>
              <h3 className="font-semibold text-text-primary">Connect</h3>
              <p className="mt-1 text-sm text-text-secondary">Build genuine friendships</p>
            </div>
            <div className="glass p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-secondary">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10 text-2xl">
                🌐
              </div>
              <h3 className="font-semibold text-text-primary">Explore</h3>
              <p className="mt-1 text-sm text-text-secondary">Visualize your network</p>
            </div>
            <div className="glass p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-glow">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-2xl">
                💬
              </div>
              <h3 className="font-semibold text-text-primary">Share</h3>
              <p className="mt-1 text-sm text-text-secondary">Post with your circle</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => {
                setAuthMode('sign-up')
                setShowAuth(true)
              }}
              className="btn-primary px-10 py-3.5 text-base"
            >
              Get Started
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('sign-in')
                setShowAuth(true)
              }}
              className="btn-secondary px-10 py-3.5 text-base"
            >
              Log In
            </button>
          </div>

          <p className="mt-10 text-xs text-text-muted">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
