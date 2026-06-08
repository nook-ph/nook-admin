"use client"

import * as React from "react"
import {
  MagnifyingGlass,
  MapPin,
  Flag,
  FlagBanner,
  ArrowCounterClockwise,
  Prohibit,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { CrawlStamp, CrawlStopWithCafe } from "@/lib/types/crawls"
import { getCrawlStamps } from "@/lib/queries/crawls"
import { StampMethodBadge } from "@/components/admin/crawls/stamp-method-badge"
import { StampVerifiedIndicator } from "@/components/admin/crawls/stamp-verified-indicator"
import { GrantManualStampDialog } from "@/components/admin/crawls/grant-manual-stamp-dialog"
import { RevokeStampDialog } from "@/components/admin/crawls/revoke-stamp-dialog"
import { RestoreStampDialog } from "@/components/admin/crawls/restore-stamp-dialog"
import { Skeleton } from "@/components/ui/skeleton"

const PAGE_SIZE = 8

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getStopLabel(stopId: string, stops: CrawlStopWithCafe[]) {
  const stop = stops.find((s) => s.id === stopId)
  if (!stop) return "Unknown"
  return `Stop ${stop.stop_order} · ${stop.cafe_name}`
}

function getInitials(username: string) {
  return username.slice(0, 2).toUpperCase()
}

export function StampsLogTab({
  crawlId,
  stops,
}: {
  crawlId: string
  stops: CrawlStopWithCafe[]
}) {
  const [stamps, setStamps] = React.useState<CrawlStamp[]>([])
  const [loading, setLoading] = React.useState(true)

  const [search, setSearch] = React.useState("")
  const [stopFilter, setStopFilter] = React.useState("all")
  const [methodFilter, setMethodFilter] = React.useState("all")
  const [verifiedFilter, setVerifiedFilter] = React.useState("all")
  const [dateFrom, setDateFrom] = React.useState("")
  const [dateTo, setDateTo] = React.useState("")
  const [page, setPage] = React.useState(1)

  const [flaggedIds, setFlaggedIds] = React.useState<Set<string>>(new Set())

  const [grantOpen, setGrantOpen] = React.useState(false)
  const [revokingStamp, setRevokingStamp] =
    React.useState<CrawlStamp | null>(null)
  const [restoringStamp, setRestoringStamp] =
    React.useState<CrawlStamp | null>(null)

  React.useEffect(() => {
    setLoading(true)
    getCrawlStamps(crawlId)
      .then((data) => {
        setStamps(data)
        setLoading(false)
      })
      .catch(() => {
        toast.error("Something went wrong")
        setLoading(false)
      })
  }, [crawlId])

  const filtered = React.useMemo(() => {
    let result = [...stamps]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (s) =>
          s.user_id.toLowerCase().includes(q)
      )
    }

    if (stopFilter !== "all") {
      result = result.filter((s) => s.stop_id === stopFilter)
    }

    if (methodFilter !== "all") {
      result = result.filter((s) => s.claim_method === methodFilter)
    }

    if (verifiedFilter !== "all") {
      if (verifiedFilter === "verified") {
        result = result.filter((s) => s.is_verified)
      } else if (verifiedFilter === "unverified") {
        result = result.filter((s) => !s.is_verified)
      } else if (verifiedFilter === "flagged") {
        result = result.filter((s) => flaggedIds.has(s.id))
      }
    }

    if (dateFrom) {
      const from = new Date(dateFrom)
      result = result.filter((s) => new Date(s.claimed_at) >= from)
    }

    if (dateTo) {
      const to = new Date(dateTo)
      to.setHours(23, 59, 59, 999)
      result = result.filter((s) => new Date(s.claimed_at) <= to)
    }

    return result
  }, [stamps, search, stopFilter, methodFilter, verifiedFilter, dateFrom, dateTo, flaggedIds])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  )

  const hasActiveFilters =
    search || stopFilter !== "all" || methodFilter !== "all" ||
    verifiedFilter !== "all" || dateFrom || dateTo

  function clearFilters() {
    setSearch("")
    setStopFilter("all")
    setMethodFilter("all")
    setVerifiedFilter("all")
    setDateFrom("")
    setDateTo("")
    setPage(1)
  }

  function handleRevoke(stampId: string, note: string) {
    setStamps((prev) =>
      prev.map((s) =>
        s.id === stampId
          ? { ...s, is_verified: false, verification_note: note }
          : s
      )
    )
    toast.success("Stamp revoked. Tier completion will be re-evaluated.")
  }

  function handleRestore(stampId: string, note?: string) {
    setStamps((prev) =>
      prev.map((s) =>
        s.id === stampId
          ? {
              ...s,
              is_verified: true,
              verification_note: note ?? s.verification_note,
            }
          : s
      )
    )
  }

  function toggleFlag(stampId: string) {
    setFlaggedIds((prev) => {
      const next = new Set(prev)
      if (next.has(stampId)) {
        next.delete(stampId)
      } else {
        next.add(stampId)
      }
      return next
    })
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  const hasResults = paginated.length > 0

  return (
    <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Stamps Log</h2>
          <Button size="sm" onClick={() => setGrantOpen(true)}>
            Grant Manual Stamp
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <MagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              className="pl-8"
              placeholder="Search by user ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>

          <Select
            value={stopFilter}
            onValueChange={(v) => {
              setStopFilter(v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All stops" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stops</SelectItem>
              {stops.map((stop) => (
                <SelectItem key={stop.id} value={stop.id}>
                  Stop {stop.stop_order} · {stop.cafe_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={methodFilter}
            onValueChange={(v) => {
              setMethodFilter(v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All methods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="qr">QR</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="redemption">Redemption</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={verifiedFilter}
            onValueChange={(v) => {
              setVerifiedFilter(v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value)
              setPage(1)
            }}
            className="w-[140px]"
            aria-label="From date"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value)
              setPage(1)
            }}
            className="w-[140px]"
            aria-label="To date"
          />

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs"
            >
              Clear filters
            </Button>
          )}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">User</TableHead>
              <TableHead>Stop</TableHead>
              <TableHead>Claimed At</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Distance</TableHead>
              <TableHead>GPS</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Verification Note</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hasResults ? (
              paginated.map((stamp) => {
                const isSuspicious = stamp.distance_meters > 200
                const isFlagged = flaggedIds.has(stamp.id)
                return (
                  <TableRow
                    key={stamp.id}
                    className={cn(
                      isSuspicious &&
                        "bg-amber-50/50 dark:bg-amber-950/20"
                    )}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="size-7">
                          <AvatarFallback className="text-[10px]">
                            {getInitials(stamp.user_id)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {stamp.user_id.slice(0, 8)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {getStopLabel(stamp.stop_id, stops)}
                    </TableCell>

                    <TableCell className="text-xs whitespace-nowrap">
                      {formatTimestamp(stamp.claimed_at)}
                    </TableCell>

                    <TableCell>
                      <StampMethodBadge method={stamp.claim_method} />
                    </TableCell>

                    <TableCell>
                      <span
                        className={cn(
                          "text-xs font-medium",
                          isSuspicious && "text-destructive"
                        )}
                      >
                        {stamp.distance_meters}m
                        {isSuspicious && (
                          <span className="ml-1 text-destructive" title="Suspicious distance">
                            ⚠
                          </span>
                        )}
                      </span>
                    </TableCell>

                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center gap-1 cursor-help text-xs text-muted-foreground">
                            <MapPin className="size-3" />
                            {stamp.claim_lat.toFixed(4)},{" "}
                            {stamp.claim_lng.toFixed(4)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          <p>
                            Claim: {stamp.claim_lat.toFixed(4)},{" "}
                            {stamp.claim_lng.toFixed(4)}
                          </p>
                          <p>
                            Cafe: {stamp.cafe_lat.toFixed(4)},{" "}
                            {stamp.cafe_lng.toFixed(4)}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>

                    <TableCell>
                      <StampVerifiedIndicator
                        isVerified={stamp.is_verified}
                      />
                    </TableCell>

                    <TableCell>
                      {stamp.verification_note ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="block max-w-[180px] truncate text-xs cursor-help">
                              {stamp.verification_note}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent
                            side="bottom"
                            align="start"
                            className="max-w-xs text-xs"
                          >
                            {stamp.verification_note}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          —
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        {stamp.is_verified ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                className="size-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() =>
                                  setRevokingStamp(stamp)
                                }
                              >
                                <Prohibit className="size-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Revoke</TooltipContent>
                          </Tooltip>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                className="size-7 text-green-600 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                                onClick={() =>
                                  setRestoringStamp(stamp)
                                }
                              >
                                <ArrowCounterClockwise className="size-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Restore</TooltipContent>
                          </Tooltip>
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              className={cn(
                                "size-7",
                                isFlagged
                                  ? "text-amber-600"
                                  : "text-muted-foreground"
                              )}
                              onClick={() => toggleFlag(stamp.id)}
                            >
                              {isFlagged ? (
                                <FlagBanner
                                  className="size-3.5"
                                  weight="fill"
                                />
                              ) : (
                                <Flag className="size-3.5" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isFlagged
                              ? "Remove flag"
                              : "Flag as suspicious"}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center text-muted-foreground py-12"
                >
                  <div className="flex flex-col items-center gap-2">
                    {stamps.length === 0 ? (
                      <p>No stamps claimed yet.</p>
                    ) : (
                      <>
                        <p>No stamps match your filters.</p>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={clearFilters}
                        >
                          Clear filters
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            {hasResults
              ? (safePage - 1) * PAGE_SIZE + 1
              : 0}
            -
            {hasResults
              ? Math.min(
                  (safePage - 1) * PAGE_SIZE + paginated.length,
                  filtered.length
                )
              : 0}{" "}
            of {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(safePage - 1)}
              disabled={safePage <= 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {totalPages === 0 ? 0 : safePage} of{" "}
              {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(safePage + 1)}
              disabled={totalPages === 0 || safePage >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>

        <GrantManualStampDialog
          open={grantOpen}
          onOpenChange={setGrantOpen}
          stops={stops}
        />

        <RevokeStampDialog
          stamp={revokingStamp}
          open={revokingStamp !== null}
          onOpenChange={() => setRevokingStamp(null)}
          onRevoke={handleRevoke}
        />

        <RestoreStampDialog
          stamp={restoringStamp}
          open={restoringStamp !== null}
          onOpenChange={() => setRestoringStamp(null)}
          onRestore={handleRestore}
        />
      </div>
  )
}
