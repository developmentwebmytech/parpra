"use client"

import { useSearchParams } from "next/navigation"

export default function NotFoundClient() {
  const searchParams = useSearchParams()
  const debug = searchParams.get("debug")

  return (
    <div className="text-center flex flex-col justify-center items-center gap-7">
      <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
      {debug && <p className="text-gray-500">Debug: {debug}</p>}
    </div>
  )
}
