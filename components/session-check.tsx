"use client"

import { useSession } from "next-auth/react"

export function SessionCheck() {
  const { data: session, status } = useSession()

  return (
    <div className="p-4 bg-muted rounded-md">
      <h3 className="font-medium mb-2">Session Status: {status}</h3>
      {session ? (
        <div>
          <p>Logged in as: {session.user?.name}</p>
          <p>Email: {session.user?.email}</p>
        </div>
      ) : (
        <p>Not logged in</p>
      )}
    </div>
  )
}
