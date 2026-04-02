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

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl font-semibold text-white">
        Friend Graph
      </h2>

      {/* Simple stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatBox label="Direct Friends" value={directFriendCount} />
        <StatBox label="Extended Network" value={totalNodeCount - 1} />
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

      <p className="text-xs text-zinc-600">
        Drag nodes to rearrange · Scroll to zoom · Click to view profile
      </p>
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
