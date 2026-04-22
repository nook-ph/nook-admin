import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST() {
  const cookieStore = await cookies()

  // Build a server client that uses the owner's session (from cookies)
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

  // Fetch the most recent invite for this user
  const { data: invite, error: inviteError } = await admin
    .from("owner_invites")
    .select("id, status, cafe_id, role")
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

  if (invite.status === "revoked") {
    return NextResponse.json({ error: "Your invite has been revoked" }, { status: 403 })
  }

  // TODO(payments): When MFA is added at the payments gate, stop here (after
  // setting "password_set" and "opened") and redirect to MFA enrollment.
  // Only advance to "active" + "accepted" + link the cafe after TOTP is verified.

  // Step through intermediate states in order so any DB state-machine triggers
  // (which check OLD.status) are satisfied: invited → password_set → active.
  const { error: profilePwError } = await admin
    .from("profiles")
    .update({ account_status: "password_set", updated_at: now })
    .eq("id", user.id)

  if (profilePwError) {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }

  const { error: profileActiveError } = await admin
    .from("profiles")
    .update({ account_status: "active", updated_at: now })
    .eq("id", user.id)

  if (profileActiveError) {
    return NextResponse.json({ error: "Failed to activate profile" }, { status: 500 })
  }

  // Step through invite states: sent → opened → accepted.
  const { error: openedError } = await admin
    .from("owner_invites")
    .update({ status: "opened", opened_at: now })
    .eq("id", invite.id)

  if (openedError) {
    return NextResponse.json({ error: "Failed to update invite" }, { status: 500 })
  }

  const { error: acceptedError } = await admin
    .from("owner_invites")
    .update({ status: "accepted", used_at: now })
    .eq("id", invite.id)

  if (acceptedError) {
    return NextResponse.json({ error: "Failed to accept invite" }, { status: 500 })
  }

  // Link the cafe to the owner
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
    action: "onboarding_complete",
    target_type: "owner_invite",
    target_id: invite.id,
    metadata: { cafe_id: invite.cafe_id, role: invite.role },
  })

  return NextResponse.json({ success: true })
}
