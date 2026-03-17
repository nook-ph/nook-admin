"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
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

function OwnerLoginForm({ className }: React.ComponentProps<"div">) {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [showForgot, setShowForgot] = useState(false)
  const [showForceChange, setShowForceChange] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetSent, setResetSent] = useState(false)
  const [resetError, setResetError] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changeError, setChangeError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email || !password) {
      setLoginError("Please enter your email and password")
      return
    }
    setLoginError("")
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setLoginError("Invalid email or password")
      setLoading(false)
      return
    }

    const role = data.user?.app_metadata?.role
    if (role !== "cafe_owner") {
      await supabase.auth.signOut()
      setLoginError("No owner account found for this email")
      setLoading(false)
      return
    }

    const isFirstLogin = !data.user.user_metadata?.password_changed
    if (isFirstLogin) {
      setShowForceChange(true)
      setLoading(false)
      return
    }

    router.push("/owner/dashboard")
    router.refresh()
  }

  async function handleForgotPassword() {
    if (!resetEmail) {
      setResetError("Please enter your email address")
      return
    }
    setResetError("")

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/owner/reset-password`,
    })

    if (error) {
      setResetError(error.message)
      return
    }

    setResetSent(true)
    setShowForgot(false)
  }

  async function handleForcePasswordChange() {
    if (!newPassword || !confirmPassword) {
      setChangeError("Please fill in both fields")
      return
    }
    if (newPassword !== confirmPassword) {
      setChangeError("Passwords do not match")
      return
    }
    if (newPassword.length < 8) {
      setChangeError("Password must be at least 8 characters")
      return
    }
    setChangeError("")
    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
      data: { password_changed: true },
    })

    if (error) {
      setChangeError(error.message)
      setLoading(false)
      return
    }

    router.push("/owner/dashboard")
    router.refresh()
  }

  const imagePanel = (
    <div className="relative hidden bg-muted md:block">
      <img
        src="/placeholder.svg"
        alt="Image"
        className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
      />
    </div>
  )

  if (showForceChange) {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <form
              className="p-6 md:p-8"
              onSubmit={(e) => {
                e.preventDefault()
                handleForcePasswordChange()
              }}
            >
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Set your password</h1>
                  <p className="text-sm text-balance text-muted-foreground">
                    This is your first login. Please set a new password to
                    continue.
                  </p>
                </div>
                <Field>
                  <Field className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="new-password">
                        New password
                      </FieldLabel>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="confirm-password">
                        Confirm password
                      </FieldLabel>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </Field>
                  </Field>
                  <FieldDescription>
                    Must be at least 8 characters long.
                  </FieldDescription>
                  {changeError && <FieldError>{changeError}</FieldError>}
                </Field>
                <Field>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "Saving…" : "Set password"}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
            {imagePanel}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (showForgot) {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <form
              className="p-6 md:p-8"
              onSubmit={(e) => {
                e.preventDefault()
                handleForgotPassword()
              }}
            >
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Reset password</h1>
                  <p className="text-balance text-muted-foreground">
                    Enter your email and we&apos;ll send you a reset link.
                  </p>
                </div>
                <Field>
                  <FieldLabel htmlFor="reset-email">Email</FieldLabel>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="you@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                  {resetError && <FieldError>{resetError}</FieldError>}
                </Field>
                <Field>
                  <Button type="submit" className="w-full">
                    Send reset link
                  </Button>
                </Field>
                <FieldDescription className="text-center">
                  <button
                    type="button"
                    className="underline underline-offset-4 hover:text-primary"
                    onClick={() => {
                      setShowForgot(false)
                      setResetError("")
                      setResetEmail("")
                    }}
                  >
                    Back to login
                  </button>
                </FieldDescription>
              </FieldGroup>
            </form>
            {imagePanel}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            className="p-6 md:p-8"
            onSubmit={(e) => {
              e.preventDefault()
              handleLogin()
            }}
          >
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-balance text-muted-foreground">
                  Login to your Nook cafe portal
                </p>
              </div>
              {resetSent && (
                <FieldDescription className="rounded-md bg-muted px-3 py-2 text-center">
                  Password reset email sent. Check your inbox.
                </FieldDescription>
              )}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <button
                    type="button"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                    onClick={() => {
                      setShowForgot(true)
                      setResetSent(false)
                    }}
                  >
                    Forgot your password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {loginError && <FieldError>{loginError}</FieldError>}
              </Field>
              <Field>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in…" : "Login"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
          {imagePanel}
        </CardContent>
      </Card>
    </div>
  )
}

export default function OwnerLoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <OwnerLoginForm />
      </div>
    </div>
  )
}
