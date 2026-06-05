import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { format, isToday, isFuture, isPast } from 'date-fns'

interface Meeting {
  id: string; roomName: string; title: string; startTime: string;
  duration: number; status: string; guestLink: string; passcode?: string;
}

export default function AdminDashboard() {
  const router = useRouter()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')

  useEffect(() => { fetchMeetings() }, [])

  async function fetchMeetings() {
    try {
      const res = await fetch('/api/meetings/list')
      if (res.status === 401) { router.push('/login'); return }
      const data = await res.json()
      setMeetings(data.meetings || [])
    } catch {}
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this meeting?')) return
    await fetch(`/api/meetings/${id}`, { method: 'DELETE' })
    setMeetings(m => m.filter(x => x.id !== id))
    showToast('Meeting deleted')
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  function copyLink(link: string) {
    navigator.clipboard.writeText(link)
    showToast('Link copied!')
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const todayMeetings = meetings.filter(m => isToday(new Date(m.startTime)))
  const upcomingMeetings = meetings.filter(m => isFuture(new Date(m.startTime)) && !isToday(new Date(m.startTime)))
  const pastMeetings = meetings.filter(m => isPast(new Date(m.startTime)) && !isToday(new Date(m.startTime)))

  function getBadge(m: Meeting) {
    const t = new Date(m.startTime)
    if (m.status === 'live') return { label: 'Live now', cls: 'live' }
    if (isToday(t) && isFuture(t)) return { label: 'Today', cls: 'upcoming' }
    if (isFuture(t)) return { label: 'Upcoming', cls: 'scheduled' }
    return { label: 'Ended', cls: 'ended' }
  }

  return (
    <>
      <Head><title>Dashboard — MeetFlow Admin</title></Head>
      <div className="app">
        {/* Sidebar */}
        <div className="nav">
          <div className="nlo">
            <div className="lb">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <rect x="2" y="7" width="13" height="10" rx="2"/><polygon points="15,10 22,7 22,17 15,14"/>
              </svg>
            </div>
            <div><div className="ln">MeetFlow</div><div className="lp">Admin</div></div>
          </div>
          <div className="nb">
            <div className="nlbl">MAIN</div>
            <Link href="/admin" className="ni act">
              <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <span className="nil">Dashboard</span>
            </Link>
            <Link href="/admin/schedule" className="ni">
              <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span className="nil">Schedule</span>
            </Link>
            <Link href="/admin/meetings" className="ni">
              <svg viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
              <span className="nil">All meetings</span>
              {meetings.length > 0 && <span className="nbdg">{meetings.length}</span>}
            </Link>
          </div>
          <div className="nbot">
            <div className="ur" onClick={handleLogout} style={{cursor:'pointer'}}>
              <div className="uaw"><div className="ua">A</div><div className="ud"></div></div>
              <div><div style={{fontSize:12,fontWeight:500}}>Admin</div><div style={{fontSize:10,color:'var(--t3)'}}>Sign out</div></div>
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="mn">
          <div className="tb">
            <div className="tbt">Dashboard</div>
            <div style={{display:'flex',gap:8}}>
              <Link href="/admin/schedule" className="btn btn-sage">
                <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                New meeting
              </Link>
            </div>
          </div>
          <div className="co">
            {/* Stats */}
            <div className="stats-grid">
              <div className="card stat-card"><div className="stat-num" style={{color:'var(--st)'}}>{meetings.length}</div><div className="stat-lbl">Total meetings</div></div>
              <div className="card stat-card"><div className="stat-num" style={{color:'var(--sg)'}}>{todayMeetings.length}</div><div className="stat-lbl">Today</div></div>
              <div className="card stat-card"><div className="stat-num" style={{color:'var(--mv)'}}>{upcomingMeetings.length}</div><div className="stat-lbl">Upcoming</div></div>
              <div className="card stat-card"><div className="stat-num" style={{color:'var(--t3)'}}>{pastMeetings.length}</div><div className="stat-lbl">Past</div></div>
            </div>

            {/* Today */}
            {todayMeetings.length > 0 && (
              <>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                  <div style={{fontSize:13,fontWeight:500}}>Today's meetings</div>
                </div>
                <div className="meeting-list" style={{marginBottom:24}}>
                  {todayMeetings.map(m => {
                    const badge = getBadge(m)
                    return (
                      <div key={m.id} className="card meeting-card">
                        <div className="mc-time">{format(new Date(m.startTime), 'h:mm a')}</div>
                        <div className="mc-dot"></div>
                        <div className="mc-title">{m.title}</div>
                        <span className={`mc-badge ${badge.cls}`}>{badge.label}</span>
                        <div style={{display:'flex',gap:6}}>
                          <button className="btn btn-sage" onClick={() => router.push(`/room/${m.roomName}?admin=1`)}>
                            <svg viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                            Start
                          </button>
                          <button className="btn btn-ghost" onClick={() => copyLink(m.guestLink)}>Copy link</button>
                          <button className="btn btn-rose" onClick={() => handleDelete(m.id)}>Delete</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {/* Upcoming */}
            {upcomingMeetings.length > 0 && (
              <>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                  <div style={{fontSize:13,fontWeight:500}}>Upcoming</div>
                </div>
                <div className="meeting-list" style={{marginBottom:24}}>
                  {upcomingMeetings.slice(0, 5).map(m => (
                    <div key={m.id} className="card meeting-card">
                      <div className="mc-time">{format(new Date(m.startTime), 'MMM d, h:mm a')}</div>
                      <div className="mc-dot"></div>
                      <div className="mc-title">{m.title}</div>
                      <span className="mc-badge scheduled">Scheduled</span>
                      <div style={{display:'flex',gap:6}}>
                        <button className="btn btn-ghost" onClick={() => copyLink(m.guestLink)}>Copy link</button>
                        <button className="btn btn-rose" onClick={() => handleDelete(m.id)}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {meetings.length === 0 && !loading && (
              <div className="card" style={{padding:40,textAlign:'center'}}>
                <div style={{fontSize:32,marginBottom:12}}>📅</div>
                <div style={{fontSize:15,fontWeight:500,marginBottom:6}}>No meetings yet</div>
                <div style={{fontSize:12,color:'var(--t3)',marginBottom:18}}>Schedule your first meeting to get started.</div>
                <Link href="/admin/schedule" className="btn btn-sage">Schedule a meeting</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className="toast">
          <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
          {toast}
        </div>
      )}
    </>
  )
}
