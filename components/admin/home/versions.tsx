"use client"

// What is live, and every earlier published version on a timeline, newest
// first, each with "Publish again". Reset to default sits apart at the end as
// the one destructive action.

import * as React from "react"
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react"

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
import { Spinner } from "@/components/ui/spinner"
import { StatusChip } from "@/components/admin/table-kit"
import { normalizeDocument } from "@/lib/home-layout/document"
import type { HomeLayoutVersion } from "@/lib/queries/home-layout"
import { cn } from "@/lib/utils"

export function formatWhen(iso: string | null) {
  if (!iso) return "—"
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso))
}

function describeVersion(v: HomeLayoutVersion) {
  const doc = v.document as { sections?: unknown[]; banner?: { enabled?: boolean } | null } | null
  if (!doc?.sections || doc.sections.length === 0) return "Built-in Home"
  const n = normalizeDocument(v.document)
  const shown = n.sections.filter((s) => s.visible).length
  const custom = n.sections.filter((s) => s.type === "custom").length
  return [
    `${shown} shelves shown`,
    custom > 0 ? `${custom} custom` : null,
    n.banner?.enabled ? "banner" : null,
  ]
    .filter(Boolean)
    .join(" · ")
}

const INITIAL_ROWS = 6

export function Versions({
  history,
  disabled,
  busyId,
  onRepublish,
  onReset,
}: {
  history: HomeLayoutVersion[]
  disabled: boolean
  busyId: string | null
  onRepublish: (id: string) => void
  onReset: () => void
}) {
  const [showAll, setShowAll] = React.useState(false)
  const [confirm, setConfirm] = React.useState<HomeLayoutVersion | "reset" | null>(null)
  const rows = showAll ? history : history.slice(0, INITIAL_ROWS)

  return (
    <div className="flex flex-col gap-4">
      {history.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">
          Nothing published yet. The app shows its built-in Home until you publish.
        </p>
      ) : (
        <ol className="relative flex flex-col">
          {rows.map((v, i) => {
            const live = v.status === "published"
            return (
              <li key={v.id} className="relative flex gap-3 pb-4 last:pb-0">
                {/* timeline */}
                <span aria-hidden className="relative flex w-3 shrink-0 justify-center">
                  <span className={cn("mt-1.5 size-2.5 rounded-full border-2", live ? "border-emerald-600 bg-emerald-600" : "border-muted-foreground/40 bg-background")} />
                  {i < rows.length - 1 && <span className="absolute top-4 bottom-[-4px] w-px bg-border" />}
                </span>
                <div className={cn("flex min-w-0 flex-1 flex-wrap items-start gap-x-3 gap-y-1.5", live && "rounded-lg bg-muted px-3 py-2 -mt-1.5")}>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-medium tabular-nums">
                      {formatWhen(v.published_at)}
                      {live && <StatusChip tone="success">Live</StatusChip>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {[v.note, describeVersion(v), v.publishedByEmail].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  {!live && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={disabled || busyId !== null}
                      onClick={() => setConfirm(v)}
                    >
                      {busyId === v.id ? <Spinner /> : <ArrowCounterClockwiseIcon aria-hidden />}
                      {busyId === v.id ? "Publishing…" : "Publish again"}
                    </Button>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      )}
      {history.length > INITIAL_ROWS && (
        <Button type="button" variant="ghost" size="sm" className="w-fit" onClick={() => setShowAll((s) => !s)}>
          {showAll ? "Show fewer" : `Show all ${history.length} versions`}
        </Button>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <p className="min-w-0 text-[13px] text-muted-foreground">
          Reset to default puts the app back on its built-in order, with no banner.
        </p>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={disabled || busyId !== null}
          onClick={() => setConfirm("reset")}
        >
          {busyId === "reset" && <Spinner />}
          Reset to default
        </Button>
      </div>

      <AlertDialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm === "reset" ? "Reset Home to default?" : "Publish this version again?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm === "reset"
                ? "Everyone gets the built-in Home and no banner on their next refresh. The draft starts over from the default order; unsaved edits are lost. The current layout stays in history."
                : confirm
                  ? `The layout from ${formatWhen(confirm.published_at)} goes live on everyone’s next refresh and replaces the draft. The current layout stays in history.`
                  : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go back</AlertDialogCancel>
            <AlertDialogAction
              variant={confirm === "reset" ? "destructive" : "default"}
              onClick={() => {
                if (confirm === "reset") onReset()
                else if (confirm) onRepublish(confirm.id)
                setConfirm(null)
              }}
            >
              {confirm === "reset" ? "Reset to default" : "Publish this version"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
