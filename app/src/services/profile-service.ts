import { supabase } from '../lib/supabase'
import type { ProfileInsert, ProfileRecord } from '../types/domain'

export async function fetchProfile(userId: string) {
  const result = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle<ProfileRecord>()

  return result
}

export async function uploadProfileAvatar(file: File) {
  const userId = (await supabase.auth.getUser()).data.user?.id
  if (!userId) {
    return { data: null, error: new Error('Not authenticated') }
  }

  const extension = file.name.includes('.') ? file.name.split('.').pop() : undefined
  // Use timestamp to ensure unique filename for each upload
  const timestamp = Date.now()
  const fileName = `avatar-${timestamp}${extension ? `.${extension}` : ''}`
  const storagePath = `${userId}/${fileName}`

  console.log('[uploadProfileAvatar] Uploading avatar to path:', storagePath)

  const uploadResult = await supabase.storage
    .from('avatars')
    .upload(storagePath, file, {
      upsert: false, // Don't upsert - we want a new file each time
      contentType: file.type,
    })

  if (uploadResult.error) {
    console.error('[uploadProfileAvatar] Upload error:', uploadResult.error)
    return { data: null, error: uploadResult.error }
  }

  console.log('[uploadProfileAvatar] Upload successful, path:', uploadResult.data?.path)

  const { data } = supabase.storage.from('avatars').getPublicUrl(storagePath)
  console.log('[uploadProfileAvatar] Generated public URL:', data.publicUrl)
  
  return {
    data: {
      path: storagePath,
      url: data.publicUrl,
    },
    error: null,
  }
}

export async function updateProfileAvatar(userId: string, avatarUrl: string) {
  console.log('[profileService.updateProfileAvatar] Updating avatar for user:', userId, 'URL:', avatarUrl)
  
  // Add cache-busting parameter to ensure browser loads new image
  const urlWithCacheBust = avatarUrl.includes('?') 
    ? `${avatarUrl}&t=${Date.now()}`
    : `${avatarUrl}?t=${Date.now()}`
  
  console.log('[profileService.updateProfileAvatar] URL with cache bust:', urlWithCacheBust)
  
  const updateResult = await supabase
    .from('profiles')
    .update({ avatar_url: urlWithCacheBust })
    .eq('id', userId)
    .select('*')
    .single<ProfileRecord>()

  console.log('[profileService.updateProfileAvatar] Update result:', updateResult)
  return updateResult
}

export async function upsertProfile(values: ProfileInsert) {
  console.log('[profileService.upsertProfile] Upserting profile:', values)
  
  // Add cache-busting to avatar URL if provided
  let avatarUrl = values.avatar_url
  if (avatarUrl && !avatarUrl.includes('?t=')) {
    avatarUrl = avatarUrl.includes('?') 
      ? `${avatarUrl}&t=${Date.now()}`
      : `${avatarUrl}?t=${Date.now()}`
    console.log('[profileService.upsertProfile] Added cache bust to avatar URL:', avatarUrl)
  }
  
  // First, upsert the profile
  const upsertResult = await supabase
    .from('profiles')
    .upsert({ ...values, avatar_url: avatarUrl }, { onConflict: 'id' })
    .select('*')

  console.log('[profileService.upsertProfile] Upsert result:', upsertResult)

  if (upsertResult.error) {
    console.error('[profileService.upsertProfile] Upsert error:', upsertResult.error)
    return upsertResult
  }

  // If upsert succeeded, return the updated profile
  if (upsertResult.data && upsertResult.data.length > 0) {
    const updatedProfile = upsertResult.data[0] as ProfileRecord
    console.log('[profileService.upsertProfile] Returning updated profile:', updatedProfile)
    return { data: updatedProfile, error: null }
  }

  // Fallback: fetch the profile directly if upsert returned empty array
  console.log('[profileService.upsertProfile] Upsert returned empty array, fetching profile directly for ID:', values.id)
  const fetchResult = await supabase
    .from('profiles')
    .select('*')
    .eq('id', values.id)
    .single<ProfileRecord>()

  console.log('[profileService.upsertProfile] Fetch result:', fetchResult)
  return fetchResult
}
