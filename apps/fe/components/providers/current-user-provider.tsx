"use client"

import type { User } from "@workspace/types/db"
import { createContext, useContext, useState } from "react"

type UserContextType = {
  user: User
  setUser: (user: User) => void
}

const CurrentUserContext = createContext<UserContextType | null>(null)

export function CurrentUserProvider({
  user: initialUser,
  children,
}: {
  user: User
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User>(initialUser)

  return (
    <CurrentUserContext.Provider value={{ user, setUser }}>
      {children}
    </CurrentUserContext.Provider>
  )
}

export function useCurrentUser() {
  const context = useContext(CurrentUserContext)

  if (!context) {
    throw new Error(
      "useCurrentUser phải được dùng bên trong CurrentUserProvider"
    )
  }

  return context
}
