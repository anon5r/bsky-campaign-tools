import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { Agent } from '@atproto/api'
import { client } from '../lib/auth'

interface AuthContextType {
  agent: Agent | null
  isAuthenticated: boolean
  isLoading: boolean
  userDid: string | null
  userHandle: string | null
  login: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [agent, setAgent] = useState<Agent | null>(null)
  const [userDid, setUserDid] = useState<string | null>(null)
  const [userHandle, setUserHandle] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function initAuth() {
      try {
        const result = await client.init()
        if (result) {
          // @ts-ignore - Session compatibility
          const newAgent = new Agent(result.session)
          setAgent(newAgent)
          setUserDid(result.session.did)
          // @ts-ignore
          setUserHandle(result.session.handle)
        }
      } catch (error) {
        console.error('Auth initialization failed', error)
      } finally {
        setIsLoading(false)
      }
    }
    initAuth()
  }, [])

  const login = useCallback(async () => {
    const handle = prompt('Enter your Bluesky handle (e.g. user.bsky.social):')
    if (!handle) return
    try {
      await client.signIn(handle, {
        state: 'undefined',
      })
    } catch (err) {
      console.error('Sign in failed', err)
    }
  }, [])

  const logout = useCallback(async () => {
    if (userDid) {
      // @ts-ignore
      if (client.revoke) await client.revoke(userDid) 
      // @ts-ignore
      else if (client.signOut) await client.signOut(userDid)
      
      setAgent(null)
      setUserDid(null)
      setUserHandle(null)
    }
  }, [userDid])

  return (
    <AuthContext.Provider value={{ agent, isAuthenticated: !!agent, isLoading, userDid, userHandle, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
