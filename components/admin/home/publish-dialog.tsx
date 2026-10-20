"use client"

// Publish review: what goes live, compared with what is live now, as a short
// list in one tinted block, then warnings (schedules already over or not yet
// started, Near you pushed down), then the optional note.

import * as React from "react"
import { WarningCircleIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { Field } from "@/components/admin/form-kit"
import { TONES } from "@/components/admin/table-kit"
import type { LayoutChanges } from "@/lib/home-layout/changes"
import { LIMITS } from "@/lib/home-layout/document"
import { cn } from "@/lib/utils"

export function PublishDialog({
  open,
  onOpenChange,
  changes,
  against,
  note,
  onNoteChange,
  busy,
  onPublish,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  changes: LayoutChanges
  /** What the list compares with: "the layout live since Oct 13" or "the built-in Home". */
  against: string
  note: string
  onNoteChange: (note: string) => void
  busy: boolean
  onPublish: () => void
}) {
  const n = changes.changes.length
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90dvh,720px)] flex-col">
        <DialogHeader>
          <DialogTitle>{n > 0 ? `Publish ${n} ${n === 1 ? "change" : "changes"}?` : "Publish this layout?"}</DialogTitle>
          <DialogDescription>
            Compared with {against}. Everyone on a current app version sees it on their next Home refresh; unsaved
            edits are saved first and the layout live now moves to Versions.
          </DialogDescription>
        </DialogHeader>

        <div className="-mx-1 flex min-h-0 flex-col gap-3 overflow-y-auto overscroll-contain px-1">
          {n > 0 ? (
            <ul className="flex flex-col gap-1.5 rounded-lg bg-muted px-4 py-3 text-[13px]" aria-label="What changes">
              {changes.changes.map((c, i) => (
                <li key={i} className="flex gap-2">
                  <span aria-hidden className="mt-[7px] size-1 shrink-0 rounded-full bg-muted-foreground" />
                  <span className="min-w-0">{c}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-lg bg-muted px-4 py-3 text-[13px] text-muted-foreground">
              Same order and shelves as {against}; publishing makes this order the saved layout.
            </p>
          )}

          {changes.warnings.length > 0 && (
            <ul className={cn("flex flex-col gap-1.5 rounded-lg px-4 py-3 text-[13px]", TONES.warning)} aria-label="Check before publishing">
              {changes.warnings.map((w, i) => (
                <li key={i} className="flex items-start gap-2">
                  <WarningCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <span className="min-w-0">{w}</span>
                </li>
              ))}
            </ul>
          )}

          <Field label="Note" htmlFor="publish-note" optional hint="Shown in Versions, e.g. “Rainy season layout”.">
            <Textarea
              id="publish-note"
              rows={2}
              maxLength={LIMITS.note}
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
            />
          </Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Go back
          </Button>
          <Button onClick={onPublish} disabled={busy}>
            {busy && <Spinner />}
            Publish layout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
