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
      <div className="card p-6 text-sm text-text-muted animate-pulse-soft" style={{ transform: 'none' }}>
        Loading posts...
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="card p-10 text-center" style={{ transform: 'none' }}>
        <p className="text-sm text-text-muted">This friend has no posts yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <article
          key={post.id}
          className="card overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent/15 to-secondary/15 text-sm font-bold text-accent">
                {post.author.slice(0, 1)}
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">{post.author}</p>
                <p className="text-xs text-text-muted">
                  {post.handle} · {post.time}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-text-secondary">{post.text}</p>

            {post.media ? (
              <div className="mt-4 overflow-hidden rounded-xl border border-border">
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
          </div>

          <div className="border-t border-border px-6 py-3 flex gap-5 text-xs text-text-muted">
            <span>{post.likes} likes</span>
            <span>{post.comments} comments</span>
          </div>
        </article>
      ))}
    </div>
  )
}
