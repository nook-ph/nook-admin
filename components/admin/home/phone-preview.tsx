"use client"

// The draft as a phone would show it at a chosen moment: one control row
// above a centred phone frame, the banner on top, then each shelf as a
// sideways row of café cards. Sections hidden at that moment stay in place
// as a short amber note, so the admin sees what dropped out and why.

import * as React from "react"
import { ArrowCounterClockwiseIcon, ArrowLeftIcon, EyeSlashIcon, MapPinIcon, StarIcon, UserIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TONES } from "@/components/admin/table-kit"
import { CafeThumb, cafeArea } from "@/components/admin/home/cafe-picker"
import { useNow } from "@/components/admin/home/use-now"
import { isoToManilaLocal, manilaLocalToIso, type HomeLayoutDocument } from "@/lib/home-layout/document"
import { buildPreview, PREVIEW_ORIGIN } from "@/lib/home-layout/preview"
import type { HomeCafe } from "@/lib/queries/home-layout"
import { cn } from "@/lib/utils"

export type PreviewTime = { mode: "now" | "pick"; picked: string }

/** A past or live version shown in the frame instead of the draft. */
export type PreviewVersion = {
  label: string
  live: boolean
  onBack: () => void
  onRestore?: () => void
}

export function PhonePreview({
  document,
  cafes,
  time,
  onTimeChange,
  version,
  onSelect,
}: {
  document: HomeLayoutDocument
  cafes: HomeCafe[]
  time: PreviewTime
  onTimeChange: (next: PreviewTime) => void
  /** Set while a version from Versions is shown instead of the draft. */
  version?: PreviewVersion | null
  /** Clicking a shelf or the banner in the frame opens its editor. */
  onSelect?: (target: string) => void
}) {
  const now = useNow()
  const { mode, picked } = time
  const select = version ? undefined : onSelect

  const at = mode === "pick" && picked ? new Date(manilaLocalToIso(picked) ?? "") : now
  // ~200 cafés × a dozen shelves: cheap enough to rebuild on every edit.
  const preview = at && !Number.isNaN(at.getTime()) ? buildPreview(document, cafes, at) : null

  const label = at
    ? new Intl.DateTimeFormat("en-PH", {
        timeZone: "Asia/Manila",
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(at)
    : "…"

  return (
    <section aria-labelledby="preview-title" className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <h2 id="preview-title" className="text-[15px] font-semibold">
            Preview
          </h2>
          <div role="radiogroup" aria-label="Preview time" className="inline-flex rounded-lg border p-0.5">
            {(["now", "pick"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={mode === m}
                onClick={() =>
                  onTimeChange({
                    mode: m,
                    picked: m === "pick" && !picked && now ? isoToManilaLocal(now.toISOString()) : picked,
                  })
                }
                className={cn(
                  "h-11 rounded-md px-3 text-[13px] font-medium outline-hidden focus-visible:ring-2 focus-visible:ring-ring sm:h-7",
                  mode === m ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {m === "now" ? "Now" : "Pick a time"}
              </button>
            ))}
          </div>
        </div>
        {mode === "pick" ? (
          <Input
            type="datetime-local"
            aria-label="Preview at (Manila time)"
            value={picked}
            onChange={(e) => onTimeChange({ mode: "pick", picked: e.target.value })}
          />
        ) : null}
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {label}, Manila time · location as {PREVIEW_ORIGIN.label}
        </p>
      </div>

      {version && (
        <div className="flex flex-col gap-2 rounded-lg bg-muted px-3 py-2.5" role="status">
          <p className="text-[13px]">
            Previewing <span className="font-medium">{version.label}</span>
            {version.live ? " (live now)" : ""}. Your draft is unchanged.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" className="max-sm:h-11" onClick={version.onBack}>
              <ArrowLeftIcon aria-hidden />
              Back to draft
            </Button>
            {version.onRestore && (
              <Button type="button" size="sm" className="max-sm:h-11" onClick={version.onRestore}>
                <ArrowCounterClockwiseIcon aria-hidden />
                Restore this version
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-[300px] rounded-[2.25rem] border-[6px] border-foreground/85 bg-background">
        <div
          className="h-[min(560px,calc(100dvh-260px))] min-h-80 overflow-y-auto overscroll-contain rounded-[1.85rem] pb-6 [scrollbar-width:none]"
          aria-label="Phone preview"
          role="region"
        >
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <span className="text-lg font-semibold tracking-tight">Home</span>
            <span className="flex size-7 items-center justify-center rounded-full bg-muted" aria-hidden>
              <UserIcon className="size-3.5 text-muted-foreground" />
            </span>
          </div>

          {!preview ? (
            <div className="flex flex-col gap-3 px-4 pt-2" aria-busy>
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : (
            <>
              {preview.banner && (
                <Pick onSelect={select} target="banner" label="Edit the banner">
                  <BannerCard banner={preview.banner} />
                </Pick>
              )}
              {preview.bannerHiddenReason && document.banner?.title && (
                <Pick onSelect={select} target="banner" label="Edit the banner">
                  <HiddenNote title={`Banner: ${document.banner.title}`} reason={preview.bannerHiddenReason} />
                </Pick>
              )}
              {preview.items.map((item) =>
                item.kind === "hidden" ? (
                  <Pick key={item.hidden.id} onSelect={select} target={item.hidden.id} label={`Edit ${item.hidden.title}`}>
                    <HiddenNote title={item.hidden.title} reason={item.hidden.reason} />
                  </Pick>
                ) : (
                  <div key={item.shelf.id} className="pt-4">
                    <div className="flex items-baseline justify-between gap-2 px-4 pb-2">
                      {select ? (
                        <button
                          type="button"
                          onClick={() => select(item.shelf.id)}
                          aria-label={`Edit ${item.shelf.title}`}
                          className="-mx-1 min-w-0 truncate rounded px-1 text-left text-[13px] font-semibold outline-hidden hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {item.shelf.title}
                        </button>
                      ) : (
                        <h3 className="min-w-0 truncate text-[13px] font-semibold">{item.shelf.title}</h3>
                      )}
                      {item.shelf.usesLocation && (
                        <MapPinIcon className="size-3 shrink-0 text-muted-foreground" aria-label="Uses location" />
                      )}
                    </div>
                    {item.shelf.personal ? (
                      <p className="mx-4 rounded-lg bg-muted px-3 py-2.5 text-[11px] text-muted-foreground">
                        Each person’s saved and recent cafés. Hidden for people with none.
                      </p>
                    ) : (
                      <ul className="flex gap-2.5 overflow-x-auto overscroll-contain px-4 pb-1 [scrollbar-width:none]">
                        {item.shelf.cafes.slice(0, 10).map((c) => (
                          <li key={c.id} className="w-28 shrink-0">
                            <CafeThumb cafe={c} className="aspect-[4/3] h-auto w-28 rounded-lg" />
                            <p className="mt-1 truncate text-[11px] font-medium">{c.name}</p>
                            <p className="flex items-center gap-1 truncate text-[10px] text-muted-foreground">
                              {c.review_count > 0 ? (
                                <>
                                  <StarIcon weight="fill" className="size-2.5 shrink-0" aria-hidden />
                                  <span className="tabular-nums">{c.rating.toFixed(1)}</span>
                                </>
                              ) : (
                                <span>New</span>
                              )}
                              <span className="truncate">· {cafeArea(c)}</span>
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
              )}
              {preview.shelves.length === 0 && !preview.banner && (
                <p className="px-4 pt-6 text-center text-xs text-muted-foreground">
                  Nothing shows at this time. Turn a shelf on or change its schedule.
                </p>
              )}
            </>
          )}
        </div>
      </div>
      {document.respect_purpose && (
        <p className="text-xs text-muted-foreground">
          The app may still move the shelf that matches a person’s onboarding answer to the top.
        </p>
      )}
    </section>
  )
}

function BannerCard({ banner }: { banner: NonNullable<HomeLayoutDocument["banner"]> }) {
  return (
    <div className="mx-4 mt-1 overflow-hidden rounded-xl border">
      {banner.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={banner.image_url} alt="" className="aspect-[16/9] w-full bg-muted object-cover" />
      )}
      <div className="flex flex-col gap-1 p-3">
        <p className="text-[13px] leading-snug font-semibold">{banner.title}</p>
        {banner.body && <p className="text-[11px] leading-snug text-muted-foreground">{banner.body}</p>}
        {banner.cta_label && (
          <span className="mt-1.5 inline-flex w-fit rounded-full bg-primary px-3 py-1 text-[11px] font-medium text-primary-foreground">
            {banner.cta_label}
          </span>
        )}
      </div>
    </div>
  )
}

/** Wraps something in the frame in a button that opens its editor; plain
 *  when the frame is read-only (a version is shown). */
function Pick({
  onSelect,
  target,
  label,
  children,
}: {
  onSelect?: (target: string) => void
  target: string
  label: string
  children: React.ReactNode
}) {
  if (!onSelect) return <>{children}</>
  return (
    <button
      type="button"
      onClick={() => onSelect(target)}
      aria-label={label}
      className="block w-full rounded-xl text-left outline-hidden hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
    </button>
  )
}

function HiddenNote({ title, reason }: { title: string; reason: string }) {
  return (
    <span className={cn("mx-4 mt-3 flex items-start gap-1.5 rounded-md px-2.5 py-1.5 text-xs", TONES.warning)}>
      <EyeSlashIcon className="mt-0.5 size-3 shrink-0" aria-hidden />
      <span className="min-w-0">
        <span className="font-medium">{title}</span> hidden · {reason}
      </span>
    </span>
  )
}
