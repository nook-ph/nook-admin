import { createAdminClient } from "@/lib/supabase/admin"
import type {
  Crawl,
  CrawlTier,
  CrawlStopWithCafe,
  CrawlStats,
  CafeSearchResult,
  CrawlStamp,
} from "@/lib/types/crawls"

export async function getCrawls(): Promise<Crawl[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("crawls")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data ?? []) as Crawl[]
}

export async function getCrawlById(id: string): Promise<Crawl | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("crawls")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  return data as Crawl | null
}

export async function getCrawlStops(
  crawlId: string,
): Promise<CrawlStopWithCafe[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("crawl_stops")
    .select(`
      *,
      cafes!inner ( name, address, neighborhood )
    `)
    .eq("crawl_id", crawlId)
    .order("stop_order", { ascending: true })

  if (error) throw error

  return ((data ?? []) as Array<Record<string, unknown>>).map((row) => {
    const cafe = row.cafes as { name: string; address: string | null; neighborhood: string | null }
    return {
      ...row,
      cafe_name: cafe.name,
      address: cafe.address,
      neighborhood: cafe.neighborhood,
    } as CrawlStopWithCafe
  })
}

export async function getCrawlTiers(crawlId: string): Promise<CrawlTier[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("crawl_tiers")
    .select("*")
    .eq("crawl_id", crawlId)
    .order("tier_order", { ascending: true })

  if (error) throw error
  return (data ?? []) as CrawlTier[]
}

export async function getCrawlStats(crawlId: string): Promise<CrawlStats> {
  const supabase = createAdminClient()

  const [registrantsResult, stampsResult, tiersResult] = await Promise.all([
    supabase
      .from("crawl_registrations")
      .select("id", { count: "exact", head: true })
      .eq("crawl_id", crawlId),
    supabase
      .from("crawl_stamps")
      .select("id", { count: "exact", head: true })
      .eq("crawl_id", crawlId),
    supabase
      .from("crawl_tiers")
      .select(`
        name,
        tier_order,
        id
      `)
      .eq("crawl_id", crawlId)
      .order("tier_order", { ascending: true }),
  ])

  if (registrantsResult.error) throw registrantsResult.error
  if (stampsResult.error) throw stampsResult.error
  if (tiersResult.error) throw tiersResult.error

  const tiers = (tiersResult.data ?? []) as Array<{ name: string; tier_order: number; id: string }>

  const tierCompletionPromises = tiers.map(async (tier) => {
    const { count, error } = await supabase
      .from("crawl_registrations")
      .select("id", { count: "exact", head: true })
      .eq("crawl_id", crawlId)
      .eq("highest_tier_id", tier.id)

    if (error) throw error
    return {
      name: tier.name,
      tier_order: tier.tier_order,
      completions: count ?? 0,
    }
  })

  const tierBreakdown = await Promise.all(tierCompletionPromises)

  return {
    totalRegistrants: registrantsResult.count ?? 0,
    totalStamps: stampsResult.count ?? 0,
    tierBreakdown,
  }
}

export async function searchCafes(
  q: string,
  crawlId: string,
): Promise<CafeSearchResult[]> {
  const supabase = createAdminClient()

  const { data: existing } = await supabase
    .from("crawl_stops")
    .select("cafe_id")
    .eq("crawl_id", crawlId)

  const existingIds = new Set((existing ?? []).map((r) => r.cafe_id))

  const { data, error } = await supabase
    .from("cafes")
    .select("id, name, address, neighborhood")
    .eq("status", "active")
    .or(`name.ilike.*${q}*,address.ilike.*${q}*`)
    .order("name", { ascending: true })
    .limit(20)

  if (error) throw error
  return ((data ?? []) as CafeSearchResult[]).filter(
    (cafe) => !existingIds.has(cafe.id),
  )
}

export async function checkSlugExists(
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  const supabase = createAdminClient()
  let query = supabase
    .from("crawls")
    .select("id")
    .eq("slug", slug)

  if (excludeId) {
    query = query.neq("id", excludeId)
  }

  const { data, error } = await query.maybeSingle()
  if (error) throw error
  return data !== null
}

export async function getCrawlStamps(
  crawlId: string,
): Promise<CrawlStamp[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("crawl_stamps")
    .select("*")
    .eq("crawl_id", crawlId)
    .order("claimed_at", { ascending: false })

  if (error) throw error
  return (data ?? []) as CrawlStamp[]
}
