import type { NextApiRequest, NextApiResponse } from 'next'
import { isAdminRequest } from '../../../lib/auth'
import { getMeetings } from '../../../lib/db'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  if (!isAdminRequest(req)) return res.status(401).json({ error: 'Unauthorized' })
  const meetings = getMeetings().sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
  res.status(200).json({ meetings })
}
