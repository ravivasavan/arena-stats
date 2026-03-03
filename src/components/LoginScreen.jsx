import { useState } from 'react'
import styles from './LoginScreen.module.css'

export default function LoginScreen({ onLogin }) {
  const [token, setToken] = useState('')
  const [error, setError] = useState(null)
  const [checking, setChecking] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = token.trim()
    if (!trimmed) return

    setChecking(true)
    setError(null)

    try {
      const apiBase = import.meta.env.PROD ? 'https://api.are.na/v3' : '/api/arena/v3'
      const res = await fetch(`${apiBase}/me`, {
        headers: { Authorization: `Bearer ${trimmed}` },
      })
      if (!res.ok) {
        throw new Error('Invalid token')
      }
      onLogin(trimmed)
    } catch {
      setError('Could not verify token. Please check it and try again.')
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Are.na Stats</h1>
        <p className={styles.description}>
          Enter your personal access token to view your dashboard.
        </p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            className={styles.input}
            type="password"
            placeholder="Paste your access token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            autoFocus
          />
          <button
            className={styles.button}
            type="submit"
            disabled={!token.trim() || checking}
          >
            {checking ? 'Checking...' : 'Connect'}
          </button>
        </form>
        {error && <p className={styles.error}>{error}</p>}
        <p className={styles.help}>
          Get your token at{' '}
          <a
            href="https://www.are.na/settings/personal-access-tokens"
            target="_blank"
            rel="noopener noreferrer"
          >
            are.na/settings/personal-access-tokens
          </a>
          . Your token is stored only on your device (e.g. in this browser); we don&apos;t save it in any database.
        </p>
      </div>
    </div>
  )
}
