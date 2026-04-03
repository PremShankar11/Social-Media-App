import { useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { fetchProfile, upsertProfile } from '../services/profile-service'
import type { ProfileRecord } from '../types/domain'

type UseAuthResult = {
  busy: boolean
  message: string | null
  profile: ProfileRecord | null
  session: Session | null
  user: User | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  saveProfile: (values: {
    username: string
    displayName: string
    bio: string
    avatarUrl?: string
  }) => Promise<void>
}

export function useAuth(): UseAuthResult {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<ProfileRecord | null>(null)
  const [busy, setBusy] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadSession() {
      const {
        data: { session: currentSession },
        error,
      } = await supabase.auth.getSession()

      if (!mounted) {
        return
      }

      if (error) {
        setMessage(error.message)
      }

      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      setBusy(false)
    }

    void loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      setProfile(null)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      if (!user) {
        setProfile(null)
        return
      }

      setBusy(true)
      const { data, error } = await fetchProfile(user.id)

      if (cancelled) {
        return
      }

      if (error) {
        setMessage(error.message)
        setProfile(null)
      } else {
        setProfile(data)
      }

      setBusy(false)
    }

    void loadProfile()

    return () => {
      cancelled = true
    }
  }, [user])

  async function signIn(email: string, password: string) {
    setBusy(true)
    setMessage(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
    }

    setBusy(false)
  }

  async function signUp(email: string, password: string) {
    setBusy(true)
    setMessage(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Account created. Check your email if Supabase email confirmation is enabled.')
    }

    setBusy(false)
  }

  async function signOut() {
    setBusy(true)
    setMessage(null)
    const { error } = await supabase.auth.signOut()

    if (error) {
      setMessage(error.message)
    }

    setBusy(false)
  }

  async function saveProfile(values: {
    username: string
    displayName: string
    bio: string
    avatarUrl?: string
  }) {
    if (!user) {
      setMessage('You must be signed in to save a profile.')
      return
    }

    console.log('[useAuth.saveProfile] Saving profile with values:', values)
    setBusy(true)
    setMessage(null)

    const { data, error } = await upsertProfile({
      id: user.id,
      username: values.username,
      display_name: values.displayName,
      bio: values.bio,
      avatar_url: values.avatarUrl ?? undefined,
    })

    console.log('[useAuth.saveProfile] Upsert result - error:', error, 'data:', data)

    if (error) {
      console.error('[useAuth.saveProfile] Error:', error)
      setMessage(error.message)
      setBusy(false)
      return
    }

    console.log('[useAuth.saveProfile] Profile updated successfully, data:', data)
    
    // Ensure we have a valid profile object to set
    if (data) {
      setProfile(data)
    } else {
      // If data is null, fetch the profile directly
      console.log('[useAuth.saveProfile] Data is null, fetching profile directly')
      const { data: fetchedProfile, error: fetchError } = await fetchProfile(user.id)
      if (fetchError) {
        console.error('[useAuth.saveProfile] Error fetching profile:', fetchError)
      } else {
        console.log('[useAuth.saveProfile] Fetched profile:', fetchedProfile)
        setProfile(fetchedProfile)
      }
    }
    
    setBusy(false)
  }

  return {
    busy,
    message,
    profile,
    session,
    user,
    signIn,
    signUp,
    signOut,
    saveProfile,
  }
}
