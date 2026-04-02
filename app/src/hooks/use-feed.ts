import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createPost,
  createPostMediaRecord,
  fetchFeedPosts,
  uploadPostMedia,
} from '../services/post-service'
import type { FeedPost, FeedPostMedia, ProfileRecord } from '../types/domain'

const starterPosts: FeedPost[] = [
  {
    id: 'seed-1',
    author: 'Anaya Sharma',
    handle: '@anaya',
    time: '2h ago',
    text:
      'Went out for chai after class and realized this is exactly the kind of simple, real moment this app should be for.',
    likes: 24,
    comments: 6,
  },
  {
    id: 'seed-2',
    author: 'Rishi Mehta',
    handle: '@rishi.codes',
    time: '5h ago',
    text:
      'Trying to keep my feed small, calm, and useful. Close friends, real updates, and no algorithmic pressure.',
    likes: 17,
    comments: 3,
  },
]

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
}

export function useFeed({ userId, profile }: UseFeedArgs): UseFeedResult {
  const [serverPosts, setServerPosts] = useState<FeedPost[]>([])
  const [localPosts, setLocalPosts] = useState<FeedPost[]>([])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const refreshFeed = useCallback(async () => {
    setBusy(true)

    const { data, error } = await fetchFeedPosts()

    if (error) {
      setMessage(
        'Feed is using starter data right now. Apply the Supabase SQL migrations to load real posts.',
      )
      setServerPosts(starterPosts)
    } else {
      setServerPosts(data)
      setMessage(null)
    }

    setBusy(false)
  }, [])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void refreshFeed()
    }, 0)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [refreshFeed])

  const posts = useMemo(() => [...localPosts, ...serverPosts], [localPosts, serverPosts])

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
      author: profile.display_name,
      handle: `@${profile.username}`,
      time: 'Now',
      text: trimmedCaption,
      likes: 0,
      comments: 0,
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
        'Post added locally. Run the Supabase SQL migrations to save posts permanently.',
      )
      setBusy(false)
      return
    }

    if (mediaFile) {
      const uploadResult = await uploadPostMedia(mediaFile, data.id)

      if (uploadResult.error || !uploadResult.data) {
        setMessage(
          'Post text saved, but media upload is still using local preview because Supabase storage is not fully ready yet.',
        )
        setBusy(false)
        return
      } else {
        const mediaType = mediaFile.type.startsWith('video/') ? 'video' : 'image'
        const mediaInsertResult = await createPostMediaRecord({
          post_id: data.id,
          storage_path: uploadResult.data.path,
          media_type: mediaType,
        })

        if (mediaInsertResult.error) {
          setMessage(
            'Post text saved, but media metadata could not be stored yet. Keeping the local preview visible for now.',
          )
          setBusy(false)
          return
        }
      }
    }

    setLocalPosts((current) =>
      current.filter((post) => post.id !== optimisticPostId),
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
  }
}
