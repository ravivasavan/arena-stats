# Full account analysis: blocks by year and the rest of the v3 surface

**Date:** 2026-08-03
**Status:** Implemented
**Scope:** Expand the dashboard from channel-metadata-only to a full analysis of every block, plus the social and activity endpoints.

---

## 1. What the v3 API actually offers

The live spec is at `https://api.are.na/v3/openapi.json` (41 paths). The ones worth surfacing for a personal dashboard:

| Endpoint | What it gives us |
|---|---|
| `GET /v3/me` | `tier`, `badge`, `counts.{channels,followers,following,notifications}`, `email` |
| `GET /v3/users/:id/contents?type=Block` | **Every block you've made.** `type`, `created_at`, `updated_at`, `title`, `visibility`, `comment_count`, `source.{url,provider}`, `image.{file_size,aspect_ratio}`, `attachment.{file_size,file_extension}`, `content.plain` |
| `GET /v3/users/:id/contents?type=Channel` | Channels, each with `counts.{blocks,channels,contents,collaborators}`, `owner` (User **or** Group), and an embedded `collaborators` array |
| `GET /v3/users/:id/following?type=User\|Channel\|Group` | Following split by type (one `per=1` request each reads the count from `meta`) |
| `GET /v3/users/:id/followers` | Follower count and the newest followers |
| `GET /v3/users/:id/groups` | Groups you belong to |
| `GET /v3/me/feed` | Network activity, cursor-paginated, typed by `ActivityKind` |

Deliberately not used: `/v3/search` (premium only), `/v3/blocks/:id/connections` (one request per block — far too many), `/v3/me/notifications` (not a stat).

Sorting on user contents accepts `created_at_asc|desc`, `updated_at_asc|desc`; `per` maxes out at 100.

Two API quirks worth knowing:

- **`?type=Embed` is broken.** It ignores the filter and returns the total for *all* contents (3,483 on an account with 3,320 blocks; 8,551 on one with 8,104). Never trust per-type counts from the API — derive them from the block payload, which is what we do.
- **`X-RateLimit-*` is unreadable in the browser.** The headers are sent on every response, but `Access-Control-Expose-Headers` is empty, so JS can't read them cross-origin. It works behind the dev proxy and silently stops working in production.

## 2. Fetch strategy

Blocks are the whole game and also the whole cost: one request per 100 blocks.

- **Tier-aware throttle.** `/v3/me` returns `tier`; the limits are guest 30, free 120, premium 300, supporter 600 requests/minute. We run a sliding-window budget at 80% of the tier limit. The `X-RateLimit-*` headers can't be read cross-origin (`access-control-expose-headers` is empty), so self-throttling from the tier is the only option. 429s back off using `Retry-After`.
- **Sequential pagination**, not parallel — keeps us predictable against the budget.
- **Trim on ingest.** Each block is reduced to ~14 scalar fields before it's kept, so a 25k-block account is a few MB rather than hundreds.
- **24h `localStorage` cache**, keyed by user id, per collection (`channels`, `blocks`, `social`). Quota failures are swallowed — the app just re-fetches next time.
- **Progressive publish.** Channels render first, blocks recompute every 5 pages while streaming, social lands last. Social fetches are individually settled so one failure doesn't take the page down.
- **Cap at 250 pages** (25,000 blocks). Totals still come from `meta.total_count`; the charts note that they're based on a sample.

## 3. Derived statistics

**Blocks** (`src/utils/blockStats.js`) — single pass over the trimmed array producing: counts by type / visibility / year / year-and-type / month / day, weekday and hour histograms, top hosts and extensions, storage totals, word count, comment totals, titled ratio, image orientation, first and latest block, active days, busiest day and month, longest and current streaks, and pace figures (last 30/90/365, this year vs same point last year, per week, per active day).

Four things the naive version gets wrong, all corrected here:

- Link and Embed blocks carry a **fetched preview image** with a `file_size` and `aspect_ratio`. Counting those makes "storage uploaded" and "image orientation" meaningless — preview crops skew heavily square (49% square vs 13% once excluded, on a real account). Only `Image` and `Attachment` blocks count as uploads.
- The API returns block types outside the documented five — a real account turned up a **`PendingBlock`**. Iterating a hardcoded type list silently drops them and the percentages stop summing to 100. `typeOrder` keeps the familiar order, then appends anything unexpected with a neutral colour.
- `source.provider.name` is **just the hostname** (`www.booooooom.com`), so a "top providers" chart is a duplicate of "top domains". Not worth the row in the cache.
- Consecutive-day maths uses a UTC day serial, so streaks don't break on DST boundaries. Day keys are local-time so calendar buckets match the user's own days.

**Channels** (`src/utils/channelStats.js`) — the previous stats plus ownership (owner is a `User` that is you, another user, or a `Group`), collaborator tallies across all channels, nested channel links, median size, and channel lifespan (`created_at` → `updated_at`).

## 4. UI

Shared primitives in `src/components/ui/`: `Section` (card + heading + note + actions, plus `Facts`/`Fact`/`Subheading`/`Empty`), `Bars` (horizontal, optionally stacked), `Columns` (vertical, dense series), `StackedBar` (proportional + legend).

Panels, in page order: stat cards → `CreationTimeline` (by year, blocks/channels toggle) → `ActivityHeatmap` → `PacePanel` → `BlockComposition` → `RhythmPanel` → `SourcesPanel` → `ChannelsPanel` → channel/block lists → `MilestonesPanel` → `StoragePanel` → `PeoplePanel` → `ActivityFeed`.

Every panel handles three states: no data yet (blocks still streaming), empty (account has none), and loaded. Colours are all CSS custom properties, so a `prefers-color-scheme: dark` block re-themes the whole app.

## 5. Edge cases

- Blocks not yet loaded: the year chart falls back to channels; block panels render an empty state rather than crashing.
- Truncated block fetch: stat cards show the true total with an "N analysed" hint, and the footer says so.
- Social endpoints failing (permissions, feed unavailable): each resolves to `null` and its panel degrades.
- Unknown future `ActivityKind` values: the feed falls back to the raw kind with underscores stripped.
