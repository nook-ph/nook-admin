import { createClient } from "@/lib/supabase/server"

/**
 * Authorization gate for every server action in this app.
 *
 * Middleware is NOT sufficient. Next.js dispatches a server action by its
 * action id to whatever URL the request is POSTed to — not to the route the
 * action was defined in. Our matcher is ["/login", "/admin/:path*"], so a POST
 * to "/" or "/signup" carrying a Next-Action header never runs middleware. Any
 * action that reaches for createAdminClient() then runs with the service role
 * and RLS bypassed. Middleware is a UX redirect; this is the security boundary.
 *
 * Reads app_metadata.role, which only the service role can write — a user
 * cannot set it via signUp or updateUser (user_metadata would be forgeable).
 *
 * Throws rather than returning a result so a caller cannot forget to check it.
 */
export async function requireSuperadmin() {
  const supabase = await createClient()

  // getUser() validates against the auth server. getSession() would only decode
  // the cookie, which the client controls.
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    throw new Error("auth_required")
  }
  if (data.user.app_metadata?.role !== "superadmin") {
    throw new Error("not_authorized")
  }

  return { supabase, userId: data.user.id }
}
