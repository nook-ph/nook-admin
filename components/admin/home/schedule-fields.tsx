"use client"

// Schedule for a shelf or the banner (HOME_LAYOUT.md › schedule): start and
// end side by side, seven weekday toggles, an hours window, and one sentence
// restating it. Times are Manila wall-clock.

import * as React from "react"
import { CalendarBlankIcon, XIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/admin/form-kit"
import {
  describeSchedule,
  isoToManilaLocal,
  manilaLocalToIso,
  type LayoutErrors,
  type Schedule,
} from "@/lib/home-layout/document"
import { cn } from "@/lib/utils"

const DAYS = [
  { n: 1, short: "Mon", long: "Monday" },
  { n: 2, short: "Tue", long: "Tuesday" },
  { n: 3, short: "Wed", long: "Wednesday" },
  { n: 4, short: "Thu", long: "Thursday" },
  { n: 5, short: "Fri", long: "Friday" },
  { n: 6, short: "Sat", long: "Saturday" },
  { n: 7, short: "Sun", long: "Sunday" },
]

export function ScheduleFields({
  idPrefix,
  value,
  onChange,
  errors,
  errorPrefix,
  what,
}: {
  idPrefix: string
  value: Schedule | null | undefined
  onChange: (next: Schedule | null) => void
  errors: LayoutErrors
  errorPrefix: string
  /** "shelf" or "banner", for the copy. */
  what: string
}) {
  const [open, setOpen] = React.useState(!!value)
  const s: Schedule = value ?? {}
  const summary = describeSchedule(value)

  if (!open) {
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
          <CalendarBlankIcon aria-hidden />
          Add a schedule
        </Button>
        <span className="text-xs text-muted-foreground">Without one, the {what} always shows.</span>
      </div>
    )
  }

  const set = (patch: Partial<Schedule>) => onChange({ ...s, ...patch })
  const days = s.days ?? []
  const toggleDay = (n: number) =>
    set({ days: days.includes(n) ? days.filter((d) => d !== n) : [...days, n].sort() })

  return (
    <fieldset className="flex min-w-0 flex-col gap-4 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-3">
        <legend className="text-sm font-medium">Schedule</legend>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => {
            onChange(null)
            setOpen(false)
          }}
        >
          <XIcon aria-hidden />
          Remove schedule
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Starts" htmlFor={`${idPrefix}-starts`} optional error={errors[`${errorPrefix}.starts_at`]}>
          <Input
            id={`${idPrefix}-starts`}
            type="datetime-local"
            value={isoToManilaLocal(s.starts_at)}
            onChange={(e) => set({ starts_at: manilaLocalToIso(e.target.value) })}
            aria-invalid={!!errors[`${errorPrefix}.starts_at`]}
          />
        </Field>
        <Field label="Ends" htmlFor={`${idPrefix}-ends`} optional error={errors[`${errorPrefix}.ends_at`]}>
          <Input
            id={`${idPrefix}-ends`}
            type="datetime-local"
            value={isoToManilaLocal(s.ends_at)}
            onChange={(e) => set({ ends_at: manilaLocalToIso(e.target.value) })}
            aria-invalid={!!errors[`${errorPrefix}.ends_at`]}
          />
        </Field>
      </div>

      <div className="flex min-w-0 flex-col gap-1.5">
        <span id={`${idPrefix}-days-label`} className="text-sm font-medium">
          Days <span className="ml-1 text-xs font-normal text-muted-foreground">None picked = every day</span>
        </span>
        <div role="group" aria-labelledby={`${idPrefix}-days-label`} className="grid grid-cols-7 gap-1.5">
          {DAYS.map((d) => {
            const on = days.includes(d.n)
            return (
              <button
                key={d.n}
                type="button"
                aria-pressed={on}
                aria-label={d.long}
                onClick={() => toggleDay(d.n)}
                className={cn(
                  "h-11 rounded-lg border text-[13px] font-medium outline-hidden focus-visible:ring-2 focus-visible:ring-ring sm:h-8",
                  on ? "border-foreground bg-foreground text-background" : "bg-background text-muted-foreground hover:bg-muted"
                )}
              >
                {d.short}
              </button>
            )
          })}
        </div>
        {errors[`${errorPrefix}.days`] && <p className="text-xs text-destructive">{errors[`${errorPrefix}.days`]}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="From" htmlFor={`${idPrefix}-from`} optional error={errors[`${errorPrefix}.hours`]}>
          <Input
            id={`${idPrefix}-from`}
            type="time"
            value={s.hours?.from ?? ""}
            onChange={(e) => set({ hours: { from: e.target.value, to: s.hours?.to ?? "" } })}
            aria-invalid={!!errors[`${errorPrefix}.hours`]}
          />
        </Field>
        <Field label="To" htmlFor={`${idPrefix}-to`} optional hint="Earlier than From runs past midnight.">
          <Input
            id={`${idPrefix}-to`}
            type="time"
            value={s.hours?.to ?? ""}
            onChange={(e) => set({ hours: { from: s.hours?.from ?? "", to: e.target.value } })}
          />
        </Field>
      </div>

      <p className="text-[13px] text-muted-foreground" aria-live="polite">
        {summary ? (
          <>
            Shows <span className="font-medium text-foreground">{summary}</span>, Manila time.
          </>
        ) : (
          "Nothing set yet, so it always shows. Times are Manila time."
        )}
      </p>
    </fieldset>
  )
}
