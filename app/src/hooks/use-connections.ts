import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createFriendRequest,
  fetchFriendRequests,
  fetchFriends,
  respondToFriendRequest,
  searchProfiles,
} from '../services/friends-service'
import type { PublicProfile } from '../types/domain'

export type RequestWithCounterpart = {
  id: string
  sender_id: string
  receiver_id: string
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled'
  created_at: string
  updated_at: string
  direction: 'incoming' | 'outgoing'
  counterpart: PublicProfile | null
}

export type FriendWithProfile = {
  id: string
  created_at: string
  friend: PublicProfile
}

type UseConnectionsArgs = {
  currentUserId: string | null
  enabled: boolean
}

type UseConnectionsResult = {
  busy: boolean
  message: string | null
  searchResults: PublicProfile[]
  requests: RequestWithCounterpart[]
  friends: FriendWithProfile[]
  incomingPendingCount: number
  hasSearched: boolean
  search: (query: string) => Promise<void>
  sendRequest: (targetUserId: string) => Promise<void>
  respond: (
    requestId: string,
    senderId: string,
    receiverId: string,
    status: 'accepted' | 'rejected',
  ) => Promise<void>
  isExistingFriend: (userId: string) => boolean
  getPendingDirection: (userId: string) => 'incoming' | 'outgoing' | null
}

export function useConnections({
  currentUserId,
  enabled,
}: UseConnectionsArgs): UseConnectionsResult {
  const [searchResults, setSearchResults] = useState<PublicProfile[]>([])
  const [requests, setRequests] = useState<RequestWithCounterpart[]>([])
  const [friends, setFriends] = useState<FriendWithProfile[]>([])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const refresh = useCallback(async () => {
    if (!enabled || !currentUserId) {
      setRequests([])
      setFriends([])
      return
    }

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
  }, [currentUserId, enabled])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void refresh()
    }, 0)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [refresh])

  const incomingPendingCount = useMemo(
    () =>
      requests.filter(
        (request) =>
          request.status === 'pending' && request.direction === 'incoming',
      ).length,
    [requests],
  )

  async function search(query: string) {
    if (!enabled || !currentUserId) {
      return
    }

    const trimmedQuery = query.trim()
    setHasSearched(true)

    if (!trimmedQuery) {
      setSearchResults([])
      setMessage('Enter a name or username to search.')
      return
    }

    setBusy(true)
    setMessage(null)

    const { data, error } = await searchProfiles(trimmedQuery, currentUserId)

    if (error) {
      setMessage(error.message)
      setSearchResults([])
    } else {
      setSearchResults(data)
      if (data.length === 0) {
        setMessage('No users found for that search.')
      }
    }

    setBusy(false)
  }

  async function sendRequest(targetUserId: string) {
    if (!enabled || !currentUserId) {
      return
    }

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

  async function respond(
    requestId: string,
    senderId: string,
    receiverId: string,
    status: 'accepted' | 'rejected',
  ) {
    if (!enabled || !currentUserId) {
      return
    }

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

  function isExistingFriend(userId: string) {
    return friends.some((entry) => entry.friend.id === userId)
  }

  function getPendingDirection(userId: string) {
    const pendingRequest = requests.find(
      (request) =>
        request.status === 'pending' && request.counterpart?.id === userId,
    )

    return pendingRequest?.direction ?? null
  }

  return {
    busy,
    message,
    searchResults,
    requests,
    friends,
    incomingPendingCount,
    hasSearched,
    search,
    sendRequest,
    respond,
    isExistingFriend,
    getPendingDirection,
  }
}
