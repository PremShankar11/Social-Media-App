type FriendProfileStatsProps = {
  friendCount: number
  postCount: number
}

export function FriendProfileStats({
  friendCount,
  postCount,
}: FriendProfileStatsProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="card p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-muted">Friends</p>
        <p className="mt-2 text-3xl font-bold text-text-primary">{friendCount}</p>
      </div>
      <div className="card p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-muted">Posts</p>
        <p className="mt-2 text-3xl font-bold text-text-primary">{postCount}</p>
      </div>
    </div>
  )
}
