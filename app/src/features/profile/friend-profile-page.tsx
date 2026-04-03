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
        <h2 className="font-display text-2xl font-bold text-text-primary">Friend profile</h2>
        <div className="card p-6">
          <p className="text-sm font-medium text-rose-400">{error}</p>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={onBack}
              className="btn-primary px-5 py-2.5 text-sm"
            >
              Back to connections
            </button>
            <button
              type="button"
              onClick={() => void refresh()}
              className="btn-secondary px-5 py-2.5 text-sm"
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
      <h2 className="font-display text-2xl font-bold text-text-primary">Friend profile</h2>

      <FriendProfileHeader profile={profile} onBack={onBack} />
      <FriendProfileStats friendCount={friendCount} postCount={postCount} />

      {message ? (
        <div className="rounded-xl border border-accent/20 bg-accent-soft px-4 py-3 text-sm font-medium text-accent">
          {message}
        </div>
      ) : null}

      <div className="space-y-4">
        <h3 className="text-base font-bold text-text-primary">Posts</h3>
        <FriendPostsSection posts={posts} busy={busy} />
      </div>

      {relatedFriends.length > 0 ? (
        <div className="card p-6">
          <h3 className="mb-3 text-sm font-bold text-text-primary">View another friend</h3>
          <div className="space-y-2">
            {relatedFriends.map((friend) => (
              <button
                key={friend.id}
                type="button"
                onClick={() => onOpenFriend(friend.id)}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface p-3.5 text-left transition-all hover:border-border-hover"
              >
                {friend.avatar_url ? (
                  <img
                    src={friend.avatar_url}
                    alt={friend.display_name}
                    className="h-9 w-9 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent/15 to-secondary/15 text-xs font-bold text-accent">
                    {friend.display_name.slice(0, 1)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-text-primary">{friend.display_name}</p>
                  <p className="text-xs text-text-muted">@{friend.username}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
