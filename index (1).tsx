import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (res.ok) {
        router.push('/admin')
      } else {
        setError(data.error || 'Invalid credentials')
      }
    } catch {
      setError('Something went wrong. Try again.')
    }
    setLoading(false)
  }

  return (
    <>
      <Head><title>Login — MeetFlow</title></Head>
      <div className="login-wrap">
        <div className="login-card">
          <div className="login-logo">
            <div className="lb" style={{ width: 38, height: 38, borderRadius: 10 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <rect x="2" y="7" width="13" height="10" rx="2"/>
                <polygon points="15,10 22,7 22,17 15,14"/>
              </svg>
            </div>
            <div>
              <div className="login-title">MeetFlow</div>
              <div className="login-sub">Admin portal</div>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>Welcome back</div>
            <div style={{ fontSize: 12, color: 'var(--t3)' }}>Sign in to manage meetings and schedule calls</div>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="field">
              <label>Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@yourcompany.com"
                required
                autoFocus
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-sage"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: 13, marginTop: 4 }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div style={{ marginTop: 20, padding: '14px', background: 'var(--bg2)', borderRadius: 9, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 6 }}>GUEST ACCESS</div>
            <div style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.5 }}>
              Guests don't need an account. Share a meeting link and they can join directly — no login required.
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
