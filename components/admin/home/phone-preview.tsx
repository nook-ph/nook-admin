"use client"

// The draft as a phone would show it at a chosen moment: one control row
// above a centred phone frame, the banner on top, then each shelf as a
// sideways row of café cards. Sections hidden at that moment stay in place
// as a short amber note, so the admin sees what dropped out and why.

import * as React from "react"
import { EyeSlashIcon, MapPinIcon, StarIcon, UserIcon } from "@phosphor-icons/react"

import { Input } from "@/components/ui/input"
import { CafeThumb, cafeArea } from "@/components/admin/home/cafe-picker"
import { isoToManilaLocal, manilaLocalToIso, type HomeLayoutDocument } from "@/lib/home-layout/document"
import { buildPreview, PREVIEW_ORIGIN } from "@/lib/home-layout/preview"
import type { HomeCafe } from "@/lib/queries/home-layout"
import { cn } from "@/lib/utils"

function useNow() {
  // Re-read "now" each minute so a schedule boundary shows without a reload.
  const [now, setNow] = React.useState<Date | null>(null)
  React.useEffect(() => {
    // Set after mount (not during render) so server and client markup match.
    const first = setTimeout(() => setNow(new Date()), 0)
    const t = setInterval(() => setNow(new Date()), 60_000)
    return () => {
      clearTimeout(first)
      clearInterval(t)
    }
  }, [])
  return now
}

export function PhonePreview({ document, cafes }: { document: HomeLayoutDocument; cafes: HomeCafe[] }) {
  const now = useNow()
  const [mode, setMode] = React.useState<"now" | "pick">("now")
  const [picked, setPicked] = React.useState("")

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
                onClick={() => {
                  setMode(m)
                  if (m === "pick" && !picked && now) setPicked(isoToManilaLocal(now.toISOString()))
                }}
                className={cn(
                  "h-9 rounded-md px-3 text-[13px] font-medium outline-hidden focus-visible:ring-2 focus-visible:ring-ring sm:h-7",
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
            onChange={(e) => setPicked(e.target.value)}
          />
        ) : null}
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {label}, Manila time · location as {PREVIEW_ORIGIN.label}
        </p>
      </div>

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
              {preview.banner && <BannerCard banner={preview.banner} />}
              {preview.bannerHiddenReason && document.banner?.title && (
                <HiddenNote title={`Banner: ${document.banner.title}`} reason={preview.bannerHiddenReason} />
              )}
              {preview.items.map((item) =>
                item.kind === "hidden" ? (
                  <HiddenNote key={item.hidden.id} title={item.hidden.title} reason={item.hidden.reason} />
                ) : (
                  <div key={item.shelf.id} className="pt-4">
                    <div className="flex items-baseline justify-between gap-2 px-4 pb-2">
                      <h3 className="min-w-0 truncate text-[13px] font-semibold">{item.shelf.title}</h3>
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

function HiddenNote({ title, reason }: { title: string; reason: string }) {
  return (
    <p className="mx-4 mt-3 flex items-start gap-1.5 rounded-md bg-[#FFF4DC] px-2.5 py-1.5 text-[11px] text-[#8A5A00]">
      <EyeSlashIcon className="mt-px size-3 shrink-0" aria-hidden />
      <span className="min-w-0">
        <span className="font-medium">{title}</span> hidden · {reason}
      </span>
    </p>
  )
}
