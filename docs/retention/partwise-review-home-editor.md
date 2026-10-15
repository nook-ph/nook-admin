# Partwise review: nook-admin Home layout editor (`/admin/home`)

Job: **review** (mode web, target code). Reports only; no app code changed.
Branch `feat/home-layout` at `132acc1`. Contract: nook-supabase `docs/HOME_LAYOUT.md` (incl. "As built").

Looked at: **rendered at 1440 and 390** in Playwright (Chromium), dev server with
`HOME_LAYOUT_FIXTURE=1`, cafés and tags read from production (read-only). Screenshots in
`review-shots-home-editor/`. Hover/focus judged from source plus one scripted focus shot
(`23-focus-row.png`).

How it was rendered: fixture mode does **not** get past `middleware.ts`, which redirects every
`/admin/*` request without a superadmin session to `/login`. To render without credentials the
review ran a throwaway copy of the worktree in `/tmp` whose `middleware.ts` was a pass-through.
Nothing in the repo was changed; every server action ran against the in-memory fixture store.
The banner upload (which still calls `requireSuperadmin()`) therefore failed with
`auth_required`, which is how that error state was seen.

Screenshot traps: in full-page captures (`02`, `31`) the pinned save bar lands mid-page; the
round "N" bottom-left is the Next.js dev indicator, not the app. Element captures at 390
(`32`, `33`) look cut on the right; measured in the page, the open row panel and its fields fit
(panel 341px; the `li` overflows by 3px only), so that is a capture artefact.

---

```text
Screen: /admin/home (Home layout editor)   Looked at: rendered at 1440 + 390

Must fix (blocks the task or excludes people)
- None found. Every flow in the brief works end to end: reorder (drag on desktop, Move up/down
  in the open row on all widths), toggle, rename, House picks picker, custom shelf picked and
  rule, banner, schedule, preview-time, save, publish with note, publish again, reset.

Should fix
- A published layout with no draft is labelled "Default order, not saved yet" — home-layout-editor.tsx
  SaveBar savedLabel (hasDraft ? … : …) — initialDraftDocument() seeds the draft from the
  *published* document when there is no draft, so the label is false on first open after any
  publish (01-desktop-initial.png: chip says "Live", bar says "Default order"). Use
  "Same as live, no draft yet" when published exists and "Built-in order, not saved yet" only
  when nothing is published.
- A schedule that has already ended publishes silently — document.ts validateSchedule and the
  section row meta line — 11/19: House picks was published with "until Oct 10" on Oct 16, so it is
  hidden for everyone and nothing said so outside the preview. Flag it in the row meta ("Ended
  Oct 10" in the warning tone, like "Needs a fix") and list ended/never-showing items in the
  Publish dialog ("House picks: schedule ended Oct 10 — it won't show"). Not a block; a warning.
- Raw error codes reach the admin — actions.ts message() passes requireSuperadmin's
  "auth_required" / "not_authorized" straight to toast.error (16-upload-attempt.png). Map those two
  to "Your session ended. Sign in again to save." / "Only superadmins can change Home." and keep
  the unsaved draft in place (it does; only the copy is wrong).
- Empty required title looks filled — section-list.tsx custom Title input: placeholder
  "Rainy-day cafés" in muted-foreground (lab 39.7, near the value colour) sits next to the error
  "Give the shelf a title." (10-save-with-errors.png). Drop the placeholder for custom shelves (or
  prefix "e.g. "), and let the row say "Untitled shelf" as it does.
- Visibility switches are 32×18px — every shelf row, banner and options (Switch from
  components/ui/switch.tsx) — under the 24px pointer floor and far under 44px at 390. Keep the
  component; on this page wrap each switch in a label/hit area at least 44×44 on phones (the row is
  52px tall, so the room is there), or raise the shared Switch's hit area in the ui kit.
- Drag handle shown on touch in the café picker — cafe-picker.tsx chosen-list `li` — the shelf list
  hides its handle below `sm` because HTML5 drag does not work on touch, but the picker keeps it, and
  with three icon buttons it squeezes names to ~8 characters at 390 ("Bitbrew …", 32). Hide the
  handle below `sm` as the shelf list does, which gives the name back ~24px.

Could be better
- Dev fixture skips the superadmin check — actions.ts actor(). Judged safe for production:
  isHomeLayoutFixture() needs NODE_ENV !== "production", and `next build`/`next start` (every Vercel
  build, preview included) force production, so the bypass cannot run there whatever the env var
  says; the upload action keeps requireSuperadmin; in fixture mode no action reaches the database
  except read-only tag names. Residual risk is a `next dev` reachable on a network with the flag set:
  unauthenticated POSTs could change the in-memory store only. Tighten anyway: also require
  `!process.env.VERCEL`, and still call requireSuperadmin() when a session cookie exists. Two related
  gaps: the dev-fixture.ts comment implies the page renders without the table *and* without sign-in,
  but middleware still demands a superadmin session — say so in the comment; and nothing on the page
  says fixture mode is on, so fixture screenshots read as production ("Live since …"). Add a
  neutral "Fixture data — nothing is saved" chip beside the status chip in that mode.
- Amber hex repeated — section-list.tsx MatchWarning and phone-preview.tsx HiddenNote use
  bg-[#FFF4DC] text-[#8A5A00]; that pair already lives in table-kit.tsx TONES.warning. Export and
  reuse TONES.warning (or add a warning token) so the three stay in step.
- Schedule panel ignores Discard — schedule-fields.tsx `open` state is set once from `!!value`; after
  Discard removes a schedule the empty form stays open saying "Nothing set yet". Derive open from
  `value != null || userOpened` and reset userOpened when value goes from set to null.
- Schedule legend is not the fieldset's first child — schedule-fields.tsx wraps <legend> in a flex
  div, so the group loses its accessible name. Make the legend a direct child (sr-only) and keep the
  visible heading in the row.
- Picker search shows the first 8 matches with no hint that there are more — cafe-picker.tsx results
  slice(0, 8). Add "Showing 8 of N — keep typing" when cut.
- Publish is disabled with no reason when the draft equals live — the bar says "Draft saved" and the
  button is pale (01). Add title/aria-describedby "Nothing new to publish", or keep it enabled and
  say so in the dialog.
- Preview time toggle (Now / Pick a time) is 36px tall at 390 — phone-preview.tsx `h-9 sm:h-7`. Use
  h-11 below sm as the other segmented controls on the page do.

Working well
- Shelf rows: number, title, type chip and a meta line that restates source, schedule and "Hidden" /
  "Needs a fix", so the list reads like the phone without opening anything (23). Keyboard reorder via
  Move up/down instead of drag-only is the right call.
- Save bar "4 things to fix" opens and scrolls to the first broken shelf, and the preview keeps
  hidden shelves in place as amber notes with the reason — the schedule is checkable before publish.
- Confirm dialogs say exactly what happens and keep history ("The current layout stays in history"),
  and destructive Reset is set apart at the end (20–22).
```

## Scorecard per view

```text
View 1: Shelf list + page frame (header, status, options)   Looked at: rendered 1440 + 390
Foundations   Typography 2 · Grids 2 · Color 2 · Communication 2
Structure     Proportion 2 · Clarity 1 · Precision 2 · Order 2
Behavior      Affordance 1 · Motion 2 · Efficiency 2 · Restraint 2
Impact        Visuals 2 · Universal 2 · Accessibility 1 · Responsibility 2
Total 29/32 (16 scored)
Fix
- Clarity 1: savedLabel "Default order, not saved yet" while a layout is live — make it truthful.
- Affordance 1 / Accessibility 1: switches 32×18 — 44×44 hit area on phones.
```

```text
View 2: Shelf editors (House picks picker, custom shelf picked + rule, schedule fields)
Foundations   Typography 2 · Grids 2 · Color 1 · Communication 2
Structure     Proportion 2 · Clarity 1 · Precision 2 · Order 1
Behavior      Affordance 1 · Motion n/a · Efficiency 1 · Restraint 2
Impact        Visuals 2 · Universal 1 · Accessibility 1 · Responsibility 1
Total 22/30 (15 scored)
Fix
- Responsibility 1: ended schedules publish silently — warn in row and Publish dialog.
- Color 1 / Clarity 1: placeholder in the required custom title reads as a value — remove or "e.g.".
- Universal 1 / Affordance 1: picker drag handle on touch squeezes names at 390 — hide below sm.
- Accessibility 1: schedule legend nested in a div — make it the fieldset's first child.
- Order 1: raw amber hex in MatchWarning — reuse TONES.warning.
- Efficiency 1: 8-result cap without a "more" hint; schedule panel stays open after Discard.
```

```text
View 3: Banner editor
Foundations   Typography 2 · Grids 2 · Color 2 · Communication 2
Structure     Proportion 2 · Clarity 2 · Precision 2 · Order 2
Behavior      Affordance 1 · Motion n/a · Efficiency 2 · Restraint 2
Impact        Visuals 2 · Universal 2 · Accessibility 1 · Responsibility 2
Total 28/30 (15 scored)
Fix
- Affordance 1: upload failure toasts the raw code "auth_required" — human copy.
- Accessibility 1: "Show a banner" switch 32×18 — same hit-area fix as View 1.
```

```text
View 4: Phone-frame preview with preview time
Foundations   Typography 1 · Grids 2 · Color 2 · Communication 2
Structure     Proportion 2 · Clarity 2 · Precision 2 · Order 1
Behavior      Affordance 2 · Motion n/a · Efficiency 2 · Restraint 2
Impact        Visuals 2 · Universal 2 · Accessibility 1 · Responsibility 2
Total 27/30 (15 scored)
Fix
- Typography 1: card meta at 10px and notes at 11px inside the frame. Acceptable as a miniature,
  but the hidden-shelf notes carry real information: set HiddenNote at 12px.
- Order 1: HiddenNote amber hex — reuse TONES.warning.
- Accessibility 1: Now / Pick a time 36px tall at 390 — h-11 below sm.
```

```text
View 5: Save / publish / reset / versions flows (save bar, dialogs, timeline)
Foundations   Typography 2 · Grids 2 · Color 2 · Communication 2
Structure     Proportion 2 · Clarity 1 · Precision 2 · Order 2
Behavior      Affordance 2 · Motion n/a · Efficiency 2 · Restraint 2
Impact        Visuals 2 · Universal 2 · Accessibility 2 · Responsibility 1
Total 28/30 (15 scored)
Fix
- Clarity 1: disabled Publish gives no reason when draft = live.
- Responsibility 1: raw auth codes in toasts; past-ended schedules not called out in the Publish
  dialog.
```

Grand total 134/152 (76 scored).

States checked: loading (preview skeleton before the client clock, from source; Spinner + disabled buttons
during save/publish/republish, 18), empty (no cafés picked notes, no search match 05, rule with no
tag 07, nothing published copy in source), error (field errors 10 and 15, save bar count, upload
toast 16), confirm (publish 17, publish again 21, reset 22, delete shelf in source), success
(toasts, header "Live since … · draft saved …", versions timeline 19–20). Long content: a 56-char
House picks title truncates cleanly in the row and the preview (04, 13). Not checked: the
missing-table state (fixture skips it; source shows a clear inline note), and >6 versions
("Show all" in source).

## Shared shell change (`overflow-x-hidden` → `overflow-x-clip` on `<main>`)

Spot-checked `/admin/cafes`, `/admin/cafes/new`, `/admin/dashboard` and `/admin/tags` at 1440 and
390 (40–43), measured in the page: `<main>` computes `overflow-x: clip; overflow-y: visible`, is not
a scroll container, and the document never scrolls sideways (scrollWidth = clientWidth at both
widths). The `lg:sticky` rail on the café form now sticks (top 192px → 24px after scrolling 1200px,
42), which it could not under `hidden`. `hidden` never let the user scroll `<main>` sideways either,
so nothing that used to be reachable is now cut off. No regression found. (Needs Safari 16+ for
`clip`; older Safari treats it as `visible`, the pre-fix behaviour of letting a wide child widen the
page.) The SaveBar spacer change (`h-36 sm:h-24`) reserves enough room on phones on both pages that
use it.
