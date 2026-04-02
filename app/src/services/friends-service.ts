import { supabase } from '../lib/supabase'
import type {
  FriendRequestRecord,
  FriendshipRecord,
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
  const { data, error } = await supabase
    .from('friend_requests')
    .select('id, sender_id, receiver_id, status, created_at, updated_at')
    .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
    .order('created_at', { ascending: false })
    .returns<FriendRequestRecord[]>()

  if (error || !data) {
    return { data: null, error }
  }

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
  const { data, error } = await supabase
    .from('friendships')
    .select('id, user_one_id, user_two_id, created_at')
    .or(`user_one_id.eq.${currentUserId},user_two_id.eq.${currentUserId}`)
    .order('created_at', { ascending: false })
    .returns<FriendshipRecord[]>()

  if (error || !data) {
    return { data: null, error }
  }

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
  const updateResult = await supabase
    .from('friend_requests')
    .update({ status })
    .eq('id', requestId)
    .select('id')
    .single()

  if (updateResult.error || status !== 'accepted') {
    return updateResult
  }

  const friendship = sortFriendPair(senderId, receiverId)

  const friendshipResult = await supabase
    .from('friendships')
    .upsert(friendship, {
      onConflict: 'user_one_id,user_two_id',
      ignoreDuplicates: true,
    })

  if (friendshipResult.error) {
    return friendshipResult
  }

  return { data: { id: requestId, userId: currentUserId }, error: null }
}
