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
} from "@/components/ui/alert-dialog"
import {
  suspendUserAction,
  deleteUserAction,
} from "@/app/admin/users/actions"

type UserStatus = "Active" | "Suspended"

interface AppUser {
  id: string
  email: string | undefined
  full_name: string | null
  username: string | null
  avatar_url: string | null
  is_suspended: boolean
  created_at: string
  review_count: number
  fav_count: number
}

function getInitials(user: AppUser) {
  if (user.full_name) {
    return user.full_name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }
  return user.email?.[0].toUpperCase() ?? "?"
}

function getDisplayName(user: AppUser) {
  return user.full_name ?? user.username ?? user.email ?? "—"
}

function formatDate(isoString: string) {
  return new Date(isoString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
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

function DeleteAccountDialog({
  user,
  onClose,
}: {
  user: AppUser
  onClose: () => void
}) {
  const [confirmValue, setConfirmValue] = React.useState("")
  const [isPending, startTransition] = React.useTransition()

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
        <AlertDialogCancel
          onClick={() => {
            setConfirmValue("")
            onClose()
          }}
        >
          Cancel
        </AlertDialogCancel>
        <AlertDialogAction
          variant="destructive"
          disabled={confirmValue !== "DELETE" || isPending}
          onClick={() => {
            startTransition(async () => {
              try {
                await deleteUserAction(user.id)
                toast.success("User deleted")
                setConfirmValue("")
                onClose()
              } catch (error) {
                const message = error instanceof Error ? error.message : "Failed to delete user"
                toast.error(message)
              }
            })
          }}
        >
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  )
}

function SuspendDialog({
  user,
  onClose,
}: {
  user: AppUser
  onClose: () => void
}) {
  const [isPending, startTransition] = React.useTransition()

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Suspend user?</AlertDialogTitle>
        <AlertDialogDescription>
          This user will be locked out and all their reviews will be hidden.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
        <AlertDialogAction
          variant="destructive"
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              try {
                await suspendUserAction(user.id, true)
                toast.success("User suspended")
                onClose()
              } catch (error) {
                const message = error instanceof Error ? error.message : "Failed to suspend user"
                toast.error(message)
              }
            })
          }}
        >
          Suspend
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  )
}

type DialogMode = "suspend" | "delete" | null

function UserActions({ user }: { user: AppUser }) {
  const [dialogMode, setDialogMode] = React.useState<DialogMode>(null)
  const [isPending, startTransition] = React.useTransition()

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
              console.log(`Viewing reviews for ${getDisplayName(user)}`)
            }}
          >
            <Eye />
            View Reviews
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {!user.is_suspended && (
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
          {user.is_suspended && (
            <DropdownMenuItem
              disabled={isPending}
              onSelect={() => {
                startTransition(async () => {
                  try {
                    await suspendUserAction(user.id, false)
                    toast.success("User unsuspended")
                  } catch (error) {
                    const message = error instanceof Error ? error.message : "Failed to unsuspend user"
                    toast.error(message)
                  }
                })
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

      {dialogMode === "suspend" && (
        <SuspendDialog user={user} onClose={() => setDialogMode(null)} />
      )}
      {dialogMode === "delete" && (
        <DeleteAccountDialog user={user} onClose={() => setDialogMode(null)} />
      )}
    </AlertDialog>
  )
}

export function UsersClient({ users }: { users: AppUser[] }) {
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [sort, setSort] = React.useState("recent")

  const filtered = users
    .filter((user) => {
      const matchesSearch =
        search === "" ||
        getDisplayName(user).toLowerCase().includes(search.toLowerCase()) ||
        (user.email?.toLowerCase().includes(search.toLowerCase()) ?? false)

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && !user.is_suspended) ||
        (statusFilter === "suspended" && user.is_suspended)

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sort === "recent") {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      }
      if (sort === "reviews") {
        return b.review_count - a.review_count
      }
      if (sort === "az") {
        return getDisplayName(a).localeCompare(getDisplayName(b))
      }
      return 0
    })

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
          <Input
            className="pl-8"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={setSort}>
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
            {filtered.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground shrink-0">
                      {getInitials(user)}
                    </div>
                    <span className="text-sm font-medium">
                      {getDisplayName(user)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {user.email ?? "—"}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(user.created_at)}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-sm tabular-nums">
                    {user.review_count}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-sm tabular-nums">{user.fav_count}</span>
                </TableCell>
                <TableCell>
                  <StatusBadge
                    status={user.is_suspended ? "Suspended" : "Active"}
                  />
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
