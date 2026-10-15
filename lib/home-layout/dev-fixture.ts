// Local preview only. With HOME_LAYOUT_FIXTURE=1 in a non-production build,
// home_layouts reads and writes go to this in-memory store instead of the
// database, so /admin/home can be rendered before the migration is applied.
// It never runs in production: isHomeLayoutFixture() is false whenever
// NODE_ENV is "production" (every Vercel build), whatever the env var says.

import type { HomeLayoutRow } from "@/lib/queries/home-layout"

export function isHomeLayoutFixture() {
  return process.env.NODE_ENV !== "production" && process.env.HOME_LAYOUT_FIXTURE === "1"
}

type Store = { rows: HomeLayoutRow[] }

const g = globalThis as unknown as { __homeLayoutFixture?: Store }

export function fixtureStore(): Store {
  if (!g.__homeLayoutFixture) {
    const day = 24 * 60 * 60 * 1000
    const now = Date.now()
    g.__homeLayoutFixture = {
      rows: [
        {
          id: "00000000-0000-4000-8000-000000000002",
          status: "published",
          note: "Rainy season layout",
          document: {
            schema: 1,
            respect_purpose: true,
            banner: null,
            sections: [
              { id: "your_places", type: "builtin", visible: true },
              { id: "nearby", type: "builtin", visible: true },
              { id: "featured", type: "builtin", visible: true },
            ],
          },
          created_at: new Date(now - 3 * day).toISOString(),
          updated_at: new Date(now - 3 * day).toISOString(),
          published_at: new Date(now - 3 * day).toISOString(),
          created_by: null,
          published_by: null,
        },
        {
          id: "00000000-0000-4000-8000-000000000001",
          status: "archived",
          note: null,
          document: { schema: 1, respect_purpose: true, banner: null, sections: [] },
          created_at: new Date(now - 12 * day).toISOString(),
          updated_at: new Date(now - 3 * day).toISOString(),
          published_at: new Date(now - 12 * day).toISOString(),
          created_by: null,
          published_by: null,
        },
      ],
    }
  }
  return g.__homeLayoutFixture
}
