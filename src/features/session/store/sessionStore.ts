import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { SessionBootstrap } from '@/application'

export type SessionStatus = 'idle' | 'loading' | 'ready' | 'error'

interface SessionState {
  status: SessionStatus
  data: SessionBootstrap | null
  error: string | null
  setLoading: () => void
  setReady: (data: SessionBootstrap) => void
  setError: (error: string) => void
  reset: () => void
}

export const useSessionStore = create<SessionState>()(
  devtools(
    (set) => ({
      status: 'idle',
      data: null,
      error: null,
      setLoading: () => set({ status: 'loading', error: null }, false, 'session/setLoading'),
      setReady: (data) => set({ status: 'ready', data, error: null }, false, 'session/setReady'),
      setError: (error) => set({ status: 'error', error }, false, 'session/setError'),
      reset: () => set({ status: 'idle', data: null, error: null }, false, 'session/reset'),
    }),
    { name: 'SessionStore' },
  ),
)
