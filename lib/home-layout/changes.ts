// What a draft changes compared with the live layout, and where each schedule
// stands right now. Pure: used by the state line, the Publish dialog and the
// status chips on shelf rows and the banner. Dates are Manila time.

import {
  cleanDocument,
  describeSchedule,
  isScheduleActive,
  sectionTitle,
  type HomeLayoutDocument,
  type HomeSection,
  type Schedule,
} from "@/lib/home-layout/document"

/** Positions 1–3 are what most people see without scrolling. */
export const NEARBY_MAX_POSITION = 3
export const NEARBY_WARNING = "Near you is the most-used shelf; moving it down hides it for most people."

function shortDate(iso: string) {
  return new Intl.DateTimeFormat("en-PH", { timeZone: "Asia/Manila", month: "short", day: "numeric" }).format(new Date(iso))
}

export type ScheduleStatus = {
  kind: "upcoming" | "showing" | "off" | "ended"
  label: string
  tone: "neutral" | "success" | "warning"
  /** "Oct 20": the start for upcoming, the end for ended. */
  date?: string
}

/** "Starts Oct 20" / "Showing · ends Oct 26" / "Ended Oct 10". Null without a schedule. */
export function scheduleStatus(s: Schedule | null | undefined, now: Date): ScheduleStatus | null {
  if (!s || !describeSchedule(s)) return null
  const t = now.getTime()
  if (s.ends_at && t > Date.parse(s.ends_at)) {
    return { kind: "ended", label: `Ended ${shortDate(s.ends_at)}`, tone: "warning", date: shortDate(s.ends_at) }
  }
  if (s.starts_at && t < Date.parse(s.starts_at)) {
    return { kind: "upcoming", label: `Starts ${shortDate(s.starts_at)}`, tone: "neutral", date: shortDate(s.starts_at) }
  }
  const ends = s.ends_at ? ` · ends ${shortDate(s.ends_at)}` : ""
  // Inside the date window; days or hours can still keep it off right now.
  if (!isScheduleActive(s, now)) return { kind: "off", label: `Off right now${ends}`, tone: "neutral" }
  return { kind: "showing", label: `Showing${ends}`, tone: "success" }
}

export type LayoutChanges = {
  /** One line per change, in reading order. */
  changes: string[]
  /** Things that will publish but probably shouldn't go unnoticed. */
  warnings: string[]
}

function same(a: unknown, b: unknown) {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null)
}

/** Ids not in the longest run that kept its relative order: the ones that "moved". */
function movedIds(before: string[], after: string[]) {
  const pos = new Map(before.map((id, i) => [id, i]))
  const seq = after.map((id) => pos.get(id)!)
  // Longest increasing subsequence, O(n²): at most 20 shelves.
  const len = seq.map(() => 1)
  const prev = seq.map(() => -1)
  for (let i = 0; i < seq.length; i++) {
    for (let j = 0; j < i; j++) {
      if (seq[j] < seq[i] && len[j] + 1 > len[i]) {
        len[i] = len[j] + 1
        prev[i] = j
      }
    }
  }
  let end = len.indexOf(Math.max(0, ...len))
  const keep = new Set<string>()
  while (end >= 0) {
    keep.add(after[end])
    end = prev[end]
  }
  return after.filter((id) => !keep.has(id))
}

function fillOf(s: HomeSection) {
  if (s.type === "builtin") return s.cafe_ids ?? []
  return s.source === "picked" ? { source: "picked", ids: s.cafe_ids ?? [] } : { source: "rule", rule: s.rule }
}

/** Warnings that hold for a document on its own, whatever is live. */
export function layoutWarnings(doc: HomeLayoutDocument, now: Date): string[] {
  const warnings: string[] = []
  const b = doc.banner
  if (b && b.enabled && b.title.trim()) {
    const st = scheduleStatus(b.schedule, now)
    if (st?.kind === "ended") warnings.push(`Banner: its schedule ended ${st.date}, so it won’t show.`)
    if (st?.kind === "upcoming") warnings.push(`Banner: starts ${st.date}; hidden until then.`)
  }
  for (const s of doc.sections) {
    if (!s.visible) continue
    const st = scheduleStatus(s.schedule, now)
    if (st?.kind === "ended") warnings.push(`${sectionTitle(s)}: its schedule ended ${st.date}, so it won’t show.`)
    if (st?.kind === "upcoming") warnings.push(`${sectionTitle(s)}: starts ${st.date}; hidden until then.`)
  }
  const nearby = doc.sections.findIndex((s) => s.id === "nearby")
  if (nearby >= NEARBY_MAX_POSITION) warnings.push(`Near you is at #${nearby + 1}. ${NEARBY_WARNING}`)
  return warnings
}

/** What publishing `draft` changes on phones, compared with `live` (the
 *  built-in order when nothing is live). */
export function layoutChanges(live: HomeLayoutDocument, draft: HomeLayoutDocument, now: Date): LayoutChanges {
  const a = cleanDocument(live)
  const b = cleanDocument(draft)
  const changes: string[] = []
  const liveById = new Map(a.sections.map((s) => [s.id, s]))
  const draftIds = new Set(b.sections.map((s) => s.id))

  for (const s of b.sections) if (!liveById.has(s.id)) changes.push(`Added “${sectionTitle(s)}” at #${b.sections.indexOf(s) + 1}`)
  for (const s of a.sections) if (!draftIds.has(s.id)) changes.push(`Removed “${sectionTitle(s)}”`)

  const common = (d: HomeLayoutDocument, other: Set<string>) => d.sections.map((s) => s.id).filter((id) => other.has(id))
  const liveCommon = common(a, draftIds)
  const draftCommon = common(b, new Set(liveById.keys()))
  for (const id of movedIds(liveCommon, draftCommon)) {
    const s = b.sections.find((x) => x.id === id)!
    const from = a.sections.findIndex((x) => x.id === id) + 1
    const to = b.sections.findIndex((x) => x.id === id) + 1
    changes.push(`Moved “${sectionTitle(s)}” from #${from} to #${to}`)
  }

  for (const s of b.sections) {
    const was = liveById.get(s.id)
    if (!was) continue
    const name = sectionTitle(s)
    if (sectionTitle(was) !== name) changes.push(`Renamed “${sectionTitle(was)}” to “${name}”`)
    if (was.visible !== s.visible) changes.push(`${s.visible ? "Showed" : "Hid"} “${name}”`)
    if (!same(fillOf(was), fillOf(s))) {
      if (s.id === "featured") {
        const n = s.type === "builtin" ? s.cafe_ids?.length ?? 0 : 0
        changes.push(n > 0 ? `Changed House picks (${n} picked)` : "House picks back to automatic")
      } else {
        changes.push(`Changed what fills “${name}”`)
      }
    }
    if (!same(was.schedule, s.schedule)) {
      const d = describeSchedule(s.schedule)
      changes.push(d ? `Scheduled “${name}”: ${d}` : `Removed the schedule on “${name}”`)
    }
  }

  const ab = a.banner?.enabled ? a.banner : null
  const bb = b.banner?.enabled ? b.banner : null
  if (!ab && bb) {
    const d = describeSchedule(bb.schedule)
    changes.push(`Banner on: “${bb.title}”${d ? ` · ${d}` : ""}`)
  } else if (ab && !bb) {
    changes.push("Banner off")
  } else if (ab && bb) {
    const { schedule: s1, ...rest1 } = ab
    const { schedule: s2, ...rest2 } = bb
    if (!same(rest1, rest2)) changes.push(`Changed the banner (“${bb.title}”)`)
    if (!same(s1, s2)) {
      const d = describeSchedule(s2)
      changes.push(d ? `Banner schedule: ${d}` : "Removed the banner schedule")
    }
  }

  if (a.respect_purpose !== b.respect_purpose) {
    changes.push(b.respect_purpose ? "Onboarding answers can lead again" : "Your order is exact (onboarding answers don’t lead)")
  }

  return { changes, warnings: layoutWarnings(b, now) }
}
