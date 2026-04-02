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
    <div className="card overflow-hidden">
      <div className="h-16 bg-gradient-to-r from-secondary via-accent to-[#ff5500]" />
      <div className="p-6">
        <button
          type="button"
          onClick={onBack}
          className="btn-secondary mb-5 px-3 py-2 text-xs"
        >
          ← Back to connections
        </button>

        <div className="-mt-2 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-secondary text-lg font-bold text-white shadow-glow ring-4 ring-surface-raised">
            {(profile?.display_name ?? 'U').slice(0, 1)}
          </div>
          <div>
            <p className="text-lg font-bold text-text-primary">
              {profile?.display_name ?? 'Unknown friend'}
            </p>
            <p className="text-sm text-text-muted">
              {profile?.username ? `@${profile.username}` : '@unknown'}
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-text-secondary">
          {profile?.bio || 'No bio added yet.'}
        </p>
      </div>
    </div>
  )
}
