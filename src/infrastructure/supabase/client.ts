import { createClient } from '@supabase/supabase-js'
import type { Session, SupabaseClient } from '@supabase/supabase-js'
import type { AdminRole } from '@/features/admin/types'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// null when env vars are absent; ServiceFactory guarantees Supabase repos are only
// used when VITE_SUPABASE_URL is defined, so this path is never reached in practice.
export const supabase: SupabaseClient = url && anonKey
  ? createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true } })
  : (null as unknown as SupabaseClient)

export async function getCurrentUserRole(): Promise<AdminRole | null> {
  const { data } = await supabase.auth.getSession()
  const role = data.session?.user?.user_metadata?.role as AdminRole | undefined
  return role ?? null
}

export function getUserRoleFromSession(session: Session | null): AdminRole {
  return (session?.user?.user_metadata?.role as AdminRole) ?? 'admin'
}
