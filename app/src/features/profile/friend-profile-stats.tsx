type FriendProfileStatsProps = {
  friendCount: number
  postCount: number
}

export function FriendProfileStats({
  friendCount,
  postCount,
}: FriendProfileStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-border bg-surface-raised p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Friends</p>
        <p className="mt-2 text-2xl font-semibold text-white">{friendCount}</p>
      </div>
      <div className="rounded-2xl border border-border bg-surface-raised p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Posts</p>
        <p className="mt-2 text-2xl font-semibold text-white">{postCount}</p>
      </div>
    </div>
  )
}
