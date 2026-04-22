import type { Metadata } from "next"
import { getCafes } from "@/lib/queries/cafes"

export const metadata: Metadata = { title: "Cafes" }
import { CafeListClient } from "@/components/admin/cafe-list-client"

export default async function CafesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; neighborhood?: string; search?: string }>
}) {
  const { status, neighborhood, search } = await searchParams
  const cafes = await getCafes({ status, neighborhood, search })

  return <CafeListClient cafes={cafes} />
}
