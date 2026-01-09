import { useState, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { parsePostUrl, resolveDid, fetchAllReposters, fetchAllQuotes, fetchFollowers, getPostCounts, getProfileFollowerCount } from '../lib/bsky-helpers'
import type { Participant } from '../lib/bsky-helpers'
import { LogOut, Users, Repeat, MessageSquare, Gift, Search, Download, CheckCircle, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import clsx from 'clsx'

interface ConfirmedWinner extends Participant {
  confirmedLotteryName: string
}

function ProgressBar({ current, total, label }: { current: number, total: number | null, label: string }) {
  const percent = total ? Math.min(100, Math.round((current / total) * 100)) : 0
  
  return (
    <div className="w-full mt-2">
      <div className="flex justify-between text-xs mb-1 text-gray-600">
        <span>{label}</span>
        <span>
          {current} / {total !== null ? total : '?'} {total ? `(${percent}%)` : ''}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { agent, userDid, userHandle, logout } = useAuth()
  
  // Inputs
  const [postUrl, setPostUrl] = useState('')
  const [includeQuotes, setIncludeQuotes] = useState(true)
  const [untilDate, setUntilDate] = useState('')
  const [lotteryName, setLotteryName] = useState('Campaign')
  
  // State
  const [isFetchingInteractions, setIsFetchingInteractions] = useState(false)
  const [isFetchingFollowers, setIsFetchingFollowers] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  
  // Progress
  const [totalInteractions, setTotalInteractions] = useState<number | null>(null)
  const [fetchedInteractions, setFetchedInteractions] = useState(0)
  
  const [totalFollowers, setTotalFollowers] = useState<number | null>(null)
  const [fetchedFollowers, setFetchedFollowers] = useState(0)

  // Data
  const [interactions, setInteractions] = useState<Participant[]>([])
  const [followers, setFollowers] = useState<Set<string>>(new Set())
  
  // Winners
  const [winnerCount, setWinnerCount] = useState(1)
  const [currentWinners, setCurrentWinners] = useState<Participant[]>([])
  const [confirmedWinners, setConfirmedWinners] = useState<ConfirmedWinner[]>([])

  // Derived Participants (Interactions filtered by Followers and Date)
  const participants = useMemo(() => {
    if (interactions.length === 0) return []
    if (followers.size === 0) return []

    const valid = interactions.filter(p => {
      // Must be following me
      if (!followers.has(p.did)) return false
      
      // Time filter
      if (untilDate) {
        if (p.type === 'quote' && p.repostedAt) {
          return new Date(p.repostedAt) <= new Date(untilDate)
        }
        return true
      }
      return true
    })

    // Remove duplicates
    return Array.from(new Map(valid.map(item => [item.did, item])).values())
  }, [interactions, followers, untilDate])

  // Filter out confirmed winners from the pool available for picking
  const pickableParticipants = useMemo(() => {
    const confirmedDids = new Set(confirmedWinners.map(w => w.did))
    return participants.filter(p => !confirmedDids.has(p.did))
  }, [participants, confirmedWinners])


  const handleFetchInteractions = async () => {
    if (!agent) return
    const urlData = parsePostUrl(postUrl)
    if (!urlData) {
      alert('Invalid Post URL. Please use a valid Bluesky post link.')
      return
    }

    setIsFetchingInteractions(true)
    setFetchedInteractions(0)
    setTotalInteractions(null)
    setStatusMessage('Resolving post...')

    try {
      const authorDid = await resolveDid(agent, urlData.handle)
      if (!authorDid) throw new Error('Could not resolve author')
      const postUri = `at://${authorDid}/app.bsky.feed.post/${urlData.rkey}`

      // Get Counts first
      const counts = await getPostCounts(agent, postUri)
      const estimatedTotal = counts ? counts.repostCount + (includeQuotes ? counts.quoteCount : 0) : null
      setTotalInteractions(estimatedTotal)

      setStatusMessage('Fetching Reposters...')
      const reposters = await fetchAllReposters(agent, postUri, (c) => {
        setFetchedInteractions(c)
        setStatusMessage(`Fetching Reposters... (${c})`)
      })
      
      let quotes: Participant[] = []
      if (includeQuotes) {
        setStatusMessage('Fetching Quotes...')
        const currentBase = reposters.length
        quotes = await fetchAllQuotes(agent, postUri, (c) => {
          setFetchedInteractions(currentBase + c)
          setStatusMessage(`Fetching Quotes... (${c})`)
        })
      }

      setInteractions([...reposters, ...quotes])
      setStatusMessage(`Fetched ${reposters.length + quotes.length} interactions.`)
    } catch (err) {
      console.error(err)
      alert('Error fetching interactions.')
    } finally {
      setIsFetchingInteractions(false)
    }
  }

  const handleFetchFollowers = async () => {
    if (!agent || !userDid) return
    setIsFetchingFollowers(true)
    setFetchedFollowers(0)
    setTotalFollowers(null)
    setStatusMessage('Fetching Your Followers...')
    
    try {
      // Get Count first
      const count = await getProfileFollowerCount(agent, userDid)
      setTotalFollowers(count)

      const myFollowers = await fetchFollowers(agent, userDid, (c) => {
        setFetchedFollowers(c)
        setStatusMessage(`Fetching Your Followers... (${c})`)
      })
      setFollowers(myFollowers)
      setStatusMessage(`Fetched ${myFollowers.size} followers.`)
    } catch (err) {
      console.error(err)
      alert('Error fetching followers.')
    } finally {
      setIsFetchingFollowers(false)
    }
  }

  const handlePickWinners = () => {
    if (pickableParticipants.length === 0) {
      alert('No qualified participants available to pick from.')
      return
    }
    const count = Math.min(winnerCount, pickableParticipants.length)
    const shuffled = [...pickableParticipants].sort(() => 0.5 - Math.random())
    setCurrentWinners(shuffled.slice(0, count))
  }

  const handleConfirmWinners = () => {
    const newConfirmed = currentWinners.map(w => ({
      ...w,
      confirmedLotteryName: lotteryName
    }))
    setConfirmedWinners(prev => [...prev, ...newConfirmed])
    setCurrentWinners([])
  }

  const handleExportCSV = () => {
    if (confirmedWinners.length === 0) return
    
    // CSV Header
    const headers = ['Lottery Name', 'DID', 'Handle', 'Display Name', 'Type', 'Date']
    const rows = confirmedWinners.map(w => [
      w.confirmedLotteryName,
      w.did,
      w.handle,
      w.displayName || '',
      w.type,
      w.repostedAt || ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const dateStr = format(new Date(), 'yyyyMMdd_HHmm')
    const fileName = `winners_${dateStr}.csv`

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    placeholder="https://bsky.app/profile/..." 
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                    value={postUrl}
                    onChange={e => setPostUrl(e.target.value)}
                  />
                  <button
                    onClick={handleFetchInteractions}
                    disabled={isFetchingInteractions || !postUrl}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm whitespace-nowrap"
                  >
                    {isFetchingInteractions ? 'Fetching...' : 'Fetch Reposts'}
                  </button>
                </div>
                {/* Progress Bar for Interactions */}
                {isFetchingInteractions && <ProgressBar current={fetchedInteractions} total={totalInteractions} label="Interactions Progress" />}
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
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Followers Data</span>
                    <p className="text-xs text-gray-500">{followers.size > 0 ? `${followers.size} loaded` : 'Not loaded'}</p>
                  </div>
                  <button
                    onClick={handleFetchFollowers}
                    disabled={isFetchingFollowers}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
                  >
                    {isFetchingFollowers ? 'Fetching...' : 'Fetch Followers'}
                  </button>
                </div>
                {/* Progress Bar for Followers */}
                {isFetchingFollowers && <ProgressBar current={fetchedFollowers} total={totalFollowers} label="Followers Progress" />}
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
                <p className="font-medium mb-1">Status:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Interactions Loaded: {interactions.length} {totalInteractions ? `(Total ~${totalInteractions})` : ''}</li>
                  <li>Followers Loaded: {followers.size} {totalFollowers ? `(Total ~${totalFollowers})` : ''}</li>
                  <li><strong>Qualified Participants: {participants.length}</strong></li>
                  <li>Available to Pick: {pickableParticipants.length}</li>
                </ul>
                {statusMessage && <p className="mt-2 text-gray-600 animate-pulse">{statusMessage}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Results & Picker Section */}
        {participants.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* List */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-[700px]">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-semibold text-gray-700 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-indigo-500"/> 
                  Qualified Participants 
                  <span className="ml-2 bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs">{participants.length}</span>
                </h3>
              </div>
              <div className="overflow-y-auto flex-1 p-0">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {participants.map((p) => (
                      <tr key={p.did} className={clsx("hover:bg-gray-50 transition-colors", confirmedWinners.some(w => w.did === p.did) && "opacity-50 bg-gray-100")}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img className="h-10 w-10 rounded-full bg-gray-200" src={p.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.handle)}`} alt="" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{p.displayName || p.handle}</div>
                              <div className="text-sm text-gray-500">@{p.handle}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400 font-mono">
                          {p.did}
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

            {/* Picker & Winners */}
            <div className="space-y-6 flex flex-col h-[700px]">
              
              {/* Controls */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex-shrink-0">
                 <h3 className="font-semibold text-gray-700 mb-4 flex items-center">
                  <Gift className="w-5 h-5 mr-2 text-pink-500"/> Pick Winners
                </h3>
                
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Lottery Name (for CSV)</label>
                  <input 
                    type="text" 
                    value={lotteryName} 
                    onChange={e => setLotteryName(e.target.value)}
                    className="w-full text-sm p-2 border rounded"
                  />
                </div>

                <div className="flex space-x-2 mb-2">
                  <input 
                    type="number" 
                    min="1" 
                    max={pickableParticipants.length}
                    value={winnerCount}
                    onChange={e => setWinnerCount(parseInt(e.target.value))}
                    className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 p-2 border"
                  />
                  <button 
                    onClick={handlePickWinners}
                    disabled={pickableParticipants.length === 0}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-2 px-4 rounded-md shadow-md transition-all disabled:opacity-50"
                  >
                    Pick Randomly
                  </button>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Available to pick: {pickableParticipants.length}
                </p>
              </div>

              {/* Current Draw (Tentative) */}
              {currentWinners.length > 0 && (
                <div className="bg-yellow-50 rounded-xl shadow-lg border border-yellow-200 p-4 flex-shrink-0">
                   <h3 className="font-bold text-yellow-800 mb-2 text-center text-sm uppercase tracking-wide">Tentative Winners</h3>
                   <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                     {currentWinners.map(w => (
                       <div key={w.did} className="bg-white p-2 rounded flex items-center border border-yellow-100 text-sm">
                          <img className="h-8 w-8 rounded-full" src={w.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(w.handle)}`} alt="" />
                          <div className="ml-2 overflow-hidden">
                            <p className="font-bold text-gray-900 truncate">{w.displayName || w.handle}</p>
                            <p className="text-xs text-gray-500 truncate">@{w.handle}</p>
                          </div>
                       </div>
                     ))}
                   </div>
                   <div className="flex space-x-2">
                     <button onClick={() => setCurrentWinners([])} className="flex-1 py-1 text-gray-600 hover:bg-gray-200 rounded text-sm">Cancel</button>
                     <button onClick={handleConfirmWinners} className="flex-1 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded font-medium text-sm flex items-center justify-center">
                       <CheckCircle className="w-4 h-4 mr-1"/> Confirm
                     </button>
                   </div>
                </div>
              )}

              {/* Confirmed Winners */}
              <div className="bg-white rounded-xl shadow-lg border border-green-100 flex-1 flex flex-col overflow-hidden">
                <div className="p-3 bg-green-50 border-b border-green-100 flex justify-between items-center">
                   <h3 className="font-semibold text-green-800 flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 mr-1 text-green-600"/> Confirmed ({confirmedWinners.length})
                  </h3>
                  {confirmedWinners.length > 0 && (
                     <button onClick={handleExportCSV} className="text-xs bg-white border border-green-200 text-green-700 px-2 py-1 rounded hover:bg-green-100 flex items-center">
                       <Download className="w-3 h-3 mr-1"/> CSV
                     </button>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {confirmedWinners.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm mt-10">No confirmed winners yet.</p>
                  ) : (
                    confirmedWinners.map((w, i) => (
                       <div key={i} className="bg-gray-50 p-2 rounded flex items-center border border-gray-100 text-sm relative group">
                          <span className="text-xs text-gray-400 mr-2 w-4 text-center">{i+1}</span>
                          <img className="h-8 w-8 rounded-full" src={w.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(w.handle)}`} alt="" />
                          <div className="ml-2 overflow-hidden flex-1">
                            <p className="font-bold text-gray-900 truncate">{w.displayName || w.handle}</p>
                            <p className="text-xs text-gray-500 truncate">@{w.handle}</p>
                          </div>
                          <button 
                            onClick={() => setConfirmedWinners(prev => prev.filter((_, idx) => idx !== i))}
                            className="hidden group-hover:block absolute right-2 text-red-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4"/>
                          </button>
                       </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  )
}
