import type { FeedPost } from '../../types/domain'

type FriendPostsSectionProps = {
  posts: FeedPost[]
  busy: boolean
}

export function FriendPostsSection({
  posts,
  busy,
}: FriendPostsSectionProps) {
  if (busy) {
    return (
      <div className="rounded-2xl border border-border bg-surface-raised p-6 text-sm text-zinc-400">
        Loading posts...
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface-raised p-8 text-center">
        <p className="text-sm text-zinc-400">This friend has no posts yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <article
          key={post.id}
          className="rounded-2xl border border-border bg-surface-raised p-5 transition-colors hover:border-border-hover"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-overlay text-sm font-semibold text-zinc-300">
              {post.author.slice(0, 1)}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{post.author}</p>
              <p className="text-xs text-zinc-500">
                {post.handle} · {post.time}
              </p>
            </div>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-zinc-300">{post.text}</p>

          {post.media ? (
            <div className="mt-4 overflow-hidden rounded-xl border border-border bg-surface">
              {post.media.type === 'video' ? (
                <video
                  src={post.media.url}
                  controls
                  className="max-h-[28rem] w-full object-cover"
                />
              ) : (
                <img
                  src={post.media.url}
                  alt={`${post.author} post media`}
                  className="max-h-[28rem] w-full object-cover"
                />
              )}
            </div>
          ) : null}

          <div className="mt-4 flex gap-4 text-xs text-zinc-500">
            <span>{post.likes} likes</span>
            <span>{post.comments} comments</span>
          </div>
        </article>
      ))}
    </div>
  )
}
