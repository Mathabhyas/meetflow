import type { NextApiRequest, NextApiResponse } from 'next'
import { isAdminRequest } from '../../../lib/auth'
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ admin: isAdminRequest(req) })
}
