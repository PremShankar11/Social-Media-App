import { useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { fetchProfile, upsertProfile } from '../services/profile-service'
import type { ProfileRecord } from '../types/domain'

type UseAuthResult = {
  busy: boolean
  message: string | null
  cooldownSeconds: number
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
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null)
  const [clock, setClock] = useState(() => Date.now())

  const cooldownSeconds =
    cooldownUntil && cooldownUntil > clock
      ? Math.ceil((cooldownUntil - clock) / 1000)
      : 0

  useEffect(() => {
    if (!cooldownUntil) {
      return
    }

    const id = window.setInterval(() => {
      const now = Date.now()
      setClock(now)
      if (cooldownUntil <= now) {
        setCooldownUntil(null)
      }
    }, 500)

    return () => {
      window.clearInterval(id)
    }
  }, [cooldownUntil])

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
        setProfile(data ?? null)
      }

      setBusy(false)
    }

    void loadProfile()

    return () => {
      cancelled = true
    }
  }, [user])

  function startCooldown(seconds: number) {
    setCooldownUntil(Date.now() + seconds * 1000)
  }

  async function performSignIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      if (error.status === 429) {
        startCooldown(30)
        setMessage('Too many attempts. Please wait 30 seconds and try again.')
        return { ok: false as const, reason: 'rate_limit' as const }
      }

      setMessage(error.message)
      return { ok: false as const, reason: 'error' as const }
    }

    return { ok: true as const, reason: 'ok' as const }
  }

  async function signIn(email: string, password: string) {
    if (busy) {
      return
    }

    if (cooldownSeconds > 0) {
      setMessage(`Too many attempts. Please wait ${cooldownSeconds}s and try again.`)
      return
    }

    setBusy(true)
    setMessage(null)

    await performSignIn(email, password)

    setBusy(false)
  }

  async function signUp(email: string, password: string) {
    if (busy) {
      return
    }

    if (cooldownSeconds > 0) {
      setMessage(`Too many attempts. Please wait ${cooldownSeconds}s and try again.`)
      return
    }

    setBusy(true)
    setMessage(null)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      if (error.status === 429) {
        startCooldown(30)
        setMessage('Too many attempts. Please wait 30 seconds and try again.')
      } else {
        setMessage(error.message)
      }
      setBusy(false)
      return
    }

    // If Supabase is configured for instant sign-in, we may already have a session.
    // Otherwise, try signing in immediately (works when email confirmation is disabled).
    if (!data.session) {
      const signInResult = await performSignIn(email, password)
      if (!signInResult.ok) {
        if (signInResult.reason === 'rate_limit') {
          setBusy(false)
          return
        }

        const currentSession = await supabase.auth.getSession()
        const userId = currentSession.data.session?.user?.id ?? null

        if (!userId) {
          setMessage(
            'Account created, but your Supabase Auth settings currently require confirmation before sign-in. Disable email confirmation in Supabase Auth settings to allow instant login.',
          )
        }
        setBusy(false)
        return
      }
    }

    setBusy(false)
  }

  async function signOut() {
    setBusy(true)
    setMessage(null)
    setCooldownUntil(null)
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
    cooldownSeconds,
    profile,
    session,
    user,
    signIn,
    signUp,
    signOut,
    saveProfile,
  }
}
