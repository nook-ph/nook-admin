"use client"

// The shelves in Home order. Each row: drag handle, a short type code, the
// name over a meta line (source, schedule, hidden, needs a fix), the visible
// switch and an expand chevron. An open row holds that shelf's editor.

import * as React from "react"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretDownIcon,
  DotsSixVerticalIcon,
  PlusIcon,
  TrashIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react"

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
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Field } from "@/components/admin/form-kit"
import { CafePicker } from "@/components/admin/home/cafe-picker"
import { ScheduleFields } from "@/components/admin/home/schedule-fields"
import {
  builtinInfo,
  describeSchedule,
  LIMITS,
  RULE_SORTS,
  sectionTitle,
  type CustomSection,
  type HomeSection,
  type LayoutErrors,
  type RuleSort,
} from "@/lib/home-layout/document"
import { buildPreview } from "@/lib/home-layout/preview"
import type { HomeCafe } from "@/lib/queries/home-layout"
import { cn } from "@/lib/utils"

function hasErrorFor(errors: LayoutErrors, id: string) {
  const prefix = `sections.${id}`
  return Object.keys(errors).some((k) => k === prefix || k.startsWith(prefix + "."))
}

function metaLine(s: HomeSection, cafesById: Map<string, HomeCafe>) {
  const parts: string[] = []
  if (s.type === "builtin") {
    if (s.id === "featured") {
      const n = s.cafe_ids?.length ?? 0
      parts.push(n > 0 ? `${n} picked` : "Automatic")
    } else {
      parts.push(builtinInfo(s.id)?.about ?? "Built in")
    }
  } else if (s.source === "picked") {
    const n = (s.cafe_ids ?? []).filter((id) => cafesById.has(id)).length
    parts.push(`${n} picked`)
  } else {
    const sort = RULE_SORTS.find((r) => r.value === s.rule?.sort)?.label.toLowerCase()
    parts.push(s.rule?.tag ? `Tag ${s.rule.tag}, ${sort}, up to ${s.rule.limit}` : "Rule: no tag yet")
  }
  const sched = describeSchedule(s.schedule)
  if (sched) parts.push(sched)
  return parts.join(" · ")
}

export function SectionList({
  sections,
  onChange,
  errors,
  cafes,
  cafesById,
  tags,
  openId,
  onOpenChange,
}: {
  sections: HomeSection[]
  onChange: (next: HomeSection[]) => void
  errors: LayoutErrors
  cafes: HomeCafe[]
  cafesById: Map<string, HomeCafe>
  tags: string[]
  openId: string | null
  onOpenChange: (id: string | null) => void
}) {
  const [dragIndex, setDragIndex] = React.useState<number | null>(null)
  const [overIndex, setOverIndex] = React.useState<number | null>(null)
  const [confirmDelete, setConfirmDelete] = React.useState<HomeSection | null>(null)

  const update = (id: string, patch: Partial<HomeSection>) =>
    onChange(sections.map((s) => (s.id === id ? ({ ...s, ...patch } as HomeSection) : s)))
  const move = (from: number, to: number) => {
    if (to < 0 || to >= sections.length || from === to) return
    const next = [...sections]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    onChange(next)
  }

  return (
    <>
      <ol className="overflow-hidden rounded-xl border" aria-label="Shelves, in Home order">
        {sections.map((s, index) => {
          const open = openId === s.id
          const hasError = hasErrorFor(errors, s.id)
          const title = sectionTitle(s)
          return (
            <li
              key={s.id}
              id={`row-${s.id}`}
              onDragOver={(e) => {
                e.preventDefault()
                setOverIndex(index)
              }}
              onDrop={() => {
                if (dragIndex !== null) move(dragIndex, index)
                setDragIndex(null)
                setOverIndex(null)
              }}
              className={cn(
                "border-b bg-background last:border-b-0",
                dragIndex === index && "opacity-50",
                overIndex === index && dragIndex !== null && dragIndex !== index && "bg-muted"
              )}
            >
              <div className="flex min-h-13 items-center gap-2 py-1.5 pr-2 pl-1 sm:gap-3 sm:pr-3">
                <span
                  draggable
                  onDragStart={() => setDragIndex(index)}
                  onDragEnd={() => {
                    setDragIndex(null)
                    setOverIndex(null)
                  }}
                  className="hidden cursor-grab items-center self-stretch px-1 text-muted-foreground active:cursor-grabbing sm:flex"
                  title="Drag to reorder"
                  aria-hidden
                >
                  <DotsSixVerticalIcon className="size-4" />
                </span>
                <span className="w-5 shrink-0 text-right text-xs text-muted-foreground tabular-nums sm:w-4">{index + 1}</span>
                <button
                  type="button"
                  onClick={() => onOpenChange(open ? null : s.id)}
                  aria-expanded={open}
                  aria-controls={`panel-${s.id}`}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-md py-1 text-left outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className={cn("truncate text-sm font-medium", !s.visible && "text-muted-foreground")}>{title}</span>
                      <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {s.type === "custom" ? "Custom" : "Built in"}
                      </span>
                    </span>
                    <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                      {hasError ? (
                        <span className="flex items-center gap-1 font-medium text-destructive">
                          <WarningCircleIcon className="size-3.5 shrink-0" aria-hidden />
                          Needs a fix
                        </span>
                      ) : !s.visible ? (
                        <span className="font-medium">Hidden</span>
                      ) : null}
                      {(hasError || !s.visible) && <span aria-hidden>·</span>}
                      <span className="truncate">{metaLine(s, cafesById)}</span>
                    </span>
                  </span>
                  <CaretDownIcon
                    className={cn("size-4 shrink-0 text-muted-foreground transition-transform duration-150", open && "rotate-180")}
                    aria-hidden
                  />
                </button>
                <Switch
                  checked={s.visible}
                  onCheckedChange={(visible) => update(s.id, { visible })}
                  aria-label={`Show ${title}`}
                />
              </div>

              {open && (
                <div id={`panel-${s.id}`} className="flex flex-col gap-5 border-t bg-sidebar/50 px-4 py-5 sm:px-5">
                  <SectionEditor
                    section={s}
                    onPatch={(patch) => update(s.id, patch)}
                    errors={errors}
                    cafes={cafes}
                    cafesById={cafesById}
                    tags={tags}
                  />
                  <div className="flex flex-wrap items-center gap-2 border-t pt-4">
                    <Button type="button" variant="outline" size="sm" disabled={index === 0} onClick={() => move(index, index - 1)}>
                      <ArrowUpIcon aria-hidden />
                      Move up
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={index === sections.length - 1}
                      onClick={() => move(index, index + 1)}
                    >
                      <ArrowDownIcon aria-hidden />
                      Move down
                    </Button>
                    {s.type === "custom" && (
                      <Button type="button" variant="ghost" size="sm" className="ml-auto text-destructive hover:text-destructive" onClick={() => setConfirmDelete(s)}>
                        <TrashIcon aria-hidden />
                        Delete shelf
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ol>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{confirmDelete ? sectionTitle(confirmDelete) : ""}”?</AlertDialogTitle>
            <AlertDialogDescription>
              It leaves the draft now and leaves the app when you next publish. Discard brings it back until you save.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (confirmDelete) onChange(sections.filter((x) => x.id !== confirmDelete.id))
                setConfirmDelete(null)
                onOpenChange(null)
              }}
            >
              Delete shelf
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function AddShelfButton({ disabled, onAdd }: { disabled: boolean; onAdd: () => void }) {
  return (
    <Button type="button" variant="outline" size="sm" onClick={onAdd} disabled={disabled}>
      <PlusIcon aria-hidden />
      Add shelf
    </Button>
  )
}

function SectionEditor({
  section: s,
  onPatch,
  errors,
  cafes,
  cafesById,
  tags,
}: {
  section: HomeSection
  onPatch: (patch: Partial<HomeSection>) => void
  errors: LayoutErrors
  cafes: HomeCafe[]
  cafesById: Map<string, HomeCafe>
  tags: string[]
}) {
  const p = `sections.${s.id}`
  const def = s.type === "builtin" ? builtinInfo(s.id)?.title : undefined
  return (
    <>
      <Field
        label="Title"
        htmlFor={`${s.id}-title`}
        optional={s.type === "builtin"}
        hint={s.type === "builtin" ? `Leave empty for “${def}”.` : undefined}
        error={errors[`${p}.title`]}
      >
        <Input
          id={`${s.id}-title`}
          value={s.title ?? ""}
          placeholder={def ?? "Rainy-day cafés"}
          onChange={(e) => onPatch({ title: e.target.value })}
          aria-invalid={!!errors[`${p}.title`]}
        />
      </Field>

      {s.type === "builtin" && s.id === "featured" && (
        <CafePicker
          id={s.id}
          value={s.cafe_ids ?? []}
          onChange={(cafe_ids) => onPatch({ cafe_ids })}
          cafes={cafes}
          cafesById={cafesById}
          emptyNote="None picked, so House picks fills itself with the featured cafés (automatic). Add cafés to choose them and their order."
          error={errors[`${p}.cafe_ids`]}
        />
      )}

      {s.type === "builtin" && s.id !== "featured" && (
        <p className="text-[13px] text-muted-foreground">
          {builtinInfo(s.id)?.about}. The app fills this shelf; you set its place, title, visibility and schedule.
        </p>
      )}

      {s.type === "custom" && (
        <CustomSource section={s} onPatch={onPatch} errors={errors} cafes={cafes} cafesById={cafesById} tags={tags} />
      )}

      <ScheduleFields
        idPrefix={`${s.id}-schedule`}
        value={s.schedule}
        onChange={(schedule) => onPatch({ schedule })}
        errors={errors}
        errorPrefix={`${p}.schedule`}
        what="shelf"
      />
    </>
  )
}

function CustomSource({
  section: s,
  onPatch,
  errors,
  cafes,
  cafesById,
  tags,
}: {
  section: CustomSection
  onPatch: (patch: Partial<CustomSection>) => void
  errors: LayoutErrors
  cafes: HomeCafe[]
  cafesById: Map<string, HomeCafe>
  tags: string[]
}) {
  const p = `sections.${s.id}`
  const rule = s.rule ?? { tag: null, sort: "top_rated" as RuleSort, limit: LIMITS.ruleLimitDefault }
  const setRule = (patch: Partial<typeof rule>) => onPatch({ rule: { ...rule, ...patch } })

  // Live match count: the same preview logic as the phone frame, for this shelf alone.
  const matches = React.useMemo(() => {
    if (s.source !== "rule" || !rule.tag) return null
    const one = buildPreview(
      { schema: 1, respect_purpose: false, banner: null, sections: [{ ...s, visible: true, schedule: null }] },
      cafes,
      new Date()
    )
    return one.shelves[0]?.cafes.length ?? cafes.filter((c) => c.tags.includes(rule.tag!)).slice(0, rule.limit).length
  }, [s, rule.tag, rule.limit, cafes])

  const pickedLive = (s.cafe_ids ?? []).filter((id) => cafesById.has(id)).length

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <span id={`${s.id}-source`} className="text-sm font-medium">
          Fill with
        </span>
        <div role="radiogroup" aria-labelledby={`${s.id}-source`} className="inline-flex w-fit rounded-lg border bg-background p-0.5">
          {(
            [
              ["picked", "Pick by hand"],
              ["rule", "Fill by rule"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={s.source === value}
              onClick={() =>
                onPatch(
                  value === "picked"
                    ? { source: "picked", cafe_ids: s.cafe_ids ?? [] }
                    : { source: "rule", rule }
                )
              }
              className={cn(
                "h-11 rounded-md px-3 text-[13px] font-medium outline-hidden focus-visible:ring-2 focus-visible:ring-ring sm:h-8",
                s.source === value ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {s.source === "picked" ? (
        <>
          <CafePicker
            id={s.id}
            value={s.cafe_ids ?? []}
            onChange={(cafe_ids) => onPatch({ cafe_ids })}
            cafes={cafes}
            cafesById={cafesById}
            emptyNote={`Add at least ${LIMITS.minShelfCafes} cafés. With fewer, the app hides the shelf.`}
            error={errors[`${p}.cafe_ids`]}
          />
          {pickedLive > 0 && pickedLive < LIMITS.minShelfCafes && (
            <MatchWarning count={pickedLive} />
          )}
        </>
      ) : (
        <div className="flex flex-col gap-4 rounded-lg bg-muted p-4">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_96px]">
            <Field label="Tag" htmlFor={`${s.id}-tag`} error={errors[`${p}.rule.tag`]}>
              <Select value={rule.tag ?? undefined} onValueChange={(tag) => setRule({ tag })}>
                <SelectTrigger id={`${s.id}-tag`} className="w-full bg-background" aria-invalid={!!errors[`${p}.rule.tag`]}>
                  <SelectValue placeholder="Choose a tag" />
                </SelectTrigger>
                <SelectContent>
                  {tags.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Order" htmlFor={`${s.id}-sort`}>
              <Select value={rule.sort} onValueChange={(sort) => setRule({ sort: sort as RuleSort })}>
                <SelectTrigger id={`${s.id}-sort`} className="w-full bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RULE_SORTS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Up to" htmlFor={`${s.id}-limit`} error={errors[`${p}.rule.limit`]}>
              <Input
                id={`${s.id}-limit`}
                type="number"
                inputMode="numeric"
                min={LIMITS.ruleLimitMin}
                max={LIMITS.ruleLimitMax}
                value={Number.isFinite(rule.limit) ? rule.limit : ""}
                onChange={(e) => setRule({ limit: e.target.value === "" ? NaN : Number(e.target.value) })}
                className="bg-background tabular-nums"
                aria-invalid={!!errors[`${p}.rule.limit`]}
              />
            </Field>
          </div>
          <p className="text-[13px]" aria-live="polite">
            {matches === null ? (
              <span className="text-muted-foreground">Choose a tag to see how many cafés match.</span>
            ) : matches < LIMITS.minShelfCafes ? (
              <MatchWarning count={matches} />
            ) : (
              <>
                <span className="font-medium tabular-nums">{matches}</span> cafés fill this shelf right now
                {rule.sort === "nearby" && <span className="text-muted-foreground"> (closest to each person)</span>}.
              </>
            )}
          </p>
        </div>
      )}
    </div>
  )
}

function MatchWarning({ count }: { count: number }) {
  return (
    <span className="inline-flex items-start gap-1.5 rounded-md bg-[#FFF4DC] px-2.5 py-1.5 text-[13px] text-[#8A5A00]">
      <WarningCircleIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      {count === 0 ? "No published café matches." : `Only ${count} café${count === 1 ? "" : "s"}.`} The app hides shelves with
      fewer than {LIMITS.minShelfCafes}.
    </span>
  )
}
