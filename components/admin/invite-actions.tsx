"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowCounterClockwise, ProhibitInset, EnvelopeSimple } from "@phosphor-icons/react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import type { OwnerInviteStatus } from "./invite-status-badge"

interface InviteActionsProps {
  invite: {
    id: string
    status: OwnerInviteStatus
    invited_email: string
  }
  cafeId: string
}

export function InviteActions({ invite, cafeId }: InviteActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = React.useState<"resend" | "revoke" | null>(null)
  const [revokeOpen, setRevokeOpen] = React.useState(false)

  async function callEdgeFn(fn: string, body: Record<string, string>) {
    const supabase = createClient()
    const { error } = await supabase.functions.invoke(fn, { body })
    if (error) {
      let message = "Please try again"
      if (error instanceof Error) {
        message = error.message
      } else if (typeof error === "object" && error !== null && "message" in error) {
        message = String((error as { message: unknown }).message)
      }
      throw new Error(message)
    }
  }

  async function handleResend() {
    setLoading("resend")
    try {
      await callEdgeFn("resend-invite", { invite_id: invite.id })
      toast.success("Invite resent", {
        description: `A new onboarding email was sent to ${invite.invited_email}`,
      })
      router.refresh()
    } catch (err) {
      toast.error("Failed to resend invite", {
        description: err instanceof Error ? err.message : "Please try again",
      })
    } finally {
      setLoading(null)
    }
  }

  async function handleRevoke() {
    setLoading("revoke")
    try {
      await callEdgeFn("revoke-invite", { invite_id: invite.id })
      setRevokeOpen(false)
      toast.success("Invite revoked", {
        description: `${invite.invited_email}'s access has been removed`,
      })
      router.refresh()
    } catch (err) {
      setRevokeOpen(false)
      toast.error("Failed to revoke invite", {
        description: err instanceof Error ? err.message : "Please try again",
      })
    } finally {
      setLoading(null)
    }
  }

  const { status } = invite

  if (status === "accepted") {
    return null
  }

  if (status === "revoked") {
    return null
  }

  if (status === "expired") {
    return (
      <Button size="sm" variant="outline" asChild>
        <Link href={`/admin/cafes/${cafeId}/owner/new`}>
          <EnvelopeSimple className="size-3.5" />
          Send new invite
        </Link>
      </Button>
    )
  }

  // status === "sent" | "opened"
  return (
    <>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleResend}
          disabled={loading !== null}
        >
          <ArrowCounterClockwise className="size-3.5" />
          {loading === "resend" ? "Resending…" : "Resend"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-destructive hover:bg-destructive/10"
          onClick={() => setRevokeOpen(true)}
          disabled={loading !== null}
        >
          <ProhibitInset className="size-3.5" />
          Revoke
        </Button>
      </div>

      <AlertDialog open={revokeOpen} onOpenChange={setRevokeOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke invite?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel{" "}
              <span className="font-medium text-foreground">
                {invite.invited_email}
              </span>
              &apos;s invite and deactivate their account if they&apos;ve already
              started onboarding. This cannot be undone — you&apos;d need to send a
              new invite.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading === "revoke"}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              disabled={loading === "revoke"}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading === "revoke" ? "Revoking…" : "Revoke invite"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
