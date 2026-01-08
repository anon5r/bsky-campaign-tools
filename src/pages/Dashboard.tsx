import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { parsePostUrl, resolveDid, fetchAllReposters, fetchAllQuotes, fetchFollowers } from '../lib/bsky-helpers'
import type { Participant } from '../lib/bsky-helpers'
import { LogOut, Users, Repeat, MessageSquare, Gift, Search, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import clsx from 'clsx'

export default function Dashboard() {
  const { agent, userDid, userHandle, logout } = useAuth()
  
  // Inputs
  const [postUrl, setPostUrl] = useState('')
  const [includeQuotes, setIncludeQuotes] = useState(true)
  const [untilDate, setUntilDate] = useState('')
  
  // State
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [participants, setParticipants] = useState<Participant[]>([])
  
  // Winners
  const [winnerCount, setWinnerCount] = useState(1)
  const [winners, setWinners] = useState<Participant[]>([])

  const handleAnalyze = async () => {
    if (!agent || !userDid) return
    const urlData = parsePostUrl(postUrl)
    if (!urlData) {
      alert('Invalid Post URL. Please use a valid Bluesky post link.')
      return
    }

    setIsAnalyzing(true)
    setParticipants([])
    setWinners([])
    setStatusMessage('Resolving post...')

    try {
      // 1. Resolve Post URI
      const authorDid = await resolveDid(agent, urlData.handle)
      if (!authorDid) throw new Error('Could not resolve author')
      const postUri = `at://${authorDid}/app.bsky.feed.post/${urlData.rkey}`

      // 2. Fetch Reposters
      setStatusMessage('Fetching Reposters...')
      const reposters = await fetchAllReposters(agent, postUri, (c) => setStatusMessage(`Fetching Reposters... (${c})`))
      
      // 3. Fetch Quotes (if requested)
      let quotes: Participant[] = []
      if (includeQuotes) {
        setStatusMessage('Fetching Quotes...')
        quotes = await fetchAllQuotes(agent, postUri, (c) => setStatusMessage(`Fetching Quotes... (${c})`))
      }

      const allInteractions = [...reposters, ...quotes]
      
      // 4. Fetch Followers (to filter)
      setStatusMessage('Fetching Your Followers (This may take a while)...')
      // Note: We fetch followers of the CURRENT USER (campaign runner), not the post author (unless same)
      const myFollowers = await fetchFollowers(agent, userDid, (c) => setStatusMessage(`Fetching Your Followers... (${c})`))

      // 5. Filter
      setStatusMessage('Processing results...')
      
      const validParticipants = allInteractions.filter(p => {
        // Must be following me
        if (!myFollowers.has(p.did)) return false
        
        // Time filter
        if (untilDate) {
          if (p.type === 'quote' && p.repostedAt) {
            return new Date(p.repostedAt) <= new Date(untilDate)
          }
          // For reposts, we can't filter by time effectively, so we include them or exclude based on policy.
          // For now, we include them but maybe mark them?
          // Let's assume we include them as we can't verify.
          return true
        }
        return true
      })

      // Remove duplicates (if someone reposted AND quoted)
      const uniqueParticipants = Array.from(new Map(validParticipants.map(item => [item.did, item])).values())

      setParticipants(uniqueParticipants)
      setStatusMessage(`Found ${uniqueParticipants.length} qualified participants!`)

    } catch (err) {
      console.error(err)
      setStatusMessage('Error occurred during analysis.')
      alert('An error occurred. Check console for details.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handlePickWinners = () => {
    if (participants.length === 0) return
    const count = Math.min(winnerCount, participants.length)
    const shuffled = [...participants].sort(() => 0.5 - Math.random())
    setWinners(shuffled.slice(0, count))
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Gift className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-800">Campaign Tools</h1>
          </div>
          <div className="flex items-center space-x-4">
             {userHandle && <span className="text-sm font-medium text-gray-600">@{userHandle}</span>}
            <button onClick={logout} className="p-2 text-gray-500 hover:text-red-600 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Configuration Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center"><Search className="w-5 h-5 mr-2 text-blue-500"/> Campaign Setup</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Post URL</label>
                <input 
                  type="text" 
                  placeholder="https://bsky.app/profile/..." 
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  value={postUrl}
                  onChange={e => setPostUrl(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-4">
                 <label className="flex items-center space-x-2 cursor-pointer">
                   <input 
                    type="checkbox" 
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                    checked={includeQuotes}
                    onChange={e => setIncludeQuotes(e.target.checked)}
                   />
                   <span className="text-sm text-gray-700">Include Quotes</span>
                 </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Until Date (Optional)</label>
                <input 
                  type="datetime-local" 
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  value={untilDate}
                  onChange={e => setUntilDate(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  <AlertCircle className="w-3 h-3 inline mr-1"/>
                  Time filtering is precise for Quotes. Standard reposts may not have exact timestamps available via API.
                </p>
              </div>
            </div>

            <div className="flex flex-col justify-end">
              <div className="bg-blue-50 p-4 rounded-lg mb-4 text-sm text-blue-800">
                <p className="font-medium mb-1">Criteria:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Must follow you (@{userHandle || '...'})</li>
                  <li>Must have Reposted or Quoted the target post</li>
                  {untilDate && <li>Must have acted before {new Date(untilDate).toLocaleString()}</li>}
                </ul>
              </div>
              <button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing || !postUrl}
                className={clsx(
                  "w-full py-3 px-4 rounded-lg font-semibold text-white shadow-md transition-all",
                  isAnalyzing || !postUrl ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                )}
              >
                {isAnalyzing ? 'Analyzing...' : 'Fetch Participants'}
              </button>
              {statusMessage && <p className="text-center text-sm text-gray-600 mt-2 animate-pulse">{statusMessage}</p>}
            </div>
          </div>
        </div>

        {/* Results Section */}
        {participants.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* List */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-[600px]">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-semibold text-gray-700 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-indigo-500"/> 
                  Qualified Participants 
                  <span className="ml-2 bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs">{participants.length}</span>
                </h3>
              </div>
              <div className="overflow-y-auto flex-1 p-0">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {participants.map((p) => (
                      <tr key={p.did} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img className="h-10 w-10 rounded-full bg-gray-200" src={p.avatar || 'https://ui-avatars.com/api/?name=?'} alt="" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{p.displayName || p.handle}</div>
                              <div className="text-sm text-gray-500">@{p.handle}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={clsx(
                            "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                            p.type === 'repost' ? "bg-green-100 text-green-800" : "bg-purple-100 text-purple-800"
                          )}>
                            {p.type === 'repost' ? <Repeat className="w-3 h-3 mr-1"/> : <MessageSquare className="w-3 h-3 mr-1"/>}
                            {p.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {p.repostedAt && p.type === 'quote' ? format(new Date(p.repostedAt), 'PP p') : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Picker */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                 <h3 className="font-semibold text-gray-700 mb-4 flex items-center">
                  <Gift className="w-5 h-5 mr-2 text-pink-500"/> Pick Winners
                </h3>
                <div className="flex space-x-2 mb-4">
                  <input 
                    type="number" 
                    min="1" 
                    max={participants.length}
                    value={winnerCount}
                    onChange={e => setWinnerCount(parseInt(e.target.value))}
                    className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 p-2 border"
                  />
                  <button 
                    onClick={handlePickWinners}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-2 px-4 rounded-md shadow-md transition-all"
                  >
                    Pick Randomly
                  </button>
                </div>
              </div>

              {/* Winners List */}
              {winners.length > 0 && (
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-lg border border-yellow-200 p-6 relative overflow-hidden">
                   <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-yellow-300 rounded-full blur-2xl opacity-50"></div>
                   <h3 className="font-bold text-yellow-800 mb-4 text-center text-lg uppercase tracking-wide">🎉 Winners 🎉</h3>
                   <div className="space-y-4">
                     {winners.map(w => (
                       <div key={w.did} className="bg-white p-3 rounded-lg shadow-sm flex items-center border border-yellow-100">
                          <img className="h-12 w-12 rounded-full ring-2 ring-yellow-400" src={w.avatar || 'https://ui-avatars.com/api/?name=?'} alt="" />
                          <div className="ml-3">
                            <p className="font-bold text-gray-900">{w.displayName || w.handle}</p>
                            <p className="text-sm text-gray-500">@{w.handle}</p>
                          </div>
                       </div>
                     ))}
                   </div>
                </div>
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  )
}
