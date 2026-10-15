# Home layout editor (`/admin/home`) · UX research (2026-10-16)

Job: partwise **ux** (research only; no design, no code). Branch `feat/home-layout` at `5084011`.
Contract: nook-supabase `docs/HOME_LAYOUT.md`. "As it is" comes from the finished review
(`partwise-review-home-editor.md`) and its screenshots in `review-shots-home-editor/`, plus a
reading of `components/admin/home/*` and `app/admin/home/actions.ts`. Nothing was re-rendered.

This is desk research and expert evaluation by one rater. It is not user research: no admin
was watched or asked. Anything that needs a real admin is in the last section.

## Question

```text
Question: How should the founder change what everyone sees on Home, and run a time-boxed
          campaign there, fast and without publishing a mistake?
Product:  internal CMS / page-layout editor with draft → preview → publish and history, like
          the Shopify theme editor, Replo, Mapbox Studio publish, Linktree link scheduling,
          Fourthwall collection scheduling.
People:   1–2 superadmins (the founder), on a laptop, sometimes a phone, in short sessions
          between other work. "When I want Home to show something new (a crawl, a rainy-day
          list, a new House picks set), I want to change it and be sure it looks right, so I can
          publish without breaking Home for every user and undo it fast if I did."
Journeys: J1 Admin changes what everyone sees: open /admin/home → reorder / hide / rename
          shelves → hand-pick House picks → save draft → preview → publish → later roll back.
          J2 Admin runs a campaign: custom shelf (picked or rule) + scheduled banner → preview
          at a future time → publish → it ends on its own.
Evidence: the review's 33 screenshots (1440 + 390, fixture data), the source. No analytics on
          nook-admin, so no funnel; none is estimated. No support messages (the admins are the
          team).
```

Weighting for this product: with one or two admins, **fast and safe beats powerful**. A
feature that only pays off with a content team (roles, approval workflow, comments,
multi-draft branches) is out of scope on purpose.

## Journeys today

Sheets: the review's screenshots, referenced by number (`review-shots-home-editor/NN-*.png`).
PURE score per step: 1 easy, 2 noticeable effort, 3 hard enough to give up (single-rater).
Walkthrough failures name the NN/g question that failed: **try** (will they try the right
thing), **notice** (will they see the control), **connect** (will they link it to the goal),
**see** (will they see it worked).

### J1 · Admin changes what everyone sees on Home

| # | Step | What the screen asks / shows | Fails | PURE |
|---|---|---|---|---|
| 1 | Open `/admin/home` (01) | Header "Live since Oct 13 · 'Rainy season layout'", green Live chip, 9 shelf rows, preview beside, save bar "Default order, not saved yet", Publish pale/disabled | **see**: the bar says "Default order, not saved yet" while a layout is live; Publish disabled with no reason | 2 |
| 2 | Reorder (01, 23) | Drag a row by its handle (desktop), or open the row and Move up / Move down (all widths) | — | 1 |
| 3 | Hide a shelf (01) | Switch at the right of each row; row meta then says "Hidden", preview shows an amber note | **notice** at 390: switch is 32×18 | 1 |
| 4 | Rename (04) | Open row → Title (optional, "Leave empty for 'House picks'") | — | 1 |
| 5 | Hand-pick House picks (03–05, 33) | Open row → search published cafés → add one at a time (first 8 matches) → order with ↑ ↓ or drag | — (works, but one search per café, no multi-select) | 2 |
| 6 | Save draft | Save bar "N unsaved changes" → Save draft → "Draft saved" | — | 1 |
| 7 | Preview (12, 13) | Phone frame beside the list, live as you edit; Now / Pick a time | — | 1 |
| 8 | Publish (17, 18) | Dialog: what happens ("next Home refresh", "moves to Versions"), optional note | **connect**: the dialog does not say *what* changes vs live, nor flag shelves whose schedule already ended | 2 |
| 9 | Confirm it worked (19, 20) | Toast "Published. Phones pick it up on their next Home refresh."; Versions shows the new Live row | — | 1 |
| 10 | Roll back, later (20, 21) | Scroll past shelves, banner and options to Versions → Publish again → confirm | **connect / see**: no way to look at the old version before it goes live; it also overwrites the current draft (`republishHomeVersionAction` → `saveHomeLayoutDraft`) | 2 |

Total **14** (single-rater). States: loading, empty, validation, confirm and success are all
present (see review). Missing: a preview of a past version, a diff, an "ended" state.

### J2 · Admin runs a campaign

| # | Step | What the screen asks / shows | Fails | PURE |
|---|---|---|---|---|
| 1 | Add shelf (06) | "Add shelf" appends "Untitled shelf" as **#13, the bottom**, opens it, focuses Title | **see**: it lands below the fold, far from where a campaign shelf belongs | 2 |
| 2 | Fill it (06, 07, 09) | Title; Fill with: Pick by hand / Fill by rule. Picked = search + add (≥3). Rule = Tag, Order, Up to, and a live "10 cafés fill this shelf right now" | placeholder "Rainy-day cafés" reads as a filled value (10) | 1 |
| 3 | Move it to the top | Drag 12 rows up, or Move up ×10–12 | — (works, tedious) | 2 |
| 4 | Schedule the shelf (11) | Add a schedule → Starts / Ends (datetime), Days, From / To; summary sentence "Shows Weekends · 7am–12pm · until Oct 10, Manila time" | — (strong) | 1 |
| 5 | Banner (14, 15) | Scroll **below all shelves** to Banner (the banner sits at the *top* of the phone) → Show a banner → image, title, text, button label, link | **notice**: editor order is the reverse of the phone order | 2 |
| 6 | Schedule the banner | Same schedule fields | — | 1 |
| 7 | Preview at a future time (13) | Pick a time → one datetime input → preview shows the shelf, or an amber "hidden · Outside its schedule" note | checking start *and* end means typing two datetimes by hand; the picked time stays after publish (19 still shows Oct 3) | 2 |
| 8 | Publish (17) | Same dialog as J1 | **connect**: nothing lists the campaign's windows or warns "ends in the past" (review: House picks published "until Oct 10" on Oct 16 with no warning) | 2 |
| 9 | It ends on its own | The phone stops showing it (schedule evaluated on device, Manila time) | **see**: in the editor nothing changes; no "Ended" state on the row or banner; the dead shelf stays in the list until removed by hand | 2 |

Total **15** (single-rater). The engine is right: schedules are evaluated on the phone, so
nothing has to run at the start or end time, and a campaign is just part of the one layout.
The friction is all in *seeing* time.

## How others do it

Refero flows (screens kept in `/tmp/ux-home-editor/`, not committed). Refero has no single flow
covering either journey end to end; each reference covers a slice.

### J1 references

1. **Shopify online store theme editor** ([5413](https://refero.design/flows/5413), collection
   picking [5400](https://refero.design/flows/5400)). Left tree of the whole page (Header >
   Announcement bar, Template > Image banner, Featured collection, Footer), each with one menu:
   Rename, Hide, Duplicate, Remove; "Add section" sits *between* sections. Click a block in the
   preview to select it. Status: green "Live" pill by the theme name; Save commits. Products are
   hand-picked in a modal: search, filter, **tick several**, Add.
2. **Replo page builder** ([3867](https://refero.design/flows/3867), history
   [3886](https://refero.design/flows/3886)). Canvas + properties panel; Preview and Publish in
   the top bar. Version history panel with continuous autosaves, filter (All / By you /
   Published / Restored), and **click a version to see it in the preview (desktop + mobile)
   before restoring**; a restore is itself logged, so a rollback can be rolled back.
3. **Mapbox Studio "Publish"** ([9672](https://refero.design/flows/9672)), with Patreon's page
   editor ([1271](https://refero.design/flows/1271)). Publish opens a **review modal: Current vs
   Pending side by side** (or a slider), plain consequence text ("applies the changes in your
   draft style to your production style"), "Publish as new" as a safe fork, success dialog.
   Patreon keeps a persistent "You have unpublished changes" bar with Discard / Save.

**Pattern:** one surface, a persistent Publish, edit in place, live preview, hide/rename on
the item itself. **Split:** how draft vs live is shown (pill / history / explicit "pending"
banner) and how rollback works (none / preview-then-restore / fork).

### J2 references

1. **Fourthwall collection scheduling** ([7294](https://refero.design/flows/7294)). Curated
   list and schedule on the same page; status menu Public / Hidden / **Schedule as public**,
   Launch date + optional end, time zone printed in the field (CET). Confirm restates the exact
   time and asks about the knock-on effect. Afterwards the status pill reads **"Going public
   Sep 5"**.
2. **Linktree link schedule** ([12391](https://refero.design/flows/12391)). Schedule panel
   inside the link card: "Show link on" / "Hide link on", time zone, inline validation ("start
   date must be in the future"). Card then shows a green **"Scheduled 25 Jun 2026, 12:00 AM"**
   chip; the phone mockup shows only the current page.
3. **fal smart collection** ([13560](https://refero.design/flows/13560)). Rule builder with a
   condition row already present, All/Any, and a **live "N matches" count** before Create;
   Create disabled until valid. No scheduling.

Also seen: Shopify discount active dates ([5409](https://refero.design/flows/5409)), Medium
schedule-in-publish-dialog ([11121](https://refero.design/flows/11121)), Fourthwall
"Scheduled" tab for posts ([7298](https://refero.design/flows/7298)).

**Pattern:** the schedule lives inside the item's own editor, and after saving the item
carries a **status chip with the date** (Scheduled / Going public …). **Split:** time zone
fixed vs selectable; confirm-with-consequence vs inline validation only. **None** of them
previews the page at a future time and none shows an "Ended" state, so Nook's preview time is
already ahead of the references; what it lacks is the chip.

## Findings

Ranked by severity, then evidence. Laws are named where they explain, not prove.

1. **Major · code + seen · J1 step 10 (roll back).** "Publish again" puts an old version live
   after one confirm, with no way to see it first, and silently replaces the current draft
   (`republishHomeVersionAction` saves the restored document as the draft). Cost: the moment
   the founder needs rollback is the moment they are least sure what an old version contained
   ("Oct 13 · Rainy season layout · 9 shelves shown" is all they get), and any half-done draft
   is lost. Reference: Replo previews any version in the phone/desktop frame before restoring
   and logs the restore. Change: **"Preview" on each version** loads it into the phone frame
   read-only (with "Back to draft"); the confirm says "Your unsaved/unpublished draft will be
   replaced" when the draft differs from live, or offers "Open as draft" beside "Publish now".
2. **Major · seen · J1 step 8, J2 step 8 (publish).** The Publish dialog explains *what
   happens* but not *what changes*. Cost: the only safety check before every user's Home
   changes is the founder's memory of what they edited (recognition over recall fails), and
   expired or not-yet-started schedules go live unnoticed (review: House picks published
   "until Oct 10" on Oct 16). Reference: Mapbox shows Current vs Pending in the publish modal.
   Change: a short **change list** in the dialog ("Moved Laptop-friendly to #2 · Hid Local
   beans · New shelf 'Rainy-day cafés' · Banner on, Oct 20–26 · ⚠ House picks: schedule ended
   Oct 10, won't show"), optionally a Live / Draft toggle on the preview. No side-by-side
   needed; a list is faster for nine rows.
3. **Major · seen · J2 steps 7–9 (campaign over time).** Time is only visible inside an open
   schedule panel or by typing a preview datetime. Rows say "until Oct 10" as plain meta;
   nothing says Scheduled / Showing now / Ended, and an ended shelf or banner stays in the
   list forever looking like any other. Checking a campaign's start and end means typing two
   datetimes by hand. Cost: the founder cannot glance at the page and know what Home shows this
   week; clean-up depends on remembering. Reference: Fourthwall's "Going public Sep 5" pill,
   Linktree's "Scheduled …" chip. Change: a **status chip per scheduled row and on the banner**
   ("Starts Oct 20", "Showing · ends Oct 26", "Ended Oct 10" in warning tone), and in each
   schedule panel **"Preview at start / at end"** buttons that set the preview time.
4. **Major · seen · J1 step 1 (orientation).** On open after any publish, the save bar says
   "Default order, not saved yet" next to a green Live chip, and Publish is disabled with no
   reason. Cost: the first thing read on every visit contradicts itself, so the founder cannot
   trust the bar later when it matters ("is this live or not?"). Reference: Patreon's
   persistent "You have unpublished changes" bar; Shopify's single Live pill. Change: one
   state line, three values: "Same as live", "N unpublished changes", "Nothing live yet:
   built-in Home"; Publish carries "Nothing new to publish" when disabled.
5. **Moderate · code + seen · J2 steps 1 and 3 (add a campaign shelf).** Add shelf appends at
   #13, below the fold; a campaign shelf usually belongs near the top, which takes 10–12 Move
   up presses or a long drag. Cost: the most common campaign action is the slowest one
   (Fitts's law, plus the added shelf disappears from view). Reference: Shopify's "Add section"
   between sections. Change: add **after the row you are on** (an "Add shelf below" in each
   open row) or ask "Where: top / below Near you / bottom"; also "Move to top" in the row.
6. **Moderate · seen · J2 step 5 (banner placement).** The banner is first on the phone but
   edited below all shelves, and the preview is not clickable to jump to what you see. Cost:
   scrolling past 9–13 rows to reach the one campaign element at the top; the editor's order
   stops matching the phone's (Jakob's law: page editors list blocks in page order). Reference:
   Shopify's tree puts Header > Announcement bar first and selects a block when it is clicked
   in the preview. Change: Banner block **above** Shelves; clicking a shelf or the banner in the
   phone frame opens its editor.
7. **Moderate · seen · J2 step 7 (preview time is sticky).** After publishing, the preview
   still shows the picked time (19: Oct 3) with only small text below the toggle. Cost: easy
   to read a past or future Home as "what's live now". Change: after Publish, return to Now, or
   show an amber "Previewing Sat Oct 3, 9:00 AM · Back to now" bar inside the frame.
8. **Moderate · seen · all saves (session expiry).** An expired session surfaces as the raw
   code "auth_required" (16). The draft is kept, but the founder is not told what to do.
   Change: "Your session ended. Sign in again to save." (review item; listed because it ends
   the journey).
9. **Minor · seen · J1 step 5 (hand-picking).** One search per café, first 8 matches, no
   multi-select. Fine for a founder who knows the cafés; slow for a 10-pick set. Reference:
   Shopify's Add products modal with checkboxes. Change only if the test shows it: let the
   results list stay open and add several without clearing the search, plus "8 of N, keep
   typing".
10. **Minor · inferred · J1 step 6 (two saves).** Save draft and Publish both exist; Publish
    saves first, and a leave guard exists. Replo autosaves continuously. For one admin the
    explicit Save draft is acceptable; autosave is not recommended now (it would make the
    "unpublished changes" count meaningless and adds server writes).

Working well, keep: row meta restating source, schedule and "Hidden" / "Needs a fix"; Move
up/down as a non-drag path (WCAG 2.5.7); the rule shelf's live match count (same as fal);
the schedule summary sentence in Manila time; hidden shelves shown in place in the preview with
the reason; "4 things to fix" jumping to the first error; automatic "Restored from …" note.

## Recommended flow

### J1 · Change Home (score 14 → 10)

1. Open `/admin/home`. One state line: **"Same as live"** / "N unpublished changes" /
   "Nothing live yet". *(changed; 2 → 1)*
2. Reorder, hide, rename in the rows as today. *(1)*  3. *(1)*  4. *(1)*
5. House picks: search and add several without leaving the results. *(changed; 2 → 2, until
   tested)*
6. Save draft (optional; Publish saves first). *(1)*
7. Preview beside the list, as today. *(1)*
8. Publish: dialog lists **what changed vs live** and **warns on ended / not-yet-started
   schedules**, optional note. *(changed; 2 → 1)*
9. Toast + Versions row. *(1)*
10. Roll back: Versions → **Preview** the old version in the phone frame → "Publish this
    version" (confirm warns if it replaces a draft) or "Open as draft". *(changed; 2 → 1)*

### J2 · Run a campaign (score 15 → 10)

1. Banner sits **first** in the editor, above Shelves. "Add shelf" offers **where** (or
   "Add shelf below" inside a row), so the new shelf lands where it belongs. *(changed;
   2 → 1, step 3 merged away)*
2. Fill it: picked or rule with live count, as today. *(1)*
3. Schedule shelf and banner in their own panels, as today. *(1, 1)*
4. In each schedule panel: **Preview at start / Preview at end**. *(changed; 2 → 1)*
5. Publish: change list includes each window ("Banner: Oct 20 00:00 – Oct 26 23:59") and warns
   on a window already over. *(changed; 2 → 1)*
6. Afterwards each scheduled item carries a chip: **Starts Oct 20 / Showing · ends Oct 26 /
   Ended Oct 26**; an ended item offers "Remove" in its row. Preview returns to Now after
   publish. *(changed; 2 → 1)*

Not recommended for 1–2 admins: approval workflows, multiple drafts, a separate campaign
page or calendar, per-campaign versions, autosave history, a time zone picker (Manila only is
correct for Nook and already stated).

## To test with real admins

Nook has one or two admins, so a 5-person test is not possible with real admins. Run each task
with the founder, then with 2–3 stand-ins who have not seen the editor (a teammate, a café
owner from outreach), one task each, think aloud, on the deployed preview with fixture data.

| Question | Method | Task / prompt | Success |
|---|---|---|---|
| Does the state line tell people whether Home is live and changed? | Five-second test on the open page | "What does a phone show right now, and is anything waiting to go out?" | Answers "the Oct 13 layout; nothing waiting" without reading the Versions list |
| Do they check what they are publishing, and is the change list enough? | Task test | "Move Laptop-friendly to second, hide Local beans, then publish." Then: "What did you just change?" | Names both changes from the dialog; no second publish within 10 minutes to fix a mistake |
| Can they roll back safely? | Task test | "Yesterday's Home was better. Put it back." (with an unpublished draft in progress) | Finds Versions, previews the right one before restoring, and is not surprised the draft changed (or chooses "Open as draft") |
| Where do they expect a new campaign shelf to appear? | First-click test | "Add a 'Rainy-day cafés' shelf right under Near you." | First click is in or near the Near you row, not the top "Add shelf"; time-to-placed < 30s |
| Do they find the banner? | First-click test | "Turn on a banner for the crawl." | First click on Banner without scrolling past shelves |
| Can they check a campaign's window? | Task test | "Make sure the crawl banner shows on Oct 20 and is gone on Oct 27." | Confirms both ends in the preview in under a minute, without typing a wrong date |
| After it ends, do they notice and clean up? | Task test, two weeks later (real use) | Open the editor after a campaign ended; no prompt | Spots the ended item from the list and removes or keeps it on purpose |
| Is one-at-a-time hand-picking slow enough to matter? | Task test, timed | "Make House picks these 8 cafés: …" | Under 2 minutes; if over, build multi-add (finding 9) |

Analytics (HEART, nook-admin has none today): **Task success** · publish not followed by
another publish or rollback within 30 minutes · `home_layout_published` with `changes_count`,
`seconds_since_open`; **Adoption** · campaigns per month · `home_layout_published` with
`has_schedule`; **Happiness/errors** · rollbacks and publishes with an ended schedule ·
`home_layout_republished`, `publish_warned_ended`. With two admins these are a log, not a
metric; read them as a diary.

## Next

`polish` on `/admin/home` for findings 4, 6, 7 and 8 (small, in place). Findings 1–3 change
behavior (version preview, change list, status chips): run them as `part` jobs on the Versions
list, the Publish dialog and the section row.
