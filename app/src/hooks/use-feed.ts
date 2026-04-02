import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createPost,
  createPostMediaRecord,
  uploadPostMedia,
} from '../services/post-service'
import { fetchFriendsFeedPosts } from '../services/engagement-service'
import type { FeedPost, FeedPostMedia, ProfileRecord } from '../types/domain'

type UseFeedArgs = {
  userId: string | null
  profile: ProfileRecord | null
}

type UseFeedResult = {
  busy: boolean
  message: string | null
  posts: FeedPost[]
  createPostWithOptionalMedia: (
    caption: string,
    mediaFile?: File | null,
  ) => Promise<void>
  refreshFeed: () => Promise<void>
  updatePostLocally: (postId: string, updates: Partial<FeedPost>) => void
}

export function useFeed({ userId, profile }: UseFeedArgs): UseFeedResult {
  const [serverPosts, setServerPosts] = useState<FeedPost[]>([])
  const [localPosts, setLocalPosts] = useState<FeedPost[]>([])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const refreshFeed = useCallback(async () => {
    if (!userId) return

    setBusy(true)

    const { data, error } = await fetchFriendsFeedPosts(userId)

    if (error) {
      setMessage('Unable to load feed right now.')
      setServerPosts([])
    } else {
      setServerPosts(data ?? [])
      setMessage(null)
    }

    setBusy(false)
  }, [userId])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void refreshFeed()
    }, 0)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [refreshFeed])

  const posts = useMemo(() => {
    const localIds = new Set(localPosts.map((post) => post.id))
    const remainingServerPosts = serverPosts.filter((post) => !localIds.has(post.id))
    return [...localPosts, ...remainingServerPosts]
  }, [localPosts, serverPosts])

  function updatePostLocally(postId: string, updates: Partial<FeedPost>) {
    setServerPosts((current) =>
      current.map((post) =>
        post.id === postId ? { ...post, ...updates } : post,
      ),
    )
    setLocalPosts((current) =>
      current.map((post) =>
        post.id === postId ? { ...post, ...updates } : post,
      ),
    )
  }

  async function createPostWithOptionalMedia(caption: string, mediaFile?: File | null) {
    const trimmedCaption = caption.trim()

    if (!trimmedCaption && !mediaFile) {
      return
    }

    if (!userId || !profile) {
      setMessage('Sign in and complete your profile before posting.')
      return
    }

    let localMedia: FeedPostMedia | null = null

    if (mediaFile) {
      localMedia = {
        type: mediaFile.type.startsWith('video/') ? 'video' : 'image',
        url: URL.createObjectURL(mediaFile),
      }
    }

    const optimisticPostId = `local-${Date.now()}`

    const optimisticPost: FeedPost = {
      id: optimisticPostId,
      author_id: userId,
      author: profile.display_name,
      handle: `@${profile.username}`,
      time: 'Now',
      text: trimmedCaption,
      likes: 0,
      comments: 0,
      user_liked: false,
      media: localMedia,
      isLocalOnly: true,
    }

    setLocalPosts((current) => [optimisticPost, ...current])
    setBusy(true)

    const { data, error } = await createPost({
      author_id: userId,
      caption: trimmedCaption,
      visibility: 'friends',
    })

    if (error || !data) {
      setMessage(
        error?.message ?? 'Failed to create post.',
      )
      setBusy(false)
      return
    }

    if (mediaFile) {
      setLocalPosts((current) =>
        current.map((post) =>
          post.id === optimisticPostId
            ? { ...post, id: data.id }
            : post,
        ),
      )

      const uploadResult = await uploadPostMedia(mediaFile, data.id)

      if (uploadResult.error || !uploadResult.data) {
        setMessage(uploadResult.error?.message ?? 'Media upload failed.')
        setBusy(false)
        return
      }

      const mediaType = mediaFile.type.startsWith('video/') ? 'video' : 'image'
      const mediaInsertResult = await createPostMediaRecord({
        post_id: data.id,
        storage_path: uploadResult.data.path,
        media_type: mediaType,
      })

      if (mediaInsertResult.error) {
        setMessage(mediaInsertResult.error.message)
        setBusy(false)
        return
      }
    }

    setLocalPosts((current) =>
      current.filter(
        (post) => post.id !== optimisticPostId && post.id !== data.id,
      ),
    )
    await refreshFeed()
    setMessage(null)
    setBusy(false)
  }

  return {
    busy,
    message,
    posts,
    createPostWithOptionalMedia,
    refreshFeed,
    updatePostLocally,
  }
}
