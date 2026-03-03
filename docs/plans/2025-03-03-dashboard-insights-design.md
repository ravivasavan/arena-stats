# Dashboard insights design: first channel, block-size distribution, idle channels

**Date:** 2025-03-03  
**Status:** Approved  
**Scope:** Three new dashboard features, all derived from existing API data (no new requests).

---

## 1. First channel (header)

- **Data:** From the existing `channels` array, take the channel with the earliest `created_at`. Add to `computeStats` output: `firstChannel: { title, slug, created_at }` (or `null` if no channels). Format date like the rest of the app (e.g. "Jan 2020").
- **Placement:** In `UserHeader.jsx`, add one line below "Member since X · Y": **"First channel: [title] (Month YYYY)"**, with the title linking to `https://www.are.na/{user.slug}/{channel.slug}`.
- **Edge case:** If the user has no channels, `firstChannel` is `null` and this line is not rendered.

---

## 2. Channel insights block

- **Data (in `computeStats`):**
  - **Block-size buckets:** For each channel, use `counts?.contents ?? 0` and bucket into: `0`, `1–10`, `11–50`, `51–100`, `101+`. Return e.g. `channelsByBlockSize: { '0': n, '1–10': n, ... }`.
  - **Idle channels:** Count channels where `updated_at` is older than 6 months, and separately older than 1 year (from now). Return e.g. `idleChannels: { over6Months: number, over1Year: number }`.
- **Component:** New component `ChannelInsights` that receives these stats (and optionally `userSlug` for future links).
- **UI:** One section with heading "Channel insights". Two subsections:
  - **By size:** "0 blocks: X channels", "1–10: Y", "11–50: Z", "51–100: W", "101+: V". Optionally omit buckets with 0.
  - **Idle:** "Not updated in 6 months: X channels", "Not updated in 1 year: Y channels."
- **Placement:** Below `ChannelTimeline`, above the two-column TopChannels area; full width.
- **Edge case:** If there are no channels, show "No channel data" or hide the section.

---

## 3. Data flow and edge cases

- **No new API calls.** All new fields are derived in `computeStats(user, channels, blockCount)` from existing fetches. `useArenaStats` and `arena.js` unchanged.
- **Missing data:** If a channel has no `created_at` or `updated_at`, skip it for first-channel and idle. If `counts?.contents` is missing, treat as 0 for block-size.
- **App.jsx:** Pass `firstChannel` (or include on `user`) to `UserHeader`; pass new stats to `ChannelInsights` and render it above the TopChannels columns.
