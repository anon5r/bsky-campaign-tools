import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { PartyPopper } from 'lucide-react'

export default function Home() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          <PartyPopper className="w-20 h-20 text-blue-500" />
        </div>
        <h1 className="text-4xl font-bold">Bluesky Campaign Tools</h1>
        <p className="text-gray-400">
          Run contests, giveaways, and campaigns on Bluesky with ease.
          Filter reposts, check followers, and pick winners.
        </p>
        <button
          onClick={login}
          className="w-full py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors shadow-lg"
        >
          Sign in with Bluesky
        </button>
      </div>
    </div>
  )
}
