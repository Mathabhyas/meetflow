const DAILY_API_URL = 'https://api.daily.co/v1'
const DAILY_API_KEY = process.env.DAILY_API_KEY || ''

export async function createRoom(name: string): Promise<{ url: string; name: string } | null> {
  try {
    const res = await fetch(`${DAILY_API_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name,
        properties: {
          max_participants: 200,
          enable_recording: 'cloud',
          enable_chat: true,
          enable_knocking: true,
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
        },
      }),
    })
    if (!res.ok) {
      console.error('Daily.co room creation failed:', await res.text())
      return null
    }
    const data = await res.json()
    return { url: data.url, name: data.name }
  } catch (e) {
    console.error('Daily.co error:', e)
    return null
  }
}

export async function createMeetingToken(roomName: string, isOwner = false): Promise<string | null> {
  try {
    const res = await fetch(`${DAILY_API_URL}/meeting-tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          is_owner: isOwner,
          start_audio_off: false,
          start_video_off: false,
          enable_recording: isOwner ? 'cloud' : undefined,
        },
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.token
  } catch { return null }
}

export async function deleteRoom(roomName: string): Promise<void> {
  try {
    await fetch(`${DAILY_API_URL}/rooms/${roomName}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${DAILY_API_KEY}` },
    })
  } catch {}
}
