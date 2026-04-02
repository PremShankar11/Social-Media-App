export type ProfileRecord = {
  id: string
  username: string
  display_name: string
  bio: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export type ProfileInsert = {
  id: string
  username: string
  display_name: string
  bio: string
}

export type PublicProfile = Pick<
  ProfileRecord,
  'id' | 'username' | 'display_name' | 'bio' | 'avatar_url'
>

export type FriendRequestRecord = {
  id: string
  sender_id: string
  receiver_id: string
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled'
  created_at: string
  updated_at: string
}

export type FriendshipRecord = {
  id: string
  user_one_id: string
  user_two_id: string
  created_at: string
}
