import type { Metadata } from "next"
import { getUsers } from "@/lib/queries/users"

export const metadata: Metadata = { title: "Users" }
import { UsersClient } from "@/components/admin/users-client"

export default async function UsersPage() {
  const users = await getUsers()
  return <UsersClient users={users} />
}
