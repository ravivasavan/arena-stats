# Dashboard insights implementation plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add three dashboard features—first channel in header, block-size distribution, and idle channel counts—using only existing API data (no new requests).

**Architecture:** Extend `computeStats` in `src/utils/stats.js` to derive `firstChannel`, `channelsByBlockSize`, and `idleChannels`. Add a "First channel" line to `UserHeader` and a new `ChannelInsights` component below the timeline; wire new props from `App.jsx`.

**Tech Stack:** React, Vite, CSS modules. No new dependencies.

**Reference:** Design in [docs/plans/2025-03-03-dashboard-insights-design.md](2025-03-03-dashboard-insights-design.md).

---

## Task 1: Extend computeStats with firstChannel, channelsByBlockSize, idleChannels

**Files:**
- Modify: `src/utils/stats.js`

**Step 1: Add firstChannel**

- After existing logic in `computeStats`, find the channel with the earliest `created_at` (skip channels without `created_at`). If channels length is 0, set `firstChannel: null`. Otherwise set `firstChannel: { title: ch.title, slug: ch.slug, created_at: ch.created_at }`. Format the date with the existing `MONTH_NAMES` pattern (e.g. "Jan 2020") and expose a `formattedDate` or keep raw and format in the component.

**Step 2: Add channelsByBlockSize**

- Define buckets: 0, 1–10, 11–50, 51–100, 101+. Loop channels, get `count = ch.counts?.contents ?? 0`, and increment the appropriate bucket. Return an object e.g. `channelsByBlockSize: { '0': n0, '1–10': n1, '11–50': n2, '51–100': n3, '101+': n4 }`.

**Step 3: Add idleChannels**

- Compute `now = new Date()`, then two counts: (1) channels where `updated_at` exists and `new Date(ch.updated_at) < sixMonthsAgo` (e.g. `new Date(now.getTime() - 6*30*24*60*60*1000)`), (2) same for 1 year. Return `idleChannels: { over6Months: number, over1Year: number }`.

**Step 4: Add to return object**

- Add `firstChannel`, `channelsByBlockSize`, and `idleChannels` to the object returned by `computeStats`.

**Step 5: Verify**

- Run `npm run dev` and confirm the app still loads (no runtime errors from missing fields until components use them).

**Step 6: Commit**

```bash
git add src/utils/stats.js
git commit -m "feat(stats): add firstChannel, channelsByBlockSize, idleChannels"
```

---

## Task 2: Show first channel in UserHeader

**Files:**
- Modify: `src/components/UserHeader.jsx`
- Modify: `src/App.jsx` (pass `firstChannel`; ensure `user` has it or pass separately)

**Step 1: Pass firstChannel**

- In `App.jsx`, ensure `stats.user` includes `firstChannel` (add it in `computeStats` to `user` object, e.g. `user: { ..., firstChannel }`, so `UserHeader` receives it via `user.firstChannel`). Or pass `firstChannel={stats.firstChannel}` to `UserHeader` and update the component to accept it.

**Step 2: Render first channel line in UserHeader**

- In `UserHeader.jsx`, below the "Member since ..." span, add a conditional: if `user.firstChannel` (or `firstChannel` prop), render a line like "First channel: " plus a link (href `https://www.are.na/${user.slug}/${user.firstChannel.slug}`, target _blank, rel noopener noreferrer) with text `user.firstChannel.title`, then " (Month YYYY)" using the formatted date. Use the same or a similar class as `memberSince` for styling.

**Step 3: Verify**

- Load the app with a logged-in user who has channels; confirm the first channel line appears and the link works. With no channels, confirm the line does not appear.

**Step 4: Commit**

```bash
git add src/components/UserHeader.jsx src/App.jsx src/utils/stats.js
git commit -m "feat(header): show first channel with link"
```

---

## Task 3: Add ChannelInsights component

**Files:**
- Create: `src/components/ChannelInsights.jsx`
- Create: `src/components/ChannelInsights.module.css`

**Step 1: Component structure**

- `ChannelInsights` accepts props: `channelsByBlockSize`, `idleChannels`, optionally `userSlug`. If both stats are empty (e.g. total channels 0), render "No channel data" or return null.
- Render a section with a heading "Channel insights". Two subsections:
  - **By size:** Label "By size" (or "Channels by size"). List the five buckets; for each bucket with a count, show "0 blocks: X channels", "1–10: Y channels", etc. Use the same key names as in stats.
  - **Idle:** Label "Idle". "Not updated in 6 months: X channels." "Not updated in 1 year: Y channels."

**Step 2: Styling**

- Reuse patterns from `ChannelBreakdown.module.css` or `ChannelTimeline.module.css` (section title, list, spacing) so the block fits visually between timeline and TopChannels.

**Step 3: Verify**

- Render the component in App with the new stats; confirm layout and numbers match the dashboard.

**Step 4: Commit**

```bash
git add src/components/ChannelInsights.jsx src/components/ChannelInsights.module.css
git commit -m "feat: add ChannelInsights component"
```

---

## Task 4: Integrate ChannelInsights in App

**Files:**
- Modify: `src/App.jsx`

**Step 1: Import and render**

- Import `ChannelInsights`. Below `ChannelTimeline`, render `<ChannelInsights channelsByBlockSize={stats.channelsByBlockSize} idleChannels={stats.idleChannels} userSlug={stats.user.slug} />` (or pass only what the component needs).

**Step 2: Verify**

- Full flow: login, dashboard shows timeline then Channel insights (by size + idle) then TopChannels. No extra API calls; data matches existing channels.

**Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat: integrate ChannelInsights below timeline"
```

---

## Execution

Use **superpowers:executing-plans** to run these tasks in order. After completion, optionally update README "Features" to mention first channel, channel insights by size, and idle channel counts.
