import type { Metadata } from "next"
import { getUsers } from "@/lib/data"
import { UsersTable } from "@/components/users/users-table"
import { UsersFilter } from "@/components/users/users-filter"

export const metadata: Metadata = {
  title: "Users | E-commerce Admin",
  description: "Manage your store users",
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; per_page?: string; name?: string; email?: string }>
}) {
  // Await the searchParams promise
  const searchParamsObj = await searchParams
  const searchParam = searchParamsObj || {}
  const page = Number(searchParam.page) || 1
  const per_page = Number(searchParam.per_page) || 10
  const name = searchParam.name || ""
  const email = searchParam.email || ""

  const { users, totalPages } = await getUsers({ page, per_page, name, email })

  return (
    <div className="flex-1 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-5xl font-bold tracking-tight">Users</h2>
      </div>

      <UsersFilter />

      <UsersTable users={users} totalPages={totalPages} page={page} per_page={per_page} />
    </div>
  )
}
