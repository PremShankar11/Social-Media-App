import { supabase } from '../lib/supabase'
import type {
  FeedPost,
  FeedPostMedia,
  PostMediaInsert,
  PostMediaRecord,
  PostInsert,
  PostRecord,
  PublicProfile,
} from '../types/domain'
import { formatRelativeTime } from '../utils/time'

async function fetchProfilesByIds(ids: string[]) {
  if (ids.length === 0) {
    return { data: [] as PublicProfile[], error: null }
  }

  const result = await supabase
    .from('profiles')
    .select('id, username, display_name, bio, avatar_url')
    .in('id', ids)
    .returns<PublicProfile[]>()

  return result
}

function mapPostToFeedItem(post: PostRecord, profile?: PublicProfile | null): FeedPost {
  return {
    id: post.id,
    author: profile?.display_name ?? 'Unknown user',
    handle: profile?.username ? `@${profile.username}` : '@unknown',
    time: formatRelativeTime(post.created_at),
    text: post.caption,
    likes: 0,
    comments: 0,
    media: null,
  }
}

async function fetchPostMediaByPostIds(postIds: string[]) {
  if (postIds.length === 0) {
    return { data: [] as PostMediaRecord[], error: null }
  }

  const result = await supabase
    .from('post_media')
    .select('id, post_id, storage_path, media_type, width, height, duration_seconds, created_at')
    .in('post_id', postIds)
    .returns<PostMediaRecord[]>()

  return result
}

async function buildMediaUrl(storagePath: string) {
  const signedUrlResult = await supabase.storage
    .from('post-media')
    .createSignedUrl(storagePath, 60 * 60)

  if (!signedUrlResult.error && signedUrlResult.data?.signedUrl) {
    return signedUrlResult.data.signedUrl
  }

  const { data } = supabase.storage.from('post-media').getPublicUrl(storagePath)
  return data.publicUrl
}

export async function fetchFeedPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('id, author_id, caption, visibility, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(25)
    .returns<PostRecord[]>()

  if (error || !data) {
    return { data: null, error }
  }

  const authorIds = Array.from(new Set(data.map((post) => post.author_id)))
  const profilesResult = await fetchProfilesByIds(authorIds)

  if (profilesResult.error) {
    return { data: null, error: profilesResult.error }
  }

  const profilesById = new Map(
    profilesResult.data.map((profile) => [profile.id, profile]),
  )

  const mediaResult = await fetchPostMediaByPostIds(data.map((post) => post.id))

  if (mediaResult.error) {
    return {
      data: data.map((post) => mapPostToFeedItem(post, profilesById.get(post.author_id))),
      error: null,
    }
  }

  const mediaByPostId = new Map<string, FeedPostMedia>()

  for (const media of mediaResult.data) {
    if (!mediaByPostId.has(media.post_id)) {
      const mediaUrl = await buildMediaUrl(media.storage_path)

      mediaByPostId.set(media.post_id, {
        type: media.media_type,
        url: mediaUrl,
      })
    }
  }

  return {
    data: data.map((post) => ({
      ...mapPostToFeedItem(post, profilesById.get(post.author_id)),
      media: mediaByPostId.get(post.id) ?? null,
    })),
    error: null,
  }
}

export async function createPost(values: PostInsert) {
  const result = await supabase
    .from('posts')
    .insert(values)
    .select('id, author_id, caption, visibility, created_at, updated_at')
    .single<PostRecord>()

  return result
}

export async function uploadPostMedia(file: File, postId: string) {
  const extension = file.name.includes('.') ? file.name.split('.').pop() : undefined
  const fileName = `${postId}-${Date.now()}${extension ? `.${extension}` : ''}`
  const storagePath = `${postId}/${fileName}`

  const uploadResult = await supabase.storage
    .from('post-media')
    .upload(storagePath, file, {
      upsert: false,
      contentType: file.type,
    })

  if (uploadResult.error) {
    return { data: null, error: uploadResult.error }
  }

  return {
    data: {
      path: storagePath,
      url: await buildMediaUrl(storagePath),
    },
    error: null,
  }
}

export async function createPostMediaRecord(values: PostMediaInsert) {
  const result = await supabase.from('post_media').insert(values).select('id').single()
  return result
}
