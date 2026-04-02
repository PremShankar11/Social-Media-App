import { useState } from 'react'
import { useConnections } from '../../hooks/use-connections'

type FriendsPanelProps = {
  currentUserId: string
  incomingPendingCount?: number
  onOpenFriendProfile?: (friendId: string) => void
}

export function FriendsPanel({
  currentUserId,
  incomingPendingCount,
  onOpenFriendProfile,
}: FriendsPanelProps) {
  const [query, setQuery] = useState('')
  const {
    busy,
    message,
    searchResults,
    requests,
    friends,
    hasSearched,
    search,
    sendRequest,
    respond,
    isExistingFriend,
    getPendingDirection,
  } = useConnections({
    currentUserId,
    enabled: true,
  })

  const pendingRequests = requests.filter((request) => request.status === 'pending')
  const incomingCount =
    incomingPendingCount ??
    pendingRequests.filter((request) => request.direction === 'incoming').length

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="card p-6">
        <h3 className="mb-3 text-sm font-bold text-text-primary">Find people</h3>
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                void search(query)
              }
            }}
            className="input-base py-2.5"
            placeholder="Search by username or name"
          />
          <button
            type="button"
            onClick={() => void search(query)}
            disabled={busy}
            className="btn-primary shrink-0 px-5 py-2.5"
          >
            Search
          </button>
        </div>

        {searchResults.length > 0 ? (
          <div className="mt-4 space-y-2">
            {searchResults.map((profile) => (
              <SearchResultRow
                key={profile.id}
                busy={busy}
                profile={profile}
                isFriend={isExistingFriend(profile.id)}
                pendingDirection={getPendingDirection(profile.id)}
                onAdd={() => void sendRequest(profile.id)}
              />
            ))}
          </div>
        ) : hasSearched ? (
          <div className="mt-4 rounded-xl border border-dashed border-border bg-surface p-4 text-sm text-text-muted">
            No matching people found yet.
          </div>
        ) : null}
      </div>

      {/* Status message */}
      {message && (
        <div className="rounded-xl border border-accent/20 bg-accent-soft px-4 py-2.5 text-sm font-medium text-accent">
          {message}
        </div>
      )}

      {/* Pending requests */}
      <div className="card p-6">
        <h3 className="mb-3 text-sm font-bold text-text-primary">
          Pending requests{' '}
          {incomingCount > 0 && (
            <span className="ml-1 rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent">
              {incomingCount}
            </span>
          )}
        </h3>

        {pendingRequests.length === 0 ? (
          <p className="text-sm text-text-muted">No pending requests.</p>
        ) : (
          <div className="space-y-2">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between rounded-xl border border-border bg-surface p-3.5 transition-all hover:border-border-hover"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-secondary/15 to-accent/15 text-xs font-bold text-secondary">
                    {(request.counterpart?.display_name ?? 'U').slice(0, 1)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      {request.counterpart?.display_name ?? 'Unknown'}
                    </p>
                    <p className="text-xs text-text-muted">
                      {request.direction === 'incoming' ? 'Wants to connect' : 'Sent by you'}
                    </p>
                  </div>
                </div>
                {request.direction === 'incoming' && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        void respond(
                          request.id,
                          request.sender_id,
                          request.receiver_id,
                          'accepted',
                        )
                      }
                      disabled={busy}
                      className="btn-primary px-3 py-1.5 text-xs"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void respond(
                          request.id,
                          request.sender_id,
                          request.receiver_id,
                          'rejected',
                        )
                      }
                      disabled={busy}
                      className="btn-secondary px-3 py-1.5 text-xs"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Friends list */}
      <div className="card p-6">
        <h3 className="mb-3 text-sm font-bold text-text-primary">
          Friends{' '}
          {friends.length > 0 && (
            <span className="ml-1 text-xs text-text-muted">{friends.length}</span>
          )}
        </h3>

        {friends.length === 0 ? (
          <p className="text-sm text-text-muted">No friends yet. Start searching above!</p>
        ) : (
          <div className="space-y-2">
            {friends.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3.5 transition-all hover:border-border-hover"
              >
                <button
                  type="button"
                  onClick={() => onOpenFriendProfile?.(entry.friend.id)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent/15 to-secondary/15 text-xs font-bold text-accent">
                    {entry.friend.display_name.slice(0, 1)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text-primary">{entry.friend.display_name}</p>
                    <p className="truncate text-xs text-text-muted">@{entry.friend.username}</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenFriendProfile?.(entry.friend.id)}
                  className="btn-secondary px-3 py-1.5 text-xs"
                >
                  View
                </button>
              </div>
            ))}
          </div>
          )}
        </div>
    </div>
  )
}

function SearchResultRow({
  busy,
  profile,
  isFriend,
  pendingDirection,
  onAdd,
}: {
  busy: boolean
  profile: { id: string; display_name: string; username: string }
  isFriend: boolean
  pendingDirection: 'incoming' | 'outgoing' | null
  onAdd: () => void
}) {
  let buttonLabel = 'Add friend'
  let disabled = busy

  if (isFriend) {
    buttonLabel = 'Friends'
    disabled = true
  } else if (pendingDirection === 'outgoing') {
    buttonLabel = 'Requested'
    disabled = true
  } else if (pendingDirection === 'incoming') {
    buttonLabel = 'Respond below'
    disabled = true
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-3.5 transition-all hover:border-border-hover">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent/15 to-secondary/15 text-xs font-bold text-accent">
          {profile.display_name.slice(0, 1)}
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary">{profile.display_name}</p>
          <p className="text-xs text-text-muted">@{profile.username}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onAdd}
        disabled={disabled}
        className="btn-secondary px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
      >
        {buttonLabel}
      </button>
    </div>
  )
}
