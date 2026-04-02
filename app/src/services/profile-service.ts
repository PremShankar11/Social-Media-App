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

export async function upsertProfile(values: ProfileInsert) {
  const result = await supabase
    .from('profiles')
    .upsert(values, { onConflict: 'id' })
    .select('*')
    .single<ProfileRecord>()

  return result
}
