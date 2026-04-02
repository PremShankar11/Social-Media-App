import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { profileSchema } from '../auth/schemas'
import type { ProfileRecord } from '../../types/domain'

type ProfileSetupFormProps = {
  busy: boolean
  profile: ProfileRecord | null
  onSubmit: (values: {
    username: string
    displayName: string
    bio: string
  }) => Promise<void>
}

export function ProfileSetupForm({
  busy,
  profile,
  onSubmit,
}: ProfileSetupFormProps) {
  const defaults = useMemo(
    () => ({
      username: profile?.username ?? '',
      displayName: profile?.display_name ?? '',
      bio: profile?.bio ?? '',
    }),
    [profile],
  )

  const [username, setUsername] = useState(defaults.username)
  const [displayName, setDisplayName] = useState(defaults.displayName)
  const [bio, setBio] = useState(defaults.bio)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsed = profileSchema.safeParse({
      username: username.trim().toLowerCase(),
      displayName: displayName.trim(),
      bio: bio.trim(),
    })

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Profile details are invalid.')
      return
    }

    setError(null)
    await onSubmit(parsed.data)
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-400" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-accent/50"
          placeholder="friends_only"
          autoComplete="username"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-400" htmlFor="displayName">
          Display name
        </label>
        <input
          id="displayName"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-accent/50"
          placeholder="Your name"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-zinc-400" htmlFor="bio">
          Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          className="min-h-[80px] w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-accent/50 resize-none"
          placeholder="A short intro for your friends."
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
        {busy ? 'Saving...' : profile ? 'Update profile' : 'Complete profile'}
      </button>
    </form>
  )
}
