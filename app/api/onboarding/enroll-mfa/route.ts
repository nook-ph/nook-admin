// TODO(payments): This route is dormant — it is no longer called from the
// onboarding flow. When the payments feature ships, call this route from the
// payments MFA gate after the owner verifies their TOTP code. The route
// already handles profile activation, invite acceptance, and cafe linking.
import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const admin = createAdminClient()
  const now = new Date().toISOString()

  // Fetch the most recent invite to get cafe_id and invite id
  const { data: invite, error: inviteError } = await admin
    .from("owner_invites")
    .select("id, cafe_id, role, status")
    .eq("invited_profile_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (inviteError) {
    return NextResponse.json({ error: "Failed to fetch invite" }, { status: 500 })
  }
  if (!invite) {
    return NextResponse.json({ error: "No invite found for this account" }, { status: 404 })
  }

  // Update profile to active
  const { error: profileError } = await admin
    .from("profiles")
    .update({ account_status: "active", updated_at: now })
    .eq("id", user.id)

  if (profileError) {
    return NextResponse.json({ error: "Failed to activate profile" }, { status: 500 })
  }

  // Mark invite as accepted
  const { error: inviteUpdateError } = await admin
    .from("owner_invites")
    .update({ status: "accepted", used_at: now })
    .eq("id", invite.id)

  if (inviteUpdateError) {
    return NextResponse.json({ error: "Failed to update invite" }, { status: 500 })
  }

  // Insert cafe_owner_cafe link
  const { error: linkError } = await admin
    .from("cafe_owner_cafe")
    .upsert({
      owner_id: user.id,
      cafe_id: invite.cafe_id,
      role: invite.role,
      linked_at: now,
    })

  if (linkError) {
    return NextResponse.json({ error: "Failed to link cafe" }, { status: 500 })
  }

  // Write audit log
  await admin.from("audit_logs").insert({
    actor_type: "owner",
    actor_id: user.id,
    action: "mfa_enrolled",
    target_type: "owner_invite",
    target_id: invite.id,
    metadata: { cafe_id: invite.cafe_id, role: invite.role },
  })

  return NextResponse.json({ success: true })
}
