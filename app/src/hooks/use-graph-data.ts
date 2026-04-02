import { useCallback, useEffect, useState } from 'react'
import { fetchGraphData } from '../services/graph-service'
import {
  calculateNetworkMetrics,
  detectCommunities,
  findShortestPath,
  getMutualConnectionIds,
} from '../utils/graph-algorithms'
import type {
  Community,
  GraphEdge,
  GraphNode,
  NetworkMetrics,
  PathFindingResult,
} from '../types/domain'

type UseGraphDataArgs = {
  userId: string | null
  enabled: boolean
}

type UseGraphDataResult = {
  nodes: GraphNode[]
  edges: GraphEdge[]
  communities: Community[]
  metrics: NetworkMetrics
  busy: boolean
  error: string | null
  refresh: () => Promise<void>
  findPath: (sourceId: string, targetId: string) => PathFindingResult | null
  getMutualConnections: (userId: string) => string[]
}

const emptyMetrics: NetworkMetrics = {
  totalFriends: 0,
  totalSecondaryFriends: 0,
  networkDensity: 0,
  averageDegree: 0,
  clusteringCoefficient: 0,
  networkDiameter: 0,
  interconnectednessScore: 0,
  communityCount: 0,
}

export function useGraphData({ userId, enabled }: UseGraphDataArgs): UseGraphDataResult {
  const [nodes, setNodes] = useState<GraphNode[]>([])
  const [edges, setEdges] = useState<GraphEdge[]>([])
  const [communities, setCommunities] = useState<Community[]>([])
  const [metrics, setMetrics] = useState<NetworkMetrics>(emptyMetrics)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!enabled || !userId) {
      setNodes([])
      setEdges([])
      setCommunities([])
      setMetrics(emptyMetrics)
      return
    }

    setBusy(true)
    setError(null)

    const result = await fetchGraphData(userId)

    if (result.error || !result.data) {
      setError(
        result.error instanceof Error
          ? result.error.message
          : 'Failed to load graph data.',
      )
      setBusy(false)
      return
    }

    const { nodes: rawNodes, edges: rawEdges } = result.data

    // Run algorithms
    const detectedCommunities = detectCommunities(rawNodes, rawEdges)
    const calculatedMetrics = calculateNetworkMetrics(rawNodes, rawEdges)
    calculatedMetrics.communityCount = detectedCommunities.length

    setNodes(rawNodes)
    setEdges(rawEdges)
    setCommunities(detectedCommunities)
    setMetrics(calculatedMetrics)
    setBusy(false)
  }, [userId, enabled])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void refresh()
    }, 0)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [refresh])

  function findPath(sourceId: string, targetId: string) {
    return findShortestPath(nodes, edges, sourceId, targetId)
  }

  function getMutualConnections(targetUserId: string) {
    if (!userId) return []
    return getMutualConnectionIds(edges, userId, targetUserId)
  }

  return {
    nodes,
    edges,
    communities,
    metrics,
    busy,
    error,
    refresh,
    findPath,
    getMutualConnections,
  }
}
