import { useCallback, useState } from 'react'
import { useArenaStats } from './hooks/useArenaStats'
import { clearCache } from './api/cache'
import LoginScreen from './components/LoginScreen'
import UserHeader from './components/UserHeader'
import StatCard from './components/StatCard'
import LoadProgress from './components/LoadProgress'
import CreationTimeline from './components/CreationTimeline'
import ActivityHeatmap from './components/ActivityHeatmap'
import BlockComposition from './components/BlockComposition'
import SourcesPanel from './components/SourcesPanel'
import RhythmPanel from './components/RhythmPanel'
import PacePanel from './components/PacePanel'
import MilestonesPanel from './components/MilestonesPanel'
import StoragePanel from './components/StoragePanel'
import ChannelsPanel from './components/ChannelsPanel'
import PeoplePanel from './components/PeoplePanel'
import ChannelList from './components/ChannelList'
import BlockList from './components/BlockList'
import LoadingState from './components/LoadingState'
import ErrorState from './components/ErrorState'
import { formatBytes, formatRelative } from './utils/format'
import styles from './App.module.css'

const STORAGE_KEY = 'arena_token'

function getStoredToken() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export default function App() {
  const [token, setToken] = useState(getStoredToken)
  const { stats, loading, error, progress, cachedAt, refresh } = useArenaStats(token)

  const handleLogin = useCallback((newToken) => {
    localStorage.setItem(STORAGE_KEY, newToken)
    setToken(newToken)
  }, [])

  const handleLogout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    clearCache(null)
    setToken(null)
  }, [])

  if (!token) return <LoginScreen onLogin={handleLogin} />
  if (error) return <ErrorState message={error} onLogout={handleLogout} />
  if (!stats) return <LoadingState progress={progress} />

  const { user, channels, blocks, social } = stats

  return (
    <main className={styles.main}>
      <div className={styles.topBar}>
        <UserHeader user={user} />
        <div className={styles.controls}>
          {cachedAt && !loading && (
            <span className={styles.cached}>Cached {formatRelative(cachedAt)}</span>
          )}
          <button className={styles.button} onClick={refresh} disabled={loading}>
            Refresh
          </button>
          <button className={styles.button} onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>

      {progress && <LoadProgress progress={progress} />}

      <div className={styles.statsGrid}>
        <StatCard
          value={stats.totalBlocks}
          label="Blocks"
          hint={blocks?.truncated ? `${blocks.sampled.toLocaleString()} analysed` : null}
        />
        <StatCard
          value={stats.totalChannels}
          label="Channels"
          hint={`${channels.owned.toLocaleString()} yours`}
        />
        <StatCard value={stats.averageBlocksPerChannel} label="Avg / channel" />
        <StatCard value={stats.followerCount} label="Followers" />
        <StatCard value={stats.followingCount} label="Following" />
        <StatCard
          value={blocks?.storage?.totalBytes ? formatBytes(blocks.storage.totalBytes) : '—'}
          label="Uploads"
        />
      </div>

      <CreationTimeline blocks={blocks} channelsByYear={channels.byYear} />

      {blocks && !blocks.empty && (
        <ActivityHeatmap calendar={blocks.calendar} years={blocks.years} />
      )}

      <PacePanel blocks={blocks} />

      <BlockComposition blocks={blocks} />

      <RhythmPanel blocks={blocks} />

      <SourcesPanel blocks={blocks} />

      <ChannelsPanel channels={channels} />

      <div className={styles.columns}>
        <ChannelList
          title="Largest Channels"
          channels={channels.topBySize}
          userSlug={user.slug}
          metric="size"
        />
        <ChannelList
          title="Recently Updated"
          channels={channels.recentlyUpdated}
          userSlug={user.slug}
          metric="updated"
        />
      </div>

      <div className={styles.columns}>
        <ChannelList
          title="Longest Running"
          channels={channels.longestRunning}
          userSlug={user.slug}
          metric="lifespan"
        />
        <BlockList title="Most Discussed Blocks" blocks={blocks?.comments?.mostDiscussed} />
      </div>

      <MilestonesPanel user={user} blocks={blocks} channels={channels} />

      <StoragePanel blocks={blocks} />

      <PeoplePanel user={user} channels={channels} social={social} />

      <footer className={styles.footer}>
        Data from the{' '}
        <a href="https://api.are.na/v3/openapi" target="_blank" rel="noopener noreferrer">
          Are.na v3 API
        </a>
        . Nothing leaves your browser.
        {blocks?.truncated && ' Block analysis is capped at 25,000 blocks.'}
      </footer>
    </main>
  )
}
