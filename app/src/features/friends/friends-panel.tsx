import { useCallback, useEffect, useState } from 'react'
import {
  createFriendRequest,
  fetchFriendRequests,
  fetchFriends,
  respondToFriendRequest,
  searchProfiles,
} from '../../services/friends-service'
import type { PublicProfile } from '../../types/domain'

type RequestWithCounterpart = {
  id: string
  sender_id: string
  receiver_id: string
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled'
  created_at: string
  updated_at: string
  direction: 'incoming' | 'outgoing'
  counterpart: PublicProfile | null
}

type FriendWithProfile = {
  id: string
  created_at: string
  friend: PublicProfile
}

type FriendsPanelProps = {
  currentUserId: string
}

export function FriendsPanel({ currentUserId }: FriendsPanelProps) {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<PublicProfile[]>([])
  const [requests, setRequests] = useState<RequestWithCounterpart[]>([])
  const [friends, setFriends] = useState<FriendWithProfile[]>([])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setBusy(true)

    const [requestsResult, friendsResult] = await Promise.all([
      fetchFriendRequests(currentUserId),
      fetchFriends(currentUserId),
    ])

    if (requestsResult.error) {
      setMessage(requestsResult.error.message)
    } else {
      setRequests(requestsResult.data as RequestWithCounterpart[])
    }

    if (friendsResult.error) {
      setMessage(friendsResult.error.message)
    } else {
      setFriends(friendsResult.data as FriendWithProfile[])
    }

    setBusy(false)
  }, [currentUserId])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void refresh()
    }, 0)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [refresh])

  async function handleSearch() {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setBusy(true)
    setMessage(null)

    const { data, error } = await searchProfiles(query.trim(), currentUserId)

    if (error) {
      setMessage(error.message)
      setSearchResults([])
    } else {
      setSearchResults(data)
    }

    setBusy(false)
  }

  async function handleSendRequest(targetUserId: string) {
    setBusy(true)
    setMessage(null)

    const { error } = await createFriendRequest(currentUserId, targetUserId)

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Friend request sent.')
      await refresh()
    }

    setBusy(false)
  }

  async function handleRespond(
    requestId: string,
    senderId: string,
    receiverId: string,
    status: 'accepted' | 'rejected',
  ) {
    setBusy(true)
    setMessage(null)

    const { error } = await respondToFriendRequest(
      requestId,
      currentUserId,
      senderId,
      receiverId,
      status,
    )

    if (error) {
      setMessage(error.message)
    } else {
      setMessage(
        status === 'accepted'
          ? 'Friend request accepted.'
          : 'Friend request rejected.',
      )
      await refresh()
    }

    setBusy(false)
  }

  const pendingRequests = requests.filter((r) => r.status === 'pending')

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="rounded-2xl border border-border bg-surface-raised p-5">
        <h3 className="mb-3 text-sm font-semibold text-white">Find people</h3>
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') void handleSearch() }}
            className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-accent/50"
            placeholder="Search by username or name"
          />
          <button
            type="button"
            onClick={() => void handleSearch()}
            disabled={busy}
            className="shrink-0 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            Search
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            {searchResults.map((profile) => (
              <div
                key={profile.id}
                className="flex items-center justify-between rounded-xl border border-border bg-surface p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-overlay text-xs font-semibold text-zinc-300">
                    {profile.display_name.slice(0, 1)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{profile.display_name}</p>
                    <p className="text-xs text-zinc-500">@{profile.username}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void handleSendRequest(profile.id)}
                  disabled={busy}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Add friend
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status message */}
      {message && (
        <div className="rounded-xl border border-accent/20 bg-accent-soft px-4 py-2.5 text-sm text-accent">
          {message}
        </div>
      )}

      {/* Pending requests */}
      <div className="rounded-2xl border border-border bg-surface-raised p-5">
        <h3 className="mb-3 text-sm font-semibold text-white">
          Pending requests{' '}
          {pendingRequests.length > 0 && (
            <span className="ml-1 rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent">
              {pendingRequests.length}
            </span>
          )}
        </h3>

        {pendingRequests.length === 0 ? (
          <p className="text-sm text-zinc-600">No pending requests.</p>
        ) : (
          <div className="space-y-2">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between rounded-xl border border-border bg-surface p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-overlay text-xs font-semibold text-zinc-300">
                    {(request.counterpart?.display_name ?? 'U').slice(0, 1)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {request.counterpart?.display_name ?? 'Unknown'}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {request.direction === 'incoming' ? 'Wants to connect' : 'Sent by you'}
                    </p>
                  </div>
                </div>
                {request.direction === 'incoming' && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        void handleRespond(
                          request.id,
                          request.sender_id,
                          request.receiver_id,
                          'accepted',
                        )
                      }
                      disabled={busy}
                      className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-accent-hover disabled:opacity-40"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void handleRespond(
                          request.id,
                          request.sender_id,
                          request.receiver_id,
                          'rejected',
                        )
                      }
                      disabled={busy}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-rose-500/50 hover:text-rose-400 disabled:opacity-40"
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
      <div className="rounded-2xl border border-border bg-surface-raised p-5">
        <h3 className="mb-3 text-sm font-semibold text-white">
          Friends{' '}
          {friends.length > 0 && (
            <span className="ml-1 text-xs text-zinc-500">{friends.length}</span>
          )}
        </h3>

        {friends.length === 0 ? (
          <p className="text-sm text-zinc-600">No friends yet. Start searching above!</p>
        ) : (
          <div className="space-y-2">
            {friends.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-overlay text-xs font-semibold text-zinc-300">
                  {entry.friend.display_name.slice(0, 1)}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{entry.friend.display_name}</p>
                  <p className="text-xs text-zinc-500">@{entry.friend.username}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
