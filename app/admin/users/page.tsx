"use client"

import * as React from "react"
import {
  MagnifyingGlass,
  DotsThree,
  Eye,
  Prohibit,
  ArrowCounterClockwise,
  Trash,
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

type UserStatus = "Active" | "Suspended"

interface AppUser {
  id: string
  name: string
  email: string
  joined: string
  reviews: number
  favorites: number
  status: UserStatus
}

const USERS: AppUser[] = [
  {
    id: "1",
    name: "Jana Cruz",
    email: "jana.cruz@gmail.com",
    joined: "Jan 8, 2025",
    reviews: 12,
    favorites: 24,
    status: "Active",
  },
  {
    id: "2",
    name: "Marco Reyes",
    email: "marcoreyes@gmail.com",
    joined: "Jan 14, 2025",
    reviews: 8,
    favorites: 15,
    status: "Active",
  },
  {
    id: "3",
    name: "Bea Santos",
    email: "beasantos@gmail.com",
    joined: "Feb 2, 2025",
    reviews: 31,
    favorites: 40,
    status: "Active",
  },
  {
    id: "4",
    name: "Nico Lim",
    email: "nico.lim@gmail.com",
    joined: "Feb 19, 2025",
    reviews: 2,
    favorites: 5,
    status: "Suspended",
  },
  {
    id: "5",
    name: "Trish Villanueva",
    email: "trishv@gmail.com",
    joined: "Mar 3, 2025",
    reviews: 19,
    favorites: 33,
    status: "Active",
  },
  {
    id: "6",
    name: "Kobe Tan",
    email: "kobet@gmail.com",
    joined: "Mar 10, 2025",
    reviews: 0,
    favorites: 2,
    status: "Active",
  },
]

function getInitials(name: string) {
  const parts = name.trim().split(" ")
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function StatusBadge({ status }: { status: UserStatus }) {
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
      Suspended
    </Badge>
  )
}

function DeleteAccountDialog({ user }: { user: AppUser }) {
  const [confirmValue, setConfirmValue] = React.useState("")

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete account?</AlertDialogTitle>
        <AlertDialogDescription>
          Type DELETE to confirm. This removes all reviews, favorites, and
          cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <Input
        placeholder="Type DELETE"
        value={confirmValue}
        onChange={(e) => setConfirmValue(e.target.value)}
      />
      <AlertDialogFooter>
        <AlertDialogCancel onClick={() => setConfirmValue("")}>
          Cancel
        </AlertDialogCancel>
        <AlertDialogAction
          variant="destructive"
          disabled={confirmValue !== "DELETE"}
          onClick={() => setConfirmValue("")}
        >
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  )
}

function SuspendDialog() {
  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Suspend user?</AlertDialogTitle>
        <AlertDialogDescription>
          This user will be locked out and all their reviews will be hidden.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction variant="destructive">Suspend</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  )
}

type DialogMode = "suspend" | "delete" | null

function UserActions({ user }: { user: AppUser }) {
  const [dialogMode, setDialogMode] = React.useState<DialogMode>(null)

  return (
    <AlertDialog
      open={dialogMode !== null}
      onOpenChange={(open) => {
        if (!open) setDialogMode(null)
      }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <DotsThree weight="bold" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={() => {
              console.log(`Viewing reviews for ${user.name}`)
            }}
          >
            <Eye />
            View Reviews
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {user.status === "Active" && (
            <DropdownMenuItem
              variant="destructive"
              onSelect={(e) => {
                e.preventDefault()
                setDialogMode("suspend")
              }}
            >
              <Prohibit />
              Suspend User
            </DropdownMenuItem>
          )}
          {user.status === "Suspended" && (
            <DropdownMenuItem
              onSelect={() => {
                console.log(`${user.name} has been unsuspended`)
              }}
            >
              <ArrowCounterClockwise />
              Unsuspend User
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={(e) => {
              e.preventDefault()
              setDialogMode("delete")
            }}
          >
            <Trash />
            Delete Account
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {dialogMode === "suspend" && <SuspendDialog />}
      {dialogMode === "delete" && <DeleteAccountDialog user={user} />}
    </AlertDialog>
  )
}

export default function UsersPage() {
  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 px-4 py-6 lg:px-6">
      {/* Section 1 — Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Users</h1>
          <p className="text-muted-foreground text-sm">
            All registered app users
          </p>
        </div>
      </div>

      {/* Section 2 — Search bar */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input className="pl-8" placeholder="Search by name or email..." />
        </div>

        <Select>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recently Joined</SelectItem>
            <SelectItem value="reviews">Most Reviews</SelectItem>
            <SelectItem value="az">A–Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Section 3 — Users table */}
      <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-center">Reviews</TableHead>
            <TableHead className="text-center">Favorites</TableHead>
            <TableHead>Status</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {USERS.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground shrink-0">
                    {getInitials(user.name)}
                  </div>
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {user.joined}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <span className="text-sm tabular-nums">{user.reviews}</span>
              </TableCell>
              <TableCell className="text-center">
                <span className="text-sm tabular-nums">{user.favorites}</span>
              </TableCell>
              <TableCell>
                <StatusBadge status={user.status} />
              </TableCell>
              <TableCell className="text-right">
                <UserActions user={user} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    </div>
  )
}
