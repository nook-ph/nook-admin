// TODO(payments): This page is dormant — it is no longer linked from the
// onboarding flow. When the payments feature ships, wire it to
// /owner/payments/enroll-mfa and update the post-enrollment redirect to read
// a `?returnTo` query param instead of hardcoding /owner/dashboard.
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

type Stage = "loading" | "qr" | "verifying" | "error"
type ErrorKind = "no-session" | "wrong-status" | "generic"

export default function OnboardingEnrollMfaPage() {
  const router = useRouter()
  const supabase = createClient()

  const [stage, setStage] = React.useState<Stage>("loading")
  const [errorKind, setErrorKind] = React.useState<ErrorKind>("generic")
  const [factorId, setFactorId] = React.useState("")
  const [qrCode, setQrCode] = React.useState("")
  const [secret, setSecret] = React.useState("")
  const [code, setCode] = React.useState("")
  const [formError, setFormError] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    async function init() {
      // 1. Verify session exists
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setErrorKind("no-session")
        setStage("error")
        return
      }

      // 2. Verify account_status is password_set
      const { data: profile } = await supabase
        .from("profiles")
        .select("account_status")
        .eq("id", session.user.id)
        .single()

      if (profile?.account_status !== "password_set") {
        if (profile?.account_status === "active") {
          router.replace("/owner/dashboard")
          return
        }
        setErrorKind("wrong-status")
        setStage("error")
        return
      }

      // 3. Enroll TOTP factor.
      // If an unverified factor already exists (e.g. page refresh mid-setup),
      // unenroll the stale one first so we can get a fresh QR code.
      let { data: enrollData, error: enrollError } =
        await supabase.auth.mfa.enroll({ factorType: "totp" })

      if (enrollError?.message?.includes("already exists")) {
        const { data: factorsData } = await supabase.auth.mfa.listFactors()
        const stale = factorsData?.totp?.find((f) => f.status !== "verified")
        if (stale) {
          await supabase.auth.mfa.unenroll({ factorId: stale.id })
          const retry = await supabase.auth.mfa.enroll({ factorType: "totp" })
          enrollData = retry.data
          enrollError = retry.error
        }
      }

      if (enrollError || !enrollData) {
        console.error("MFA enroll error:", enrollError)
        setErrorKind("generic")
        setStage("error")
        return
      }

      setFactorId(enrollData.id)
      setQrCode(enrollData.totp.qr_code)
      setSecret(enrollData.totp.secret)
      setStage("qr")
    }

    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setFormError("")

    if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
      setFormError("Enter the 6-digit code from your authenticator app")
      return
    }

    setSubmitting(true)
    try {
      // 1. Create challenge and verify the code
      const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code,
      })

      if (verifyError) {
        setFormError(
          verifyError.message.includes("Invalid")
            ? "Incorrect code. Please try again."
            : verifyError.message,
        )
        return
      }

      // 2. Update DB state via route handler
      const res = await fetch("/api/onboarding/enroll-mfa", { method: "POST" })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setFormError((body as { error?: string }).error ?? "Something went wrong")
        return
      }

      router.push("/owner/dashboard")
    } finally {
      setSubmitting(false)
    }
  }

  if (stage === "loading") {
    return (
      <Card>
        <CardContent className="p-8 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">Setting up two-factor authentication…</p>
        </CardContent>
      </Card>
    )
  }

  if (stage === "error") {
    const messages: Record<ErrorKind, { title: string; body: string }> = {
      "no-session": {
        title: "Session expired",
        body: "Your session has expired. Please start the onboarding process again.",
      },
      "wrong-status": {
        title: "Step unavailable",
        body: "Please complete setting your password before enrolling in two-factor authentication.",
      },
      generic: {
        title: "Something went wrong",
        body: "We couldn't set up two-factor authentication. Please try again or contact your admin.",
      },
    }
    const msg = messages[errorKind]
    return (
      <Card>
        <CardContent className="p-8 flex flex-col items-center gap-4 text-center">
          <h1 className="text-2xl font-bold">{msg.title}</h1>
          <p className="text-sm text-muted-foreground">{msg.body}</p>
          <Button variant="outline" onClick={() => router.push("/login")}>
            Back to login
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-8">
        <form onSubmit={handleVerify}>
          <FieldGroup>
            <div className="flex flex-col items-center gap-2 text-center mb-6">
              <h1 className="text-2xl font-bold">Set up two-factor authentication</h1>
              <p className="text-sm text-muted-foreground text-balance">
                Scan the QR code with your authenticator app (Google Authenticator,
                Authy, etc.), then enter the 6-digit code to verify.
              </p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center my-2">
              {qrCode ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrCode}
                  alt="TOTP QR code"
                  width={180}
                  height={180}
                  className="rounded-md border bg-white p-2"
                />
              ) : (
                <div className="size-44 rounded-md border bg-muted animate-pulse" />
              )}
            </div>

            {/* Manual secret fallback */}
            {secret && (
              <div className="rounded-md bg-muted px-4 py-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">
                  Can&apos;t scan? Enter this code manually:
                </p>
                <p className="font-mono text-sm font-medium tracking-widest break-all">
                  {secret}
                </p>
              </div>
            )}

            <Field>
              <FieldLabel htmlFor="totp-code">Verification code</FieldLabel>
              <Input
                id="totp-code"
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                autoComplete="one-time-code"
                className="text-center tracking-widest text-lg"
                required
              />
              <FieldDescription>
                Enter the 6-digit code from your authenticator app.
              </FieldDescription>
              {formError && <FieldError>{formError}</FieldError>}
            </Field>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Verifying…" : "Verify & activate account"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
