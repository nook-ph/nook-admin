"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  IdentificationBadge,
  MagnifyingGlass,
  DotsThree,
  EnvelopeSimple,
  LockKey,
  Eye,
  UserCircleMinus,
  WarningCircle,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  resendCredentialsAction,
  revokeOwnerAccessAction,
} from "@/app/admin/owners/actions"

type LinkedCafe = {
  owner_id: string
  role: string
  cafes: {
    id: string
    name: string
    neighborhood: string
    status: string
  } | null
}

type OwnerRow = {
  id: string
  email: string
  linkedCafes: LinkedCafe[]
  created: string
  lastLogin: string
  neverLoggedIn: boolean
}

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks}w ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

function StatusBadge({ neverLoggedIn }: { neverLoggedIn: boolean }) {
  if (!neverLoggedIn) {
    return (
      <Badge
        variant="outline"
        className="text-green-700 border-green-300 bg-green-50 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
      >
        Active
      </Badge>
    )
  }
  return (
    <Badge
      variant="outline"
      className="text-red-700 border-red-300 bg-red-50 dark:bg-red-950 dark:text-red-400 dark:border-red-800"
    >
      <WarningCircle className="size-3 mr-1" />
      Never Logged In
    </Badge>
  )
}

function OwnerActions({ owner }: { owner: OwnerRow }) {
  const router = useRouter()
  const firstCafeId = owner.linkedCafes[0]?.cafes?.id

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <DotsThree weight="bold" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={async () => {
              try {
                await resendCredentialsAction(owner.id)
                toast.success("Credentials resent", {
                  description: `Password reset email sent to ${owner.email}`,
                })
              } catch {
                toast.error("Failed to resend credentials")
              }
            }}
          >
            <EnvelopeSimple />
            Resend Credentials
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={async () => {
              try {
                await resendCredentialsAction(owner.id)
                toast.success("Password reset sent", {
                  description: `Reset link sent to ${owner.email}`,
                })
              } catch {
                toast.error("Failed to send reset email")
              }
            }}
          >
            <LockKey />
            Reset Password
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push(`/admin/owners/${owner.id}`)}>
            <Eye />
            View Detail
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              variant="destructive"
              onSelect={(e) => e.preventDefault()}
            >
              <UserCircleMinus />
              Revoke Access
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Revoke access?</AlertDialogTitle>
          <AlertDialogDescription>
            This owner will no longer be able to log in or edit their listing.
            This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={async () => {
              if (!firstCafeId) return
              try {
                await revokeOwnerAccessAction(owner.id, firstCafeId)
                toast.success("Access revoked")
              } catch {
                toast.error("Failed to revoke access")
              }
            }}
          >
            Revoke
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

interface OwnersClientProps {
  owners: {
    id: string
    email: string | undefined
    created_at: string
    last_sign_in_at: string | null | undefined
    linked_cafes: LinkedCafe[]
  }[]
}

export function OwnersClient({ owners }: OwnersClientProps) {
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [sort, setSort] = React.useState("recent")

  const rows: OwnerRow[] = owners.map(owner => ({
    id:           owner.id,
    email:        owner.email ?? "",
    linkedCafes:  owner.linked_cafes,
    created:      new Date(owner.created_at).toLocaleDateString(),
    lastLogin:    owner.last_sign_in_at
                    ? formatRelativeTime(owner.last_sign_in_at)
                    : "Never",
    neverLoggedIn: !owner.last_sign_in_at,
  }))

  const filtered = rows
    .filter(o => {
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        o.email.toLowerCase().includes(q) ||
        o.linkedCafes.some(lc =>
          lc.cafes?.name.toLowerCase().includes(q)
        )
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "logged-in" && !o.neverLoggedIn) ||
        (statusFilter === "never" && o.neverLoggedIn)
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sort === "never-first") {
        return Number(b.neverLoggedIn) - Number(a.neverLoggedIn)
      }
      return 0
    })

  const neverLoggedInCount = rows.filter(o => o.neverLoggedIn).length

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 px-4 py-6 lg:px-6">
      {/* Section 1 — Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Owners</h1>
          <p className="text-muted-foreground text-sm">
            Cafe owners with portal access
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/admin/owners/new">
            <IdentificationBadge />
            Create Owner Account
          </Link>
        </Button>
      </div>

      {/* Section 2 — Search and filter bar */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-8"
            placeholder="Search by email or cafe name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Login Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="logged-in">Logged In</SelectItem>
            <SelectItem value="never">Never Logged In</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recently Created</SelectItem>
            <SelectItem value="last-login">Last Login</SelectItem>
            <SelectItem value="never-first">Never Logged In First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Callout banner — shown when any owners have never logged in */}
      {neverLoggedInCount > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-800 dark:bg-amber-950">
          <WarningCircle className="size-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div className="flex flex-col gap-1">
            <p className="font-medium text-amber-900 dark:text-amber-100">
              {neverLoggedInCount} {neverLoggedInCount === 1 ? "owner has" : "owners have"} never logged in
            </p>
            <p className="text-amber-700 dark:text-amber-300">
              Send them a follow-up message to make sure they received their
              credentials.
            </p>
          </div>
        </div>
      )}

      {/* Section 3 — Owners table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Owner</TableHead>
              <TableHead>Linked Cafe</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((owner) => (
              <TableRow key={owner.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{owner.email}</span>
                    <span className="text-xs text-muted-foreground">
                      {owner.linkedCafes[0]?.role
                        ? owner.linkedCafes[0].role.charAt(0).toUpperCase() +
                          owner.linkedCafes[0].role.slice(1)
                        : "Owner"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {owner.linkedCafes.length === 0 ? (
                    <span className="text-sm text-muted-foreground italic">None</span>
                  ) : (
                    <div className="flex flex-col gap-1">
                      {owner.linkedCafes.map(lc => (
                        <div key={lc.cafes?.id} className="flex items-center gap-2">
                          <div className="size-7 rounded-md bg-muted shrink-0" />
                          <span className="text-sm">{lc.cafes?.name ?? "—"}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {owner.created}
                  </span>
                </TableCell>
                <TableCell>
                  {owner.neverLoggedIn ? (
                    <span className="text-muted-foreground italic text-sm">
                      Never
                    </span>
                  ) : (
                    <span className="text-sm">{owner.lastLogin}</span>
                  )}
                </TableCell>
                <TableCell>
                  <StatusBadge neverLoggedIn={owner.neverLoggedIn} />
                </TableCell>
                <TableCell className="text-right">
                  <OwnerActions owner={owner} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
