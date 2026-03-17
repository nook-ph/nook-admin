"use server"

import { revalidatePath } from "next/cache"
import { suspendUser, deleteUser } from "@/lib/queries/users"

export async function suspendUserAction(userId: string, suspend: boolean) {
  await suspendUser(userId, suspend)
  revalidatePath("/admin/users")
}

export async function deleteUserAction(userId: string) {
  await deleteUser(userId)
  revalidatePath("/admin/users")
}
