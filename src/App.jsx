import { useState, useCallback } from 'react'
import { useArenaStats } from './hooks/useArenaStats'
import LoginScreen from './components/LoginScreen'
import UserHeader from './components/UserHeader'
import StatCard from './components/StatCard'
import ChannelBreakdown from './components/ChannelBreakdown'
import ChannelTimeline from './components/ChannelTimeline'
import TopChannels from './components/TopChannels'
import LoadingState from './components/LoadingState'
import ErrorState from './components/ErrorState'
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
  const { stats, loading, error } = useArenaStats(token)

  const handleLogin = useCallback((newToken) => {
    localStorage.setItem(STORAGE_KEY, newToken)
    setToken(newToken)
  }, [])

  const handleLogout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setToken(null)
  }, [])

  if (!token) return <LoginScreen onLogin={handleLogin} />
  if (error) {
    return (
      <ErrorState
        message={error}
        onLogout={handleLogout}
      />
    )
  }
  if (loading || !stats) return <LoadingState />

  return (
    <main className={styles.main}>
      <div className={styles.topBar}>
        <UserHeader user={stats.user} />
        <button className={styles.logout} onClick={handleLogout}>
          Log out
        </button>
      </div>

      <div className={styles.statsGrid}>
        <StatCard value={stats.totalBlocks} label="Total blocks" />
        <StatCard value={stats.totalChannels} label="Channels" />
        <StatCard value={stats.averageBlocksPerChannel} label="Avg / channel" />
        <StatCard value={stats.followerCount} label="Followers" />
        <StatCard value={stats.followingCount} label="Following" />
      </div>

      <ChannelBreakdown
        channelsByVisibility={stats.channelsByVisibility}
        totalChannels={stats.totalChannels}
      />

      <ChannelTimeline channelsByYear={stats.channelsByYear} />

      <div className={styles.columns}>
        <TopChannels
          channels={stats.topChannelsBySize}
          userSlug={stats.user.slug}
        />
        <TopChannels
          title="Recently Updated"
          channels={stats.mostRecentChannels}
          userSlug={stats.user.slug}
        />
      </div>
    </main>
  )
}
