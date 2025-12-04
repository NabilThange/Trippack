"use client"

export interface SessionUser {
  id: string
  username: string
}

export function getClientSession(): SessionUser | null {
  if (typeof window === "undefined") return null

  const stored = localStorage.getItem("trippack_user")
  if (!stored) return null

  try {
    return JSON.parse(stored) as SessionUser
  } catch {
    return null
  }
}

export function setClientSession(user: SessionUser): void {
  localStorage.setItem("trippack_user", JSON.stringify(user))
}

export function clearClientSession(): void {
  localStorage.removeItem("trippack_user")
}
