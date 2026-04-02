import { supabase } from '../lib/supabase'
import type {
  FriendshipRecord,
  GraphEdge,
  GraphNode,
  PublicProfile,
} from '../types/domain'

type RawGraphData = {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

async function fetchProfilesByIds(ids: string[]) {
  if (ids.length === 0) {
    return { data: [] as PublicProfile[], error: null }
  }

  const result = await supabase
    .from('profiles')
    .select('id, username, display_name, bio, avatar_url')
    .in('id', ids)
    .returns<PublicProfile[]>()

  return result
}

async function fetchFriendshipsForUser(userId: string) {
  // Fetch all friendships where the user is either user_one_id or user_two_id
  // We need to make two separate queries and combine them
  const [result1, result2] = await Promise.all([
    supabase
      .from('friendships')
      .select('id, user_one_id, user_two_id, created_at')
      .eq('user_one_id', userId)
      .returns<FriendshipRecord[]>(),
    supabase
      .from('friendships')
      .select('id, user_one_id, user_two_id, created_at')
      .eq('user_two_id', userId)
      .returns<FriendshipRecord[]>(),
  ])

  if (result1.error) {
    console.error('Error fetching friendships (user_one_id) for user:', userId, result1.error)
    return result1
  }

  if (result2.error) {
    console.error('Error fetching friendships (user_two_id) for user:', userId, result2.error)
    return result2
  }

  // Combine results
  const allFriendships = [...(result1.data ?? []), ...(result2.data ?? [])]
  console.log(`[DEBUG] fetchFriendshipsForUser(${userId}): Found ${allFriendships.length} friendships (${result1.data?.length ?? 0} as user_one_id, ${result2.data?.length ?? 0} as user_two_id)`)
  console.log(`[DEBUG] Friendship records:`, allFriendships.map(f => ({ user_one_id: f.user_one_id, user_two_id: f.user_two_id })))
  
  return { data: allFriendships, error: null }
}

function getFriendId(friendship: FriendshipRecord, userId: string) {
  return friendship.user_one_id === userId
    ? friendship.user_two_id
    : friendship.user_one_id
}

async function fetchActualFriendCount(userId: string) {
  const [result1, result2] = await Promise.all([
    supabase
      .from('friendships')
      .select('id', { count: 'exact', head: true })
      .eq('user_one_id', userId),
    supabase
      .from('friendships')
      .select('id', { count: 'exact', head: true })
      .eq('user_two_id', userId),
  ])

  const count1 = result1.count ?? 0
  const count2 = result2.count ?? 0
  return count1 + count2
}

export async function fetchGraphData(
  userId: string,
): Promise<{ data: RawGraphData | null; error: unknown }> {
  console.log(`[DEBUG] fetchGraphData starting for userId: ${userId}`)
  
  // 1. Fetch current user's friendships
  const directResult = await fetchFriendshipsForUser(userId)

  if (directResult.error || !directResult.data) {
    console.error('[DEBUG] Error fetching direct friendships:', directResult.error)
    return { data: null, error: directResult.error }
  }

  const directFriendIds = directResult.data.map((f) => getFriendId(f, userId))
  console.log(`[DEBUG] Direct friends: ${directFriendIds.length}`, directFriendIds)
  console.log(`[DEBUG] getFriendId mapping:`, directResult.data.map(f => ({ 
    user_one_id: f.user_one_id, 
    user_two_id: f.user_two_id, 
    extracted_friend_id: getFriendId(f, userId),
    current_user_id: userId
  })))

  if (directFriendIds.length === 0) {
    console.log('[DEBUG] No direct friends, returning empty graph')
    return { data: { nodes: [], edges: [] }, error: null }
  }

  // 2. Fetch secondary friendships (friends of friends)
  const allRelevantIds = new Set<string>([userId, ...directFriendIds])
  const secondaryEdgeSet = new Set<string>()
  const edges: GraphEdge[] = []

  // Add direct edges
  for (const friendId of directFriendIds) {
    const edgeKey = [userId, friendId].sort().join('-')
    if (!secondaryEdgeSet.has(edgeKey)) {
      secondaryEdgeSet.add(edgeKey)
      edges.push({
        source: userId,
        target: friendId,
        weight: 1,
        isDirectConnection: true,
      })
    }
  }

  // Fetch friendships for each direct friend to find secondary friends
  const secondaryResults = await Promise.all(
    directFriendIds.map((fid) => fetchFriendshipsForUser(fid)),
  )

  for (let i = 0; i < directFriendIds.length; i++) {
    const friendId = directFriendIds[i]
    const result = secondaryResults[i]

    if (result.error || !result.data) continue

    for (const friendship of result.data) {
      const otherId = getFriendId(friendship, friendId)

      // Skip self
      if (otherId === userId) continue

      allRelevantIds.add(otherId)

      const edgeKey = [friendId, otherId].sort().join('-')
      if (!secondaryEdgeSet.has(edgeKey)) {
        secondaryEdgeSet.add(edgeKey)
        edges.push({
          source: friendId,
          target: otherId,
          weight: 1,
          isDirectConnection: directFriendIds.includes(otherId),
        })
      }
    }
  }

  console.log(`[DEBUG] Total nodes: ${allRelevantIds.size}, Total edges: ${edges.length}`)

  // 3. Fetch profiles for all relevant users
  const profilesResult = await fetchProfilesByIds(Array.from(allRelevantIds))

  if (profilesResult.error || !profilesResult.data) {
    console.error('[DEBUG] Error fetching profiles:', profilesResult.error)
    return { data: null, error: profilesResult.error }
  }

  const profilesById = new Map(
    profilesResult.data.map((p) => [p.id, p]),
  )

  // 3b. Fetch actual friend counts for all nodes
  const friendCountsMap = new Map<string, number>()
  const friendCountPromises = Array.from(allRelevantIds).map(async (id) => {
    const count = await fetchActualFriendCount(id)
    friendCountsMap.set(id, count)
  })
  await Promise.all(friendCountPromises)

  // 4. Calculate mutual connections per edge
  const adjacencyMap = new Map<string, Set<string>>()
  for (const edge of edges) {
    if (!adjacencyMap.has(edge.source)) adjacencyMap.set(edge.source, new Set())
    if (!adjacencyMap.has(edge.target)) adjacencyMap.set(edge.target, new Set())
    adjacencyMap.get(edge.source)!.add(edge.target)
    adjacencyMap.get(edge.target)!.add(edge.source)
  }

  // Count mutual connections for each node relative to the root
  const rootNeighbors = adjacencyMap.get(userId) ?? new Set()

  // Build nodes
  const nodes: GraphNode[] = Array.from(allRelevantIds).map((id) => {
    const profile = profilesById.get(id)
    const neighbors = adjacencyMap.get(id) ?? new Set()
    const mutualWithRoot = [...neighbors].filter((n) => rootNeighbors.has(n)).length
    const actualFriendCount = friendCountsMap.get(id) ?? 0

    return {
      id,
      label: (profile?.display_name ?? 'Unknown').slice(0, 1),
      displayName: profile?.display_name ?? 'Unknown',
      username: profile?.username ?? 'unknown',
      avatarUrl: profile?.avatar_url ?? undefined,
      friendCount: actualFriendCount,
      mutualConnections: id === userId ? 0 : mutualWithRoot,
      communityId: 0,
      isRoot: id === userId,
      isDirectFriend: directFriendIds.includes(id),
    }
  })

  // Update edge weights (mutual connections between source and target)
  for (const edge of edges) {
    const sourceNeighbors = adjacencyMap.get(edge.source) ?? new Set()
    const targetNeighbors = adjacencyMap.get(edge.target) ?? new Set()
    edge.weight = [...sourceNeighbors].filter((n) => targetNeighbors.has(n)).length
  }

  console.log('[DEBUG] fetchGraphData complete. Nodes:', nodes.map(n => ({ id: n.id, displayName: n.displayName, friendCount: n.friendCount })))

  return { data: { nodes, edges }, error: null }
}
