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

export type PostRecord = {
  id: string
  author_id: string
  caption: string
  visibility: 'friends'
  created_at: string
  updated_at: string
}

export type PostInsert = {
  author_id: string
  caption: string
  visibility: 'friends'
}

export type FeedPost = {
  id: string
  author: string
  handle: string
  time: string
  text: string
  likes: number
  comments: number
  media?: FeedPostMedia | null
  isLocalOnly?: boolean
}

export type PostMediaRecord = {
  id: string
  post_id: string
  storage_path: string
  media_type: 'image' | 'video'
  width: number | null
  height: number | null
  duration_seconds: number | null
  created_at: string
}

export type PostMediaInsert = {
  post_id: string
  storage_path: string
  media_type: 'image' | 'video'
  width?: number | null
  height?: number | null
  duration_seconds?: number | null
}

export type FeedPostMedia = {
  type: 'image' | 'video'
  url: string
}
