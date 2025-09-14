import { useSession } from "next-auth/react"
import { type Session } from "next-auth"

export function useAuth() {
  const { data: session, status } = useSession()
  
  return {
    session,
    status,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    accessToken: (session as Session & { accessToken?: string })?.accessToken
  }
}