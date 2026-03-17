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

type OwnerStatus = "Active" | "Never Logged In"

interface Owner {
  id: string
  email: string
  cafe: string
  created: string
  lastLogin: string
  status: OwnerStatus
}

const OWNERS: Owner[] = [
  {
    id: "1",
    email: "owner@slowpokecoffee.com",
    cafe: "Slowpoke Coffee",
    created: "Jan 12, 2025",
    lastLogin: "2 days ago",
    status: "Active",
  },
  {
    id: "2",
    email: "hello@abacacoffee.com",
    cafe: "Abaca Coffee Roasters",
    created: "Jan 15, 2025",
    lastLogin: "5 hours ago",
    status: "Active",
  },
  {
    id: "3",
    email: "manager@cafelaguna.com",
    cafe: "Cafe Laguna",
    created: "Feb 3, 2025",
    lastLogin: "Never",
    status: "Never Logged In",
  },
  {
    id: "4",
    email: "coffeeadness.cebu@gmail.com",
    cafe: "Coffee Madness",
    created: "Feb 10, 2025",
    lastLogin: "Never",
    status: "Never Logged In",
  },
  {
    id: "5",
    email: "brewlab.cebu@gmail.com",
    cafe: "Brewlab",
    created: "Mar 1, 2025",
    lastLogin: "3 weeks ago",
    status: "Active",
  },
]

function StatusBadge({ status }: { status: OwnerStatus }) {
  if (status === "Active") {
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

function OwnerActions({ owner }: { owner: Owner }) {
  const router = useRouter()

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
            onSelect={() => {
              console.log(`Credentials resent to ${owner.email}`)
            }}
          >
            <EnvelopeSimple />
            Resend Credentials
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              console.log(`Password reset email sent to ${owner.email}`)
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
          <AlertDialogAction variant="destructive">Revoke</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

const neverLoggedInCount = OWNERS.filter(
  (o) => o.status === "Never Logged In"
).length

export default function OwnersPage() {
  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      {/* Section 1 — Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Owners</h1>
          <p className="text-muted-foreground text-sm">
            Cafe owners with portal access
          </p>
        </div>
        <Button asChild>
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
          <Input className="pl-8" placeholder="Search by email or cafe name..." />
        </div>

        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Login Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="logged-in">Logged In</SelectItem>
            <SelectItem value="never">Never Logged In</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-[200px]">
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
              2 owners have never logged in
            </p>
            <p className="text-amber-700 dark:text-amber-300">
              Send them a follow-up message to make sure they received their
              credentials.
            </p>
          </div>
        </div>
      )}

      {/* Section 3 — Owners table */}
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
          {OWNERS.map((owner) => (
            <TableRow key={owner.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{owner.email}</span>
                  <span className="text-xs text-muted-foreground">Owner</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-md bg-muted shrink-0" />
                  <span className="text-sm">{owner.cafe}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {owner.created}
                </span>
              </TableCell>
              <TableCell>
                {owner.lastLogin === "Never" ? (
                  <span className="text-muted-foreground italic text-sm">
                    Never
                  </span>
                ) : (
                  <span className="text-sm">{owner.lastLogin}</span>
                )}
              </TableCell>
              <TableCell>
                <StatusBadge status={owner.status} />
              </TableCell>
              <TableCell className="text-right">
                <OwnerActions owner={owner} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
