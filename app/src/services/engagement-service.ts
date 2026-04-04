import { supabase } from '../lib/supabase'

/* ── Post Likes ── */

export async function likePost(postId: string, userId: string) {
  const { error } = await supabase
    .from('post_likes')
    .insert({ post_id: postId, user_id: userId })

  // Ignore unique constraint violations (already liked)
  if (error && error.code !== '23505') {
    console.error('Error liking post:', error)
    return { error }
  }
  return { error: null }
}

export async function unlikePost(postId: string, userId: string) {
  const { error } = await supabase
    .from('post_likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error unliking post:', error)
    return { error }
  }
  return { error: null }
}

export async function togglePostLike(postId: string, userId: string, currentlyLiked: boolean) {
  if (currentlyLiked) {
    return unlikePost(postId, userId)
  }
  return likePost(postId, userId)
}

/* ── Comment Likes ── */

export async function likeComment(commentId: string, userId: string) {
  const { error } = await supabase
    .from('comment_likes')
    .insert({ comment_id: commentId, user_id: userId })

  if (error && error.code !== '23505') {
    console.error('Error liking comment:', error)
    return { error }
  }
  return { error: null }
}

export async function unlikeComment(commentId: string, userId: string) {
  const { error } = await supabase
    .from('comment_likes')
    .delete()
    .eq('comment_id', commentId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error unliking comment:', error)
    return { error }
  }
  return { error: null }
}

export async function toggleCommentLike(commentId: string, userId: string, currentlyLiked: boolean) {
  if (currentlyLiked) {
    return unlikeComment(commentId, userId)
  }
  return likeComment(commentId, userId)
}

/* ── Reply Likes ── */

export async function likeReply(replyId: string, userId: string) {
  const { error } = await supabase
    .from('reply_likes')
    .insert({ reply_id: replyId, user_id: userId })

  if (error && error.code !== '23505') {
    console.error('Error liking reply:', error)
    return { error }
  }
  return { error: null }
}

export async function unlikeReply(replyId: string, userId: string) {
  const { error } = await supabase
    .from('reply_likes')
    .delete()
    .eq('reply_id', replyId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error unliking reply:', error)
    return { error }
  }
  return { error: null }
}

export async function toggleReplyLike(replyId: string, userId: string, currentlyLiked: boolean) {
  if (currentlyLiked) {
    return unlikeReply(replyId, userId)
  }
  return likeReply(replyId, userId)
}

/* ── Comment CRUD ── */

export async function createComment(postId: string, userId: string, text: string) {
  const trimmed = text.trim()
  if (!trimmed) return { data: null, error: new Error('Comment cannot be empty') }

  const { data, error } = await supabase
    .from('comments')
    .insert({ post_id: postId, author_id: userId, text: trimmed })
    .select('id, post_id, author_id, text, created_at')
    .single()

  if (error) {
    console.error('Error creating comment:', error)
    return { data: null, error }
  }
  return { data, error: null }
}

export async function fetchPostComments(postId: string, userId: string) {
  // Fetch comments for the post
  const { data: comments, error } = await supabase
    .from('comments')
    .select('id, post_id, author_id, text, created_at')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error || !comments) {
    return { data: null, error }
  }

  // Fetch author profiles with avatar_url
  const authorIds = [...new Set(comments.map((c) => c.author_id))]
  let profilesMap = new Map<string, { display_name: string; username: string; avatar_url: string | null }>()

  if (authorIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, username, avatar_url')
      .in('id', authorIds)

    if (profiles) {
      profilesMap = new Map(profiles.map((p) => [p.id, p]))
    }
  }

  // Fetch like counts + user's liked status
  const commentIds = comments.map((c) => c.id)

  const [likeCounts, userLikes, replyCounts] = await Promise.all([
    supabase.from('comment_likes').select('comment_id').in('comment_id', commentIds),
    supabase.from('comment_likes').select('comment_id').in('comment_id', commentIds).eq('user_id', userId),
    supabase.from('replies').select('comment_id').in('comment_id', commentIds),
  ])

  const likeCountMap = new Map<string, number>()
  for (const like of likeCounts.data ?? []) {
    likeCountMap.set(like.comment_id, (likeCountMap.get(like.comment_id) ?? 0) + 1)
  }

  const userLikedSet = new Set((userLikes.data ?? []).map((l) => l.comment_id))

  const replyCountMap = new Map<string, number>()
  for (const reply of replyCounts.data ?? []) {
    replyCountMap.set(reply.comment_id, (replyCountMap.get(reply.comment_id) ?? 0) + 1)
  }

  const result = comments.map((c) => {
    const profile = profilesMap.get(c.author_id)
    return {
      id: c.id,
      post_id: c.post_id,
      author_id: c.author_id,
      author_name: profile?.display_name ?? 'Unknown',
      author_username: profile?.username ?? 'unknown',
      author_avatar: profile?.avatar_url ?? null,
      text: c.text,
      likes_count: likeCountMap.get(c.id) ?? 0,
      replies_count: replyCountMap.get(c.id) ?? 0,
      user_liked: userLikedSet.has(c.id),
      created_at: c.created_at,
    }
  })

  return { data: result, error: null }
}

export async function deleteComment(commentId: string) {
  // Cascade deletes replies + likes via DB foreign keys
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)

  return { error }
}

/* ── Reply CRUD ── */

export async function createReply(commentId: string, userId: string, text: string) {
  const trimmed = text.trim()
  if (!trimmed) return { data: null, error: new Error('Reply cannot be empty') }

  const { data, error } = await supabase
    .from('replies')
    .insert({ comment_id: commentId, author_id: userId, text: trimmed })
    .select('id, comment_id, author_id, text, created_at')
    .single()

  if (error) {
    console.error('Error creating reply:', error)
    return { data: null, error }
  }
  return { data, error: null }
}

export async function fetchCommentReplies(commentId: string, userId: string) {
  const { data: replies, error } = await supabase
    .from('replies')
    .select('id, comment_id, author_id, text, created_at')
    .eq('comment_id', commentId)
    .order('created_at', { ascending: true })

  if (error || !replies) {
    return { data: null, error }
  }

  const authorIds = [...new Set(replies.map((r) => r.author_id))]
  let profilesMap = new Map<string, { display_name: string; username: string; avatar_url: string | null }>()

  if (authorIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, username, avatar_url')
      .in('id', authorIds)

    if (profiles) {
      profilesMap = new Map(profiles.map((p) => [p.id, p]))
    }
  }

  const replyIds = replies.map((r) => r.id)
  const [likeCounts, userLikes] = await Promise.all([
    supabase.from('reply_likes').select('reply_id').in('reply_id', replyIds),
    supabase.from('reply_likes').select('reply_id').in('reply_id', replyIds).eq('user_id', userId),
  ])

  const likeCountMap = new Map<string, number>()
  for (const like of likeCounts.data ?? []) {
    likeCountMap.set(like.reply_id, (likeCountMap.get(like.reply_id) ?? 0) + 1)
  }

  const userLikedSet = new Set((userLikes.data ?? []).map((l) => l.reply_id))

  const result = replies.map((r) => {
    const profile = profilesMap.get(r.author_id)
    return {
      id: r.id,
      comment_id: r.comment_id,
      author_id: r.author_id,
      author_name: profile?.display_name ?? 'Unknown',
      author_username: profile?.username ?? 'unknown',
      author_avatar: profile?.avatar_url ?? null,
      text: r.text,
      likes_count: likeCountMap.get(r.id) ?? 0,
      user_liked: userLikedSet.has(r.id),
      created_at: r.created_at,
    }
  })

  return { data: result, error: null }
}

export async function deleteReply(replyId: string) {
  const { error } = await supabase
    .from('replies')
    .delete()
    .eq('id', replyId)

  return { error }
}

/* ── Feed helpers ── */

export async function fetchFriendsFeedPosts(userId: string) {
  // 1. Get friend IDs
  const [f1, f2] = await Promise.all([
    supabase.from('friendships').select('user_two_id').eq('user_one_id', userId),
    supabase.from('friendships').select('user_one_id').eq('user_two_id', userId),
  ])

  const friendIds = [
    ...(f1.data ?? []).map((r) => r.user_two_id),
    ...(f2.data ?? []).map((r) => r.user_one_id),
  ]

  // Include the user's own posts in the feed
  const allAuthorIds = [...friendIds, userId]

  if (allAuthorIds.length === 0) {
    return { data: [], error: null }
  }

  // 2. Fetch posts from friends + self
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, author_id, caption, visibility, created_at, updated_at')
    .in('author_id', allAuthorIds)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error || !posts) {
    return { data: null, error }
  }

  // 3. Fetch profiles
  const authorIdSet = [...new Set(posts.map((p) => p.author_id))]
  let profilesMap = new Map<string, { display_name: string; username: string; avatar_url: string | null }>()

  if (authorIdSet.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name, username, avatar_url')
      .in('id', authorIdSet)

    if (profiles) {
      profilesMap = new Map(profiles.map((p) => [p.id, p]))
    }
  }

  // 4. Fetch media
  const postIds = posts.map((p) => p.id)

  const mediaMap = new Map<string, { type: 'image' | 'video'; url: string }>()

  if (postIds.length > 0) {
    const { data: mediaRecords } = await supabase
      .from('post_media')
      .select('post_id, storage_path, media_type')
      .in('post_id', postIds)

    if (mediaRecords) {
      for (const m of mediaRecords) {
        if (!mediaMap.has(m.post_id)) {
          const { data: urlData } = supabase.storage.from('post-media').getPublicUrl(m.storage_path)
          mediaMap.set(m.post_id, {
            type: m.media_type as 'image' | 'video',
            url: urlData.publicUrl,
          })
        }
      }
    }
  }

  // 5. Fetch like counts + user like status + comment counts
  const [likeCounts, userLikes, commentCounts] = await Promise.all([
    supabase.from('post_likes').select('post_id').in('post_id', postIds),
    supabase.from('post_likes').select('post_id').in('post_id', postIds).eq('user_id', userId),
    supabase.from('comments').select('post_id').in('post_id', postIds),
  ])

  const likeCountMap = new Map<string, number>()
  for (const like of likeCounts.data ?? []) {
    likeCountMap.set(like.post_id, (likeCountMap.get(like.post_id) ?? 0) + 1)
  }

  const userLikedSet = new Set((userLikes.data ?? []).map((l) => l.post_id))

  const commentCountMap = new Map<string, number>()
  for (const c of commentCounts.data ?? []) {
    commentCountMap.set(c.post_id, (commentCountMap.get(c.post_id) ?? 0) + 1)
  }

  // 6. Build feed posts
  const { formatRelativeTime } = await import('../utils/time')

  const feedPosts = posts.map((post) => {
    const profile = profilesMap.get(post.author_id)
    return {
      id: post.id,
      author_id: post.author_id,
      author: profile?.display_name ?? 'Unknown',
      handle: profile?.username ? `@${profile.username}` : '@unknown',
      time: formatRelativeTime(post.created_at),
      text: post.caption,
      likes: likeCountMap.get(post.id) ?? 0,
      comments: commentCountMap.get(post.id) ?? 0,
      user_liked: userLikedSet.has(post.id),
      media: mediaMap.get(post.id) ?? null,
      author_avatar: profile?.avatar_url ?? null,
      created_at: post.created_at,
    }
  })

  return { data: feedPosts, error: null }
}
