"use client"

// /admin/home: the draft Home layout (nook-supabase docs/HOME_LAYOUT.md).
// Workbench form page: banner, shelves and options in the main column (in
// phone order), the phone preview in the sticky rail, versions at the end,
// and the save bar with Save draft and Publish pinned to the bottom. One state
// line everywhere: "Same as live" / "N unpublished changes" / "Nothing live yet".

import * as React from "react"
import { DatabaseIcon } from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { FormSection, SaveBar, useLeaveGuard } from "@/components/admin/form-kit"
import { PageHeader, StatusChip } from "@/components/admin/table-kit"
import { BannerEditor } from "@/components/admin/home/banner-editor"
import { HomeSwitch } from "@/components/admin/home/home-switch"
import { PhonePreview, type PreviewTime } from "@/components/admin/home/phone-preview"
import { PublishDialog } from "@/components/admin/home/publish-dialog"
import { AddShelfButton, SectionList } from "@/components/admin/home/section-list"
import { useNow } from "@/components/admin/home/use-now"
import { formatWhen, RestoreDialog, Versions } from "@/components/admin/home/versions"
import {
  publishHomeLayoutAction,
  republishHomeVersionAction,
  resetHomeLayoutAction,
  saveHomeDraftAction,
} from "@/app/admin/home/actions"
import { layoutChanges } from "@/lib/home-layout/changes"
import {
  cleanDocument,
  defaultDocument,
  isoToManilaLocal,
  LIMITS,
  MAX_CUSTOM_SHELVES,
  newCustomSection,
  normalizeDocument,
  validateDocument,
  type HomeLayoutDocument,
} from "@/lib/home-layout/document"
import type { HomeCafe, HomeLayoutVersion } from "@/lib/queries/home-layout"
import { cn } from "@/lib/utils"

const EPOCH = new Date(0)

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
  if ((a.pin_top ?? true) !== (b.pin_top ?? true)) n++
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
  fixture,
}: {
  missingTable: boolean
  hasDraft: boolean
  draftUpdatedAt: string | null
  initialDocument: HomeLayoutDocument
  published: HomeLayoutVersion | null
  history: HomeLayoutVersion[]
  cafes: HomeCafe[]
  tags: string[]
  /** Dev-only fixture store (lib/home-layout/dev-fixture.ts): nothing is saved. */
  fixture: boolean
}) {
  const [baseline, setBaseline] = React.useState(initialDocument)
  const [doc, setDoc] = React.useState(initialDocument)
  const [openId, setOpenId] = React.useState<string | null>(null)
  const [showErrors, setShowErrors] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const [busyId, setBusyId] = React.useState<string | null>(null)
  const [publishOpen, setPublishOpen] = React.useState(false)
  const [note, setNote] = React.useState("")
  const [previewTime, setPreviewTime] = React.useState<PreviewTime>({ mode: "now", picked: "" })
  const [previewVersion, setPreviewVersion] = React.useState<HomeLayoutVersion | null>(null)
  const [restoreVersion, setRestoreVersion] = React.useState<HomeLayoutVersion | null>(null)
  const now = useNow()

  // The draft's updated_at this editor last saw; saves send it so a draft
  // saved meanwhile in another tab is never overwritten silently.
  const [draftStamp, setDraftStamp] = React.useState(draftUpdatedAt)

  // Each action's revalidatePath sends the page again with what was saved.
  // Load it only when the stored draft or the live version really changed
  // (not on every new props object), and the form is inert while an action
  // runs, so nothing typed can be dropped here.
  const serverKey = `${draftUpdatedAt ?? ""}|${published?.id ?? ""}`
  const [lastKey, setLastKey] = React.useState(serverKey)
  if (lastKey !== serverKey) {
    setLastKey(serverKey)
    setBaseline(initialDocument)
    setDoc(initialDocument)
    setDraftStamp(draftUpdatedAt)
  }

  const cafesById = React.useMemo(() => new Map(cafes.map((c) => [c.id, c])), [cafes])
  const allErrors = React.useMemo(() => validateDocument(doc, tags), [doc, tags])
  const errors = showErrors ? allErrors : {}
  const errorCount = Object.keys(allErrors).length
  const dirtyCount = React.useMemo(() => countChanges(baseline, doc), [baseline, doc])
  useLeaveGuard(dirtyCount > 0)

  // Compared with what phones get now: the live layout, or the built-in order.
  const liveDoc = React.useMemo(
    () => (published ? normalizeDocument(published.document) : defaultDocument()),
    [published]
  )
  const changes = React.useMemo(() => layoutChanges(liveDoc, doc, now ?? EPOCH), [liveDoc, doc, now])
  const savedUnpublished = React.useMemo(
    () => layoutChanges(liveDoc, baseline, EPOCH).changes.length,
    [liveDoc, baseline]
  )
  const unpublished = changes.changes.length
  const nothingToPublish = !!published && unpublished === 0
  const customCount = doc.sections.filter((s) => s.type === "custom").length
  const canAdd = doc.sections.length < LIMITS.sections && customCount < MAX_CUSTOM_SHELVES

  function addShelfAt(index: number) {
    const s = newCustomSection()
    setDoc((d) => {
      const sections = [...d.sections]
      sections.splice(index, 0, s)
      return { ...d, sections }
    })
    setOpenId(s.id)
    requestAnimationFrame(() => document.getElementById(`${s.id}-title`)?.focus())
  }

  function showPreview() {
    // Below lg the preview sits under the form; bring it into view.
    if (window.matchMedia("(max-width: 1023px)").matches) {
      document.getElementById("preview")?.scrollIntoView({ block: "start", behavior: "smooth" })
    }
  }

  function previewAt(iso: string) {
    setPreviewVersion(null)
    setPreviewTime({ mode: "pick", picked: isoToManilaLocal(iso) })
    showPreview()
  }

  function backToNow() {
    setPreviewTime((t) => ({ ...t, mode: "now" }))
    setPreviewVersion(null)
  }

  function selectFromPreview(target: string) {
    if (target === "banner") {
      document.getElementById("banner")?.scrollIntoView({ block: "start", behavior: "smooth" })
      return
    }
    setOpenId(target)
    requestAnimationFrame(() =>
      document.getElementById(`row-${target}`)?.scrollIntoView({ block: "start", behavior: "smooth" })
    )
  }

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

  async function run(
    label: string,
    fn: () => Promise<{ success: boolean; error?: string; warning?: string; draftUpdatedAt?: string }>,
    okMessage: string
  ) {
    setSaving(true)
    setBusyId(label)
    let res: Awaited<ReturnType<typeof fn>>
    try {
      res = await fn()
    } catch {
      // The request itself failed (offline, a new deploy): nothing changed here.
      res = { success: false, error: "Couldn’t reach the server. Check your connection and try again." }
    } finally {
      setSaving(false)
      setBusyId(null)
    }
    // A failed publish may still have saved the draft; keep its new stamp so
    // a retry isn't refused as someone else's edit.
    if (res.draftUpdatedAt) setDraftStamp(res.draftUpdatedAt)
    if (res.success) {
      if (res.warning) toast.warning(res.warning)
      else toast.success(okMessage)
    } else {
      toast.error(res.error ?? "Something went wrong")
    }
    return res.success
  }

  async function saveDraft() {
    if (errorCount > 0) return firstError()
    await run("save", () => saveHomeDraftAction(doc, draftStamp), "Draft saved")
  }

  async function publish() {
    if (errorCount > 0) {
      setPublishOpen(false)
      return firstError()
    }
    const ok = await run("publish", () => publishHomeLayoutAction(doc, note.trim() || null, draftStamp), "Published. Phones pick it up on their next Home refresh.")
    if (ok) {
      setPublishOpen(false)
      setNote("")
      backToNow()
    }
  }

  async function republish(v: HomeLayoutVersion) {
    setRestoreVersion(null)
    const ok = await run(v.id, () => republishHomeVersionAction(v.id), "That version is live again")
    if (ok) backToNow()
  }

  function openAsDraft(v: HomeLayoutVersion) {
    setRestoreVersion(null)
    setPreviewVersion(null)
    setDoc(normalizeDocument(v.document))
    setShowErrors(false)
    toast.success("Opened as the draft. Nothing is live until you publish.")
  }

  const stateLine = missingTable
    ? "Not set up"
    : !published
      ? "Nothing live yet"
      : unpublished === 0
        ? "Same as live"
        : `${unpublished} unpublished ${unpublished === 1 ? "change" : "changes"}`

  const status = (
    <StatusChip tone={missingTable || !published ? "neutral" : unpublished === 0 ? "success" : "warning"}>
      {stateLine}
    </StatusChip>
  )

  const savedLabel = missingTable
    ? "Nothing is saved until the table exists"
    : !published
      ? "Nothing live yet · the app shows its built-in Home"
      : unpublished === 0
        ? "Same as live"
        : `Draft saved · ${unpublished} unpublished ${unpublished === 1 ? "change" : "changes"}`

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
        <div className="flex flex-wrap items-center gap-2">
          {status}
          {fixture && <StatusChip tone="info">Fixture data · nothing is saved</StatusChip>}
        </div>
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
        {/* Inert while saving: the refresh that follows replaces the form with
            what was saved, so edits made meanwhile would be dropped. */}
        <div className={cn("flex min-w-0 flex-col", saving && "opacity-80")} inert={saving}>
          <FormSection id="banner" title="Banner" description="One banner at the top of Home, above every shelf. Optional.">
            <BannerEditor
              value={doc.banner}
              onChange={(banner) => setDoc((d) => ({ ...d, banner }))}
              errors={errors}
              now={now}
              onPreviewAt={previewAt}
              onUploadingChange={setUploading}
            />
          </FormSection>

          <FormSection
            id="shelves"
            title="Shelves"
            description={`Top to bottom, as on the phone. Drag a row or open it to move it. ${doc.sections.length} of ${LIMITS.sections} · ${customCount} of ${MAX_CUSTOM_SHELVES} custom.`}
            action={<AddShelfButton disabled={!canAdd} onAdd={() => addShelfAt(doc.sections.length)} />}
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
              now={now}
              canAdd={canAdd}
              onAddBelow={(index) => addShelfAt(index + 1)}
              onPreviewAt={previewAt}
              pinTop={doc.pin_top !== false}
            />
          </FormSection>

          <FormSection id="options" title="Options">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <label htmlFor="respect-purpose" className="text-sm font-medium">
                  Let onboarding answers lead
                </label>
                <p className="text-xs text-muted-foreground">
                  On: the shelf matching what a person said they come for can move to the top, as today. Off: it stays where you put it.
                </p>
              </div>
              <HomeSwitch
                id="respect-purpose"
                checked={doc.respect_purpose}
                onCheckedChange={(respect_purpose) => setDoc((d) => ({ ...d, respect_purpose }))}
              />
            </div>
          </FormSection>

          <FormSection id="versions" title="Versions" description="Every publish is kept. Times are Manila time.">
            <Versions
              history={history}
              disabled={missingTable || uploading}
              busyId={busyId === "save" || busyId === "publish" ? "busy" : busyId}
              previewId={previewVersion?.id ?? null}
              onPreview={(v) => {
                setPreviewVersion(v)
                if (v) showPreview()
              }}
              onRestore={setRestoreVersion}
              unsaved={dirtyCount}
              unpublished={savedUnpublished}
              onReset={async () => {
                const ok = await run("reset", () => resetHomeLayoutAction(null), "Home is back to the built-in layout")
                if (ok) backToNow()
              }}
            />
          </FormSection>
        </div>

        <aside id="preview" className="flex min-w-0 scroll-mt-6 flex-col gap-4 lg:sticky lg:top-6">
          <PhonePreview
            document={previewVersion ? normalizeDocument(previewVersion.document) : doc}
            cafes={cafes}
            time={previewTime}
            onTimeChange={setPreviewTime}
            onSelect={selectFromPreview}
            version={
              previewVersion
                ? {
                    label: `the version from ${formatWhen(previewVersion.published_at)}`,
                    live: previewVersion.status === "published",
                    onBack: () => setPreviewVersion(null),
                    onRestore:
                      previewVersion.status === "published" || missingTable || uploading
                        ? undefined
                        : () => setRestoreVersion(previewVersion),
                  }
                : null
            }
          />
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
        savedLabel={savedLabel}
      >
        <Button variant="outline" onClick={saveDraft} disabled={saving || uploading || missingTable || dirtyCount === 0}>
          {busyId === "save" && <Spinner />}
          Save draft
        </Button>
        <Button
          onClick={() => (errorCount > 0 ? firstError() : setPublishOpen(true))}
          disabled={saving || uploading || missingTable || nothingToPublish}
        >
          {nothingToPublish ? "Nothing new to publish" : "Publish"}
        </Button>
      </SaveBar>

      <PublishDialog
        open={publishOpen}
        onOpenChange={setPublishOpen}
        changes={changes}
        against={published ? `the layout live since ${formatWhen(published.published_at)}` : "the built-in Home"}
        note={note}
        onNoteChange={setNote}
        busy={saving}
        onPublish={() => void publish()}
      />

      <RestoreDialog
        version={restoreVersion}
        unsaved={dirtyCount}
        unpublished={savedUnpublished}
        onOpenChange={(o) => !o && setRestoreVersion(null)}
        onPublish={(v) => void republish(v)}
        onOpenAsDraft={openAsDraft}
      />
    </div>
  )
}
