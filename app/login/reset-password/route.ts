import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(new URL("/login/set-password", request.url))
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(
      new URL("/login/set-password?error=link_expired", request.url)
    )
  }

  return NextResponse.redirect(new URL("/login/set-password", request.url))
}
