// Home layout storage (nook-supabase docs/HOME_LAYOUT.md). home_layouts has
// RLS on and no policies, so every read and write here uses the service role;
// callers are server actions or pages behind requireSuperadmin().

import { unstable_cache } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { fixtureStore, isHomeLayoutFixture } from "@/lib/home-layout/dev-fixture"
import { defaultDocument, type HomeLayoutDocument } from "@/lib/home-layout/document"

export type HomeLayoutStatus = "draft" | "published" | "archived"

export type HomeLayoutRow = {
  id: string
  status: HomeLayoutStatus
  document: unknown
  note: string | null
  created_at: string
  updated_at: string
  created_by: string | null
  published_by: string | null
  published_at: string | null
}

export type HomeLayoutVersion = Omit<HomeLayoutRow, "document"> & {
  document: unknown
  publishedByEmail: string | null
}

export type HomeLayoutEditorData = {
  /** The table isn't in the database yet (migration 20261016090000 not applied). */
  missingTable: boolean
  draft: HomeLayoutRow | null
  published: HomeLayoutVersion | null
  /** Published and archived rows, newest first. */
  history: HomeLayoutVersion[]
}

const HISTORY_LIMIT = 30

function isMissingTable(error: { code?: string } | null) {
  return !!error && (error.code === "42P01" || error.code === "PGRST205" || error.code === "PGRST202")
}

async function emailsFor(ids: (string | null)[]) {
  const unique = [...new Set(ids.filter((v): v is string => !!v))]
  const map = new Map<string, string | null>()
  if (unique.length === 0 || isHomeLayoutFixture()) return map
  const supabase = createAdminClient()
  // profiles.email is service-role-readable; a missing row just shows no name.
  const { data } = await supabase.from("profiles").select("id, email").in("id", unique)
  for (const p of data ?? []) map.set(p.id as string, (p.email as string | null) ?? null)
  return map
}

export async function getHomeLayoutEditorData(): Promise<HomeLayoutEditorData> {
  let rows: HomeLayoutRow[]
  if (isHomeLayoutFixture()) {
    rows = [...fixtureStore().rows]
  } else {
    const supabase = createAdminClient()
    const [draftRes, historyRes] = await Promise.all([
      supabase.from("home_layouts").select("*").eq("status", "draft").maybeSingle(),
      supabase
        .from("home_layouts")
        .select("*")
        .neq("status", "draft")
        .order("published_at", { ascending: false })
        .limit(HISTORY_LIMIT),
    ])
    if (isMissingTable(draftRes.error) || isMissingTable(historyRes.error)) {
      return { missingTable: true, draft: null, published: null, history: [] }
    }
    if (draftRes.error) throw draftRes.error
    if (historyRes.error) throw historyRes.error
    rows = [...(draftRes.data ? [draftRes.data as HomeLayoutRow] : []), ...((historyRes.data ?? []) as HomeLayoutRow[])]
  }

  const draft = rows.find((r) => r.status === "draft") ?? null
  const historyRows = rows
    .filter((r) => r.status !== "draft")
    .sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""))
    .slice(0, HISTORY_LIMIT)
  const emails = await emailsFor(historyRows.map((r) => r.published_by))
  const history = historyRows.map((r) => ({
    ...r,
    publishedByEmail: r.published_by ? emails.get(r.published_by) ?? null : null,
  }))
  return {
    missingTable: false,
    draft,
    published: history.find((r) => r.status === "published") ?? null,
    history,
  }
}

/** Thrown when the draft changed since the editor loaded it. */
export const DRAFT_CONFLICT =
  "Someone saved the draft since you opened this page (another tab or admin). Copy anything you need, reload, and apply your edits again."

/** Writes the draft row (creating it the first time) and returns its new
 *  updated_at. With `expectedUpdatedAt` (the draft's updated_at when the
 *  editor loaded it, null when there was none) the write only happens if the
 *  draft is still that one, so two tabs never silently overwrite each other.
 *  Every action passes it (Save, Publish, and the draft write after Reset and
 *  Publish this version again); a call without it writes unconditionally. */
export async function saveHomeLayoutDraft(
  document: HomeLayoutDocument,
  userId: string,
  expectedUpdatedAt?: string | null
): Promise<string> {
  const checkConflict = expectedUpdatedAt !== undefined
  if (isHomeLayoutFixture()) {
    const store = fixtureStore()
    const now = new Date().toISOString()
    const draft = store.rows.find((r) => r.status === "draft")
    if (checkConflict && (draft?.updated_at ?? null) !== expectedUpdatedAt) throw new Error(DRAFT_CONFLICT)
    if (draft) {
      draft.document = document
      draft.updated_at = now
    } else {
      store.rows.push({
        id: crypto.randomUUID(),
        status: "draft",
        document,
        note: null,
        created_at: now,
        updated_at: now,
        created_by: userId,
        published_by: null,
        published_at: null,
      })
    }
    return now
  }

  const supabase = createAdminClient()
  const { data: existing, error: readError } = await supabase
    .from("home_layouts")
    .select("id, updated_at")
    .eq("status", "draft")
    .maybeSingle()
  if (readError) throw readError

  if (existing) {
    if (checkConflict && existing.updated_at !== expectedUpdatedAt) throw new Error(DRAFT_CONFLICT)
    let update = supabase.from("home_layouts").update({ document }).eq("id", existing.id)
    // Compare-and-set: a save that lands between the read and this write
    // changes updated_at, so this matches no row.
    if (checkConflict) update = update.eq("updated_at", existing.updated_at as string)
    const { data, error } = await update.select("updated_at")
    if (error) throw error
    if (!data || data.length === 0) throw new Error(DRAFT_CONFLICT)
    return data[0].updated_at as string
  }
  if (checkConflict && expectedUpdatedAt !== null) throw new Error(DRAFT_CONFLICT)
  const { data, error } = await supabase
    .from("home_layouts")
    .insert({ status: "draft", document, created_by: userId })
    .select("updated_at")
    .single()
  // 23505: another tab created the draft a moment ago. A checked save is a
  // conflict; an unchecked one writes to that draft.
  if (error?.code === "23505") {
    if (checkConflict) throw new Error(DRAFT_CONFLICT)
    return saveHomeLayoutDraft(document, userId)
  }
  if (error) throw error
  return data.updated_at as string
}

/** Archives the live layout and publishes `document` in one transaction
 *  (admin_publish_home_layout). Returns the new version id. */
export async function publishHomeLayout(document: HomeLayoutDocument, note: string | null, userId: string) {
  if (isHomeLayoutFixture()) {
    const store = fixtureStore()
    const now = new Date().toISOString()
    for (const r of store.rows) if (r.status === "published") r.status = "archived"
    const id = crypto.randomUUID()
    store.rows.push({
      id,
      status: "published",
      document,
      note: note?.trim() || null,
      created_at: now,
      updated_at: now,
      created_by: userId,
      published_by: userId,
      published_at: now,
    })
    return id
  }
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc("admin_publish_home_layout", {
    p_document: document,
    p_note: note?.trim() || null,
    p_user_id: userId,
  })
  if (error) throw error
  return data as string
}

export async function getHomeLayoutVersion(id: string): Promise<HomeLayoutRow | null> {
  if (isHomeLayoutFixture()) return fixtureStore().rows.find((r) => r.id === id) ?? null
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("home_layouts").select("*").eq("id", id).maybeSingle()
  if (error) throw error
  return (data as HomeLayoutRow | null) ?? null
}

export function initialDraftDocument(data: HomeLayoutEditorData): unknown {
  return data.draft?.document ?? data.published?.document ?? defaultDocument()
}

// ---------------------------------------------------------------------------
// Catalog reads for the picker and the preview (read-only).

export type HomeCafe = {
  id: string
  name: string
  neighborhood: string | null
  city: string
  featured_image_url: string | null
  rating: number
  review_count: number
  is_featured: boolean
  created_at: string
  lat: number
  lng: number
  tags: string[]
}

/** Every active (published) café with its active tag names. ~200 rows today;
 *  paged in 1000s so it keeps working as the catalog grows. */
export const getHomeCafes = unstable_cache(
  async (): Promise<HomeCafe[]> => {
    const supabase = createAdminClient()
    const out: HomeCafe[] = []
    const page = 1000
    for (let from = 0; ; from += page) {
      const { data, error } = await supabase
        .from("cafes")
        .select(
          "id, name, neighborhood, city, featured_image_url, rating, review_count, is_featured, created_at, lat, lng, cafe_tags(tags(name, is_active))"
        )
        .eq("status", "active")
        .order("name")
        // Names repeat (chains), so pages need a unique tie-breaker.
        .order("id")
        .range(from, from + page - 1)
      if (error) throw error
      for (const c of data ?? []) {
        const tags = ((c.cafe_tags ?? []) as unknown as { tags: { name: string; is_active: boolean } | null }[])
          .map((ct) => ct.tags)
          .filter((t): t is { name: string; is_active: boolean } => !!t && t.is_active)
          .map((t) => t.name)
        out.push({
          id: c.id as string,
          name: c.name as string,
          neighborhood: (c.neighborhood as string | null) ?? null,
          city: c.city as string,
          featured_image_url: (c.featured_image_url as string | null) ?? null,
          rating: Number(c.rating ?? 0),
          review_count: Number(c.review_count ?? 0),
          is_featured: !!c.is_featured,
          created_at: c.created_at as string,
          lat: Number(c.lat),
          lng: Number(c.lng),
          tags,
        })
      }
      if (!data || data.length < page) break
    }
    return out
  },
  ["admin-home-cafes"],
  // Nothing revalidates "admin-cafes" yet, so keep this short: a café
  // published a minute ago should be pickable.
  { revalidate: 60, tags: ["admin-cafes"] }
)

/** Active tag names, read now. Publish and save check rules against this,
 *  so a tag renamed or turned off a minute ago is caught. */
export async function fetchActiveTagNames(): Promise<string[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("tags")
    .select("name")
    .eq("is_active", true)
    .order("category")
    .order("sort_order")
  if (error) throw error
  return (data ?? []).map((t) => t.name as string)
}
