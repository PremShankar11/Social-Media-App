import { supabase } from '../lib/supabase'
import type {
  FriendRequestRecord,
  FriendshipRecord,
  ProfileRecord,
  PublicProfile,
} from '../types/domain'

function sortFriendPair(userId: string, otherUserId: string) {
  return userId < otherUserId
    ? { user_one_id: userId, user_two_id: otherUserId }
    : { user_one_id: otherUserId, user_two_id: userId }
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

export async function getFriendProfile(
  currentUserId: string,
  friendId: string,
) {
  // Just fetch the profile without checking friendship
  // This allows viewing profiles of anyone in the network (including 2nd degree friends from the graph)
  const profileResult = await supabase
    .from('profiles')
    .select('*')
    .eq('id', friendId)
    .maybeSingle<ProfileRecord>()

  if (profileResult.error || !profileResult.data) {
    return {
      data: null,
      error: profileResult.error ?? new Error('Profile not found.'),
    }
  }

  return { data: profileResult.data, error: null }
}

export async function searchProfiles(query: string, currentUserId: string) {
  const result = await supabase
    .from('profiles')
    .select('id, username, display_name, bio, avatar_url')
    .neq('id', currentUserId)
    .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
    .limit(8)
    .returns<PublicProfile[]>()

  return result
}

export async function fetchFriendRequests(currentUserId: string) {
  // Split .or() into two separate queries (Supabase .or() can be unreliable)
  const [result1, result2] = await Promise.all([
    supabase
      .from('friend_requests')
      .select('id, sender_id, receiver_id, status, created_at, updated_at')
      .eq('sender_id', currentUserId)
      .order('created_at', { ascending: false })
      .returns<FriendRequestRecord[]>(),
    supabase
      .from('friend_requests')
      .select('id, sender_id, receiver_id, status, created_at, updated_at')
      .eq('receiver_id', currentUserId)
      .order('created_at', { ascending: false })
      .returns<FriendRequestRecord[]>(),
  ])

  if (result1.error) return { data: null, error: result1.error }
  if (result2.error) return { data: null, error: result2.error }

  const data = [...(result1.data ?? []), ...(result2.data ?? [])]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const counterpartIds = Array.from(
    new Set(
      data.map((request) =>
        request.sender_id === currentUserId ? request.receiver_id : request.sender_id,
      ),
    ),
  )

  const profilesResult = await fetchProfilesByIds(counterpartIds)

  if (profilesResult.error) {
    return { data: null, error: profilesResult.error }
  }

  const profilesById = new Map(
    profilesResult.data.map((profile) => [profile.id, profile]),
  )

  return {
    data: data.map((request) => ({
      ...request,
      counterpart:
        profilesById.get(
          request.sender_id === currentUserId
            ? request.receiver_id
            : request.sender_id,
        ) ?? null,
      direction: request.sender_id === currentUserId ? 'outgoing' : 'incoming',
    })),
    error: null,
  }
}

export async function fetchFriends(currentUserId: string) {
  // Split .or() into two separate queries
  const [result1, result2] = await Promise.all([
    supabase
      .from('friendships')
      .select('id, user_one_id, user_two_id, created_at')
      .eq('user_one_id', currentUserId)
      .order('created_at', { ascending: false })
      .returns<FriendshipRecord[]>(),
    supabase
      .from('friendships')
      .select('id, user_one_id, user_two_id, created_at')
      .eq('user_two_id', currentUserId)
      .order('created_at', { ascending: false })
      .returns<FriendshipRecord[]>(),
  ])

  if (result1.error) return { data: null, error: result1.error }
  if (result2.error) return { data: null, error: result2.error }

  const data = [...(result1.data ?? []), ...(result2.data ?? [])]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const friendIds = Array.from(
    new Set(
      data.map((friendship) =>
        friendship.user_one_id === currentUserId
          ? friendship.user_two_id
          : friendship.user_one_id,
      ),
    ),
  )

  const profilesResult = await fetchProfilesByIds(friendIds)

  if (profilesResult.error) {
    return { data: null, error: profilesResult.error }
  }

  const profilesById = new Map(
    profilesResult.data.map((profile) => [profile.id, profile]),
  )

  return {
    data: data
      .map((friendship) => {
        const friendId =
          friendship.user_one_id === currentUserId
            ? friendship.user_two_id
            : friendship.user_one_id

        return {
          ...friendship,
          friend: profilesById.get(friendId) ?? null,
        }
      })
      .filter((entry) => entry.friend !== null),
    error: null,
  }
}

export async function createFriendRequest(
  currentUserId: string,
  targetUserId: string,
) {
  const result = await supabase.from('friend_requests').insert({
    sender_id: currentUserId,
    receiver_id: targetUserId,
    status: 'pending',
  })

  return result
}

export async function respondToFriendRequest(
  requestId: string,
  currentUserId: string,
  senderId: string,
  receiverId: string,
  status: 'accepted' | 'rejected',
) {

  console.log('Updating request:', requestId, 'to status:', status) // ADD THIS

  const updateResult = await supabase
    .from('friend_requests')
    .update({ status })
    .eq('id', requestId)
    .select('id')
    .single()

  console.log('Update result:', updateResult) // ADD THIS
  
  if (updateResult.error || status !== 'accepted') {
    return updateResult
  }

  const friendship = sortFriendPair(senderId, receiverId)

  const existingFriendshipResult = await supabase
    .from('friendships')
    .select('id')
    .eq('user_one_id', friendship.user_one_id)
    .eq('user_two_id', friendship.user_two_id)
    .maybeSingle()

  if (existingFriendshipResult.error) {
    return existingFriendshipResult
  }

  if (existingFriendshipResult.data) {
    return { data: { id: requestId, userId: currentUserId }, error: null }
  }

  const friendshipResult = await supabase.from('friendships').insert(friendship)

  if (friendshipResult.error) {
    return friendshipResult
  }

  return { data: { id: requestId, userId: currentUserId }, error: null }
}
