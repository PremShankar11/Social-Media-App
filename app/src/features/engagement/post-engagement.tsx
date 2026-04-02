import { useState } from 'react'
import type { Comment, FeedPost, Reply } from '../../types/domain'
import {
  togglePostLike,
  toggleCommentLike,
  toggleReplyLike,
  fetchPostComments,
  fetchCommentReplies,
  createComment,
  createReply,
  deleteComment,
  deleteReply,
} from '../../services/engagement-service'
import { formatRelativeTime } from '../../utils/time'

type PostEngagementProps = {
  post: FeedPost
  currentUserId: string
  onPostUpdated: (postId: string, updates: Partial<FeedPost>) => void
}

export function PostEngagement({ post, currentUserId, onPostUpdated }: PostEngagementProps) {
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentsBusy, setCommentsBusy] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [likeBusy, setLikeBusy] = useState(false)

  async function handleToggleLike() {
    if (likeBusy) return
    setLikeBusy(true)

    const newLiked = !post.user_liked
    onPostUpdated(post.id, {
      user_liked: newLiked,
      likes: post.likes + (newLiked ? 1 : -1),
    })

    const { error } = await togglePostLike(post.id, currentUserId, post.user_liked)
    if (error) {
      onPostUpdated(post.id, {
        user_liked: post.user_liked,
        likes: post.likes,
      })
    }

    setLikeBusy(false)
  }

  async function handleToggleComments() {
    const next = !showComments
    setShowComments(next)

    if (next && comments.length === 0) {
      setCommentsBusy(true)
      const { data } = await fetchPostComments(post.id, currentUserId)
      setComments(data ?? [])
      setCommentsBusy(false)
    }
  }

  async function handleAddComment() {
    const trimmed = commentText.trim()
    if (!trimmed) return

    setCommentsBusy(true)
    const { data, error } = await createComment(post.id, currentUserId, trimmed)

    if (!error && data) {
      const { data: updated } = await fetchPostComments(post.id, currentUserId)
      setComments(updated ?? [])
      setCommentText('')
      onPostUpdated(post.id, { comments: (updated?.length ?? 0) })
    }
    setCommentsBusy(false)
  }

  async function handleDeleteComment(commentId: string) {
    const { error } = await deleteComment(commentId)
    if (!error) {
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      onPostUpdated(post.id, { comments: Math.max(0, post.comments - 1) })
    }
  }

  async function handleToggleCommentLike(comment: Comment) {
    const newLiked = !comment.user_liked
    setComments((prev) =>
      prev.map((c) =>
        c.id === comment.id
          ? { ...c, user_liked: newLiked, likes_count: c.likes_count + (newLiked ? 1 : -1) }
          : c,
      ),
    )

    const { error } = await toggleCommentLike(comment.id, currentUserId, comment.user_liked)
    if (error) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === comment.id
            ? { ...c, user_liked: comment.user_liked, likes_count: comment.likes_count }
            : c,
        ),
      )
    }
  }

  return (
    <div>
      {/* Engagement bar */}
      <div className="flex items-center gap-5 border-t border-border px-6 py-3">
        <button
          type="button"
          onClick={() => void handleToggleLike()}
          disabled={likeBusy}
          className="group flex items-center gap-1.5 text-xs transition-all duration-200"
        >
          <HeartIcon filled={post.user_liked} />
          <span className={post.user_liked ? 'font-semibold text-rose-400' : 'text-text-muted group-hover:text-text-secondary'}>
            {post.likes}
          </span>
        </button>

        <button
          type="button"
          onClick={() => void handleToggleComments()}
          className="group flex items-center gap-1.5 text-xs text-text-muted transition-all duration-200 hover:text-text-secondary"
        >
          <CommentIcon />
          <span>{post.comments}</span>
        </button>
      </div>

      {/* Comment section */}
      {showComments ? (
        <div className="border-t border-border px-6 py-4">
          {commentsBusy && comments.length === 0 ? (
            <p className="text-xs text-text-muted animate-pulse-soft">Loading comments…</p>
          ) : comments.length === 0 ? (
            <p className="text-xs text-text-muted">No comments yet. Be the first!</p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUserId={currentUserId}
                  onToggleLike={() => void handleToggleCommentLike(comment)}
                  onDelete={() => void handleDeleteComment(comment.id)}
                />
              ))}
            </div>
          )}

          {/* Comment input */}
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void handleAddComment()
                }
              }}
              placeholder="Write a comment…"
              className="input-base py-2.5 text-xs"
              disabled={commentsBusy}
            />
            <button
              type="button"
              onClick={() => void handleAddComment()}
              disabled={!commentText.trim() || commentsBusy}
              className="btn-primary rounded-xl px-4 py-2.5 text-xs"
            >
              Post
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

/* ── CommentItem ── */

function CommentItem({
  comment,
  currentUserId,
  onToggleLike,
  onDelete,
}: {
  comment: Comment
  currentUserId: string
  onToggleLike: () => void
  onDelete: () => void
}) {
  const [showReplies, setShowReplies] = useState(false)
  const [replies, setReplies] = useState<Reply[]>([])
  const [replyText, setReplyText] = useState('')
  const [repliesBusy, setRepliesBusy] = useState(false)
  const [showReplyInput, setShowReplyInput] = useState(false)

  async function handleToggleReplies() {
    const next = !showReplies
    setShowReplies(next)

    if (next && replies.length === 0 && comment.replies_count > 0) {
      setRepliesBusy(true)
      const { data } = await fetchCommentReplies(comment.id, currentUserId)
      setReplies(data ?? [])
      setRepliesBusy(false)
    }
  }

  async function handleAddReply() {
    const trimmed = replyText.trim()
    if (!trimmed) return

    setRepliesBusy(true)
    const { error } = await createReply(comment.id, currentUserId, trimmed)
    if (!error) {
      const { data: updated } = await fetchCommentReplies(comment.id, currentUserId)
      setReplies(updated ?? [])
      setReplyText('')
      setShowReplyInput(false)
      setShowReplies(true)
    }
    setRepliesBusy(false)
  }

  async function handleDeleteReply(replyId: string) {
    const { error } = await deleteReply(replyId)
    if (!error) {
      setReplies((prev) => prev.filter((r) => r.id !== replyId))
    }
  }

  async function handleToggleReplyLike(reply: Reply) {
    const newLiked = !reply.user_liked
    setReplies((prev) =>
      prev.map((r) =>
        r.id === reply.id
          ? { ...r, user_liked: newLiked, likes_count: r.likes_count + (newLiked ? 1 : -1) }
          : r,
      ),
    )

    const { error } = await toggleReplyLike(reply.id, currentUserId, reply.user_liked)
    if (error) {
      setReplies((prev) =>
        prev.map((r) =>
          r.id === reply.id
            ? { ...r, user_liked: reply.user_liked, likes_count: reply.likes_count }
            : r,
        ),
      )
    }
  }

  return (
    <div>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-secondary/20 to-accent/20 text-[11px] font-bold text-secondary">
          {comment.author_name.slice(0, 1)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-semibold text-text-primary">{comment.author_name}</span>
            <span className="text-[10px] text-text-muted">
              {formatRelativeTime(comment.created_at)}
            </span>
          </div>
          <p className="mt-0.5 text-xs leading-relaxed text-text-secondary">{comment.text}</p>

          {/* Comment actions */}
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleLike}
              className="flex items-center gap-1 text-[10px] transition-all duration-200"
            >
              <HeartIcon filled={comment.user_liked} size={12} />
              <span className={comment.user_liked ? 'font-semibold text-rose-400' : 'text-text-muted hover:text-text-secondary'}>
                {comment.likes_count}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowReplyInput((v) => !v)}
              className="text-[10px] font-medium text-text-muted transition hover:text-accent"
            >
              Reply
            </button>

            {comment.replies_count > 0 ? (
              <button
                type="button"
                onClick={() => void handleToggleReplies()}
                className="text-[10px] font-medium text-accent transition hover:text-accent-hover"
              >
                {showReplies ? 'Hide' : `View ${comment.replies_count}`} {comment.replies_count === 1 ? 'reply' : 'replies'}
              </button>
            ) : null}

            {comment.author_id === currentUserId ? (
              <button
                type="button"
                onClick={onDelete}
                className="text-[10px] text-text-muted transition hover:text-rose-400"
              >
                Delete
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Reply input */}
      {showReplyInput ? (
        <div className="ml-11 mt-2 flex gap-2">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void handleAddReply()
              }
            }}
            placeholder={`Reply to ${comment.author_name}…`}
            className="input-base py-2 text-[11px]"
            disabled={repliesBusy}
          />
          <button
            type="button"
            onClick={() => void handleAddReply()}
            disabled={!replyText.trim() || repliesBusy}
            className="btn-primary rounded-xl px-3 py-2 text-[11px]"
          >
            Reply
          </button>
        </div>
      ) : null}

      {/* Replies list */}
      {showReplies ? (
        <div className="ml-11 mt-3 space-y-2.5 border-l-2 border-surface-muted pl-4">
          {repliesBusy && replies.length === 0 ? (
            <p className="text-[10px] text-text-muted animate-pulse-soft">Loading replies…</p>
          ) : (
            replies.map((reply) => (
              <ReplyItem
                key={reply.id}
                reply={reply}
                currentUserId={currentUserId}
                onToggleLike={() => void handleToggleReplyLike(reply)}
                onDelete={() => void handleDeleteReply(reply.id)}
              />
            ))
          )}
        </div>
      ) : null}
    </div>
  )
}

/* ── ReplyItem ── */

function ReplyItem({
  reply,
  currentUserId,
  onToggleLike,
  onDelete,
}: {
  reply: Reply
  currentUserId: string
  onToggleLike: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-muted text-[9px] font-bold text-text-secondary">
        {reply.author_name.slice(0, 1)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[11px] font-semibold text-text-primary">{reply.author_name}</span>
          <span className="text-[10px] text-text-muted">
            {formatRelativeTime(reply.created_at)}
          </span>
        </div>
        <p className="mt-0.5 text-[11px] leading-relaxed text-text-secondary">{reply.text}</p>

        <div className="mt-1.5 flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleLike}
            className="flex items-center gap-1 text-[10px] transition-all duration-200"
          >
            <HeartIcon filled={reply.user_liked} size={11} />
            <span className={reply.user_liked ? 'font-semibold text-rose-400' : 'text-text-muted hover:text-text-secondary'}>
              {reply.likes_count}
            </span>
          </button>

          {reply.author_id === currentUserId ? (
            <button
              type="button"
              onClick={onDelete}
              className="text-[10px] text-text-muted transition hover:text-rose-400"
            >
              Delete
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

/* ── Icons ── */

function HeartIcon({ filled, size = 14 }: { filled: boolean; size?: number }) {
  if (filled) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#fb7185" stroke="#fb7185" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    )
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#606078" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function CommentIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}
