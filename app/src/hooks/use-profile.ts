import { useCallback, useEffect, useState } from 'react'
import {
  deletePost as deletePostService,
  fetchFriendCount,
  fetchUserPosts,
} from '../services/post-service'
import type { FeedPost } from '../types/domain'

type UseProfileArgs = {
  userId: string | null
  enabled: boolean
}

type UseProfileResult = {
  friendCount: number
  postCount: number
  userPosts: FeedPost[]
  busy: boolean
  message: string | null
  deletePost: (postId: string) => Promise<void>
  refreshProfile: () => Promise<void>
}

export function useProfile({ userId, enabled }: UseProfileArgs): UseProfileResult {
  const [userPosts, setUserPosts] = useState<FeedPost[]>([])
  const [friendCount, setFriendCount] = useState(0)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const refreshProfile = useCallback(async () => {
    if (!enabled || !userId) {
      setUserPosts([])
      setFriendCount(0)
      return
    }

    setBusy(true)

    const [postsResult, friendsResult] = await Promise.all([
      fetchUserPosts(userId),
      fetchFriendCount(userId),
    ])

    if (postsResult.error) {
      setMessage(postsResult.error.message)
    } else {
      setUserPosts(postsResult.data ?? [])
    }

    if (friendsResult.error) {
      setMessage(friendsResult.error.message)
    } else {
      setFriendCount(friendsResult.count)
    }

    setBusy(false)
  }, [userId, enabled])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void refreshProfile()
    }, 0)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [refreshProfile])

  async function deletePost(postId: string) {
    setBusy(true)
    setMessage(null)

    const { error } = await deletePostService(postId)

    if (error) {
      setMessage(error.message)
      setBusy(false)
      return
    }

    setUserPosts((current) => current.filter((post) => post.id !== postId))
    setMessage('Post deleted.')
    setBusy(false)
  }

  return {
    friendCount,
    postCount: userPosts.length,
    userPosts,
    busy,
    message,
    deletePost,
    refreshProfile,
  }
}
