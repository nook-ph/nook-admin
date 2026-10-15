// What the phone would show for a layout at a given time, from the published
// catalog. Mirrors the app (nook-mobile get_cafe_summaries_usecase + HOME_LAYOUT.md):
// built-in shelves use the same sorts and tags get_cafes is called with; a
// shelf with fewer than 3 cafés is hidden. "Near you" style sorts use Cebu
// City as the preview location, since the admin has no phone position.

import {
  LIMITS,
  isScheduleActive,
  sectionTitle,
  type Banner,
  type HomeLayoutDocument,
  type HomeSection,
  type RuleSort,
} from "@/lib/home-layout/document"
import type { HomeCafe } from "@/lib/queries/home-layout"

export const PREVIEW_ORIGIN = { lat: 10.3157, lng: 123.8854, label: "Cebu City" }
const SHELF_SIZE = 20

export type PreviewShelf = {
  id: string
  title: string
  cafes: HomeCafe[]
  /** Personal to each user (Your places): no real cafés to show. */
  personal?: boolean
  /** Uses a location; previewed from Cebu City. */
  usesLocation?: boolean
}

export type PreviewHidden = { id: string; title: string; reason: string }

export type HomePreview = {
  banner: Banner | null
  bannerHiddenReason: string | null
  shelves: PreviewShelf[]
  hidden: PreviewHidden[]
  /** Shelves and hidden sections in layout order. */
  items: ({ kind: "shelf"; shelf: PreviewShelf } | { kind: "hidden"; hidden: PreviewHidden })[]
}

function distance(c: HomeCafe) {
  const dLat = ((c.lat - PREVIEW_ORIGIN.lat) * Math.PI) / 180
  const dLng = ((c.lng - PREVIEW_ORIGIN.lng) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((PREVIEW_ORIGIN.lat * Math.PI) / 180) * Math.cos((c.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return 2 * 6371000 * Math.asin(Math.sqrt(a))
}

function sortCafes(list: HomeCafe[], sort: RuleSort) {
  const out = [...list]
  const tie = (a: HomeCafe, b: HomeCafe) =>
    Number(b.is_featured) - Number(a.is_featured) || b.created_at.localeCompare(a.created_at)
  switch (sort) {
    case "top_rated":
      return out.sort((a, b) => b.rating - a.rating || tie(a, b))
    case "trending": {
      const score = (c: HomeCafe) => c.rating * Math.log10(Math.max(c.review_count, 1))
      return out.sort((a, b) => score(b) - score(a) || tie(a, b))
    }
    case "newest":
      return out.sort((a, b) => b.created_at.localeCompare(a.created_at))
    case "nearby":
      return out.sort((a, b) => distance(a) - distance(b))
    default:
      // An unknown sort in an old or hand-made document: the app uses top_rated.
      return out.sort((a, b) => b.rating - a.rating || tie(a, b))
  }
}

function withTags(cafes: HomeCafe[], tags: string[]) {
  return cafes.filter((c) => tags.every((t) => c.tags.includes(t)))
}

function pickIds(ids: string[], byId: Map<string, HomeCafe>) {
  return ids.map((id) => byId.get(id)).filter((c): c is HomeCafe => !!c)
}

function shelfCafes(s: HomeSection, cafes: HomeCafe[], byId: Map<string, HomeCafe>): Omit<PreviewShelf, "id" | "title"> {
  if (s.type === "custom") {
    if (s.source === "picked") return { cafes: pickIds(s.cafe_ids ?? [], byId).slice(0, LIMITS.cafeIdsPerSection) }
    const rule = s.rule
    if (!rule?.tag) return { cafes: [] }
    return {
      cafes: sortCafes(withTags(cafes, [rule.tag]), rule.sort).slice(0, rule.limit),
      usesLocation: rule.sort === "nearby",
    }
  }
  switch (s.id) {
    case "your_places":
      return { cafes: [], personal: true }
    case "nearby":
      return { cafes: sortCafes(cafes, "nearby").slice(0, SHELF_SIZE), usesLocation: true }
    case "featured": {
      if (s.cafe_ids && s.cafe_ids.length > 0) return { cafes: pickIds(s.cafe_ids, byId) }
      // As the app (nook-mobile HomeBloc._buildFeatured): the featured cafés
      // among the Newest, Crowd favorites, Highest rated and Near you lists,
      // in that order, each once.
      const seen = new Set<string>()
      const pool = [
        ...sortCafes(cafes, "newest").slice(0, SHELF_SIZE),
        ...sortCafes(cafes, "trending").slice(0, SHELF_SIZE),
        ...sortCafes(cafes, "top_rated").slice(0, SHELF_SIZE),
        ...sortCafes(cafes, "nearby").slice(0, SHELF_SIZE),
      ]
      return { cafes: pool.filter((c) => c.is_featured && !seen.has(c.id) && !!seen.add(c.id)), usesLocation: true }
    }
    case "specialty":
      return { cafes: sortCafes(withTags(cafes, ["Specialty Coffee"]), "nearby").slice(0, SHELF_SIZE), usesLocation: true }
    case "local_beans":
      return { cafes: sortCafes(withTags(cafes, ["Philippine Beans"]), "nearby").slice(0, SHELF_SIZE), usesLocation: true }
    case "newest":
      return { cafes: sortCafes(cafes, "newest").slice(0, SHELF_SIZE) }
    case "laptop_friendly":
      return { cafes: sortCafes(withTags(cafes, ["Free WiFi", "Power Outlets"]), "top_rated").slice(0, SHELF_SIZE) }
    case "trending":
      return { cafes: sortCafes(cafes, "trending").slice(0, SHELF_SIZE) }
    case "top_rated":
      return { cafes: sortCafes(cafes, "top_rated").slice(0, SHELF_SIZE) }
  }
}

/** How many cafés a shelf's own page (nook://shelf/<id>) would list from
 *  this catalog: the app shows "This shelf isn't on Nook right now" at 0. */
export function shelfPageCafeCount(s: HomeSection, cafes: HomeCafe[]): number {
  const byId = new Map(cafes.map((c) => [c.id, c]))
  if (s.type === "custom" && s.source === "rule") {
    return s.rule?.tag ? withTags(cafes, [s.rule.tag]).length : 0
  }
  return pickIds(s.cafe_ids ?? [], byId).length
}

/** HOME_LAYOUT.md › pin_top, as nook-mobile pinPersonalShelves: with pin_top
 *  on, Your places and Near you are pulled into the first three of the shown
 *  shelves (the admin's first other shelves fill the rest of the top, in
 *  order). Turned-off and out-of-schedule rows keep their place in the list.
 *  The preview always has a position (Cebu City), so Near you always counts. */
export const PINNED_SLOTS = 3

export function pinnedOrder(doc: HomeLayoutDocument, at: Date): HomeSection[] {
  if (doc.pin_top === false) return doc.sections
  const shown = (s: HomeSection) => s.visible && isScheduleActive(s.schedule, at)
  const slots = doc.sections.filter(shown)
  const isPin = (s: HomeSection) => s.id === "your_places" || s.id === "nearby"
  const pins = slots.filter(isPin)
  if (pins.length === 0 || pins.every((p) => slots.indexOf(p) < PINNED_SLOTS)) return doc.sections
  const lead = PINNED_SLOTS - pins.length
  const others = slots.filter((s) => !isPin(s))
  const top = new Set([...pins, ...others.slice(0, lead)])
  const order = [...slots.filter((s) => top.has(s)), ...others.slice(lead)]
  let next = 0
  return doc.sections.map((s) => (shown(s) ? order[next++] : s))
}

export function buildPreview(doc: HomeLayoutDocument, cafes: HomeCafe[], at: Date): HomePreview {
  const byId = new Map(cafes.map((c) => [c.id, c]))
  const shelves: PreviewShelf[] = []
  const hidden: PreviewHidden[] = []
  const items: HomePreview["items"] = []

  for (const s of pinnedOrder(doc, at)) {
    const title = sectionTitle(s)
    if (!s.visible) {
      hidden.push({ id: s.id, title, reason: "Turned off" })
      items.push({ kind: "hidden", hidden: hidden[hidden.length - 1] })
      continue
    }
    if (!isScheduleActive(s.schedule, at)) {
      hidden.push({ id: s.id, title, reason: "Outside its schedule" })
      items.push({ kind: "hidden", hidden: hidden[hidden.length - 1] })
      continue
    }
    const shelf = shelfCafes(s, cafes, byId)
    if (!shelf.personal && shelf.cafes.length < LIMITS.minShelfCafes) {
      hidden.push({
        id: s.id,
        title,
        reason:
          shelf.cafes.length === 0
            ? "No cafés yet"
            : `Only ${shelf.cafes.length} café${shelf.cafes.length === 1 ? "" : "s"}; needs ${LIMITS.minShelfCafes}`,
      })
      items.push({ kind: "hidden", hidden: hidden[hidden.length - 1] })
      continue
    }
    shelves.push({ id: s.id, title, ...shelf })
    items.push({ kind: "shelf", shelf: shelves[shelves.length - 1] })
  }

  const b = doc.banner
  let banner: Banner | null = null
  let bannerHiddenReason: string | null = null
  // As the app: shown unless enabled is false, and only with a title.
  const on = !!b && b.enabled !== false
  if (b && on && typeof b.title === "string" && b.title.trim()) {
    if (isScheduleActive(b.schedule, at)) banner = b
    else bannerHiddenReason = "Outside its schedule"
  } else if (b && !on) {
    bannerHiddenReason = "Turned off"
  }

  return { banner, bannerHiddenReason, shelves, hidden, items }
}
