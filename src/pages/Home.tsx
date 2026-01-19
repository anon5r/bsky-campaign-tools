import {useEffect, useState} from 'react'
import {useAuth} from '../contexts/AuthContext'
import {useNavigate} from 'react-router-dom'
import {Globe, History, PartyPopper, X} from 'lucide-react'
import {clearLoginHistory, getLoginHistory} from '../lib/login-history'
import {useLanguage} from '../contexts/LanguageContext'
import {Disclaimer} from '../components/Disclaimer'
import {Footer} from "../components/Footer.tsx";

export default function Home() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const {language, setLanguage, t} = useLanguage()
  
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
      alert(t.loginFailed)
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

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ja' : 'en')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 relative">
      <button
        onClick={toggleLanguage}
        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors flex items-center space-x-1 bg-gray-800/50 rounded-full px-3"
      >
        <Globe className="w-4 h-4"/>
        <span className="text-xs font-medium uppercase">{language}</span>
      </button>

      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          <PartyPopper className="w-20 h-20 text-blue-500" />
        </div>
        <h1 className="text-4xl font-bold">{t.homeTitle}</h1>

        <div className="bg-gray-800 p-6 rounded-xl shadow-lg text-left space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-1">{t.bskyHandle}</label>
            <div className="relative">
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder={t.handlePlaceholder}
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
                  <span>{t.recentLogins}</span>
                  <button onClick={handleClearHistory} className="flex items-center hover:text-red-400 px-1">
                    <X className="w-3 h-3 mr-1"/> {t.clearHistory}
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
            {t.signIn}
          </button>
        </div>


        <div className="text-gray-300 text-sm space-y-4 bg-gray-800/50 p-6 rounded-lg border border-gray-700">
          <h2 className="text-lg font-semibold text-blue-400">{t.featuresTitle}</h2>
          <ul className="list-disc list-inside space-y-2 text-left">
            <li>{t.feature1}</li>
            <li>{t.feature2}</li>
            <li>{t.feature3}</li>
            <li>{t.feature4}</li>
          </ul>
        </div>

        <Disclaimer variant="dark"/>
        <Footer/>
      </div>
    </div>
  )
}