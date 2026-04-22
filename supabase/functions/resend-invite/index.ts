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
      .select("id, invited_email, status, cafe_id")
      .eq("id", invite_id)
      .single()

    if (fetchError || !invite) {
      return json({ error: "Invite not found" }, 404)
    }

    if (!["sent", "opened"].includes(invite.status)) {
      const messages: Record<string, string> = {
        accepted: "This invite has already been accepted",
        expired: "This invite has expired — send a new invite instead",
        revoked: "This invite has been revoked",
        failed: "This invite failed — send a new invite instead",
      }
      return json(
        { error: messages[invite.status] ?? `Invite cannot be resent (status: ${invite.status})` },
        400,
      )
    }

    // ── Resend invite email ─────────────────────────────────────────────────
    const siteUrl = Deno.env.get("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000"

    const { error: resendError } = await supabase.auth.admin.inviteUserByEmail(
      invite.invited_email,
      { redirectTo: `${siteUrl}/onboarding/set-password` },
    )

    if (resendError) {
      return json({ error: resendError.message ?? "Failed to resend invite" }, 500)
    }

    // ── Update owner_invites ────────────────────────────────────────────────
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    const { error: updateError } = await supabase
      .from("owner_invites")
      .update({
        status: "sent",
        sent_at: now.toISOString(),
        resent_by: caller.id,
        resent_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .eq("id", invite_id)

    if (updateError) {
      return json({ error: "Failed to update invite record" }, 500)
    }

    // ── Insert audit log ────────────────────────────────────────────────────
    await supabase.from("audit_logs").insert({
      actor_type: "superadmin",
      actor_id: caller.id,
      action: "invite_resent",
      target_type: "owner_invite",
      target_id: invite_id,
      metadata: { email: invite.invited_email, cafe_id: invite.cafe_id },
    })

    return json({ success: true }, 200)
  } catch (err) {
    console.error("resend-invite error:", err)
    return json({ error: "Internal server error" }, 500)
  }
})

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}
