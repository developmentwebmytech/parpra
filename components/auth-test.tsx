"use client"

import { useSession, signIn, signOut } from "next-auth/react"

export function AuthTest() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div className="p-4 bg-yellow-100 text-yellow-800 rounded-md">Loading authentication status...</div>
  }

  if (status === "authenticated") {
    return (
      <div className="p-4 bg-green-100 text-green-800 rounded-md">
        <p>Signed in as {session.user?.email}</p>
        <button className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md" onClick={() => signOut()}>
          Sign out
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 bg-red-100 text-red-800 rounded-md">
      <p>Not signed in</p>
      <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md" onClick={() => signIn()}>
        Sign in
      </button>
    </div>
  )
}
