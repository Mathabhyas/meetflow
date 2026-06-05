import type { NextApiRequest, NextApiResponse } from 'next'
import { isAdminRequest } from '../../../lib/auth'
import { createRoom } from '../../../lib/daily'
import { saveMeeting } from '../../../lib/db'
import { sendMeetingInvite } from '../../../lib/email'
import { v4 as uuidv4 } from 'uuid'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  if (!isAdminRequest(req)) return res.status(401).json({ error: 'Unauthorized' })

  const { title, description, startTime, duration, passcode, waitingRoom, autoRecord, muteOnJoin, inviteEmails } = req.body
  if (!title || !startTime) return res.status(400).json({ error: 'Title and start time required' })

  const id = uuidv4()
  const roomName = `meetflow-${id.slice(0, 8)}`
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const guestLink = `${appUrl}/join/${roomName}`

  // Create Daily.co room
  const room = await createRoom(roomName)
  const roomUrl = room?.url || `https://meetflow.daily.co/${roomName}`

  const meeting = {
    id,
    roomName,
    roomUrl,
    title,
    description: description || '',
    startTime,
    duration: Number(duration) || 60,
    passcode: passcode || '',
    waitingRoom: Boolean(waitingRoom),
    autoRecord: Boolean(autoRecord),
    muteOnJoin: Boolean(muteOnJoin),
    status: 'scheduled' as const,
    createdAt: new Date().toISOString(),
    guestLink,
  }

  saveMeeting(meeting)

  // Send invite emails if provided
  if (inviteEmails && Array.isArray(inviteEmails)) {
    for (const email of inviteEmails) {
      if (email?.trim()) {
        await sendMeetingInvite({
          to: email.trim(),
          meetingTitle: title,
          startTime,
          duration: meeting.duration,
          guestLink,
          passcode: passcode || undefined,
        })
      }
    }
  }

  res.status(200).json({ success: true, meeting })
}
