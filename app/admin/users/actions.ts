"use server"

import { revalidatePath } from "next/cache"
import { suspendUser, deleteUser } from "@/lib/queries/users"
import { requireSuperadmin } from "@/lib/auth/require-superadmin"

export async function suspendUserAction(userId: string, suspend: boolean) {
  await requireSuperadmin()

  await suspendUser(userId, suspend)
  revalidatePath("/admin/users")
}

export async function deleteUserAction(userId: string) {
  await requireSuperadmin()

  await deleteUser(userId)
  revalidatePath("/admin/users")
}
