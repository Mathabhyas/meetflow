import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const DB_DIR = join(process.cwd(), '.data')
const DB_FILE = join(DB_DIR, 'meetings.json')

export interface Meeting {
  id: string
  roomName: string
  roomUrl: string
  title: string
  description?: string
  startTime: string
  duration: number
  passcode?: string
  waitingRoom: boolean
  autoRecord: boolean
  muteOnJoin: boolean
  status: 'scheduled' | 'live' | 'ended'
  createdAt: string
  guestLink: string
}

function ensureDb() {
  if (!existsSync(DB_DIR)) mkdirSync(DB_DIR, { recursive: true })
  if (!existsSync(DB_FILE)) writeFileSync(DB_FILE, JSON.stringify([]))
}

export function getMeetings(): Meeting[] {
  ensureDb()
  try {
    return JSON.parse(readFileSync(DB_FILE, 'utf-8'))
  } catch { return [] }
}

export function getMeeting(id: string): Meeting | null {
  return getMeetings().find(m => m.id === id) || null
}

export function getMeetingByRoom(roomName: string): Meeting | null {
  return getMeetings().find(m => m.roomName === roomName) || null
}

export function saveMeeting(meeting: Meeting): void {
  ensureDb()
  const meetings = getMeetings()
  const idx = meetings.findIndex(m => m.id === meeting.id)
  if (idx >= 0) meetings[idx] = meeting
  else meetings.push(meeting)
  writeFileSync(DB_FILE, JSON.stringify(meetings, null, 2))
}

export function deleteMeeting(id: string): void {
  ensureDb()
  const meetings = getMeetings().filter(m => m.id !== id)
  writeFileSync(DB_FILE, JSON.stringify(meetings, null, 2))
}

export function updateMeetingStatus(id: string, status: Meeting['status']): void {
  const meeting = getMeeting(id)
  if (meeting) { meeting.status = status; saveMeeting(meeting) }
}
