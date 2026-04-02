import { FriendProfileHeader } from './friend-profile-header'
import { FriendProfileStats } from './friend-profile-stats'
import { FriendPostsSection } from './friend-posts-section'
import { useFriendProfile } from '../../hooks/use-friend-profile'

type FriendProfilePageProps = {
  currentUserId: string
  friendId: string
  onBack: () => void
  onOpenFriend: (friendId: string) => void
}

export function FriendProfilePage({
  currentUserId,
  friendId,
  onBack,
  onOpenFriend,
}: FriendProfilePageProps) {
  const {
    profile,
    posts,
    friendCount,
    postCount,
    relatedFriends,
    busy,
    message,
    error,
    refresh,
  } = useFriendProfile({
    currentUserId,
    friendId,
    enabled: true,
  })

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="font-display text-2xl font-semibold text-white">Friend profile</h2>
        <div className="rounded-2xl border border-border bg-surface-raised p-6">
          <p className="text-sm text-rose-400">{error}</p>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={onBack}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-hover"
            >
              Back to connections
            </button>
            <button
              type="button"
              onClick={() => void refresh()}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-border-hover hover:text-white"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-semibold text-white">Friend profile</h2>

      <FriendProfileHeader profile={profile} onBack={onBack} />
      <FriendProfileStats friendCount={friendCount} postCount={postCount} />

      {message ? (
        <div className="rounded-xl border border-accent/20 bg-accent-soft px-4 py-3 text-sm text-accent">
          {message}
        </div>
      ) : null}

      <div className="space-y-4">
        <h3 className="text-base font-semibold text-white">Posts</h3>
        <FriendPostsSection posts={posts} busy={busy} />
      </div>

      {relatedFriends.length > 0 ? (
        <div className="rounded-2xl border border-border bg-surface-raised p-5">
          <h3 className="mb-3 text-sm font-semibold text-white">View another friend</h3>
          <div className="space-y-2">
            {relatedFriends.map((friend) => (
              <button
                key={friend.id}
                type="button"
                onClick={() => onOpenFriend(friend.id)}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface p-3 text-left transition hover:border-border-hover"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-overlay text-xs font-semibold text-zinc-300">
                  {friend.display_name.slice(0, 1)}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{friend.display_name}</p>
                  <p className="text-xs text-zinc-500">@{friend.username}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
