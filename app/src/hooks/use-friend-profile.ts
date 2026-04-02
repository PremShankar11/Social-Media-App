import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchFriends, getFriendProfile } from '../services/friends-service'
import { fetchFriendCount, fetchUserPosts } from '../services/post-service'
import type { FeedPost, ProfileRecord, PublicProfile } from '../types/domain'

type UseFriendProfileArgs = {
  currentUserId: string | null
  friendId: string | null
  enabled: boolean
}

type UseFriendProfileResult = {
  profile: ProfileRecord | null
  posts: FeedPost[]
  friendCount: number
  postCount: number
  relatedFriends: PublicProfile[]
  busy: boolean
  message: string | null
  error: string | null
  refresh: () => Promise<void>
}

export function useFriendProfile({
  currentUserId,
  friendId,
  enabled,
}: UseFriendProfileArgs): UseFriendProfileResult {
  const [profile, setProfile] = useState<ProfileRecord | null>(null)
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [friendCount, setFriendCount] = useState(0)
  const [postCount, setPostCount] = useState(0)
  const [relatedFriends, setRelatedFriends] = useState<PublicProfile[]>([])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const clearState = useCallback(() => {
    setProfile(null)
    setPosts([])
    setFriendCount(0)
    setPostCount(0)
    setRelatedFriends([])
    setMessage(null)
    setError(null)
  }, [])

  const refresh = useCallback(async () => {
    if (!enabled || !currentUserId || !friendId) {
      clearState()
      return
    }

    setBusy(true)
    setError(null)

    const [profileResult, postsResult, friendCountResult, currentFriendsResult] =
      await Promise.all([
        getFriendProfile(currentUserId, friendId),
        fetchUserPosts(friendId),
        fetchFriendCount(friendId),
        fetchFriends(currentUserId),
      ])

    if (profileResult.error || !profileResult.data) {
      clearState()
      setError(profileResult.error?.message ?? 'Unable to load this friend profile.')
      setBusy(false)
      return
    }

    setProfile(profileResult.data)
    setPosts(postsResult.data ?? [])
    setPostCount(postsResult.data?.length ?? 0)
    setFriendCount(friendCountResult.count ?? 0)

    if (postsResult.error) {
      setMessage('Posts could not be fully loaded right now.')
    } else if ((postsResult.data?.length ?? 0) === 0) {
      setMessage('This friend has not posted anything yet.')
    } else {
      setMessage(null)
    }

    if (currentFriendsResult.error || !currentFriendsResult.data) {
      setRelatedFriends([])
    } else {
      setRelatedFriends(
        currentFriendsResult.data
          .map((entry) => entry.friend)
          .filter((friend) => friend.id !== friendId),
      )
    }

    setBusy(false)
  }, [clearState, currentUserId, enabled, friendId])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void refresh()
    }, 0)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [refresh])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [friendId])

  return useMemo(
    () => ({
      profile,
      posts,
      friendCount,
      postCount,
      relatedFriends,
      busy,
      message,
      error,
      refresh,
    }),
    [profile, posts, friendCount, postCount, relatedFriends, busy, message, error, refresh],
  )
}
