"use server"

import { revalidatePath } from "next/cache"

import { requireSuperadmin } from "@/lib/auth/require-superadmin"
import {
  cleanDocument,
  defaultDocument,
  isResetDocument,
  LIMITS,
  normalizeDocument,
  resetDocument,
  validateDocument,
  type HomeLayoutDocument,
} from "@/lib/home-layout/document"
import {
  assertDraftUnchanged,
  DRAFT_CONFLICT,
  getActiveTagNames,
  getHomeLayoutVersion,
  publishHomeLayout,
  saveHomeLayoutDraft,
} from "@/lib/queries/home-layout"
import { uploadFile } from "@/lib/upload"

type Result =
  | {
      success: true
      version?: string
      /** The draft's updated_at after this action, for the next conflict check. */
      draftUpdatedAt?: string
      /** Published, but a follow-up step failed; shown to the admin. */
      warning?: string
    }
  | { success: false; error: string; draftUpdatedAt?: string }

/** The superadmin's id. Always a real check, fixture mode included: a server
 *  action can be POSTed to any path, so middleware never guards it
 *  (lib/auth/require-superadmin.ts). */
async function actor() {
  const { userId } = await requireSuperadmin()
  return userId
}

/** requireSuperadmin() throws codes; the admin sees what to do instead. */
const AUTH_MESSAGES: Record<string, string> = {
  auth_required: "Your session ended. Sign in again in a new tab, then try again; your edits stay on this page.",
  not_authorized: "Only superadmins can change Home. Sign in with a superadmin account.",
}

function message(error: unknown, fallback: string) {
  const raw =
    error instanceof Error
      ? error.message
      : error && typeof error === "object" && "message" in error && typeof error.message === "string"
        ? error.message
        : ""
  if (!raw) return fallback
  return AUTH_MESSAGES[raw] ?? raw
}

/** At most LIMITS.note characters, never splitting an emoji (a lone
 *  surrogate makes Postgres reject the note). */
function clip(note: string) {
  return Array.from(note).slice(0, LIMITS.note).join("")
}

/** Normalise, clean and validate a document coming from the client. */
async function checked(input: unknown): Promise<HomeLayoutDocument> {
  const read = normalizeDocument(input)
  const doc = cleanDocument(read)
  const tags = await getActiveTagNames()
  // Checked as read too: cleaning drops a half-set hours window and folds
  // days into "every day", which would hide a bad value from the check.
  const errors = { ...validateDocument(doc, tags), ...validateDocument(read, tags) }
  const first = Object.values(errors)[0]
  if (first) throw new Error(`The layout has ${Object.keys(errors).length} thing(s) to fix: ${first}`)
  return doc
}

/** `expectedUpdatedAt`: the draft's updated_at the editor last saw (null when
 *  there was no draft). A save over someone else's newer draft is refused. */
export async function saveHomeDraftAction(input: unknown, expectedUpdatedAt: string | null): Promise<Result> {
  try {
    const userId = await actor()
    const draftUpdatedAt = await saveHomeLayoutDraft(await checked(input), userId, expectedUpdatedAt ?? null)
    revalidatePath("/admin/home")
    return { success: true, draftUpdatedAt }
  } catch (error) {
    return { success: false, error: message(error, "Couldn’t save the draft") }
  }
}

/** Saves the draft, then publishes it. */
export async function publishHomeLayoutAction(
  input: unknown,
  note: string | null,
  expectedUpdatedAt: string | null
): Promise<Result> {
  let draftUpdatedAt: string | undefined
  try {
    const userId = await actor()
    if (note != null && typeof note !== "string") throw new Error("The note must be text.")
    if (note && note.trim().length > LIMITS.note) throw new Error(`Keep the note under ${LIMITS.note} characters.`)
    const doc = await checked(input)
    // Refused before anything goes live if another tab saved a newer draft.
    draftUpdatedAt = await saveHomeLayoutDraft(doc, userId, expectedUpdatedAt ?? null)
    const version = await publishHomeLayout(doc, note, userId)
    revalidatePath("/admin/home")
    return { success: true, version, draftUpdatedAt }
  } catch (error) {
    // The draft may have been saved before the publish failed: refresh the
    // page so the editor's baseline is that draft, and hand back its stamp so
    // the retry isn't taken for someone else's edit.
    if (draftUpdatedAt) revalidatePath("/admin/home")
    return { success: false, error: message(error, "Couldn’t publish the layout"), draftUpdatedAt }
  }
}

/** Publishes the empty document, so the app shows its built-in Home, and
 *  starts the draft over from the default order. */
export async function resetHomeLayoutAction(note: string | null, expectedUpdatedAt: string | null): Promise<Result> {
  try {
    const userId = await actor()
    // The confirm warned about this page's draft; refuse if another tab or
    // admin has saved a newer one since (nothing is published then).
    await assertDraftUnchanged(expectedUpdatedAt ?? null)
    const version = await publishHomeLayout(resetDocument(), clip(note || "Reset to default"), userId)
    return await afterPublish(version, cleanDocument(defaultDocument()), userId, expectedUpdatedAt ?? null)
  } catch (error) {
    return { success: false, error: message(error, "Couldn’t reset the layout") }
  }
}

/** Publishes an earlier version's document as a new version and loads it
 *  into the draft, so editing continues from what is live. */
export async function republishHomeVersionAction(id: string, expectedUpdatedAt: string | null): Promise<Result> {
  try {
    const userId = await actor()
    await assertDraftUnchanged(expectedUpdatedAt ?? null)
    if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)) throw new Error("That version no longer exists.")
    const row = await getHomeLayoutVersion(id)
    if (!row || row.status === "draft") throw new Error("That version no longer exists.")
    // A reset (empty) version publishes as it was; any other is normalised so
    // it lists every builtin (nearby included) and validated like a fresh
    // publish (a tag may have been removed since). If it fails, the admin can
    // Open as draft and fix it.
    // A reset is no sections and no banner the app would show (isResetDocument);
    // one with a live banner keeps it.
    const doc = isResetDocument(row.document) ? resetDocument() : await checked(row.document)
    const when = row.published_at
      ? new Intl.DateTimeFormat("en-PH", { timeZone: "Asia/Manila", dateStyle: "medium" }).format(new Date(row.published_at))
      : "an earlier version"
    const version = await publishHomeLayout(doc, clip(`Restored from ${when}${row.note ? ` (${row.note})` : ""}`), userId)
    // An empty (reset) document opens as the default order.
    return await afterPublish(version, cleanDocument(normalizeDocument(doc)), userId, expectedUpdatedAt ?? null)
  } catch (error) {
    return { success: false, error: message(error, "Couldn’t publish that version") }
  }
}

/** After Reset or a restore has gone live: the draft becomes `draft`, but
 *  only if it is still the one checked before publishing (a draft another tab
 *  saved meanwhile is kept). The publish already happened, so a failure here
 *  is a warning, not an error (an error would invite a retry that publishes a
 *  second version). */
async function afterPublish(
  version: string,
  draft: HomeLayoutDocument,
  userId: string,
  expectedUpdatedAt: string | null
): Promise<Result> {
  revalidatePath("/admin/home")
  try {
    const draftUpdatedAt = await saveHomeLayoutDraft(draft, userId, expectedUpdatedAt)
    return { success: true, version, draftUpdatedAt }
  } catch (error) {
    if (error instanceof Error && error.message === DRAFT_CONFLICT) {
      return {
        success: true,
        version,
        warning: "It’s live. Someone saved the draft meanwhile, so it was kept as they left it. Reload before editing.",
      }
    }
    return {
      success: true,
      version,
      warning: `It’s live, but the draft wasn’t updated (${message(error, "unknown error")}). Reload before editing.`,
    }
  }
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_SIZE_BYTES = 10 * 1024 * 1024

// Key: nook/home/banner-{timestamp}.{ext}. Old banner images are kept: a
// version in the history may still point at one.
export async function uploadHomeBannerImageAction(
  formData: FormData
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  try {
    // Always a real check, fixture or not: the upload writes to real storage.
    await requireSuperadmin()
    const file = formData.get("file")
    if (!(file instanceof File)) throw new Error("No file provided")
    if (!ALLOWED_TYPES.includes(file.type)) throw new Error("Only JPG, PNG and WEBP are allowed")
    if (file.size > MAX_SIZE_BYTES) throw new Error("File must be under 10MB")
    const ext = file.type.split("/")[1]
    const url = await uploadFile({
      key: `nook/home/banner-${Date.now()}.${ext}`,
      buffer: Buffer.from(await file.arrayBuffer()),
      contentType: file.type,
    })
    return { success: true, url }
  } catch (error) {
    return { success: false, error: message(error, "Upload failed") }
  }
}
