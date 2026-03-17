"use server"

import { revalidatePath } from "next/cache"
import {
  createOwnerAccount,
  resendCredentials,
  revokeOwnerAccess,
} from "@/lib/queries/owners"

export async function createOwnerAccountAction(payload: {
  email: string
  full_name: string
  role: "owner" | "manager"
  cafe_id: string
}) {
  const result = await createOwnerAccount(payload)
  revalidatePath("/admin/owners")
  revalidatePath("/admin/cafes")
  return result
}

export async function resendCredentialsAction(ownerId: string) {
  await resendCredentials(ownerId)
}

export async function revokeOwnerAccessAction(
  ownerId: string,
  cafeId: string
) {
  await revokeOwnerAccess(ownerId, cafeId)
  revalidatePath("/admin/owners")
  revalidatePath("/admin/cafes")
}
