import { useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { profileSchema } from '../auth/schemas'
import type { ProfileRecord } from '../../types/domain'
import { uploadProfileAvatar } from '../../services/profile-service'

type ProfileSetupFormProps = {
  busy: boolean
  profile: ProfileRecord | null
  onSubmit: (values: {
    username: string
    displayName: string
    bio: string
    avatarUrl?: string
  }) => Promise<void>
}

export function ProfileSetupForm({
  busy,
  profile,
  onSubmit,
}: ProfileSetupFormProps) {
  const defaults = useMemo(
    () => ({
      username: profile?.username ?? '',
      displayName: profile?.display_name ?? '',
      bio: profile?.bio ?? '',
    }),
    [profile],
  )

  const [username, setUsername] = useState(defaults.username)
  const [displayName, setDisplayName] = useState(defaults.displayName)
  const [bio, setBio] = useState(defaults.bio)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url ?? null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const avatarInputRef = useRef<HTMLInputElement | null>(null)

  function handleAvatarChange(fileList: FileList | null) {
    const file = fileList?.[0] ?? null

    if (avatarPreview && avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview)
    }

    if (!file) {
      setAvatarFile(null)
      setAvatarPreview(profile?.avatar_url ?? null)
      if (avatarInputRef.current) {
        avatarInputRef.current.value = ''
      }
      return
    }

    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  function openAvatarPicker() {
    avatarInputRef.current?.click()
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsed = profileSchema.safeParse({
      username: username.trim().toLowerCase(),
      displayName: displayName.trim(),
      bio: bio.trim(),
    })

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Profile details are invalid.')
      return
    }

    setError(null)

    let avatarUrl = profile?.avatar_url ?? undefined

    if (avatarFile) {
      const uploadResult = await uploadProfileAvatar(avatarFile)
      if (uploadResult.error) {
        setError(uploadResult.error.message)
        return
      }
      avatarUrl = uploadResult.data?.url
    }

    await onSubmit({
      ...parsed.data,
      avatarUrl,
    })
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {/* Avatar upload */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-text-secondary">Profile picture</label>
        <div className="flex items-center gap-4">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Avatar preview"
              className="h-16 w-16 rounded-xl object-cover ring-2 ring-accent/30"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-surface-raised text-sm font-bold text-text-muted">
              {(displayName || profile?.display_name || 'U').slice(0, 1)}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => handleAvatarChange(event.target.files)}
              disabled={busy}
            />
            <button
              type="button"
              onClick={openAvatarPicker}
              disabled={busy}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              Choose image
            </button>
            {avatarFile && (
              <button
                type="button"
                onClick={() => handleAvatarChange(null)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:border-rose-500/50 hover:text-rose-400"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-secondary" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="input-base"
          placeholder="friends_only"
          autoComplete="username"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-secondary" htmlFor="displayName">
          Display name
        </label>
        <input
          id="displayName"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          className="input-base"
          placeholder="Your name"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-secondary" htmlFor="bio">
          Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          className="input-base min-h-[100px] resize-none"
          placeholder="A short intro for your friends."
        />
      </div>

      {error && (
        <p className="rounded-xl border border-rose-500/20 bg-rose-500/8 px-4 py-2.5 text-xs font-medium text-rose-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="btn-primary w-full"
      >
        {busy ? 'Saving...' : profile ? 'Update profile' : 'Complete profile'}
      </button>
    </form>
  )
}
