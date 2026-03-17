"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  EnvelopeSimple,
  CaretDown,
  CaretRight,
  Storefront,
  MapPin,
  MagnifyingGlass,
  Info,
  Check,
  UserCircleDashed,
} from "@phosphor-icons/react"

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

// ---------------------------------------------------------------------------
// Types & seed data
// ---------------------------------------------------------------------------

interface UnclaimedCafe {
  id: string
  name: string
  neighborhood: string
  status: "active" | "draft" | "inactive"
}

const UNCLAIMED_CAFES: UnclaimedCafe[] = [
  { id: "1", name: "Cafe Laguna",     neighborhood: "Ayala, Cebu City",    status: "active"   },
  { id: "2", name: "Brewlab",         neighborhood: "Talamban, Cebu City", status: "draft"    },
  { id: "3", name: "The Usual Place", neighborhood: "Mango, Cebu City",    status: "inactive" },
  { id: "4", name: "Coffee Madness",  neighborhood: "Mabolo, Mandaue",     status: "active"   },
  { id: "5", name: "Casa Breva",      neighborhood: "Lahug, Cebu City",    status: "active"   },
]

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

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
      {help && <p className="text-xs text-muted-foreground">{help}</p>}
    </div>
  )
}

function CafeStatusBadge({ status }: { status: UnclaimedCafe["status"] }) {
  if (status === "active") {
    return (
      <Badge variant="outline">
        <span className="inline-block size-1.5 rounded-full bg-green-500 mr-1.5" />
        Active
      </Badge>
    )
  }
  if (status === "draft") {
    return <Badge variant="secondary">Draft</Badge>
  }
  return (
    <Badge variant="outline" className="text-muted-foreground">
      Inactive
    </Badge>
  )
}

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------

function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {/* Step 1 */}
      <div className="flex items-center gap-2">
        <div
          className={`size-6 rounded-full text-xs font-medium flex items-center justify-center shrink-0 ${
            step === 2
              ? "bg-green-500 text-white"
              : "bg-primary text-primary-foreground"
          }`}
        >
          {step === 2 ? <Check className="size-3" /> : "1"}
        </div>
        <span
          className={`text-sm ${
            step === 1 ? "font-medium text-foreground" : "text-muted-foreground"
          }`}
        >
          Find cafe
        </span>
      </div>

      <div className="flex-1 h-px bg-border" />

      {/* Step 2 */}
      <div className="flex items-center gap-2">
        <div
          className={`size-6 rounded-full text-xs font-medium flex items-center justify-center shrink-0 ${
            step === 2
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          2
        </div>
        <span
          className={`text-sm ${
            step === 2 ? "font-medium text-foreground" : "text-muted-foreground"
          }`}
        >
          Owner details
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function NewOwnerPage() {
  const router = useRouter()

  // Two-step flow
  const [step, setStep] = React.useState<1 | 2>(1)
  const [selectedCafe, setSelectedCafe] = React.useState<UnclaimedCafe | null>(null)

  // Step 1 — search
  const [searchQuery, setSearchQuery] = React.useState("")

  // Step 2 — owner form
  const [ownerName, setOwnerName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [role, setRole] = React.useState("")
  const [note, setNote] = React.useState("")
  const [previewOpen, setPreviewOpen] = React.useState(false)
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [errors, setErrors] = React.useState<{
    ownerName?: string
    email?: string
    role?: string
  }>({})

  // Filtered cafe results
  const filteredCafes = UNCLAIMED_CAFES.filter((cafe) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      cafe.name.toLowerCase().includes(q) ||
      cafe.neighborhood.toLowerCase().includes(q)
    )
  })

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

  function handleBack() {
    setStep(1)
    setSelectedCafe(null)
    setOwnerName("")
    setEmail("")
    setRole("")
    setNote("")
    setErrors({})
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-8">
      {/* Page header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/owners">
            <ArrowLeft />
          </Link>
        </Button>
        <div className="flex flex-col gap-0.5">
          <h1 className="text-2xl font-semibold">Create Owner Account</h1>
          <p className="text-sm text-muted-foreground">
            Search for a cafe then send login credentials to its owner
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <StepIndicator step={step} />

      {/* ----------------------------------------------------------------
          STEP 1 — Cafe search
      ---------------------------------------------------------------- */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Find a cafe</CardTitle>
            <CardDescription>
              Search for the cafe you want to assign an owner to. Only
              unclaimed cafes are shown.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search input */}
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search by cafe name or neighborhood..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Results */}
            {filteredCafes.length > 0 ? (
              <div className="divide-y rounded-lg border overflow-hidden">
                {filteredCafes.map((cafe) => (
                  <button
                    key={cafe.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors w-full text-left"
                    onClick={() => {
                      setSelectedCafe(cafe)
                      setStep(2)
                    }}
                  >
                    <div className="size-9 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <Storefront className="size-4 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <p className="text-sm font-medium">{cafe.name}</p>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="size-3 text-muted-foreground shrink-0" />
                        <p className="text-xs text-muted-foreground truncate">
                          {cafe.neighborhood}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <CafeStatusBadge status={cafe.status} />
                      <CaretRight className="size-4 text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border px-4 py-8 text-center">
                <MagnifyingGlass className="size-5 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No unclaimed cafes found for &ldquo;{searchQuery}&rdquo;
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ----------------------------------------------------------------
          STEP 2 — Owner details
      ---------------------------------------------------------------- */}
      {step === 2 && selectedCafe && (
        <>
          {/* Selected cafe confirmation card */}
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950 mb-4">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-muted shrink-0 flex items-center justify-center">
                  <Storefront className="size-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col flex-1 gap-0.5 min-w-0">
                  <p className="text-sm font-semibold">{selectedCafe.name}</p>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="size-3 text-muted-foreground shrink-0" />
                    <p className="text-xs text-muted-foreground truncate">
                      {selectedCafe.neighborhood}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-auto shrink-0">
                  <Badge
                    variant="outline"
                    className="text-amber-700 border-amber-300 bg-amber-50 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800"
                  >
                    <UserCircleDashed className="size-3 mr-1.5" />
                    Unclaimed
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground h-auto py-1"
                    onClick={() => {
                      setStep(1)
                      setSelectedCafe(null)
                    }}
                  >
                    Change
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Owner details form card */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Owner details</CardTitle>
              <CardDescription>
                The owner will receive an email with their login credentials
                immediately after you send.
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
                    {selectedCafe.name} is now live on Nook — the curated
                    coffee discovery app for Cebu.
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
            <p className="text-xs text-muted-foreground max-w-[200px]">
              The owner receives this email immediately. This cannot be undone.
            </p>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="size-4 mr-1.5" />
                Back
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
                    ["Cafe",  selectedCafe?.name ?? "—"],
                    ["Owner", ownerName || "—"],
                    ["Email", email || "—"],
                    ["Role",  role ? role.charAt(0).toUpperCase() + role.slice(1) : "—"],
                  ] as [string, string][]
                ).map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    console.log(`Credentials sent to ${email}`)
                    setConfirmOpen(false)
                    setOwnerName("")
                    setEmail("")
                    setRole("")
                    setNote("")
                    setErrors({})
                    router.push("/admin/owners")
                  }}
                >
                  Send
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  )
}
