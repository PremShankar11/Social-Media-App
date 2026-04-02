import { useGraphData } from '../../hooks/use-graph-data'
import { ForceGraph } from './force-graph'
import type { GraphNode } from '../../types/domain'

type GraphPageProps = {
  userId: string
  onOpenFriendProfile: (friendId: string) => void
}

export function GraphPage({ userId, onOpenFriendProfile }: GraphPageProps) {
  const {
    nodes,
    edges,
    busy,
    error,
  } = useGraphData({ userId, enabled: true })

  if (busy && nodes.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="font-display text-2xl font-semibold text-white">
          Friend Graph
        </h2>
        <div className="flex h-96 items-center justify-center rounded-2xl border border-border bg-surface-raised">
          <p className="text-sm text-zinc-500">Loading your network…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="font-display text-2xl font-semibold text-white">Friend Graph</h2>
        <div className="rounded-2xl border border-border bg-surface-raised p-8 text-center">
          <p className="text-sm text-zinc-400">{error}</p>
        </div>
      </div>
    )
  }

  if (nodes.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="font-display text-2xl font-semibold text-white">Friend Graph</h2>
        <div className="rounded-2xl border border-border bg-surface-raised p-8 text-center">
          <p className="text-sm text-zinc-400">
            No network to visualize yet. Add some friends first!
          </p>
        </div>
      </div>
    )
  }

  const directFriendCount = nodes.filter(n => n.isDirectFriend).length
  const totalNodeCount = nodes.length
  const avgFriendCount = Math.round(
    nodes.reduce((sum, n) => sum + n.friendCount, 0) / nodes.length
  )
  const maxFriendCount = Math.max(...nodes.map(n => n.friendCount))

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl font-semibold text-white">
        Friend Graph
      </h2>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatBox label="Direct Friends" value={directFriendCount} />
        <StatBox label="Extended Network" value={totalNodeCount - 1} />
        <StatBox label="Avg Friends" value={avgFriendCount} />
        <StatBox label="Most Connected" value={maxFriendCount} />
      </div>

      {/* Graph canvas */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface-raised">
        <div style={{ height: 500 }}>
          <ForceGraph
            nodes={nodes}
            edges={edges}
            onClickNode={onOpenFriendProfile}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="rounded-2xl border border-border bg-surface-raised p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Legend
        </h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 rounded-full bg-orange-500" />
            <span className="text-zinc-400">You (root node)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 rounded-full bg-orange-400" />
            <span className="text-zinc-400">Few friends (0-5)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 rounded-full bg-red-600" />
            <span className="text-zinc-400">Many friends (15+)</span>
          </div>
          <p className="mt-3 text-zinc-600">
            Node size represents friend count. Hover to highlight connections. Click to view profile.
          </p>
        </div>
      </div>
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </p>
    </div>
  )
}
