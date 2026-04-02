import { useMemo, useState } from 'react'
import { AuthForms } from './features/auth/auth-forms'
import { FriendsPanel } from './features/friends/friends-panel'
import { ProfileSetupForm } from './features/profile/profile-setup-form'
import { useAuth } from './hooks/use-auth'

type AppView = 'home' | 'connections' | 'profile'

type FeedPost = {
  id: string
  author: string
  handle: string
  time: string
  text: string
  likes: number
  comments: number
}

const starterPosts: FeedPost[] = [
  {
    id: 'seed-1',
    author: 'Anaya Sharma',
    handle: '@anaya',
    time: '2h ago',
    text: 'Went out for chai after class and realized this is exactly the kind of simple, real moment this app should be for.',
    likes: 24,
    comments: 6,
  },
  {
    id: 'seed-2',
    author: 'Rishi Mehta',
    handle: '@rishi.codes',
    time: '5h ago',
    text: 'Trying to keep my feed small, calm, and useful. Close friends, real updates, and no algorithmic pressure.',
    likes: 17,
    comments: 3,
  },
]

/* ─── Icon helpers ─── */
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

function UserIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#f97316' : '#a1a1aa'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

/* ─── Main App ─── */
function App() {
  const {
    busy,
    message,
    profile,
    session,
    user,
    signIn,
    signOut,
    signUp,
    saveProfile,
  } = useAuth()
  const [currentView, setCurrentView] = useState<AppView>('home')
  const [postText, setPostText] = useState('')
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>(starterPosts)

  const displayName = profile?.display_name ?? 'Your profile'
  const username = profile?.username ? `@${profile.username}` : ''

  const userFeed = useMemo(() => {
    if (!profile) {
      return feedPosts
    }

    return [
      {
        id: 'profile-preview',
        author: profile.display_name,
        handle: `@${profile.username}`,
        time: 'Just now',
        text:
          profile.bio ||
          'Your profile is ready. Your future posts and updates will start showing up here.',
        likes: 0,
        comments: 0,
      },
      ...feedPosts,
    ]
  }, [feedPosts, profile])

  function handleCreatePost() {
    const trimmed = postText.trim()
    if (!trimmed) return

    setFeedPosts((current) => [
      {
        id: `post-${Date.now()}`,
        author: profile?.display_name ?? 'You',
        handle: profile?.username ? `@${profile.username}` : '@you',
        time: 'Now',
        text: trimmed,
        likes: 0,
        comments: 0,
      },
      ...current,
    ])

    setPostText('')
    setCurrentView('home')
  }

  const navItems: { key: AppView; label: string; icon: (active: boolean) => React.ReactNode }[] = [
    { key: 'home', label: 'Home', icon: (a) => <HomeIcon active={a} /> },
    { key: 'connections', label: 'Connections', icon: (a) => <PeopleIcon active={a} /> },
    { key: 'profile', label: 'Profile', icon: (a) => <UserIcon active={a} /> },
  ]

  return (
    <div className="flex min-h-screen bg-surface">
      {/* ─── Left Sidebar Nav ─── */}
      <nav className="fixed left-0 top-0 flex h-screen w-[220px] flex-col border-r border-border bg-surface-raised px-3 py-6">
        {/* Logo */}
        <div className="mb-10 px-3">
          <h1 className="font-display text-xl font-bold text-white tracking-tight">Circle</h1>
          <p className="mt-0.5 text-xs text-zinc-500">Authentic social</p>
        </div>

        {/* Nav links */}
        <div className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = currentView === item.key
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setCurrentView(item.key)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-accent-soft text-accent'
                    : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                }`}
              >
                {item.icon(isActive)}
                {item.label}
              </button>
            )
          })}
        </div>

        {/* Bottom user section */}
        <div className="mt-auto">
          {session ? (
            <div className="rounded-xl border border-border bg-surface p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-pink-500 text-sm font-semibold text-white">
                  {displayName.slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{displayName}</p>
                  {username && <p className="truncate text-xs text-zinc-500">{username}</p>}
                </div>
              </div>
              <button
                type="button"
                onClick={() => void signOut()}
                className="mt-3 w-full rounded-lg border border-border py-2 text-xs font-medium text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200"
              >
                Sign out
              </button>
            </div>
          ) : (
            <p className="px-3 text-xs text-zinc-600">Sign in from the Profile tab</p>
          )}
        </div>
      </nav>

      {/* ─── Main Content ─── */}
      <main className="ml-[220px] flex flex-1 justify-center">
        <div className="w-full max-w-2xl px-6 py-8 animate-fade-in">
          {currentView === 'home' && (
            <HomePage
              canPost={Boolean(session)}
              displayName={displayName}
              postText={postText}
              setPostText={setPostText}
              posts={userFeed}
              onCreatePost={handleCreatePost}
            />
          )}

          {currentView === 'connections' && (
            <ConnectionsPage
              canUseFriends={Boolean(user && profile)}
              currentUserId={user?.id ?? null}
            />
          )}

          {currentView === 'profile' && (
            <ProfilePage
              busy={busy}
              message={message}
              profile={profile}
              session={Boolean(session)}
              userEmail={user?.email ?? null}
              onSignIn={signIn}
              onSignUp={signUp}
              onSaveProfile={saveProfile}
            />
          )}
        </div>
      </main>
    </div>
  )
}

/* ─── Home Page ─── */
type HomePageProps = {
  canPost: boolean
  displayName: string
  postText: string
  setPostText: (value: string) => void
  posts: FeedPost[]
  onCreatePost: () => void
}

function HomePage({
  canPost,
  displayName,
  postText,
  setPostText,
  posts,
  onCreatePost,
}: HomePageProps) {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <h2 className="font-display text-2xl font-semibold text-white">Home</h2>

      {/* Composer */}
      <div className="rounded-2xl border border-border bg-surface-raised p-5">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-pink-500 text-sm font-semibold text-white">
            {displayName.slice(0, 1)}
          </div>
          <div className="min-w-0 flex-1">
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              className="min-h-[80px] w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm leading-relaxed text-white placeholder:text-zinc-600 outline-none transition-colors focus:border-accent/50"
              placeholder="What's on your mind?"
              disabled={!canPost}
            />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-zinc-600">Visible to friends only</span>
              <button
                type="button"
                onClick={onCreatePost}
                disabled={!canPost || !postText.trim()}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Separator */}
      <div className="border-t border-border" />

      {/* Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <article
            key={post.id}
            className="rounded-2xl border border-border bg-surface-raised p-5 transition-colors hover:border-border-hover animate-slide-up"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-overlay text-sm font-semibold text-zinc-300">
                {post.author.slice(0, 1)}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{post.author}</p>
                <p className="text-xs text-zinc-500">
                  {post.handle} · {post.time}
                </p>
              </div>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-zinc-300">{post.text}</p>

            <div className="mt-4 flex gap-4 text-xs text-zinc-500">
              <button type="button" className="flex items-center gap-1 transition hover:text-accent">
                <HeartIcon /> {post.likes}
              </button>
              <button type="button" className="flex items-center gap-1 transition hover:text-accent">
                <CommentIcon /> {post.comments}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

/* ─── Connections Page ─── */
function ConnectionsPage({
  canUseFriends,
  currentUserId,
}: {
  canUseFriends: boolean
  currentUserId: string | null
}) {
  if (!canUseFriends || !currentUserId) {
    return (
      <div className="space-y-4">
        <h2 className="font-display text-2xl font-semibold text-white">Connections</h2>
        <div className="rounded-2xl border border-border bg-surface-raised p-8 text-center">
          <p className="text-sm text-zinc-400">
            Sign in and complete your profile to start connecting with people.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl font-semibold text-white">Connections</h2>
      <FriendsPanel currentUserId={currentUserId} />
    </div>
  )
}

/* ─── Profile Page ─── */
type ProfilePageProps = {
  busy: boolean
  message: string | null
  profile: Parameters<typeof ProfileSetupForm>[0]['profile']
  session: boolean
  userEmail: string | null
  onSignIn: (email: string, password: string) => Promise<void>
  onSignUp: (email: string, password: string) => Promise<void>
  onSaveProfile: (values: {
    username: string
    displayName: string
    bio: string
  }) => Promise<void>
}

function ProfilePage({
  busy,
  message,
  profile,
  session,
  userEmail,
  onSignIn,
  onSignUp,
  onSaveProfile,
}: ProfilePageProps) {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-semibold text-white">Profile</h2>

      {session ? (
        <>
          {/* Profile summary card */}
          <div className="rounded-2xl border border-border bg-surface-raised p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent to-pink-500 text-lg font-bold text-white">
                {(profile?.display_name ?? 'U').slice(0, 1)}
              </div>
              <div>
                <p className="text-lg font-semibold text-white">
                  {profile?.display_name ?? 'Set up your profile'}
                </p>
                {profile?.username && (
                  <p className="text-sm text-zinc-500">@{profile.username}</p>
                )}
                <p className="mt-0.5 text-xs text-zinc-600">{userEmail}</p>
              </div>
            </div>
            {profile?.bio && (
              <p className="mt-4 text-sm leading-relaxed text-zinc-400">{profile.bio}</p>
            )}
          </div>

          {/* Profile edit form */}
          <div className="rounded-2xl border border-border bg-surface-raised p-6">
            <h3 className="mb-4 text-base font-semibold text-white">Edit profile</h3>
            <ProfileSetupForm
              key={profile?.id ?? 'profile-setup'}
              busy={busy}
              profile={profile}
              onSubmit={async ({ username, displayName, bio }) => {
                await onSaveProfile({ username, displayName, bio })
              }}
            />
          </div>
        </>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface-raised p-6">
            <h3 className="mb-4 text-base font-semibold text-white">Sign in</h3>
            <AuthForms
              mode="sign-in"
              busy={busy}
              onSubmit={async ({ email, password }) => {
                await onSignIn(email, password)
              }}
            />
          </div>

          <div className="rounded-2xl border border-border bg-surface-raised p-6">
            <h3 className="mb-4 text-base font-semibold text-white">Create account</h3>
            <AuthForms
              mode="sign-up"
              busy={busy}
              onSubmit={async ({ email, password }) => {
                await onSignUp(email, password)
              }}
            />
          </div>
        </div>
      )}

      {message && (
        <div className="rounded-xl border border-accent/20 bg-accent-soft px-4 py-3 text-sm text-accent">
          {message}
        </div>
      )}
    </div>
  )
}

/* ─── Small Icons ─── */
function HeartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function CommentIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

export default App
