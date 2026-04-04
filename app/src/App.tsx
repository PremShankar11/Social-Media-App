import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { LandingPage } from './features/auth/landing-page'
import { PostEngagement } from './features/engagement/post-engagement'
import { FriendsPanel } from './features/friends/friends-panel'
import { GraphPage } from './features/graph/graph-page'
import { FriendProfilePage } from './features/profile/friend-profile-page'
import { AvatarUpload } from './features/profile/avatar-upload'
import { ProfileSetupForm } from './features/profile/profile-setup-form'
import { useAuth } from './hooks/use-auth'
import { useFeed } from './hooks/use-feed'
import { useConnections } from './hooks/use-connections'
import { useProfile } from './hooks/use-profile'
import type { FeedPost, ProfileRecord } from './types/domain'

type AppView = 'home' | 'connections' | 'graph' | 'profile' | 'friend-profile'

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#f97316' : '#a1a1aa'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function PeopleIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#f97316' : '#a1a1aa'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function GraphIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#f97316' : '#a1a1aa'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="3" /><circle cx="5" cy="19" r="3" /><circle cx="19" cy="19" r="3" />
      <line x1="12" y1="8" x2="5" y2="16" /><line x1="12" y1="8" x2="19" y2="16" /><line x1="5" y1="19" x2="19" y2="19" />
    </svg>
  )
}

function UserIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#f97316' : '#a1a1aa'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function App() {
  const {
    busy,
    message,
    cooldownSeconds,
    profile,
    user,
    signIn,
    signOut,
    signUp,
    saveProfile,
  } = useAuth()

  const {
    busy: feedBusy,
    message: feedMessage,
    posts,
    createPostWithOptionalMedia,
    updatePostLocally,
  } = useFeed({
    userId: user?.id ?? null,
    profile,
  })
  const { incomingPendingCount } = useConnections({
    currentUserId: user?.id ?? null,
    enabled: Boolean(user && profile),
  })
  const {
    friendCount,
    postCount,
    userPosts,
    busy: profileBusy,
    message: profileMessage,
    deletePost: handleDeletePost,
    refreshProfile,
  } = useProfile({
    userId: user?.id ?? null,
    enabled: Boolean(user && profile),
  })
  const [currentView, setCurrentView] = useState<AppView>('home')
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null)
  const [postText, setPostText] = useState('')
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null)
  const [selectedMediaPreview, setSelectedMediaPreview] = useState<string | null>(null)

  // If not authenticated, show the auth landing page.
  if (!user) {
    return (
      <LandingPage
        busy={busy}
        message={message}
        cooldownSeconds={cooldownSeconds}
        onSignIn={signIn}
        onSignUp={signUp}
      />
    )
  }

  // If authenticated but profile doesn't exist yet, force a one-time profile setup.
  if (!profile) {
    return (
      <div className="min-h-screen bg-surface px-6 py-12">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15">
              <span className="text-xl font-bold text-accent">C</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-text-primary">Set up your profile</h1>
            <p className="mt-2 text-sm text-text-secondary">
              Choose a username and display name to start using Circle.
            </p>
          </div>

          {message ? (
            <p className="mb-5 rounded-xl border border-accent/20 bg-accent-soft px-4 py-3 text-sm font-medium text-accent">
              {message}
            </p>
          ) : null}

          <div className="glass p-8">
            <ProfileSetupForm
              busy={busy}
              profile={null}
              onSubmit={async ({ username, displayName, bio, avatarUrl }) => {
                await saveProfile({ username, displayName, bio, avatarUrl })
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-6 w-full rounded-xl border border-border bg-surface py-2.5 text-sm font-medium text-text-muted transition-all hover:border-border-hover hover:text-text-primary"
          >
            Sign out
          </button>
        </div>
      </div>
    )
  }

  const displayName = profile.display_name ?? 'Your profile'
  const username = profile.username ? `@${profile.username}` : ''

  async function handleCreatePost() {
    const trimmed = postText.trim()

    if (!trimmed && !selectedMedia) {
      return
    }

    await createPostWithOptionalMedia(trimmed, selectedMedia)
    setPostText('')
    if (selectedMediaPreview) {
      URL.revokeObjectURL(selectedMediaPreview)
    }
    setSelectedMedia(null)
    setSelectedMediaPreview(null)
    setCurrentView('home')
  }

  async function handleSignOut() {
    await signOut()
  }

  const navItems: { key: AppView; label: string; icon: (active: boolean) => ReactNode }[] = [
    { key: 'home', label: 'Home', icon: (a) => <HomeIcon active={a} /> },
    { key: 'connections', label: 'Connections', icon: (a) => <PeopleIcon active={a} /> },
    { key: 'graph', label: 'Graph', icon: (a) => <GraphIcon active={a} /> },
    { key: 'profile', label: 'Profile', icon: (a) => <UserIcon active={a} /> },
  ]

  return (
    <div className="flex min-h-screen bg-surface">
      <nav className="fixed left-0 top-0 flex h-screen w-[240px] flex-col bg-surface-raised px-4 py-7 shadow-sidebar">
        <div className="mb-10 px-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-[#ff5500] text-sm font-bold text-white shadow-glow">
              C
            </div>
            <div>
              <h1 className="font-display text-lg font-bold tracking-tight text-text-primary">Circle</h1>
              <p className="-mt-0.5 text-[11px] text-text-muted">Authentic social</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = currentView === item.key
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setCurrentView(item.key)}
                className={`nav-item ${
                  isActive
                    ? 'nav-item-active'
                    : 'text-text-secondary'
                }`}
              >
                {isActive ? (
                  <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-accent transition-all" />
                ) : null}
                {item.icon(isActive)}
                {item.label}
                {item.key === 'connections' && incomingPendingCount > 0 ? (
                  <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-white">
                    {incomingPendingCount}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>

        <div className="mt-auto">
          <div className="rounded-2xl bg-surface-overlay p-3.5">
            <div className="flex items-center gap-3">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={displayName}
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-pink-500 text-sm font-bold text-white shadow-sm">
                  {displayName.slice(0, 1)}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text-primary">{displayName}</p>
                {username ? <p className="truncate text-xs text-text-muted">{username}</p> : null}
              </div>
            </div>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="mt-3 w-full rounded-xl border border-border bg-surface py-2 text-xs font-medium text-text-muted transition-all hover:border-border-hover hover:text-text-primary"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="ml-[240px] flex flex-1 justify-center">
        <div className="w-full max-w-[800px] animate-fade-in px-8 py-10">
          {currentView === 'home' ? (
            <HomePage
              currentUserId={user.id}
              displayName={displayName}
              profile={profile}
              feedBusy={feedBusy}
              feedMessage={feedMessage}
              postText={postText}
              setPostText={setPostText}
              selectedMedia={selectedMedia}
              selectedMediaPreview={selectedMediaPreview}
              setSelectedMedia={setSelectedMedia}
              setSelectedMediaPreview={setSelectedMediaPreview}
              posts={posts}
              onCreatePost={handleCreatePost}
              onUpdatePost={updatePostLocally}
            />
          ) : null}

          {currentView === 'connections' ? (
            <ConnectionsPage
              currentUserId={user.id}
              onOpenFriendProfile={(friendId) => {
                setSelectedFriendId(friendId)
                setCurrentView('friend-profile')
              }}
            />
          ) : null}

          {currentView === 'profile' ? (
            <ProfilePage
              busy={busy}
              message={message}
              profile={profile}
              userEmail={user.email ?? null}
              friendCount={friendCount}
              postCount={postCount}
              userPosts={userPosts}
              profileBusy={profileBusy}
              profileMessage={profileMessage}
              onSaveProfile={saveProfile}
              onDeletePost={handleDeletePost}
              onRefreshProfile={refreshProfile}
            />
          ) : null}

          {currentView === 'graph' ? (
            <GraphPage
              userId={user.id}
              onOpenFriendProfile={(friendId) => {
                setSelectedFriendId(friendId)
                setCurrentView('friend-profile')
              }}
            />
          ) : null}

          {currentView === 'friend-profile' && selectedFriendId ? (
            <FriendProfilePage
              currentUserId={user.id}
              friendId={selectedFriendId}
              onBack={() => {
                setCurrentView('connections')
                setSelectedFriendId(null)
              }}
              onOpenFriend={(friendId) => {
                setSelectedFriendId(friendId)
                setCurrentView('friend-profile')
              }}
            />
          ) : null}
        </div>
      </main>
    </div>
  )
}

type HomePageProps = {
  currentUserId: string
  displayName: string
  profile: ProfileRecord | null
  feedBusy: boolean
  feedMessage: string | null
  postText: string
  setPostText: (value: string) => void
  selectedMedia: File | null
  selectedMediaPreview: string | null
  setSelectedMedia: (file: File | null) => void
  setSelectedMediaPreview: (value: string | null) => void
  posts: FeedPost[]
  onCreatePost: () => Promise<void>
  onUpdatePost: (postId: string, updates: Partial<FeedPost>) => void
}

function HomePage({
  currentUserId,
  displayName,
  profile,
  feedBusy,
  feedMessage,
  postText,
  setPostText,
  selectedMedia,
  selectedMediaPreview,
  setSelectedMedia,
  setSelectedMediaPreview,
  posts,
  onCreatePost,
  onUpdatePost,
}: HomePageProps) {
  const mediaInputRef = useRef<HTMLInputElement | null>(null)

  function handleMediaChange(fileList: FileList | null) {
    const file = fileList?.[0] ?? null

    if (selectedMediaPreview) {
      URL.revokeObjectURL(selectedMediaPreview)
    }

    if (!file) {
      setSelectedMedia(null)
      setSelectedMediaPreview(null)
      if (mediaInputRef.current) {
        mediaInputRef.current.value = ''
      }
      return
    }

    setSelectedMedia(file)
    setSelectedMediaPreview(URL.createObjectURL(file))
  }

  function openMediaPicker() {
    mediaInputRef.current?.click()
  }

   return (
    <div className="space-y-8">
      <h2 className="font-display text-2xl font-bold text-text-primary">Home</h2>

      <div className="card p-6">
        <div className="flex gap-4">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={displayName}
              className="h-11 w-11 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-pink-500 text-sm font-bold text-white shadow-sm">
              {displayName.slice(0, 1)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <textarea
              value={postText}
              onChange={(event) => setPostText(event.target.value)}
              className="input-base min-h-[90px] resize-none"
              placeholder="What's on your mind?"
              disabled={feedBusy}
            />
            {selectedMediaPreview ? (
              <div className="mt-3 overflow-hidden rounded-xl border border-border">
                {selectedMedia?.type.startsWith('video/') ? (
                  <video
                    src={selectedMediaPreview}
                    controls
                    className="max-h-80 w-full object-cover"
                  />
                ) : (
                  <img
                    src={selectedMediaPreview}
                    alt="Selected post media preview"
                    className="max-h-80 w-full object-cover"
                  />
                )}
              </div>
            ) : null}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs text-text-muted">Visible to friends only</span>
                <input
                  ref={mediaInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(event) => handleMediaChange(event.target.files)}
                  disabled={feedBusy}
                />
                <button
                  type="button"
                  onClick={openMediaPicker}
                  disabled={feedBusy}
                  className="btn-secondary px-3 py-2 text-xs"
                >
                  Add media
                </button>
                {selectedMedia ? (
                  <button
                    type="button"
                    onClick={() => handleMediaChange(null)}
                    className="btn-secondary px-3 py-2 text-xs"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => void onCreatePost()}
                disabled={(!postText.trim() && !selectedMedia) || feedBusy}
                className="btn-primary px-5 py-2.5 text-sm"
              >
                {feedBusy ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {feedMessage ? (
        <div className="rounded-xl border border-accent/20 bg-accent-soft px-4 py-3 text-sm font-medium text-accent">
          {feedMessage}
        </div>
      ) : null}

      <div className="space-y-5">
        {posts.length === 0 ? (
          <div className="card p-10 text-center" style={{ transform: 'none' }}>
            <p className="text-sm text-text-muted">
              No posts yet. Create the first update for your circle.
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <article
              key={post.id}
              className="card animate-slide-up overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center gap-3">
                  {post.author_avatar ? (
                    <img
                      src={post.author_avatar}
                      alt={post.author}
                      className="h-10 w-10 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent/15 to-secondary/15 text-sm font-bold text-accent">
                      {post.author.slice(0, 1)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{post.author}</p>
                    <p className="text-xs text-text-muted">
                      {post.handle} · {post.time}
                      {post.isLocalOnly ? ' · local' : ''}
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-text-secondary">{post.text}</p>

                {post.media ? (
                  <div className="mt-4 overflow-hidden rounded-xl border border-border">
                    {post.media.type === 'video' ? (
                      <video
                        src={post.media.url}
                        controls
                        className="max-h-[28rem] w-full object-cover"
                      />
                    ) : (
                      <img
                        src={post.media.url}
                        alt={`${post.author} post media`}
                        className="max-h-[28rem] w-full object-cover"
                      />
                    )}
                  </div>
                ) : null}
              </div>

              <PostEngagement
                post={post}
                currentUserId={currentUserId}
                onPostUpdated={onUpdatePost}
              />
            </article>
          ))
        )}
      </div>
    </div>
  )
}

function ConnectionsPage({
  onOpenFriendProfile,
  currentUserId,
}: {
  onOpenFriendProfile: (friendId: string) => void
  currentUserId: string
}) {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-text-primary">Connections</h2>
      <FriendsPanel
        currentUserId={currentUserId}
        onOpenFriendProfile={onOpenFriendProfile}
      />
    </div>
  )
}

type ProfilePageProps = {
  busy: boolean
  message: string | null
  profile: Parameters<typeof ProfileSetupForm>[0]['profile']
  userEmail: string | null
  friendCount: number
  postCount: number
  userPosts: FeedPost[]
  profileBusy: boolean
  profileMessage: string | null
  onSaveProfile: (values: {
    username: string
    displayName: string
    bio: string
    avatarUrl?: string
  }) => Promise<void>
  onDeletePost: (postId: string) => Promise<void>
  onRefreshProfile: () => Promise<void>
}

function ProfilePage({
  busy,
  message,
  profile,
  userEmail,
  friendCount,
  postCount,
  userPosts,
  profileBusy,
  profileMessage,
  onSaveProfile,
  onDeletePost,
}: ProfilePageProps) {
  const [showEdit, setShowEdit] = useState(false)
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)

  async function handleDelete(postId: string) {
    const confirmed = window.confirm('Delete this post? This cannot be undone.')
    if (!confirmed) return

    setDeletingPostId(postId)
    await onDeletePost(postId)
    setDeletingPostId(null)
  }

  return (
    <div className="space-y-8">
      <h2 className="font-display text-2xl font-bold text-text-primary">Profile</h2>

      {/* Profile header card */}
      <div className="card overflow-hidden">
        <div className="p-6">
          <div className="flex items-end gap-4">
            <AvatarUpload
              currentAvatarUrl={profile?.avatar_url ?? null}
              displayName={profile?.display_name ?? 'U'}
              onAvatarUpdated={async (avatarUrl) => {
                console.log('[App.onAvatarUpdated] Avatar updated with URL:', avatarUrl)
                // The profile state will be updated by the useAuth hook's profile loading effect
                // Just need to trigger a refresh by calling saveProfile with current values
                // This will cause the profile to be re-fetched and updated
                if (profile) {
                  console.log('[App.onAvatarUpdated] Current profile:', profile)
                  console.log('[App.onAvatarUpdated] Triggering profile refresh after avatar update')
                  console.log('[App.onAvatarUpdated] Calling onSaveProfile with:', {
                    username: profile.username,
                    displayName: profile.display_name,
                    bio: profile.bio,
                    avatarUrl,
                  })
                  await onSaveProfile({
                    username: profile.username,
                    displayName: profile.display_name,
                    bio: profile.bio,
                    avatarUrl,
                  })
                  console.log('[App.onAvatarUpdated] onSaveProfile completed')
                }
              }}
            />
            <div className="mb-1">
              <p className="text-lg font-bold text-text-primary">
                {profile?.display_name ?? 'Set up your profile'}
              </p>
              {profile?.username ? (
                <p className="text-sm text-text-muted">@{profile.username}</p>
              ) : null}
            </div>
          </div>
          {profile?.bio ? (
            <p className="mt-4 text-sm leading-relaxed text-text-secondary">{profile.bio}</p>
          ) : null}
          <p className="mt-2 text-xs text-text-muted">{userEmail}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-5">
        <div className="card p-6 text-center">
          <p className="text-3xl font-bold text-text-primary">{friendCount}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-text-muted">Friends</p>
        </div>
        <div className="card p-6 text-center">
          <p className="text-3xl font-bold text-text-primary">{postCount}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-text-muted">Posts</p>
        </div>
      </div>

      {/* Edit toggle + collapsible edit section */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-text-primary">Profile details</h3>
          <button
            type="button"
            onClick={() => setShowEdit((v) => !v)}
            className="btn-secondary px-4 py-2 text-xs"
          >
            {showEdit ? 'Cancel editing' : 'Edit profile'}
          </button>
        </div>

        {showEdit ? (
          <div className="mt-6 border-t border-border pt-6">
            <ProfileSetupForm
              key={profile?.id ?? 'profile-setup'}
              busy={busy}
              profile={profile}
              onSubmit={async ({ username, displayName, bio, avatarUrl }) => {
                await onSaveProfile({ username, displayName, bio, avatarUrl })
                setShowEdit(false)
              }}
            />
          </div>
        ) : null}
      </div>

      {/* User posts section */}
      <div className="card p-6">
        <h3 className="mb-5 text-base font-bold text-text-primary">Your posts</h3>

        {userPosts.length === 0 ? (
          <p className="text-sm text-text-muted">You haven't posted anything yet.</p>
        ) : (
          <div className="space-y-4">
            {userPosts.map((post) => (
              <article
                key={post.id}
                className="rounded-xl border border-border bg-surface p-5 transition-all hover:border-border-hover"
              >
                <p className="text-sm leading-relaxed text-text-secondary">{post.text}</p>

                {post.media ? (
                  <div className="mt-3 overflow-hidden rounded-lg border border-border">
                    {post.media.type === 'video' ? (
                      <video src={post.media.url} controls className="max-h-60 w-full object-cover" />
                    ) : (
                      <img src={post.media.url} alt="Post media" className="max-h-60 w-full object-cover" />
                    )}
                  </div>
                ) : null}

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-text-muted">{post.time}</p>
                  <button
                    type="button"
                    onClick={() => void handleDelete(post.id)}
                    disabled={profileBusy || deletingPostId === post.id}
                    className="rounded-xl border border-border bg-surface-raised px-3 py-1.5 text-xs font-medium text-text-muted transition hover:border-rose-500/30 hover:text-rose-400 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {deletingPostId === post.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {(message || profileMessage) ? (
        <div className="rounded-xl border border-accent/20 bg-accent-soft px-4 py-3 text-sm font-medium text-accent">
          {message || profileMessage}
        </div>
      ) : null}
    </div>
  )
}



export default App
