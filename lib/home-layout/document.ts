// The Home layout document (nook-supabase docs/HOME_LAYOUT.md, schema 1).
// Pure: shared by the server actions, the editor and the phone preview.

export const HOME_LAYOUT_SCHEMA = 1

export const LIMITS = {
  sections: 20,
  customShelves: 12,
  cafeIdsPerSection: 30,
  ruleLimitMin: 3,
  ruleLimitMax: 20,
  ruleLimitDefault: 10,
  /** A shelf with fewer cafes than this is hidden on the phone. */
  minShelfCafes: 3,
  title: 60,
  bannerTitle: 80,
  bannerBody: 160,
  ctaLabel: 30,
  note: 200,
} as const

export type BuiltinId =
  | "your_places"
  | "nearby"
  | "featured"
  | "specialty"
  | "local_beans"
  | "newest"
  | "laptop_friendly"
  | "trending"
  | "top_rated"

/** The app's built-in order and titles (mobile HomeRail + Your places). */
export const BUILTINS: { id: BuiltinId; title: string; about: string }[] = [
  { id: "your_places", title: "Your places", about: "The person’s saved and recent cafés" },
  { id: "nearby", title: "Near you", about: "Closest first; needs location" },
  { id: "featured", title: "House picks", about: "Featured cafés, or the ones you pick" },
  { id: "specialty", title: "Specialty coffee near you", about: "Tag Specialty Coffee, closest first; needs location" },
  { id: "local_beans", title: "Local beans", about: "Tag Philippine Beans" },
  { id: "newest", title: "Fresh on Nook", about: "Newest listings" },
  { id: "laptop_friendly", title: "Laptop-friendly", about: "Tags Free WiFi and Power Outlets" },
  { id: "trending", title: "Crowd favorites", about: "Rating weighted by review count" },
  { id: "top_rated", title: "Highest rated", about: "Highest rating first" },
]

export const BUILTIN_IDS = BUILTINS.map((b) => b.id)

export function builtinInfo(id: string) {
  return BUILTINS.find((b) => b.id === id)
}

export type RuleSort = "top_rated" | "trending" | "newest" | "nearby"

export const RULE_SORTS: { value: RuleSort; label: string }[] = [
  { value: "top_rated", label: "Highest rated" },
  { value: "trending", label: "Crowd favorites" },
  { value: "newest", label: "Newest" },
  { value: "nearby", label: "Closest first" },
]

export type Schedule = {
  starts_at?: string | null
  ends_at?: string | null
  /** 1 = Monday … 7 = Sunday. Empty or null = every day. */
  days?: number[] | null
  hours?: { from: string; to: string } | null
}

export type BuiltinSection = {
  id: BuiltinId
  type: "builtin"
  visible: boolean
  title?: string | null
  /** featured only: hand-picked House picks. Empty = automatic. */
  cafe_ids?: string[]
  schedule?: Schedule | null
}

export type CustomSection = {
  id: `custom:${string}`
  type: "custom"
  visible: boolean
  title: string
  source: "picked" | "rule"
  cafe_ids?: string[]
  rule?: { tag: string | null; sort: RuleSort; limit: number }
  schedule?: Schedule | null
}

export type HomeSection = BuiltinSection | CustomSection

export type Banner = {
  enabled: boolean
  title: string
  body?: string | null
  image_url?: string | null
  cta_label?: string | null
  link?: string | null
  schedule?: Schedule | null
}

export type HomeLayoutDocument = {
  schema: 1
  respect_purpose: boolean
  banner: Banner | null
  sections: HomeSection[]
}

export function defaultSections(): HomeSection[] {
  return BUILTINS.map((b) => ({
    id: b.id,
    type: "builtin" as const,
    visible: true,
    title: b.title,
  }))
}

/** What a new draft starts from: the built-in order with its default titles. */
export function defaultDocument(): HomeLayoutDocument {
  return { schema: 1, respect_purpose: true, banner: null, sections: defaultSections() }
}

/** What "Reset to default" publishes: no sections and no banner, so the app
 *  uses its built-in Home (HOME_LAYOUT.md › Storage). */
export function resetDocument(): HomeLayoutDocument {
  return { schema: 1, respect_purpose: true, banner: null, sections: [] }
}

export function emptyBanner(): Banner {
  return { enabled: true, title: "", body: "", image_url: null, cta_label: "", link: "", schedule: null }
}

export function newCustomSection(): CustomSection {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(16).slice(2, 10)
  return {
    id: `custom:${rand}`,
    type: "custom",
    visible: true,
    title: "",
    source: "picked",
    cafe_ids: [],
    rule: { tag: null, sort: "top_rated", limit: LIMITS.ruleLimitDefault },
  }
}

export function sectionTitle(section: HomeSection) {
  if (section.title && section.title.trim()) return section.title.trim()
  if (section.type === "builtin") return builtinInfo(section.id)?.title ?? section.id
  return "Untitled shelf"
}

// ---------------------------------------------------------------------------
// Normalising: the editor reads documents written by older editors, by hand,
// or the empty one "Reset to default" publishes. A document with no sections
// means "the app's default", so it opens as the default order.

export function normalizeDocument(input: unknown): HomeLayoutDocument {
  const doc = (input && typeof input === "object" ? input : {}) as Partial<HomeLayoutDocument>
  const sections = Array.isArray(doc.sections) ? doc.sections.filter(isSection) : []
  const listed = sections.length > 0 ? sections : defaultSections()
  return {
    schema: 1,
    respect_purpose: doc.respect_purpose !== false,
    banner: doc.banner && typeof doc.banner === "object" ? (doc.banner as Banner) : null,
    sections: withAllBuiltins(listed),
  }
}

/** Builtins missing from the list are appended in default order, as the app
 *  does, so the editor shows every shelf the phone will show and every saved
 *  document lists all nine (above all `nearby`: the app follows array order,
 *  so a layout that drops it pushes "Near you" to the bottom of Home). */
export function withAllBuiltins(sections: HomeSection[]): HomeSection[] {
  const missing = BUILTINS.filter((b) => !sections.some((s) => s.id === b.id)).map(
    (b): HomeSection => ({ id: b.id, type: "builtin", visible: true, title: b.title })
  )
  return missing.length > 0 ? [...sections, ...missing] : sections
}

function isSection(s: unknown): s is HomeSection {
  if (!s || typeof s !== "object") return false
  const v = s as { id?: unknown; type?: unknown }
  if (typeof v.id !== "string") return false
  if (v.type === "builtin") return (BUILTIN_IDS as string[]).includes(v.id)
  return v.type === "custom" && v.id.startsWith("custom:")
}

/** The document as saved: trims text, drops empty optional fields so the
 *  phone reads null/absent rather than "". */
export function cleanDocument(doc: HomeLayoutDocument): HomeLayoutDocument {
  const clean = (v: string | null | undefined) => {
    const t = (v ?? "").trim()
    return t ? t : null
  }
  const cleanSchedule = (s: Schedule | null | undefined): Schedule | null => {
    if (!s) return null
    const out: Schedule = {
      starts_at: s.starts_at || null,
      ends_at: s.ends_at || null,
      days: s.days && s.days.length > 0 && s.days.length < 7 ? [...s.days].sort() : null,
      hours: s.hours && s.hours.from && s.hours.to ? s.hours : null,
    }
    return out.starts_at || out.ends_at || out.days || out.hours ? out : null
  }
  return {
    schema: 1,
    respect_purpose: doc.respect_purpose,
    banner: doc.banner
      ? {
          enabled: doc.banner.enabled,
          title: doc.banner.title.trim(),
          body: clean(doc.banner.body),
          image_url: clean(doc.banner.image_url),
          cta_label: clean(doc.banner.cta_label),
          link: clean(doc.banner.link),
          schedule: cleanSchedule(doc.banner.schedule),
        }
      : null,
    // Never drop a builtin (nearby above all); an empty list stays empty,
    // which is "Reset to default".
    sections: (doc.sections.length > 0 ? withAllBuiltins(doc.sections) : []).map((s): HomeSection => {
      const schedule = cleanSchedule(s.schedule)
      if (s.type === "builtin") {
        const def = builtinInfo(s.id)?.title
        const title = clean(s.title)
        return {
          id: s.id,
          type: "builtin",
          visible: s.visible,
          // The default title is left out, so a later default rename reaches it.
          ...(title && title !== def ? { title } : {}),
          ...(s.id === "featured" && s.cafe_ids && s.cafe_ids.length > 0 ? { cafe_ids: s.cafe_ids } : {}),
          ...(schedule ? { schedule } : {}),
        }
      }
      return {
        id: s.id,
        type: "custom",
        visible: s.visible,
        title: s.title.trim(),
        source: s.source,
        ...(s.source === "picked"
          ? { cafe_ids: s.cafe_ids ?? [] }
          : { rule: { tag: s.rule?.tag ?? null, sort: s.rule?.sort ?? "top_rated", limit: s.rule?.limit ?? LIMITS.ruleLimitDefault } }),
        ...(schedule ? { schedule } : {}),
      }
    }),
  }
}

// ---------------------------------------------------------------------------
// Validation (HOME_LAYOUT.md › limits). Keys are field paths the editor
// shows errors under: "sections.<id>.title", "banner.link", ...

export type LayoutErrors = Record<string, string>

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/

export function validateLink(link: string | null | undefined): string | null {
  const v = (link ?? "").trim()
  if (!v) return null
  if (/^nook:\/\/\S+$/.test(v)) return null
  try {
    const u = new URL(v)
    if (u.protocol === "https:" && u.hostname.includes(".")) return null
  } catch {
    /* fall through */
  }
  return "Use a nook:// link or an https:// address."
}

function validateSchedule(prefix: string, s: Schedule | null | undefined, errors: LayoutErrors) {
  if (!s) return
  if (s.starts_at && Number.isNaN(Date.parse(s.starts_at))) errors[`${prefix}.starts_at`] = "Not a valid date."
  if (s.ends_at && Number.isNaN(Date.parse(s.ends_at))) errors[`${prefix}.ends_at`] = "Not a valid date."
  if (s.starts_at && s.ends_at && Date.parse(s.ends_at) <= Date.parse(s.starts_at)) {
    errors[`${prefix}.ends_at`] = "Ends before it starts."
  }
  if (s.days && s.days.some((d) => !Number.isInteger(d) || d < 1 || d > 7)) {
    errors[`${prefix}.days`] = "Days run 1 (Monday) to 7 (Sunday)."
  }
  if (s.hours) {
    const { from, to } = s.hours
    if ((from && !to) || (!from && to)) errors[`${prefix}.hours`] = "Set both times, or neither."
    else if (from && to && (!HHMM.test(from) || !HHMM.test(to))) errors[`${prefix}.hours`] = "Use HH:MM."
    else if (from && to && from === to) errors[`${prefix}.hours`] = "From and to are the same time."
  }
}

export function validateDocument(doc: HomeLayoutDocument, knownTags?: string[]): LayoutErrors {
  const errors: LayoutErrors = {}
  if (doc.sections.length > LIMITS.sections) {
    errors["sections"] = `At most ${LIMITS.sections} shelves; remove ${doc.sections.length - LIMITS.sections}.`
  }
  const customs = doc.sections.filter((s) => s.type === "custom")
  if (customs.length > LIMITS.customShelves) {
    errors["sections"] = `At most ${LIMITS.customShelves} custom shelves.`
  }
  const seen = new Set<string>()
  for (const s of doc.sections) {
    const p = `sections.${s.id}`
    if (seen.has(s.id)) errors[p] = "This shelf is listed twice."
    seen.add(s.id)
    const title = (s.title ?? "").trim()
    if (title.length > LIMITS.title) errors[`${p}.title`] = `Keep it under ${LIMITS.title} characters.`
    if (s.type === "custom" && !title) errors[`${p}.title`] = "Give the shelf a title."
    const ids = s.type === "custom" ? (s.source === "picked" ? s.cafe_ids ?? [] : []) : s.cafe_ids ?? []
    if (ids.length > LIMITS.cafeIdsPerSection) {
      errors[`${p}.cafe_ids`] = `At most ${LIMITS.cafeIdsPerSection} cafés.`
    }
    if (s.type === "custom" && s.source === "rule") {
      const r = s.rule
      if (!r?.tag) errors[`${p}.rule.tag`] = "Choose a tag."
      else if (knownTags && !knownTags.includes(r.tag)) errors[`${p}.rule.tag`] = "This tag no longer exists."
      if (!r || !Number.isInteger(r.limit) || r.limit < LIMITS.ruleLimitMin || r.limit > LIMITS.ruleLimitMax) {
        errors[`${p}.rule.limit`] = `Between ${LIMITS.ruleLimitMin} and ${LIMITS.ruleLimitMax}.`
      }
    }
    validateSchedule(`${p}.schedule`, s.schedule, errors)
  }
  const b = doc.banner
  if (b && b.enabled) {
    if (!b.title.trim()) errors["banner.title"] = "A banner needs a title."
    if (b.title.trim().length > LIMITS.bannerTitle) errors["banner.title"] = `Keep it under ${LIMITS.bannerTitle} characters.`
    if ((b.body ?? "").trim().length > LIMITS.bannerBody) errors["banner.body"] = `Keep it under ${LIMITS.bannerBody} characters.`
    if ((b.cta_label ?? "").trim().length > LIMITS.ctaLabel) errors["banner.cta_label"] = `Keep it under ${LIMITS.ctaLabel} characters.`
    const linkError = validateLink(b.link)
    if (linkError) errors["banner.link"] = linkError
    if ((b.cta_label ?? "").trim() && !(b.link ?? "").trim()) errors["banner.link"] = "A button needs a link."
    validateSchedule("banner.schedule", b.schedule, errors)
  }
  return errors
}

// ---------------------------------------------------------------------------
// Schedules, evaluated in Asia/Manila (UTC+8, no daylight saving).

const MANILA_OFFSET_MS = 8 * 60 * 60 * 1000

/** Wall-clock parts of `date` in Manila. */
export function manilaParts(date: Date) {
  const m = new Date(date.getTime() + MANILA_OFFSET_MS)
  const isoDay = ((m.getUTCDay() + 6) % 7) + 1 // 1 = Monday
  return {
    year: m.getUTCFullYear(),
    month: m.getUTCMonth() + 1,
    day: m.getUTCDate(),
    isoDay,
    minutes: m.getUTCHours() * 60 + m.getUTCMinutes(),
  }
}

/** "2026-10-20T08:00" (Manila wall clock, as a datetime-local input holds it)
 *  → "2026-10-20T08:00:00+08:00". */
export function manilaLocalToIso(local: string): string | null {
  if (!local) return null
  const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/.exec(local)
  return m ? `${m[1]}T${m[2]}:00+08:00` : null
}

/** The reverse: an ISO timestamp as a Manila datetime-local value. */
export function isoToManilaLocal(iso: string | null | undefined): string {
  if (!iso) return ""
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return ""
  return new Date(t + MANILA_OFFSET_MS).toISOString().slice(0, 16)
}

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number)
  return h * 60 + m
}

/** Whether a schedule lets its section or banner show at `at`. */
export function isScheduleActive(s: Schedule | null | undefined, at: Date): boolean {
  if (!s) return true
  const t = at.getTime()
  if (s.starts_at && t < Date.parse(s.starts_at)) return false
  if (s.ends_at && t > Date.parse(s.ends_at)) return false
  const p = manilaParts(at)
  if (s.days && s.days.length > 0 && !s.days.includes(p.isoDay)) return false
  if (s.hours && s.hours.from && s.hours.to) {
    const from = toMinutes(s.hours.from)
    const to = toMinutes(s.hours.to)
    const inside = from <= to ? p.minutes >= from && p.minutes < to : p.minutes >= from || p.minutes < to
    if (!inside) return false
  }
  return true
}

const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

function formatManila(iso: string) {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso))
}

function formatHour(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number)
  const suffix = h < 12 ? "am" : "pm"
  const h12 = h % 12 === 0 ? 12 : h % 12
  return m === 0 ? `${h12}${suffix}` : `${h12}:${String(m).padStart(2, "0")}${suffix}`
}

function describeDays(days: number[]) {
  const sorted = [...days].sort()
  if (sorted.join() === "6,7") return "Weekends"
  if (sorted.join() === "1,2,3,4,5") return "Weekdays"
  return sorted.map((d) => DAY_SHORT[d - 1]).join(", ")
}

/** One line in words: "Sat, Sun · 7am–12pm · until Dec 31, 11:59 pm". Null
 *  when there is no schedule. */
export function describeSchedule(s: Schedule | null | undefined): string | null {
  if (!s) return null
  const parts: string[] = []
  if (s.days && s.days.length > 0 && s.days.length < 7) parts.push(describeDays(s.days))
  if (s.hours && s.hours.from && s.hours.to) parts.push(`${formatHour(s.hours.from)}–${formatHour(s.hours.to)}`)
  if (s.starts_at && s.ends_at) parts.push(`${formatManila(s.starts_at)} to ${formatManila(s.ends_at)}`)
  else if (s.starts_at) parts.push(`from ${formatManila(s.starts_at)}`)
  else if (s.ends_at) parts.push(`until ${formatManila(s.ends_at)}`)
  return parts.length > 0 ? parts.join(" · ") : null
}
