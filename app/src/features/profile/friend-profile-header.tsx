import type { ProfileRecord } from '../../types/domain'

type FriendProfileHeaderProps = {
  profile: ProfileRecord | null
  onBack: () => void
}

export function FriendProfileHeader({
  profile,
  onBack,
}: FriendProfileHeaderProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface-raised p-6">
      <button
        type="button"
        onClick={onBack}
        className="mb-5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-zinc-400 transition hover:border-border-hover hover:text-zinc-200"
      >
        Back to connections
      </button>

      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent to-pink-500 text-lg font-bold text-white">
          {(profile?.display_name ?? 'U').slice(0, 1)}
        </div>
        <div>
          <p className="text-lg font-semibold text-white">
            {profile?.display_name ?? 'Unknown friend'}
          </p>
          <p className="text-sm text-zinc-500">
            {profile?.username ? `@${profile.username}` : '@unknown'}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-zinc-400">
        {profile?.bio || 'No bio added yet.'}
      </p>
    </div>
  )
}
