import { createClient } from "jsr:@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const VALID_ROLES = ["owner", "manager"] as const

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // ── Auth: verify superadmin caller ─────────────────────────────────────
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return json({ error: "Missing authorization header" }, 401)
    }

    // Verify the caller's JWT via the Auth server (supports ES256)
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    )

    const { data: { user: caller }, error: authError } =
      await userClient.auth.getUser()

    if (authError || !caller) {
      return json({ error: "Unauthorized" }, 401)
    }
    if (caller.app_metadata?.role !== "superadmin") {
      return json({ error: "Forbidden: superadmin only" }, 403)
    }

    // Separate admin client for privileged DB + Auth admin operations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    )

    // ── Parse & validate body ───────────────────────────────────────────────
    const body = await req.json()
    const { cafe_id, email, full_name, role } = body

    if (!cafe_id || !email || !full_name || !role) {
      return json({ error: "Missing required fields: cafe_id, email, full_name, role" }, 400)
    }
    if (!EMAIL_RE.test(email)) {
      return json({ error: "Invalid email address" }, 400)
    }
    if (!VALID_ROLES.includes(role)) {
      return json({ error: "Role must be 'owner' or 'manager'" }, 400)
    }

    // ── Verify cafe exists ──────────────────────────────────────────────────
    const { data: cafe, error: cafeError } = await supabase
      .from("cafes")
      .select("id")
      .eq("id", cafe_id)
      .single()

    if (cafeError || !cafe) {
      return json({ error: "Cafe not found" }, 404)
    }

    // ── Check for duplicate active invite ───────────────────────────────────
    const { data: existingInvite } = await supabase
      .from("owner_invites")
      .select("id, status")
      .eq("cafe_id", cafe_id)
      .eq("invited_email", email)
      .in("status", ["sent", "opened"])
      .maybeSingle()

    if (existingInvite) {
      return json(
        { error: "An active invite already exists for this email and cafe" },
        409,
      )
    }

    // ── Send invite email via Supabase Auth ─────────────────────────────────
    const siteUrl = Deno.env.get("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000"

    const { data: inviteData, error: inviteError } =
      await supabase.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${siteUrl}/onboarding/set-password`,
        data: { full_name },
      })

    if (inviteError) {
      // Supabase returns a specific message for existing users
      if (
        inviteError.message?.toLowerCase().includes("already") ||
        inviteError.message?.toLowerCase().includes("exists")
      ) {
        return json({ error: "A user with this email already exists" }, 409)
      }
      return json({ error: inviteError.message ?? "Failed to send invite" }, 500)
    }

    const invitedUser = inviteData.user
    if (!invitedUser) {
      return json({ error: "User creation failed" }, 500)
    }

    // ── Set role in app_metadata ────────────────────────────────────────────
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      invitedUser.id,
      { app_metadata: { role: "cafe_owner" } },
    )
    if (updateError) {
      return json({ error: "Failed to set user role" }, 500)
    }

    // ── Upsert profile ──────────────────────────────────────────────────────
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: invitedUser.id,
        email,
        full_name,
        account_status: "invited",
        updated_at: new Date().toISOString(),
      })

    if (profileError) {
      return json({ error: "Failed to create profile" }, 500)
    }

    // ── Insert owner_invites record ─────────────────────────────────────────
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    const { data: inviteRecord, error: inviteRecordError } = await supabase
      .from("owner_invites")
      .insert({
        cafe_id,
        invited_profile_id: invitedUser.id,
        invited_email: email,
        status: "sent",
        role,
        expires_at: expiresAt.toISOString(),
        sent_at: now.toISOString(),
        created_by: caller.id,
      })
      .select("id")
      .single()

    if (inviteRecordError || !inviteRecord) {
      return json({ error: "Failed to record invite" }, 500)
    }

    // ── Insert audit log ────────────────────────────────────────────────────
    await supabase.from("audit_logs").insert({
      actor_type: "superadmin",
      actor_id: caller.id,
      action: "invite_sent",
      target_type: "owner_invite",
      target_id: inviteRecord.id,
      metadata: { cafe_id, email, role, full_name },
    })

    return json({ invite_id: inviteRecord.id, user_id: invitedUser.id }, 200)
  } catch (err) {
    console.error("invite-owner error:", err)
    return json({ error: "Internal server error" }, 500)
  }
})

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}
