"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, EnvelopeSimple, CaretDown, Storefront, MapPin, Info } from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
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
import { createOwnerAccountAction } from "@/app/admin/owners/actions"

interface Cafe {
  id: string
  name: string
  neighborhood: string | null
  status: string
}

function FieldGroup({
  label,
  help,
  children,
}: {
  label: string
  help?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium leading-none">{label}</label>
      {children}
      {help && (
        <p className="text-xs text-muted-foreground">{help}</p>
      )}
    </div>
  )
}

interface CreateOwnerFormProps {
  cafe: Cafe
}

export function CreateOwnerForm({ cafe }: CreateOwnerFormProps) {
  const router = useRouter()

  const [ownerName, setOwnerName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [role, setRole] = React.useState("")
  const [note, setNote] = React.useState("")
  const [previewOpen, setPreviewOpen] = React.useState(false)
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<{
    ownerName?: string
    email?: string
    role?: string
  }>({})

  function validate() {
    const newErrors: typeof errors = {}
    if (!ownerName.trim())
      newErrors.ownerName = "Owner name is required"
    if (!email.trim())
      newErrors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Please enter a valid email address"
    if (!role)
      newErrors.role = "Please select a role"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSend() {
    setLoading(true)
    try {
      await createOwnerAccountAction({
        email,
        full_name: ownerName,
        role: role as "owner" | "manager",
        cafe_id: cafe.id,
      })
      setConfirmOpen(false)
      toast.success("Credentials sent", {
        description: `Login details sent to ${email}`,
      })
      router.push(`/admin/cafes/${cafe.id}`)
    } catch (err) {
      setConfirmOpen(false)
      toast.error("Failed to create owner account", {
        description: err instanceof Error ? err.message : "Please try again",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl w-full mx-auto px-6 py-8">
      {/* Page header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/admin/cafes/${cafe.id}`}>
            <ArrowLeft />
          </Link>
        </Button>
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold">Create Owner Account</h1>
          <p className="text-muted-foreground text-sm">
            Send login credentials to a cafe owner
          </p>
        </div>
      </div>

      {/* Linked cafe card */}
      <Card className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800 mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-md bg-muted shrink-0 flex items-center justify-center">
              <Storefront className="size-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <p className="font-medium text-sm">{cafe.name}</p>
              <div className="flex items-center gap-1">
                <MapPin className="size-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{cafe.neighborhood}</p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="ml-auto text-amber-700 border-amber-300 bg-amber-50 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800"
            >
              Unclaimed
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Form card */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Owner details</CardTitle>
          <CardDescription>
            The owner will receive an email with their login credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <FieldGroup
            label="Owner full name"
            help="Used to personalize the welcome email"
          >
            <Input
              placeholder="e.g. Maria Santos"
              value={ownerName}
              onChange={(e) => {
                setOwnerName(e.target.value)
                setErrors((prev) => ({ ...prev, ownerName: undefined }))
              }}
            />
            {errors.ownerName && (
              <p className="text-xs text-destructive">{errors.ownerName}</p>
            )}
          </FieldGroup>

          <FieldGroup
            label="Email address"
            help="This becomes their login — must be a real email they have access to"
          >
            <Input
              type="email"
              placeholder="e.g. owner@cafename.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setErrors((prev) => ({ ...prev, email: undefined }))
              }}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </FieldGroup>

          <FieldGroup
            label="Role"
            help="Owner has full edit access in Phase 1"
          >
            <Select
              value={role}
              onValueChange={(val) => {
                setRole(val)
                setErrors((prev) => ({ ...prev, role: undefined }))
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-xs text-destructive">{errors.role}</p>
            )}
          </FieldGroup>

          <FieldGroup
            label="Personal note (optional)"
            help="Added to the welcome email"
          >
            <Textarea
              placeholder="e.g. Great meeting you today at the cafe — here's your Nook listing!"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      {/* Email preview collapsible */}
      <Collapsible
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        className="mb-6"
      >
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            Preview welcome email
            <CaretDown
              className={`size-4 text-muted-foreground transition-transform duration-200 ${
                previewOpen ? "rotate-180" : ""
              }`}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="mt-2 font-mono text-xs bg-muted border-dashed">
            <CardContent className="pt-6 space-y-2 text-muted-foreground">
              <p>Subject: Your cafe is live on Nook 🎉</p>
              <Separator className="my-2" />
              <p>Hi {ownerName || "[Owner Name]"},</p>
              <p>&nbsp;</p>
              <p>
                {cafe.name} is now live on Nook — the curated coffee
                discovery app for Cebu.
              </p>
              <p>&nbsp;</p>
              <p>Dashboard: [web admin URL]</p>
              <p>Email: {email || "[their email]"}</p>
              <p>Temporary password: ••••••••••••</p>
              {note && (
                <>
                  <p>&nbsp;</p>
                  <p>{note}</p>
                </>
              )}
              <p>&nbsp;</p>
              <p>— The Nook Team</p>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Temp password info callout */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 mb-6 dark:border-amber-800 dark:bg-amber-950">
        <Info className="size-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
            About the temporary password
          </p>
          <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-0.5 list-disc list-inside">
            <li>Randomly generated — 12 characters</li>
            <li>Owner is prompted to change it on first login</li>
            <li>Expires after 7 days if unused</li>
            <li>
              Use &apos;Resend Credentials&apos; in Owner Management if it
              expires
            </li>
          </ul>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground max-w-[220px]">
          The owner will receive this email immediately after you click send.
        </p>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" asChild>
            <Link href={`/admin/cafes/${cafe.id}`}>Cancel</Link>
          </Button>
          <Button
            disabled={!ownerName.trim() || !email.trim()}
            onClick={() => {
              if (validate()) setConfirmOpen(true)
            }}
          >
            <EnvelopeSimple />
            Send Credentials
          </Button>
        </div>
      </div>

      {/* Confirm send dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send credentials?</AlertDialogTitle>
            <AlertDialogDescription>
              This will create an account for{" "}
              <span className="font-medium text-foreground">
                {email || "[email]"}
              </span>{" "}
              and send them the welcome email. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="rounded-lg bg-muted px-4 py-3 text-sm space-y-1.5 my-2">
            {(
              [
                ["Cafe", cafe.name],
                ["Owner", ownerName || "—"],
                ["Email", email || "—"],
                ["Role", role ? role.charAt(0).toUpperCase() + role.slice(1) : "—"],
              ] as [string, string][]
            ).map(([label, value]) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSend} disabled={loading}>
              {loading ? "Sending…" : "Send"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
