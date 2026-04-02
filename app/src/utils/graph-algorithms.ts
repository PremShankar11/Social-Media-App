import type {
  Community,
  GraphEdge,
  GraphNode,
  NetworkMetrics,
  PathFindingResult,
} from '../types/domain'

const COMMUNITY_COLORS = [
  '#f97316', // orange
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#10b981', // emerald
  '#eab308', // yellow
  '#6366f1', // indigo
  '#ef4444', // red
  '#14b8a6', // teal
  '#a855f7', // purple
]

function buildAdjacencyMap(edges: GraphEdge[]) {
  const map = new Map<string, Set<string>>()

  for (const edge of edges) {
    if (!map.has(edge.source)) map.set(edge.source, new Set())
    if (!map.has(edge.target)) map.set(edge.target, new Set())
    map.get(edge.source)!.add(edge.target)
    map.get(edge.target)!.add(edge.source)
  }

  return map
}

/**
 * Simplified community detection using label propagation.
 * Each node starts in its own community, then iteratively adopts
 * the most common community label among its neighbors.
 */
export function detectCommunities(
  nodes: GraphNode[],
  edges: GraphEdge[],
): Community[] {
  if (nodes.length === 0) return []

  const adjacency = buildAdjacencyMap(edges)

  // Initialize: each node in its own community
  const labels = new Map<string, number>()
  nodes.forEach((node, i) => labels.set(node.id, i))

  // Iterate label propagation
  const maxIterations = 10
  for (let iter = 0; iter < maxIterations; iter++) {
    let changed = false

    for (const node of nodes) {
      const neighbors = adjacency.get(node.id)
      if (!neighbors || neighbors.size === 0) continue

      // Count neighbor labels
      const labelCounts = new Map<number, number>()
      for (const neighborId of neighbors) {
        const label = labels.get(neighborId) ?? 0
        labelCounts.set(label, (labelCounts.get(label) ?? 0) + 1)
      }

      // Pick most common label
      let bestLabel = labels.get(node.id) ?? 0
      let bestCount = 0
      for (const [label, count] of labelCounts) {
        if (count > bestCount) {
          bestCount = count
          bestLabel = label
        }
      }

      if (bestLabel !== labels.get(node.id)) {
        labels.set(node.id, bestLabel)
        changed = true
      }
    }

    if (!changed) break
  }

  // Group by community label
  const communityMembers = new Map<number, string[]>()
  for (const [nodeId, label] of labels) {
    if (!communityMembers.has(label)) communityMembers.set(label, [])
    communityMembers.get(label)!.push(nodeId)
  }

  // Build Community objects with sequential IDs
  const communities: Community[] = []
  let communityIndex = 0

  for (const [, members] of communityMembers) {
    // Calculate internal density
    let internalEdges = 0
    const memberSet = new Set(members)
    for (const edge of edges) {
      if (memberSet.has(edge.source) && memberSet.has(edge.target)) {
        internalEdges++
      }
    }
    const possibleEdges = (members.length * (members.length - 1)) / 2
    const density = possibleEdges > 0 ? internalEdges / possibleEdges : 0

    communities.push({
      id: communityIndex,
      members,
      size: members.length,
      density,
      color: COMMUNITY_COLORS[communityIndex % COMMUNITY_COLORS.length],
    })

    // Assign community IDs back to labels map for node assignment
    for (const memberId of members) {
      labels.set(memberId, communityIndex)
    }

    communityIndex++
  }

  // Update node communityIds (mutates nodes)
  for (const node of nodes) {
    node.communityId = labels.get(node.id) ?? 0
  }

  return communities
}

/**
 * BFS shortest path between two nodes.
 */
export function findShortestPath(
  nodes: GraphNode[],
  edges: GraphEdge[],
  sourceId: string,
  targetId: string,
): PathFindingResult | null {
  if (sourceId === targetId) {
    const node = nodes.find((n) => n.id === sourceId)
    return node ? { path: [sourceId], length: 0, users: [node] } : null
  }

  const adjacency = buildAdjacencyMap(edges)
  const visited = new Set<string>()
  const parent = new Map<string, string>()
  const queue: string[] = [sourceId]
  visited.add(sourceId)

  while (queue.length > 0) {
    const current = queue.shift()!

    const neighbors = adjacency.get(current)
    if (!neighbors) continue

    for (const neighbor of neighbors) {
      if (visited.has(neighbor)) continue

      visited.add(neighbor)
      parent.set(neighbor, current)

      if (neighbor === targetId) {
        // Reconstruct path
        const path: string[] = []
        let step: string | undefined = targetId
        while (step !== undefined) {
          path.unshift(step)
          step = parent.get(step)
        }

        const nodesById = new Map(nodes.map((n) => [n.id, n]))
        return {
          path,
          length: path.length - 1,
          users: path.map((id) => nodesById.get(id)!).filter(Boolean),
        }
      }

      queue.push(neighbor)
    }
  }

  return null
}

/**
 * Calculate comprehensive network metrics.
 */
export function calculateNetworkMetrics(
  nodes: GraphNode[],
  edges: GraphEdge[],
): NetworkMetrics {
  const n = nodes.length
  const e = edges.length

  if (n === 0) {
    return {
      totalFriends: 0,
      totalSecondaryFriends: 0,
      networkDensity: 0,
      averageDegree: 0,
      clusteringCoefficient: 0,
      networkDiameter: 0,
      interconnectednessScore: 0,
      communityCount: 0,
    }
  }

  const totalFriends = nodes.filter((node) => node.isDirectFriend).length
  const totalSecondaryFriends = nodes.filter(
    (node) => !node.isRoot && !node.isDirectFriend,
  ).length

  // Network density
  const possibleEdges = (n * (n - 1)) / 2
  const networkDensity = possibleEdges > 0 ? e / possibleEdges : 0

  // Average degree
  const averageDegree = n > 0 ? (2 * e) / n : 0

  // Clustering coefficient (average local)
  const adjacency = buildAdjacencyMap(edges)
  let totalClustering = 0
  let clusterableNodes = 0

  for (const node of nodes) {
    const neighbors = adjacency.get(node.id)
    if (!neighbors || neighbors.size < 2) continue

    clusterableNodes++
    const neighborArray = Array.from(neighbors)
    let triangles = 0
    const possibleTriangles = (neighborArray.length * (neighborArray.length - 1)) / 2

    for (let i = 0; i < neighborArray.length; i++) {
      for (let j = i + 1; j < neighborArray.length; j++) {
        const aNeighbors = adjacency.get(neighborArray[i])
        if (aNeighbors?.has(neighborArray[j])) {
          triangles++
        }
      }
    }

    totalClustering += possibleTriangles > 0 ? triangles / possibleTriangles : 0
  }

  const clusteringCoefficient =
    clusterableNodes > 0 ? totalClustering / clusterableNodes : 0

  // Network diameter (BFS from each node — capped for performance)
  let diameter = 0
  const sampleNodes = nodes.slice(0, Math.min(nodes.length, 20))

  for (const startNode of sampleNodes) {
    const dist = new Map<string, number>()
    const q: string[] = [startNode.id]
    dist.set(startNode.id, 0)

    while (q.length > 0) {
      const current = q.shift()!
      const currentDist = dist.get(current)!
      const neighbors = adjacency.get(current)
      if (!neighbors) continue

      for (const neighbor of neighbors) {
        if (!dist.has(neighbor)) {
          dist.set(neighbor, currentDist + 1)
          q.push(neighbor)
          if (currentDist + 1 > diameter) {
            diameter = currentDist + 1
          }
        }
      }
    }
  }

  // Interconnectedness: ratio of edges among direct friends only
  const directFriendIds = new Set(
    nodes.filter((n) => n.isDirectFriend).map((n) => n.id),
  )
  let directEdges = 0
  for (const edge of edges) {
    if (directFriendIds.has(edge.source) && directFriendIds.has(edge.target)) {
      directEdges++
    }
  }
  const possibleDirectEdges = (directFriendIds.size * (directFriendIds.size - 1)) / 2
  const interconnectednessScore =
    possibleDirectEdges > 0 ? directEdges / possibleDirectEdges : 0

  return {
    totalFriends,
    totalSecondaryFriends,
    networkDensity: Math.round(networkDensity * 1000) / 1000,
    averageDegree: Math.round(averageDegree * 100) / 100,
    clusteringCoefficient: Math.round(clusteringCoefficient * 1000) / 1000,
    networkDiameter: diameter,
    interconnectednessScore: Math.round(interconnectednessScore * 1000) / 1000,
    communityCount: 0, // set after detectCommunities
  }
}

/**
 * Get mutual friend IDs between two users.
 */
export function getMutualConnectionIds(
  edges: GraphEdge[],
  userIdA: string,
  userIdB: string,
): string[] {
  const adjacency = buildAdjacencyMap(edges)
  const neighborsA = adjacency.get(userIdA)
  const neighborsB = adjacency.get(userIdB)

  if (!neighborsA || !neighborsB) return []

  return [...neighborsA].filter((id) => neighborsB.has(id))
}
