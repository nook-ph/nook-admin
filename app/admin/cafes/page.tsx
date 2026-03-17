"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Plus,
  MagnifyingGlass,
  Star,
  DotsThree,
  PencilSimple,
  Eye,
  IdentificationBadge,
  ArrowLineDown,
  ArrowLineUp,
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

type CafeStatus = "Active" | "Draft" | "Inactive"
type OwnerStatus = "Claimed" | "Unclaimed"

interface Cafe {
  id: string
  name: string
  neighborhood: string
  area: string
  status: CafeStatus
  owner: OwnerStatus
  rating: number | null
}

const CAFES: Cafe[] = [
  {
    id: "1",
    name: "Slowpoke Coffee",
    neighborhood: "IT Park, Cebu City",
    area: "IT Park",
    status: "Active",
    owner: "Claimed",
    rating: 4.9,
  },
  {
    id: "2",
    name: "Abaca Coffee Roasters",
    neighborhood: "Lahug, Cebu City",
    area: "Lahug",
    status: "Active",
    owner: "Claimed",
    rating: 4.8,
  },
  {
    id: "3",
    name: "Cafe Laguna",
    neighborhood: "Ayala, Cebu City",
    area: "Ayala",
    status: "Active",
    owner: "Unclaimed",
    rating: 4.7,
  },
  {
    id: "4",
    name: "Brewlab",
    neighborhood: "Talamban, Cebu City",
    area: "Talamban",
    status: "Draft",
    owner: "Unclaimed",
    rating: null,
  },
  {
    id: "5",
    name: "Coffee Madness",
    neighborhood: "Mabolo, Mandaue",
    area: "Mandaue",
    status: "Active",
    owner: "Claimed",
    rating: 4.6,
  },
  {
    id: "6",
    name: "The Usual Place",
    neighborhood: "Mango, Cebu City",
    area: "Mango",
    status: "Inactive",
    owner: "Unclaimed",
    rating: 4.3,
  },
]

function StatusBadge({ status }: { status: CafeStatus }) {
  if (status === "Active") {
    return (
      <Badge variant="outline">
        <span className="inline-block size-1.5 rounded-full bg-green-500 mr-1.5" />
        Active
      </Badge>
    )
  }
  if (status === "Draft") {
    return <Badge variant="secondary">Draft</Badge>
  }
  return (
    <Badge variant="outline" className="text-muted-foreground">
      Inactive
    </Badge>
  )
}

function OwnerBadge({ owner }: { owner: OwnerStatus }) {
  if (owner === "Claimed") {
    return (
      <Badge
        variant="outline"
        className="text-green-700 border-green-300 bg-green-50 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
      >
        Claimed
      </Badge>
    )
  }
  return (
    <Badge
      variant="outline"
      className="text-amber-700 border-amber-300 bg-amber-50 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800"
    >
      Unclaimed
    </Badge>
  )
}

function CafeActions({ cafe }: { cafe: Cafe }) {
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
          <DropdownMenuItem onClick={() => router.push(`/admin/cafes/${cafe.id}/edit`)}>
            <PencilSimple />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(`/admin/cafes/${cafe.id}/preview`)}>
            <Eye />
            Preview
          </DropdownMenuItem>
          {cafe.owner === "Unclaimed" && (
            <DropdownMenuItem
              onClick={() => router.push(`/admin/cafes/${cafe.id}/owner/new`)}
            >
              <IdentificationBadge />
              Create Owner Account
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          {cafe.status === "Active" && (
            <DropdownMenuItem>
              <ArrowLineDown />
              Deactivate
            </DropdownMenuItem>
          )}
          {cafe.status === "Inactive" && (
            <DropdownMenuItem>
              <ArrowLineUp />
              Activate
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              variant="destructive"
              onSelect={(e) => e.preventDefault()}
            >
              <Trash />
              Delete
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete cafe?</AlertDialogTitle>
          <AlertDialogDescription>
            This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default function CafesPage() {
  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      {/* Section 1 — Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Cafes</h1>
          <p className="text-muted-foreground text-sm">Manage all cafe listings</p>
        </div>
        <Button asChild>
          <Link href="/admin/cafes/new">
            <Plus />
            Add Cafe
          </Link>
        </Button>
      </div>

      {/* Section 2 — Filters and search */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input className="pl-8" placeholder="Search cafes..." />
        </div>

        <Select>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Area" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="it-park">IT Park</SelectItem>
            <SelectItem value="ayala">Ayala</SelectItem>
            <SelectItem value="lahug">Lahug</SelectItem>
            <SelectItem value="talamban">Talamban</SelectItem>
            <SelectItem value="mango">Mango</SelectItem>
            <SelectItem value="mandaue">Mandaue</SelectItem>
            <SelectItem value="south-cebu">South Cebu</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Owner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="claimed">Claimed</SelectItem>
            <SelectItem value="unclaimed">Unclaimed</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recently Added</SelectItem>
            <SelectItem value="az">A–Z</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="unclaimed">Unclaimed First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Section 3 — Cafe table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cafe</TableHead>
            <TableHead>Area</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {CAFES.map((cafe) => (
            <TableRow key={cafe.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-md bg-muted shrink-0" />
                  <div className="flex flex-col">
                    <Link
                      href={`/admin/cafes/${cafe.id}`}
                      className="font-medium text-sm hover:underline underline-offset-2"
                    >
                      {cafe.name}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {cafe.neighborhood}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>{cafe.area}</TableCell>
              <TableCell>
                <StatusBadge status={cafe.status} />
              </TableCell>
              <TableCell>
                <OwnerBadge owner={cafe.owner} />
              </TableCell>
              <TableCell>
                {cafe.rating !== null ? (
                  <span className="flex items-center gap-1">
                    <Star weight="fill" className="text-yellow-400 size-3.5" />
                    <span className="text-sm">{cafe.rating}</span>
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <CafeActions cafe={cafe} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
