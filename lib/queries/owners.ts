import { createAdminClient } from "@/lib/supabase/admin"

export async function getOwners() {
  const supabase = createAdminClient()

  const { data: { users }, error } =
    await supabase.auth.admin.listUsers()
  if (error) throw error

  const owners = users.filter(
    u => u.app_metadata?.role === "cafe_owner"
  )

  const { data: links } = await supabase
    .from("cafe_owner_cafe")
    .select(`
      owner_id, role,
      cafes ( id, name, neighborhood, status )
    `)

  return owners.map(user => ({
    id:               user.id,
    email:            user.email,
    created_at:       user.created_at,
    last_sign_in_at:  user.last_sign_in_at,
    linked_cafes:     links?.filter(
                        l => l.owner_id === user.id
                      ) ?? [],
  }))
}

export async function createOwnerAccount(payload: {
  email: string
  full_name: string
  role: "owner" | "manager"
  cafe_id: string
}) {
  const supabase = createAdminClient()

  const tempPassword = Array.from(
    crypto.getRandomValues(new Uint8Array(9))
  ).map(b => b.toString(36)).join("").slice(0, 12)

  const { data: { user }, error: authError } =
    await supabase.auth.admin.createUser({
      email: payload.email,
      password: tempPassword,
      app_metadata: { role: "cafe_owner" },
      user_metadata: {
        full_name: payload.full_name,
        password_changed: false,
      },
      email_confirm: true,
    })

  if (authError) throw authError
  if (!user) throw new Error("User creation failed")

  const { error: linkError } = await supabase
    .from("cafe_owner_cafe")
    .insert({
      owner_id: user.id,
      cafe_id: payload.cafe_id,
      role: payload.role,
    })

  if (linkError) throw linkError

  return { userId: user.id, tempPassword }
}

export async function resendCredentials(ownerId: string) {
  const supabase = createAdminClient()
  const { data: { user } } =
    await supabase.auth.admin.getUserById(ownerId)
  if (!user?.email) throw new Error("Owner not found")

  const { error } = await supabase.auth.resetPasswordForEmail(
    user.email
  )
  if (error) throw error
}

export async function revokeOwnerAccess(
  ownerId: string,
  cafeId: string
) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from("cafe_owner_cafe")
    .delete()
    .match({ owner_id: ownerId, cafe_id: cafeId })

  if (error) throw error
}
