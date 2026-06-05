import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { format } from 'date-fns'

export default function AllMeetings() {
  const router = useRouter()
  const [meetings, setMeetings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')

  useEffect(() => { fetchMeetings() }, [])

  async function fetchMeetings() {
    const res = await fetch('/api/meetings/list')
    if (res.status === 401) { router.push('/login'); return }
    const data = await res.json()
    setMeetings(data.meetings || [])
    setLoading(false)
  }

  async function del(id: string) {
    if (!confirm('Delete this meeting?')) return
    await fetch(`/api/meetings/${id}`, { method: 'DELETE' })
    setMeetings(m => m.filter(x => x.id !== id))
    setToast('Deleted'); setTimeout(() => setToast(''), 2500)
  }

  function copy(link: string) {
    navigator.clipboard.writeText(link)
    setToast('Link copied!'); setTimeout(() => setToast(''), 2500)
  }

  return (
    <>
      <Head><title>All Meetings — MeetFlow</title></Head>
      <div className="app">
        <div className="nav">
          <div className="nlo"><div className="lb"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="2" y="7" width="13" height="10" rx="2"/><polygon points="15,10 22,7 22,17 15,14"/></svg></div><div><div className="ln">MeetFlow</div><div className="lp">Admin</div></div></div>
          <div className="nb">
            <div className="nlbl">MAIN</div>
            <Link href="/admin" className="ni"><svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg><span className="nil">Dashboard</span></Link>
            <Link href="/admin/schedule" className="ni"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><span className="nil">Schedule</span></Link>
            <Link href="/admin/meetings" className="ni act"><svg viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg><span className="nil">All meetings</span></Link>
          </div>
        </div>
        <div className="mn">
          <div className="tb">
            <div className="tbt">All meetings</div>
            <Link href="/admin/schedule" className="btn btn-sage"><svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>New meeting</Link>
          </div>
          <div className="co">
            {loading && <div style={{padding:40,textAlign:'center',color:'var(--t3)'}}>Loading…</div>}
            {!loading && meetings.length === 0 && (
              <div className="card" style={{padding:40,textAlign:'center'}}>
                <div style={{fontSize:32,marginBottom:12}}>📅</div>
                <div style={{fontSize:15,fontWeight:500,marginBottom:6}}>No meetings yet</div>
                <Link href="/admin/schedule" className="btn btn-sage">Schedule one</Link>
              </div>
            )}
            {meetings.map(m => (
              <div key={m.id} className="card" style={{padding:'14px 16px',marginBottom:10,display:'flex',alignItems:'center',gap:14}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:500,marginBottom:3}}>{m.title}</div>
                  <div style={{fontSize:11,color:'var(--t3)',display:'flex',gap:12}}>
                    <span>{format(new Date(m.startTime), 'MMM d, yyyy · h:mm a')}</span>
                    <span>{m.duration} min</span>
                    {m.passcode && <span>🔒 Passcode: {m.passcode}</span>}
                  </div>
                  <div style={{fontSize:11,color:'var(--st)',marginTop:4,wordBreak:'break-all'}}>{m.guestLink}</div>
                </div>
                <div style={{display:'flex',gap:6,flexShrink:0}}>
                  <button className="btn btn-sage" onClick={() => router.push(`/room/${m.roomName}?admin=1`)}>
                    <svg viewBox="0 0 24 24" style={{width:12,height:12,fill:'none',stroke:'currentColor',strokeWidth:2}}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                    Start
                  </button>
                  <button className="btn btn-ghost" onClick={() => copy(m.guestLink)}>Copy link</button>
                  <button className="btn btn-rose" onClick={() => del(m.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {toast && <div className="toast"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>{toast}</div>}
    </>
  )
}
