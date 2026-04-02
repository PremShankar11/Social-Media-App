import { useState } from 'react'
import type { FormEvent } from 'react'
import { authSchema } from './schemas'

type AuthFormsProps = {
  mode: 'sign-in' | 'sign-up'
  busy: boolean
  onSubmit: (values: { email: string; password: string }) => Promise<void>
}

export function AuthForms({ mode, busy, onSubmit }: AuthFormsProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsed = authSchema.safeParse({
      email: email.trim().toLowerCase(),
      password,
    })

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid credentials.')
      return
    }

    setError(null)
    await onSubmit(parsed.data)
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-400" htmlFor={`${mode}-email`}>
          Email
        </label>
        <input
          id={`${mode}-email`}
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-accent/50"
          placeholder="you@example.com"
          autoComplete="email"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-400" htmlFor={`${mode}-password`}>
          Password
        </label>
        <input
          id={`${mode}-password`}
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-accent/50"
          placeholder="At least 6 characters"
          autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
        />
      </div>

      {error && (
        <p className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-white transition-all hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? 'Please wait...' : mode === 'sign-in' ? 'Sign in' : 'Create account'}
      </button>
    </form>
  )
}
