import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Whether Supabase credentials are configured.
 * When false, the app still works — Supabase features (auth, saved routes)
 * are additive and gracefully degrade. Check this before making Supabase calls.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase credentials not configured. ' +
    'Copy .env.example to .env and fill in your Supabase project values. ' +
    'Band Hopper will work without Supabase — auth and saved routes will be unavailable.'
  )
}

/**
 * Shared cookie helpers for cross-app session sync.
 * We only store the refresh_token in the cookie (small enough to fit).
 * The full session stays in localStorage per app.
 */
const SYNC_COOKIE_NAME = 'pfg-refresh-token'

function getSharedRefreshToken(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(^| )${SYNC_COOKIE_NAME}=([^;]+)`))
  return match ? decodeURIComponent(match[2]) : null
}

function setSharedRefreshToken(token: string | null): void {
  if (typeof document === 'undefined') return
  const isProduction = window.location.hostname.includes('peacefroggaming.com')
  const domain = isProduction ? '; domain=.peacefroggaming.com' : ''
  const secure = isProduction ? '; secure' : ''

  if (token) {
    document.cookie = `${SYNC_COOKIE_NAME}=${encodeURIComponent(token)}${domain}; path=/; max-age=31536000${secure}; samesite=lax`
  } else {
    // Clear the cookie
    document.cookie = `${SYNC_COOKIE_NAME}=${domain}; path=/; max-age=0`
  }
}

// Create client with default localStorage storage
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
)

/**
 * Initialize cross-app session sync.
 * Call this once on app startup (e.g., in AuthContext).
 *
 * How it works:
 * 1. On login: saves refresh_token to shared cookie
 * 2. On logout: clears shared cookie
 * 3. On app load: if no local session but shared cookie exists, restores session
 */
export async function initSessionSync(): Promise<void> {
  if (!isSupabaseConfigured) return

  // Check if we have a local session
  const { data: { session: localSession } } = await supabase.auth.getSession()

  if (!localSession) {
    // No local session - check if another app logged in (shared cookie exists)
    const sharedRefreshToken = getSharedRefreshToken()
    if (sharedRefreshToken) {
      // Try to restore session from the shared refresh token
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: sharedRefreshToken,
      })
      if (error || !data.session) {
        // Invalid token - clear it
        console.warn('Failed to restore session from shared token:', error?.message)
        setSharedRefreshToken(null)
      }
    }
  }

  // Listen for auth changes to keep the shared cookie in sync
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      if (session?.refresh_token) {
        setSharedRefreshToken(session.refresh_token)
      }
    } else if (event === 'SIGNED_OUT') {
      setSharedRefreshToken(null)
    }
  })

  // Check for login/logout from other app when tab becomes visible
  const handleVisibilityChange = async () => {
    if (document.visibilityState === 'visible') {
      const { data: { session } } = await supabase.auth.getSession()
      const sharedToken = getSharedRefreshToken()

      // If we have a local session but no shared cookie, other app logged out
      if (session && !sharedToken) {
        await supabase.auth.signOut()
      }
      // If no local session but shared cookie exists, other app logged in
      else if (!session && sharedToken) {
        await supabase.auth.refreshSession({ refresh_token: sharedToken })
      }
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)
}
