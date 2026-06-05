import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()
  useEffect(() => {
    const token = document.cookie.includes('admin_token')
    router.replace(token ? '/admin' : '/login')
  }, [])
  return null
}
