"use client"

// Ordered café picker for House picks and hand-picked shelves: a count and
// limit line, search with thumbnail rows and an add action, then the chosen
// list in shelf order (drag, or the arrow buttons, to reorder).

import * as React from "react"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DotsSixVerticalIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  StorefrontIcon,
  XIcon,
} from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LIMITS } from "@/lib/home-layout/document"
import type { HomeCafe } from "@/lib/queries/home-layout"
import { cn } from "@/lib/utils"

export function CafeThumb({ cafe, className }: { cafe: Pick<HomeCafe, "featured_image_url"> | undefined; className?: string }) {
  return cafe?.featured_image_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={cafe.featured_image_url}
      alt=""
      loading="lazy"
      className={cn("size-9 shrink-0 rounded-md bg-muted object-cover", className)}
    />
  ) : (
    <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-md bg-muted", className)}>
      <StorefrontIcon className="size-4 text-muted-foreground" aria-hidden />
    </span>
  )
}

export function cafeArea(c: Pick<HomeCafe, "neighborhood" | "city">) {
  return [c.neighborhood, c.city].filter(Boolean).join(", ")
}

const RESULT_LIMIT = 8

export function CafePicker({
  id,
  value,
  onChange,
  cafes,
  cafesById,
  emptyNote,
  error,
}: {
  id: string
  value: string[]
  onChange: (ids: string[]) => void
  cafes: HomeCafe[]
  cafesById: Map<string, HomeCafe>
  /** What an empty list means for this shelf. */
  emptyNote: string
  error?: string | null
}) {
  const [query, setQuery] = React.useState("")
  const [dragIndex, setDragIndex] = React.useState<number | null>(null)
  const atLimit = value.length >= LIMITS.cafeIdsPerSection
  const chosen = new Set(value)

  const q = query.trim().toLowerCase()
  const matches = q
    ? cafes.filter((c) => c.name.toLowerCase().includes(q) || cafeArea(c).toLowerCase().includes(q))
    : []
  const results = matches.slice(0, RESULT_LIMIT)

  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length || from === to) return
    const next = [...value]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    onChange(next)
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={`${id}-search`} className="text-sm font-medium">
          Cafés
        </label>
        <span className="text-xs text-muted-foreground tabular-nums">
          {value.length} of {LIMITS.cafeIdsPerSection}
        </span>
      </div>

      <div className="relative">
        <MagnifyingGlassIcon
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          id={`${id}-search`}
          type="search"
          autoComplete="off"
          placeholder={atLimit ? `Limit of ${LIMITS.cafeIdsPerSection} reached` : "Search published cafés by name or area"}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={atLimit}
          className="pl-9"
        />
      </div>

      {q && (
        <div className="overflow-hidden rounded-lg border" aria-live="polite">
          {results.length === 0 ? (
            <p className="px-3 py-3 text-[13px] text-muted-foreground">
              No published café matches “{query.trim()}”.
            </p>
          ) : (
            <ul>
              {results.map((c) => {
                const added = chosen.has(c.id)
                return (
                  <li key={c.id} className="flex items-center gap-3 border-b px-3 py-2 last:border-b-0">
                    <CafeThumb cafe={c} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{c.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">{cafeArea(c)}</span>
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={added || atLimit}
                      onClick={() => onChange([...value, c.id])}
                      aria-label={added ? `${c.name} is already added` : `Add ${c.name}`}
                    >
                      {added ? "Added" : (
                        <>
                          <PlusIcon aria-hidden />
                          Add
                        </>
                      )}
                    </Button>
                  </li>
                )
              })}
              {matches.length > results.length && (
                <li className="px-3 py-2 text-xs text-muted-foreground tabular-nums">
                  Showing {results.length} of {matches.length}. Refine the search to see others.
                </li>
              )}
            </ul>
          )}
        </div>
      )}

      {value.length === 0 ? (
        <p className="rounded-lg border border-dashed px-3 py-3 text-[13px] text-muted-foreground">{emptyNote}</p>
      ) : (
        <ol className="overflow-hidden rounded-lg border" aria-label="Chosen cafés, in shelf order">
          {value.map((cafeId, index) => {
            const c = cafesById.get(cafeId)
            return (
              <li
                key={cafeId}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragIndex !== null) move(dragIndex, index)
                  setDragIndex(null)
                }}
                onDragEnd={() => setDragIndex(null)}
                className={cn(
                  "flex items-center gap-2 border-b bg-background px-2 py-1.5 last:border-b-0",
                  dragIndex === index && "opacity-50"
                )}
              >
                {/* HTML drag doesn't work on touch; phones use the arrows. */}
                <DotsSixVerticalIcon className="hidden size-4 shrink-0 cursor-grab text-muted-foreground sm:block" aria-hidden />
                <span className="w-5 shrink-0 text-right text-xs text-muted-foreground tabular-nums">{index + 1}</span>
                <CafeThumb cafe={c} className="size-8" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {c ? c.name : "Café not published"}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {c ? cafeArea(c) : "Skipped on the phone until it is live again"}
                  </span>
                </span>
                <span className="flex shrink-0 items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={index === 0}
                    onClick={() => move(index, index - 1)}
                    aria-label={`Move ${c?.name ?? "café"} up`}
                  >
                    <ArrowUpIcon aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={index === value.length - 1}
                    onClick={() => move(index, index + 1)}
                    aria-label={`Move ${c?.name ?? "café"} down`}
                  >
                    <ArrowDownIcon aria-hidden />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onChange(value.filter((v) => v !== cafeId))}
                    aria-label={`Remove ${c?.name ?? "café"}`}
                  >
                    <XIcon aria-hidden />
                  </Button>
                </span>
              </li>
            )
          })}
        </ol>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
