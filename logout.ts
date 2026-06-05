import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

export default function Schedule() {
  const router = useRouter()
  const [form, setForm] = useState({
    title: '', description: '', startDate: '', startTime: '10:00',
    duration: '60', passcode: '', waitingRoom: false,
    autoRecord: false, muteOnJoin: true,
  })
  const [emails, setEmails] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<any>(null)

  function set(k: string, v: any) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.startDate) { setError('Title and date are required'); return }
    setLoading(true); setError('')
    const startTime = new Date(`${form.startDate}T${form.startTime}`).toISOString()
    const inviteEmails = emails.split(/[\n,]/).map(e => e.trim()).filter(Boolean)
    try {
      const res = await fetch('/api/meetings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, startTime, inviteEmails }),
      })
      const data = await res.json()
      if (res.ok) { setSuccess(data.meeting) }
      else { setError(data.error || 'Failed to create meeting') }
    } catch { setError('Something went wrong') }
    setLoading(false)
  }

  if (success) return (
    <>
      <Head><title>Meeting Scheduled — MeetFlow</title></Head>
      <div style={{minHeight:'100vh',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div className="card" style={{padding:32,width:460,textAlign:'center'}}>
          <div style={{fontSize:40,marginBottom:12}}>🎉</div>
          <div style={{fontSize:18,fontWeight:500,marginBottom:6}}>Meeting scheduled!</div>
          <div style={{fontSize:12,color:'var(--t3)',marginBottom:20}}>{success.title}</div>
          <div style={{background:'var(--sl)',border:'1px solid var(--sm)',borderRadius:10,padding:16,marginBottom:16,textAlign:'left'}}>
            <div style={{fontSize:10,color:'var(--sg)',letterSpacing:.5,marginBottom:6}}>GUEST LINK</div>
            <div style={{fontSize:12,color:'var(--sg)',wordBreak:'break-all',marginBottom:10}}>{success.guestLink}</div>
            <button className="btn btn-sage" onClick={() => {navigator.clipboard.writeText(success.guestLink)}}>Copy link</button>
          </div>
          {success.passcode && (
            <div style={{background:'var(--al)',border:'1px solid var(--am2)',borderRadius:10,padding:16,marginBottom:16,textAlign:'left'}}>
              <div style={{fontSize:10,color:'var(--am)',letterSpacing:.5,marginBottom:4}}>PASSCODE</div>
              <div style={{fontSize:20,fontWeight:600,color:'var(--am)',letterSpacing:4}}>{success.passcode}</div>
            </div>
          )}
          <div style={{display:'flex',gap:8,justifyContent:'center'}}>
            <button className="btn btn-sage" onClick={() => router.push(`/room/${success.roomName}?admin=1`)}>
              <svg viewBox="0 0 24 24" style={{width:13,height:13,fill:'none',stroke:'currentColor',strokeWidth:1.8}}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
              Start now
            </button>
            <button className="btn btn-ghost" onClick={() => router.push('/admin')}>Back to dashboard</button>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      <Head><title>Schedule Meeting — MeetFlow</title></Head>
      <div className="app">
        <div className="nav">
          <div className="nlo">
            <div className="lb"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="2" y="7" width="13" height="10" rx="2"/><polygon points="15,10 22,7 22,17 15,14"/></svg></div>
            <div><div className="ln">MeetFlow</div><div className="lp">Admin</div></div>
          </div>
          <div className="nb">
            <div className="nlbl">MAIN</div>
            <Link href="/admin" className="ni"><svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg><span className="nil">Dashboard</span></Link>
            <Link href="/admin/schedule" className="ni act"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><span className="nil">Schedule</span></Link>
            <Link href="/admin/meetings" className="ni"><svg viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg><span className="nil">All meetings</span></Link>
          </div>
        </div>
        <div className="mn">
          <div className="tb"><div className="tbt">Schedule a meeting</div></div>
          <div className="co">
            <form onSubmit={handleSubmit}>
              <div style={{display:'grid',gridTemplateColumns:'380px 1fr',gap:18}}>
                <div className="card form-card">
                  {error && <div className="error-msg">{error}</div>}
                  <div className="field"><label>Meeting title *</label><input value={form.title} onChange={e=>set('title',e.target.value)} placeholder="e.g. Weekly team standup" required/></div>
                  <div className="field"><label>Description</label><textarea value={form.description} onChange={e=>set('description',e.target.value)} placeholder="What is this meeting about?" style={{minHeight:70,resize:'none',lineHeight:1.5}}/></div>
                  <div className="field"><label>Date *</label><input type="date" value={form.startDate} onChange={e=>set('startDate',e.target.value)} required/></div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                    <div className="field"><label>Start time</label><input type="time" value={form.startTime} onChange={e=>set('startTime',e.target.value)}/></div>
                    <div className="field"><label>Duration (min)</label><select value={form.duration} onChange={e=>set('duration',e.target.value)}>
                      {['15','30','45','60','90','120','180'].map(d=><option key={d} value={d}>{d} min</option>)}
                    </select></div>
                  </div>
                  <div className="field"><label>Passcode (optional)</label><input value={form.passcode} onChange={e=>set('passcode',e.target.value)} placeholder="Leave blank for no passcode"/></div>
                  <div className="field"><label>Invite by email (optional)</label><textarea value={emails} onChange={e=>setEmails(e.target.value)} placeholder="Enter emails, one per line or comma separated" style={{minHeight:70,resize:'none',lineHeight:1.5}}/><div style={{fontSize:10,color:'var(--t3)',marginTop:4}}>They'll receive an invite email with the meeting link</div></div>
                  <div style={{borderTop:'1px solid var(--border)',margin:'12px 0 10px'}}/>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid var(--bg2)',fontSize:12}}>
                    <span>Waiting room</span>
                    <button type="button" className={`tog${form.waitingRoom?' on':''}`} onClick={()=>set('waitingRoom',!form.waitingRoom)}/>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid var(--bg2)',fontSize:12}}>
                    <span>Auto-record</span>
                    <button type="button" className={`tog${form.autoRecord?' on':''}`} onClick={()=>set('autoRecord',!form.autoRecord)}/>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',fontSize:12}}>
                    <span>Mute participants on join</span>
                    <button type="button" className={`tog${form.muteOnJoin?' on':''}`} onClick={()=>set('muteOnJoin',!form.muteOnJoin)}/>
                  </div>
                  <div style={{display:'flex',gap:8,marginTop:16}}>
                    <Link href="/admin" className="btn btn-ghost" style={{flex:1,justifyContent:'center'}}>Cancel</Link>
                    <button type="submit" className="btn btn-sage" disabled={loading} style={{flex:1,justifyContent:'center'}}>
                      {loading ? 'Creating…' : 'Schedule meeting'}
                    </button>
                  </div>
                </div>
                <div className="card" style={{padding:0,overflow:'hidden',height:'fit-content',maxHeight:'calc(100vh - 120px)'}}>
                  <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border)',fontSize:13,fontWeight:500,color:'var(--t2)'}}>How it works</div>
                  <div style={{padding:20}}>
                    {[
                      {icon:'🔗',title:'Shareable guest link',desc:'A unique link is created that anyone can use to join — no account needed.'},
                      {icon:'📧',title:'Email invites',desc:'Add emails above and guests receive a beautiful invite with the link and details.'},
                      {icon:'⏱',title:'Unlimited duration',desc:'Meetings have no time limit. Stay as long as you need.'},
                      {icon:'🎥',title:'Real video calls',desc:'Powered by Daily.co — HD video, screen sharing, and recording built-in.'},
                      {icon:'🛡',title:'You control access',desc:'Add a passcode or enable waiting room to approve guests before they enter.'},
                    ].map(item=>(
                      <div key={item.title} style={{display:'flex',gap:12,marginBottom:16,alignItems:'flex-start'}}>
                        <div style={{fontSize:20,flexShrink:0,marginTop:2}}>{item.icon}</div>
                        <div><div style={{fontSize:12,fontWeight:500,marginBottom:3}}>{item.title}</div><div style={{fontSize:11,color:'var(--t3)',lineHeight:1.5}}>{item.desc}</div></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
