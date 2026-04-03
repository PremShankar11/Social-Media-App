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
  avatar_url?: string | null
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
  author_id: string
  author: string
  handle: string
  time: string
  text: string
  likes: number
  comments: number
  user_liked: boolean
  media?: FeedPostMedia | null
  author_avatar?: string | null
  isLocalOnly?: boolean
  created_at?: string
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

/* ── Post Engagement ── */

export type Comment = {
  id: string
  post_id: string
  author_id: string
  author_name: string
  author_username: string
  author_avatar: string | null
  text: string
  likes_count: number
  replies_count: number
  user_liked: boolean
  created_at: string
}

export type Reply = {
  id: string
  comment_id: string
  author_id: string
  author_name: string
  author_username: string
  author_avatar: string | null
  text: string
  likes_count: number
  user_liked: boolean
  created_at: string
}

/* ── Graph Visualization ── */

export type GraphNode = {
  id: string
  label: string
  displayName: string
  username: string
  avatarUrl?: string
  friendCount: number
  mutualConnections: number
  communityId: number
  x?: number
  y?: number
  isRoot: boolean
  isDirectFriend: boolean
}

export type GraphEdge = {
  source: string
  target: string
  weight: number
  isDirectConnection: boolean
}

export type Community = {
  id: number
  members: string[]
  size: number
  density: number
  color: string
}

export type NetworkMetrics = {
  totalFriends: number
  totalSecondaryFriends: number
  networkDensity: number
  averageDegree: number
  clusteringCoefficient: number
  networkDiameter: number
  interconnectednessScore: number
  communityCount: number
}

export type PathFindingResult = {
  path: string[]
  length: number
  users: GraphNode[]
}

