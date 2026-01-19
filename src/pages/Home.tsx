import {useEffect, useState} from 'react'
import {useAuth} from '../contexts/AuthContext'
import {useNavigate} from 'react-router-dom'
import {History, PartyPopper, X} from 'lucide-react'
import {clearLoginHistory, getLoginHistory} from '../lib/login-history'

export default function Home() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  
  const [handle, setHandle] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    setHistory(getLoginHistory())
  }, [])

  const handleLogin = async () => {
    if (!handle.trim()) return
    try {
      await login(handle.trim())
    } catch (err) {
      alert('Login failed. Please check your handle and try again.')
    }
  }

  const handleClearHistory = () => {
    clearLoginHistory()
    setHistory([])
    setShowHistory(false)
  }

  const selectFromHistory = (h: string) => {
    setHandle(h)
    setShowHistory(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          <PartyPopper className="w-20 h-20 text-blue-500" />
        </div>
        <h1 className="text-4xl font-bold">Bluesky Campaign Tools</h1>

        <div className="bg-gray-800 p-6 rounded-xl shadow-lg text-left space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-1">Bluesky Handle</label>
            <div className="relative">
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="user.bsky.social"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
              {history.length > 0 && (
                <button 
                  onClick={() => setShowHistory(!showHistory)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-white"
                  title="History"
                >
                  <History className="w-5 h-5" />
                </button>
              )}
            </div>

            {showHistory && history.length > 0 && (
              <div className="absolute z-20 mt-1 w-full bg-gray-700 rounded-lg border border-gray-600 overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-2 border-b border-gray-600 bg-gray-800 text-xs text-gray-400">
                  <span>Recent Logins</span>
                  <button onClick={handleClearHistory} className="flex items-center hover:text-red-400 px-1">
                    <X className="w-3 h-3 mr-1" /> Clear
                  </button>
                </div>
                <ul className="max-h-48 overflow-y-auto">
                  {history.map((h) => (
                    <li key={h}>
                      <button 
                        onClick={() => selectFromHistory(h)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-600 text-sm transition-colors"
                      >
                        {h}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button
            onClick={handleLogin}
            disabled={!handle}
            className="w-full py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sign in
          </button>
        </div>


        <div className="text-gray-300 text-sm space-y-4 bg-gray-800/50 p-6 rounded-lg border border-gray-700">
          <h2 className="text-lg font-semibold text-blue-400">Blueskyでのキャンペーン管理をサポート</h2>
          <ul className="list-disc list-inside space-y-2 text-left">
            <li>🎯 <strong>リポスト・引用抽出:</strong> 特定の投稿を拡散したユーザーを全件取得</li>
            <li>👥 <strong>フォロワー限定:</strong> フォロワーの中から参加者をフィルタリング</li>
            <li>🎲 <strong>抽選機能:</strong> ランダムピックアップ＆重複なしの当選確定</li>
            <li>📂 <strong>CSV出力:</strong> 当選者リストをExcelなどで管理可能な形式でダウンロード</li>
          </ul>
        </div>

      </div>
    </div>
  )
}
