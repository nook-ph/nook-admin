import type { Metadata } from "next"

import { HomeLayoutEditor } from "@/components/admin/home/home-layout-editor"
import { isHomeLayoutFixture } from "@/lib/home-layout/dev-fixture"
import { normalizeDocument } from "@/lib/home-layout/document"
import {
  getActiveTagNames,
  getHomeCafes,
  getHomeLayoutEditorData,
  initialDraftDocument,
} from "@/lib/queries/home-layout"

export const metadata: Metadata = { title: "Home layout" }

export default async function HomeLayoutPage() {
  const [data, cafes, tags] = await Promise.all([
    getHomeLayoutEditorData(),
    getHomeCafes(),
    getActiveTagNames(),
  ])

  return (
    <HomeLayoutEditor
      missingTable={data.missingTable}
      hasDraft={!!data.draft}
      draftUpdatedAt={data.draft?.updated_at ?? null}
      initialDocument={normalizeDocument(initialDraftDocument(data))}
      published={data.published}
      history={data.history}
      cafes={cafes}
      tags={tags}
      fixture={isHomeLayoutFixture()}
    />
  )
}
