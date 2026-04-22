"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type Stage = "loading" | "form" | "error"
type ErrorKind = "expired" | "revoked" | "generic"

const PASSWORD_RE_UPPER = /[A-Z]/
const PASSWORD_RE_NUMBER = /[0-9]/

export default function OnboardingSetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()

  const [stage, setStage] = React.useState<Stage>("loading")
  const [errorKind, setErrorKind] = React.useState<ErrorKind>("generic")
  const [password, setPassword] = React.useState("")
  const [confirm, setConfirm] = React.useState("")
  const [formError, setFormError] = React.useState("")
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    async function init() {
      // 1. Try to establish session from hash tokens (invite link)
      const hash = window.location.hash
      const hashParams = new URLSearchParams(hash.slice(1))
      const accessToken = hashParams.get("access_token")
      const refreshToken = hashParams.get("refresh_token")

      if (accessToken && refreshToken) {
        const { data: { session }, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        // Strip tokens from URL immediately
        window.history.replaceState({}, "", window.location.pathname)

        if (error || !session) {
          setErrorKind("expired")
          setStage("error")
          return
        }
      } else {
        // No hash tokens — check for existing session
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          setErrorKind("expired")
          setStage("error")
          return
        }
      }

      // 2. Check profile status
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setErrorKind("expired")
        setStage("error")
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("account_status")
        .eq("id", user.id)
        .single()

      if (profile?.account_status === "active") {
        router.replace("/owner/dashboard")
        return
      }

      // 3. Check invite status — reject if revoked
      const { data: invite } = await supabase
        .from("owner_invites")
        .select("status")
        .eq("invited_profile_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (invite?.status === "revoked") {
        setErrorKind("revoked")
        setStage("error")
        return
      }

      setStage("form")
    }

    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function validate(): boolean {
    if (!password || !confirm) {
      setFormError("Please fill in both fields")
      return false
    }
    if (password.length < 8) {
      setFormError("Password must be at least 8 characters")
      return false
    }
    if (!PASSWORD_RE_UPPER.test(password)) {
      setFormError("Password must contain at least one uppercase letter")
      return false
    }
    if (!PASSWORD_RE_NUMBER.test(password)) {
      setFormError("Password must contain at least one number")
      return false
    }
    if (password !== confirm) {
      setFormError("Passwords do not match")
      return false
    }
    return true
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError("")
    if (!validate()) return

    setSaving(true)
    try {
      // 1. Set the password
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setFormError(updateError.message)
        return
      }

      // 2. Update DB state via route handler
      const res = await fetch("/api/onboarding/set-password", { method: "POST" })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setFormError((body as { error?: string }).error ?? "Something went wrong")
        return
      }

      // TODO(payments): When the payments feature ships, redirect to MFA
      // enrollment here before going to the dashboard, then gate access to
      // /owner/payments behind a verified TOTP factor check.
      router.push("/owner/dashboard")
    } finally {
      setSaving(false)
    }
  }

  if (stage === "loading") {
    return (
      <Card>
        <CardContent className="p-8 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">Verifying your invite link…</p>
        </CardContent>
      </Card>
    )
  }

  if (stage === "error") {
    const messages: Record<ErrorKind, { title: string; body: string }> = {
      expired: {
        title: "Link expired",
        body: "This invite link has expired or already been used. Please contact your admin for a new one.",
      },
      revoked: {
        title: "Account deactivated",
        body: "Your invite has been revoked. Please contact your admin.",
      },
      generic: {
        title: "Something went wrong",
        body: "We couldn't verify your link. Please contact your admin.",
      },
    }
    const msg = messages[errorKind]
    return (
      <Card>
        <CardContent className="p-8 flex flex-col items-center gap-4 text-center">
          <h1 className="text-2xl font-bold">{msg.title}</h1>
          <p className="text-sm text-muted-foreground">{msg.body}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <div className="flex flex-col items-center gap-2 text-center mb-6">
              <h1 className="text-2xl font-bold">Create your password</h1>
              <p className="text-sm text-muted-foreground text-balance">
                Choose a strong password to secure your account.
              </p>
            </div>

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="confirm">Confirm password</FieldLabel>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                required
              />
              <FieldDescription>
                At least 8 characters with one uppercase letter and one number.
              </FieldDescription>
              {formError && <FieldError>{formError}</FieldError>}
            </Field>

            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Saving…" : "Set password & continue"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
