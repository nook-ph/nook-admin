"use client"

// What is live, and every earlier published version on a timeline, newest
// first. Each can be previewed in the phone frame; earlier ones can be
// restored (published again, or opened as the draft). Reset to default sits
// apart at the end as the one destructive action.

import * as React from "react"
import { ArrowCounterClockwiseIcon, EyeIcon, WarningCircleIcon } from "@phosphor-icons/react"

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
import { StatusChip, TONES } from "@/components/admin/table-kit"
import { isResetDocument, normalizeDocument } from "@/lib/home-layout/document"
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

export function describeVersion(v: HomeLayoutVersion) {
  // As Restore and the app's isDefault.
  if (isResetDocument(v.document)) return "Built-in Home"
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
  previewId,
  onPreview,
  onRestore,
  unsaved,
  unpublished,
  onReset,
}: {
  history: HomeLayoutVersion[]
  disabled: boolean
  busyId: string | null
  /** The version shown in the phone frame, if any. */
  previewId: string | null
  onPreview: (v: HomeLayoutVersion | null) => void
  onRestore: (v: HomeLayoutVersion) => void
  /** Edits in the editor not yet saved. */
  unsaved: number
  /** Changes in the saved draft that aren't live (drafts aren't kept in history). */
  unpublished: number
  onReset: () => void
}) {
  const [showAll, setShowAll] = React.useState(false)
  const [confirmReset, setConfirmReset] = React.useState(false)
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
            const previewing = previewId === v.id
            return (
              <li key={v.id} className="relative flex gap-3 pb-4 last:pb-0">
                {/* timeline */}
                <span aria-hidden className="relative flex w-3 shrink-0 justify-center">
                  <span className={cn("mt-1.5 size-2.5 rounded-full border-2", live ? "border-emerald-600 bg-emerald-600" : "border-muted-foreground/40 bg-background")} />
                  {i < rows.length - 1 && <span className="absolute top-4 bottom-[-4px] w-px bg-border" />}
                </span>
                <div className={cn("flex min-w-0 flex-1 flex-wrap items-start gap-x-3 gap-y-1.5", (live || previewing) && "rounded-lg bg-muted px-3 py-2 -mt-1.5")}>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-medium tabular-nums">
                      {formatWhen(v.published_at)}
                      {live && <StatusChip tone="success">Live</StatusChip>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {[v.note, describeVersion(v), v.publishedByEmail].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="max-sm:h-11"
                      aria-pressed={previewing}
                      onClick={() => onPreview(previewing ? null : v)}
                    >
                      <EyeIcon aria-hidden weight={previewing ? "fill" : "regular"} />
                      {previewing ? "Previewing" : "Preview"}
                    </Button>
                    {!live && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="max-sm:h-11"
                        disabled={disabled || busyId !== null}
                        onClick={() => onRestore(v)}
                      >
                        {busyId === v.id ? <Spinner /> : <ArrowCounterClockwiseIcon aria-hidden />}
                        {busyId === v.id ? "Publishing…" : "Restore"}
                      </Button>
                    )}
                  </div>
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
          onClick={() => setConfirmReset(true)}
        >
          {busyId === "reset" && <Spinner />}
          Reset to default
        </Button>
      </div>

      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Home to default?</AlertDialogTitle>
            <AlertDialogDescription>
              Everyone gets the built-in Home and no banner on their next refresh. The draft starts over from the default
              order. The current layout stays in history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {(unsaved > 0 || unpublished > 0) && (
            <p className={cn("flex items-start gap-2 rounded-md px-3 py-2 text-[13px]", TONES.warning)}>
              <WarningCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
              {unsaved > 0
                ? `You have ${unsaved} unsaved ${unsaved === 1 ? "change" : "changes"}; they are lost.`
                : `Your saved draft has ${unpublished} ${unpublished === 1 ? "change" : "changes"} that ${unpublished === 1 ? "isn’t" : "aren’t"} live. Drafts aren’t kept in history, so ${unpublished === 1 ? "it is" : "they are"} lost.`}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Go back</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                onReset()
                setConfirmReset(false)
              }}
            >
              Reset to default
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/** Restore an earlier version: publish it now, or load it into the editor as
 *  the draft. Warns when either would replace work that isn't live. */
export function RestoreDialog({
  version,
  unsaved,
  unpublished,
  onOpenChange,
  onPublish,
  onOpenAsDraft,
}: {
  version: HomeLayoutVersion | null
  /** Edits in the editor not yet saved. */
  unsaved: number
  /** Changes in the (saved) draft that aren't live. */
  unpublished: number
  onOpenChange: (open: boolean) => void
  onPublish: (v: HomeLayoutVersion) => void
  onOpenAsDraft: (v: HomeLayoutVersion) => void
}) {
  const when = version ? formatWhen(version.published_at) : ""
  const risk =
    unsaved > 0
      ? `You have ${unsaved} unsaved ${unsaved === 1 ? "change" : "changes"}. Both choices replace them.`
      : unpublished > 0
        ? `Your draft has ${unpublished} ${unpublished === 1 ? "change" : "changes"} that ${unpublished === 1 ? "isn’t" : "aren’t"} live. Publishing this version replaces the saved draft; Open as draft lets you Discard to get it back.`
        : null
  return (
    <AlertDialog open={!!version} onOpenChange={onOpenChange}>
      {/* Wider than the default alert so three actions sit on one row. */}
      <AlertDialogContent className="data-[size=default]:sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Restore the version from {when}?</AlertDialogTitle>
          <AlertDialogDescription>
            Publish it and it goes live on everyone’s next refresh and becomes your draft. Open it as the draft to change
            it first; nothing goes live until you publish. The current layout stays in history either way.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {risk && (
          <p className={cn("flex items-start gap-2 rounded-md px-3 py-2 text-[13px]", TONES.warning)}>
            <WarningCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
            {risk}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>Go back</AlertDialogCancel>
          <Button type="button" variant="outline" onClick={() => version && onOpenAsDraft(version)}>
            Open as draft
          </Button>
          <AlertDialogAction onClick={() => version && onPublish(version)}>Publish this version</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
