import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — keeps cookie alive
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const role = user?.app_metadata?.role

  // Not logged in — redirect to /login
  if (!user) {
    if (path.startsWith("/admin") || path.startsWith("/owner")) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    return supabaseResponse
  }

  // Logged in — redirect away from /login
  if (path === "/login") {
    if (role === "superadmin")
      return NextResponse.redirect(new URL("/admin/dashboard", request.url))
    if (role === "cafe_owner")
      return NextResponse.redirect(new URL("/owner/dashboard", request.url))
    // Has a session but no recognized role — sign out and show /login
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Wrong role for /admin/*
  if (path.startsWith("/admin") && role !== "superadmin") {
    return NextResponse.redirect(new URL("/owner/dashboard", request.url))
  }

  // Wrong role for /owner/*
  if (path.startsWith("/owner") && role !== "cafe_owner") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url))
  }

  // Onboarding gate: cafe_owner must complete password setup before accessing /owner/*
  if (path.startsWith("/owner") && role === "cafe_owner") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("account_status")
      .eq("id", user.id)
      .single()

    const status = profile?.account_status
    if (status === "invited") {
      return NextResponse.redirect(new URL("/onboarding/set-password", request.url))
    }
    // TODO(payments): Add a check here for /owner/payments/* routes once the
    // payments feature ships. If the owner has no verified TOTP factor, redirect
    // to /owner/payments/enroll-mfa?returnTo=/owner/payments before allowing
    // access. Use supabase.auth.mfa.listFactors() to check enrollment status.
    // "password_set" should not be reachable for new owners (the set-password
    // route advances directly to "active"), but redirect to dashboard as a
    // safe fallback for any accounts in that state.
    if (status === "password_set") {
      return NextResponse.redirect(new URL("/owner/dashboard", request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/login", "/admin/:path*", "/owner/:path*"],
}
