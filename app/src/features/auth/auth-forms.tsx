import { useState } from 'react'
import type { FormEvent } from 'react'
import { authSchema } from './schemas'

type AuthFormsProps = {
  mode: 'sign-in' | 'sign-up'
  busy: boolean
  cooldownSeconds?: number
  serverMessage?: string | null
  onSubmit: (values: { email: string; password: string }) => Promise<void>
}

export function AuthForms({ mode, busy, cooldownSeconds = 0, serverMessage, onSubmit }: AuthFormsProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (busy || submitting || cooldownSeconds > 0) {
      return
    }

    const parsed = authSchema.safeParse({
      email: email.trim().toLowerCase(),
      password,
    })

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid credentials.')
      return
    }

    setError(null)
    setSubmitting(true)
    try {
      await onSubmit(parsed.data)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-secondary" htmlFor={`${mode}-email`}>
          Email
        </label>
        <input
          id={`${mode}-email`}
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value)
            setError(null)
          }}
          className="input-base"
          placeholder="you@example.com"
          autoComplete="email"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-secondary" htmlFor={`${mode}-password`}>
          Password
        </label>
        <input
          id={`${mode}-password`}
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value)
            setError(null)
          }}
          className="input-base"
          placeholder="At least 6 characters"
          autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
        />
      </div>

      {error && (
        <p className="rounded-xl border border-rose-500/20 bg-rose-500/8 px-4 py-2.5 text-xs font-medium text-rose-400">
          {error}
        </p>
      )}

      {!error && serverMessage ? (
        <p className="rounded-xl border border-accent/20 bg-accent-soft px-4 py-2.5 text-xs font-medium text-accent">
          {serverMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy || submitting || cooldownSeconds > 0}
        className="btn-primary w-full"
      >
        {cooldownSeconds > 0
          ? `Try again in ${cooldownSeconds}s`
          : busy || submitting
            ? 'Please wait...'
            : mode === 'sign-in'
              ? 'Sign in'
              : 'Create account'}
      </button>
    </form>
  )
}
