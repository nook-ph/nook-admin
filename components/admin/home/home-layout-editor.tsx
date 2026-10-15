"use client"

// /admin/home: the draft Home layout (nook-supabase docs/HOME_LAYOUT.md).
// Workbench form page: shelves, banner and options in the main column, the
// phone preview in the sticky rail, versions at the end, and the save bar
// with Save draft and Publish pinned to the bottom.

import * as React from "react"
import { useRouter } from "next/navigation"
import { DatabaseIcon } from "@phosphor-icons/react"
import { toast } from "sonner"

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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Field, FormSection, SaveBar, useLeaveGuard } from "@/components/admin/form-kit"
import { PageHeader, StatusChip } from "@/components/admin/table-kit"
import { BannerEditor } from "@/components/admin/home/banner-editor"
import { PhonePreview } from "@/components/admin/home/phone-preview"
import { AddShelfButton, SectionList } from "@/components/admin/home/section-list"
import { formatWhen, Versions } from "@/components/admin/home/versions"
import {
  publishHomeLayoutAction,
  republishHomeVersionAction,
  resetHomeLayoutAction,
  saveHomeDraftAction,
} from "@/app/admin/home/actions"
import {
  cleanDocument,
  LIMITS,
  newCustomSection,
  normalizeDocument,
  validateDocument,
  type HomeLayoutDocument,
} from "@/lib/home-layout/document"
import type { HomeCafe, HomeLayoutVersion } from "@/lib/queries/home-layout"

function same(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b)
}

/** Changed sections + banner + options + order, for "N unsaved changes". */
function countChanges(base: HomeLayoutDocument, cur: HomeLayoutDocument) {
  const a = cleanDocument(base)
  const b = cleanDocument(cur)
  let n = 0
  if (!same(a.banner, b.banner)) n++
  if (a.respect_purpose !== b.respect_purpose) n++
  const byId = new Map(a.sections.map((s) => [s.id, s]))
  for (const s of b.sections) if (!same(byId.get(s.id), s)) n++
  for (const s of a.sections) if (!b.sections.some((x) => x.id === s.id)) n++
  const common = (d: HomeLayoutDocument, other: HomeLayoutDocument) =>
    d.sections.map((s) => s.id).filter((id) => other.sections.some((x) => x.id === id))
  if (!same(common(a, b), common(b, a))) n++
  return n
}

export function HomeLayoutEditor({
  missingTable,
  hasDraft,
  draftUpdatedAt,
  initialDocument,
  published,
  history,
  cafes,
  tags,
}: {
  missingTable: boolean
  hasDraft: boolean
  draftUpdatedAt: string | null
  initialDocument: HomeLayoutDocument
  published: HomeLayoutVersion | null
  history: HomeLayoutVersion[]
  cafes: HomeCafe[]
  tags: string[]
}) {
  const router = useRouter()
  const [baseline, setBaseline] = React.useState(initialDocument)
  const [doc, setDoc] = React.useState(initialDocument)
  const [openId, setOpenId] = React.useState<string | null>(null)
  const [showErrors, setShowErrors] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [busyId, setBusyId] = React.useState<string | null>(null)
  const [publishOpen, setPublishOpen] = React.useState(false)
  const [note, setNote] = React.useState("")

  // The server sends a new initialDocument after each save/publish refresh.
  const [lastInitial, setLastInitial] = React.useState(initialDocument)
  if (lastInitial !== initialDocument) {
    setLastInitial(initialDocument)
    setBaseline(initialDocument)
    setDoc(initialDocument)
  }

  const cafesById = React.useMemo(() => new Map(cafes.map((c) => [c.id, c])), [cafes])
  const allErrors = React.useMemo(() => validateDocument(doc, tags), [doc, tags])
  const errors = showErrors ? allErrors : {}
  const errorCount = Object.keys(allErrors).length
  const dirtyCount = countChanges(baseline, doc)
  useLeaveGuard(dirtyCount > 0)

  const liveDoc = published ? normalizeDocument(published.document) : null
  const draftIsLive = !!liveDoc && same(cleanDocument(liveDoc), cleanDocument(doc))
  const customCount = doc.sections.filter((s) => s.type === "custom").length

  function firstError() {
    const key = Object.keys(allErrors)[0]
    if (!key) return
    setShowErrors(true)
    const m = /^sections\.([^.]+)/.exec(key)
    if (m) {
      setOpenId(m[1])
      requestAnimationFrame(() => document.getElementById(`row-${m[1]}`)?.scrollIntoView({ block: "start", behavior: "smooth" }))
    } else if (key.startsWith("banner")) {
      document.getElementById("banner")?.scrollIntoView({ block: "start", behavior: "smooth" })
    }
  }

  async function run(label: string, fn: () => Promise<{ success: boolean; error?: string }>, okMessage: string) {
    setSaving(true)
    setBusyId(label)
    const res = await fn()
    setSaving(false)
    setBusyId(null)
    if (res.success) {
      toast.success(okMessage)
      router.refresh()
    } else {
      toast.error(res.error ?? "Something went wrong")
    }
    return res.success
  }

  async function saveDraft() {
    if (errorCount > 0) return firstError()
    await run("save", () => saveHomeDraftAction(doc), "Draft saved")
  }

  async function publish() {
    if (errorCount > 0) {
      setPublishOpen(false)
      return firstError()
    }
    const ok = await run("publish", () => publishHomeLayoutAction(doc, note.trim() || null), "Published. Phones pick it up on their next Home refresh.")
    if (ok) {
      setPublishOpen(false)
      setNote("")
    }
  }

  const status = missingTable ? (
    <StatusChip tone="neutral">Not set up</StatusChip>
  ) : !published ? (
    <StatusChip tone="neutral">Built-in Home</StatusChip>
  ) : draftIsLive && dirtyCount === 0 ? (
    <StatusChip tone="success">Live</StatusChip>
  ) : (
    <StatusChip tone="warning">Draft differs from live</StatusChip>
  )

  const summary = missingTable
    ? "The home_layouts table isn’t in the database yet."
    : published
      ? `Live since ${formatWhen(published.published_at)}${published.note ? ` · “${published.note}”` : ""}${
          hasDraft && draftUpdatedAt ? ` · draft saved ${formatWhen(draftUpdatedAt)}` : ""
        }`
      : "Nothing published, so the app shows its built-in Home. Your draft starts from that order."

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex flex-col gap-2">
        <PageHeader
          title="Home layout"
          summary={summary}
          action={
            <a
              href="#preview"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border px-3 text-sm font-medium lg:hidden"
            >
              Jump to preview
            </a>
          }
        />
        <div>{status}</div>
      </div>

      {missingTable && (
        <div className="flex items-start gap-3 rounded-xl border px-4 py-3">
          <DatabaseIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <p className="text-[13px] text-muted-foreground">
            Apply nook-supabase migration <span className="font-mono text-foreground">20261016090000_home_layouts.sql</span>{" "}
            to save and publish. You can try the editor and preview meanwhile; nothing is saved.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
        <div className="flex min-w-0 flex-col">
          <FormSection
            id="shelves"
            title="Shelves"
            description={`Top to bottom, as on the phone. Drag a row or open it to move it. ${doc.sections.length} of ${LIMITS.sections} · ${customCount} of ${LIMITS.customShelves} custom.`}
            action={
              <AddShelfButton
                disabled={doc.sections.length >= LIMITS.sections || customCount >= LIMITS.customShelves}
                onAdd={() => {
                  const s = newCustomSection()
                  setDoc((d) => ({ ...d, sections: [...d.sections, s] }))
                  setOpenId(s.id)
                  requestAnimationFrame(() => document.getElementById(`${s.id}-title`)?.focus())
                }}
              />
            }
          >
            {errors["sections"] && <p className="text-xs text-destructive">{errors["sections"]}</p>}
            <SectionList
              sections={doc.sections}
              onChange={(sections) => setDoc((d) => ({ ...d, sections }))}
              errors={errors}
              cafes={cafes}
              cafesById={cafesById}
              tags={tags}
              openId={openId}
              onOpenChange={setOpenId}
            />
          </FormSection>

          <FormSection id="banner" title="Banner" description="One banner at the top of Home. Optional.">
            <BannerEditor value={doc.banner} onChange={(banner) => setDoc((d) => ({ ...d, banner }))} errors={errors} />
          </FormSection>

          <FormSection id="options" title="Options">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <label htmlFor="respect-purpose" className="text-sm font-medium">
                  Let onboarding answers lead
                </label>
                <p className="text-xs text-muted-foreground">
                  On: the shelf matching what a person said they come for can move to the top, as today. Off: your order is exact.
                </p>
              </div>
              <Switch
                id="respect-purpose"
                checked={doc.respect_purpose}
                onCheckedChange={(respect_purpose) => setDoc((d) => ({ ...d, respect_purpose }))}
              />
            </div>
          </FormSection>

          <FormSection id="versions" title="Versions" description="Every publish is kept. Times are Manila time.">
            <Versions
              history={history}
              disabled={missingTable}
              busyId={busyId === "save" || busyId === "publish" ? "busy" : busyId}
              onRepublish={(id) => run(id, () => republishHomeVersionAction(id), "That version is live again")}
              onReset={() => run("reset", () => resetHomeLayoutAction(null), "Home is back to the built-in layout")}
            />
          </FormSection>
        </div>

        <aside id="preview" className="flex min-w-0 scroll-mt-6 flex-col gap-4 lg:sticky lg:top-6">
          <PhonePreview document={doc} cafes={cafes} />
        </aside>
      </div>

      <SaveBar
        dirtyCount={dirtyCount}
        saving={saving}
        errorCount={showErrors || dirtyCount > 0 ? errorCount : 0}
        onFirstError={firstError}
        onDiscard={() => {
          setDoc(baseline)
          setShowErrors(false)
        }}
        savedLabel={hasDraft ? "Draft saved" : "Default order, not saved yet"}
      >
        <Button variant="outline" onClick={saveDraft} disabled={saving || missingTable || dirtyCount === 0}>
          {busyId === "save" && <Spinner />}
          Save draft
        </Button>
        <Button
          onClick={() => (errorCount > 0 ? firstError() : setPublishOpen(true))}
          disabled={saving || missingTable || (draftIsLive && dirtyCount === 0)}
        >
          Publish
        </Button>
      </SaveBar>

      <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish this layout?</DialogTitle>
            <DialogDescription>
              Everyone on a current app version sees it on their next Home refresh. Unsaved edits are saved first, and the
              layout live now moves to Versions.
            </DialogDescription>
          </DialogHeader>
          <Field label="Note" htmlFor="publish-note" optional hint="Shown in Versions, e.g. “Rainy season layout”.">
            <Textarea
              id="publish-note"
              rows={2}
              maxLength={LIMITS.note}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Field>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPublishOpen(false)} disabled={saving}>
              Go back
            </Button>
            <Button
              onClick={() => void publish()}
              disabled={saving}
            >
              {busyId === "publish" && <Spinner />}
              Publish layout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
