import { useRef, useState } from 'react'
import { uploadProfileAvatar } from '../../services/profile-service'

type AvatarUploadProps = {
  currentAvatarUrl: string | null
  displayName: string
  onAvatarUpdated: (avatarUrl: string) => Promise<void>
}

export function AvatarUpload({
  currentAvatarUrl,
  displayName,
  onAvatarUpdated,
}: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFileSelect(fileList: FileList | null) {
    const file = fileList?.[0]
    if (!file) return

    setUploading(true)
    try {
      console.log('[AvatarUpload] Starting upload for file:', file.name)
      const uploadResult = await uploadProfileAvatar(file)
      console.log('[AvatarUpload] Upload result:', uploadResult)
      
      if (uploadResult.error) {
        console.error('[AvatarUpload] Avatar upload error:', uploadResult.error)
        setUploading(false)
        return
      }

      if (uploadResult.data?.url) {
        console.log('[AvatarUpload] Uploaded avatar URL:', uploadResult.data.url)
        console.log('[AvatarUpload] Calling onAvatarUpdated callback with URL:', uploadResult.data.url)
        await onAvatarUpdated(uploadResult.data.url)
        console.log('[AvatarUpload] onAvatarUpdated completed successfully')
      }
    } catch (err) {
      console.error('[AvatarUpload] Unexpected error:', err)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="relative">
      {currentAvatarUrl ? (
        <img
          src={currentAvatarUrl}
          alt={displayName}
          className="h-16 w-16 rounded-2xl object-cover ring-4 ring-surface-raised"
        />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-secondary text-xl font-bold text-white shadow-glow-accent ring-4 ring-surface-raised">
          {displayName.slice(0, 1)}
        </div>
      )}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white shadow-lg transition hover:bg-accent-hover disabled:opacity-50"
        title="Change profile picture"
      >
        {uploading ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
        disabled={uploading}
      />
    </div>
  )
}
