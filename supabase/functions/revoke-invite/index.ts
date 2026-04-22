import { createClient } from "jsr:@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"

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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    )

    // ── Parse & validate body ───────────────────────────────────────────────
    const body = await req.json()
    const { invite_id } = body

    if (!invite_id) {
      return json({ error: "Missing required field: invite_id" }, 400)
    }

    // ── Fetch invite ────────────────────────────────────────────────────────
    const { data: invite, error: fetchError } = await supabase
      .from("owner_invites")
      .select("id, invited_profile_id, status, cafe_id, invited_email")
      .eq("id", invite_id)
      .single()

    if (fetchError || !invite) {
      return json({ error: "Invite not found" }, 404)
    }

    if (!["sent", "opened"].includes(invite.status)) {
      const messages: Record<string, string> = {
        accepted: "This invite has already been accepted and cannot be revoked",
        revoked: "This invite has already been revoked",
        expired: "This invite has already expired",
        failed: "This invite failed and cannot be revoked",
      }
      return json(
        { error: messages[invite.status] ?? `Invite cannot be revoked (status: ${invite.status})` },
        400,
      )
    }

    // ── Revoke invite ───────────────────────────────────────────────────────
    const now = new Date().toISOString()

    const { error: revokeError } = await supabase
      .from("owner_invites")
      .update({ status: "revoked", revoked_at: now })
      .eq("id", invite_id)

    if (revokeError) {
      return json({ error: "Failed to revoke invite" }, 500)
    }

    // ── Suspend profile ─────────────────────────────────────────────────────
    if (invite.invited_profile_id) {
      await supabase
        .from("profiles")
        .update({
          account_status: "suspended",
          is_suspended: true,
          updated_at: now,
        })
        .eq("id", invite.invited_profile_id)
    }

    // ── Insert audit log ────────────────────────────────────────────────────
    await supabase.from("audit_logs").insert({
      actor_type: "superadmin",
      actor_id: caller.id,
      action: "invite_revoked",
      target_type: "owner_invite",
      target_id: invite_id,
      metadata: {
        email: invite.invited_email,
        cafe_id: invite.cafe_id,
        profile_id: invite.invited_profile_id,
      },
    })

    return json({ success: true }, 200)
  } catch (err) {
    console.error("revoke-invite error:", err)
    return json({ error: "Internal server error" }, 500)
  }
})

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}
