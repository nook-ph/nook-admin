"use client"

// The one banner at the top of Home: an on/off row first, then the image
// drop zone with its size hint, then the text, button and schedule fields.

import * as React from "react"
import { ImageIcon, TrashIcon, UploadSimpleIcon } from "@phosphor-icons/react"
import imageCompression from "browser-image-compression"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { Field } from "@/components/admin/form-kit"
import { HomeSwitch } from "@/components/admin/home/home-switch"
import { ScheduleChip, ScheduleFields } from "@/components/admin/home/schedule-fields"
import { uploadHomeBannerImageAction } from "@/app/admin/home/actions"
import { emptyBanner, type Banner, type LayoutErrors } from "@/lib/home-layout/document"
import { cn } from "@/lib/utils"

const ACCEPT = "image/jpeg,image/png,image/webp"

export function BannerEditor({
  value,
  onChange,
  errors,
  now,
  onPreviewAt,
}: {
  value: Banner | null
  onChange: (next: Banner | null) => void
  errors: LayoutErrors
  /** Client clock for the schedule chip; null before mount. */
  now: Date | null
  onPreviewAt: (iso: string) => void
}) {
  const [uploading, setUploading] = React.useState(false)
  const [dragOver, setDragOver] = React.useState(false)
  const fileRef = React.useRef<HTMLInputElement>(null)
  const on = !!value?.enabled

  const set = (patch: Partial<Banner>) => onChange({ ...(value ?? emptyBanner()), ...patch })
  // The banner as it is now, for when an upload finishes: edits made while it
  // ran must not be reverted to the value captured when it started.
  const latest = React.useRef(value)
  React.useEffect(() => {
    latest.current = value
  }, [value])

  async function upload(file: File | undefined) {
    if (!file) return
    if (!ACCEPT.split(",").includes(file.type)) {
      toast.error("Only JPG, PNG and WEBP are allowed")
      return
    }
    setUploading(true)
    try {
      // Server action bodies are capped at 1MB, so shrink first, as the café
      // editor does (components/admin/cafe-editor-form.tsx).
      const small = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: "image/webp",
      })
      const fd = new FormData()
      fd.set("file", small)
      const res = await uploadHomeBannerImageAction(fd)
      if (res.success) onChange({ ...(latest.current ?? emptyBanner()), image_url: res.url })
      else toast.error(res.error)
    } catch {
      toast.error("Upload failed. Try a smaller image.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 rounded-lg bg-muted px-4 py-3">
        <div className="min-w-0">
          <span className="flex flex-wrap items-center gap-2">
            <label htmlFor="banner-on" className="text-sm font-medium">
              Show a banner
            </label>
            {on && <ScheduleChip schedule={value?.schedule} now={now} />}
          </span>
          <p className="text-xs text-muted-foreground">
            Above every shelf. People can dismiss it; a new title shows it again.
          </p>
        </div>
        <HomeSwitch
          id="banner-on"
          checked={on}
          onCheckedChange={(checked) => (value ? set({ enabled: checked }) : onChange({ ...emptyBanner(), enabled: checked }))}
        />
      </div>

      {value && (
        <fieldset disabled={!on} className={cn("flex flex-col gap-4", !on && "opacity-60")}>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">
              Image <span className="ml-1.5 text-xs font-normal text-muted-foreground">Optional · 16:9 works best</span>
            </span>
            {value.image_url ? (
              <div className="flex flex-wrap items-end gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={value.image_url} alt="Banner image" className="aspect-[16/9] w-full max-w-72 rounded-lg border bg-muted object-cover" />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                    {uploading ? <Spinner /> : <UploadSimpleIcon aria-hidden />}
                    Replace
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => set({ image_url: null })} disabled={uploading}>
                    <TrashIcon aria-hidden />
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragOver(false)
                  void upload(e.dataTransfer.files?.[0])
                }}
                disabled={uploading}
                className={cn(
                  "flex aspect-[16/9] w-full max-w-72 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed text-[13px] text-muted-foreground outline-hidden hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
                  dragOver && "border-foreground bg-muted"
                )}
              >
                {uploading ? <Spinner /> : <ImageIcon className="size-5" aria-hidden />}
                {uploading ? "Uploading…" : (
                  <span>
                    Drop an image or <span className="font-medium text-foreground underline underline-offset-2">browse</span>
                  </span>
                )}
                <span className="text-xs">JPG, PNG or WEBP, up to 10MB</span>
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPT}
              className="sr-only"
              tabIndex={-1}
              aria-hidden
              onChange={(e) => {
                void upload(e.target.files?.[0])
                e.target.value = ""
              }}
            />
          </div>

          <Field label="Title" htmlFor="banner-headline" error={errors["banner.title"]}>
            <Input
              id="banner-headline"
              value={value.title}
              placeholder="e.g. Cebu Coffee Crawl this Saturday"
              onChange={(e) => set({ title: e.target.value })}
              aria-invalid={!!errors["banner.title"]}
            />
          </Field>
          <Field label="Text" htmlFor="banner-body" optional error={errors["banner.body"]}>
            <Textarea
              id="banner-body"
              rows={2}
              value={value.body ?? ""}
              placeholder="e.g. Five cafés, one stamp card."
              onChange={(e) => set({ body: e.target.value })}
              aria-invalid={!!errors["banner.body"]}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
            <Field label="Button label" htmlFor="banner-cta" optional error={errors["banner.cta_label"]}>
              <Input
                id="banner-cta"
                value={value.cta_label ?? ""}
                placeholder="e.g. See the crawl"
                onChange={(e) => set({ cta_label: e.target.value })}
                aria-invalid={!!errors["banner.cta_label"]}
              />
            </Field>
            <Field
              label="Link"
              htmlFor="banner-link"
              optional
              hint="A nook:// link opens a screen in the app; https:// opens the browser."
              error={errors["banner.link"]}
            >
              <Input
                id="banner-link"
                type="url"
                inputMode="url"
                autoComplete="off"
                value={value.link ?? ""}
                placeholder="e.g. nook://crawls/…"
                onChange={(e) => set({ link: e.target.value })}
                aria-invalid={!!errors["banner.link"]}
              />
            </Field>
          </div>
          <ScheduleFields
            idPrefix="banner-schedule"
            value={value.schedule}
            onChange={(schedule) => set({ schedule })}
            errors={errors}
            errorPrefix="banner.schedule"
            what="banner"
            onPreviewAt={onPreviewAt}
          />
        </fieldset>
      )}
    </div>
  )
}
