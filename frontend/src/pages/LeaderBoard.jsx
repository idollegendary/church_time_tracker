import React, { useEffect, useState, useMemo } from 'react'
import axios from '../services/api'
import { formatDuration } from '../utils/format'
import Button from '../components/Button'
import Card from '../components/Card'
import Avatar from '../components/Avatar'
import RewardModal from '../components/RewardModal'

export default function LeaderBoard(){
  const [preachers, setPreachers] = useState([])
  const [sessions, setSessions] = useState([])
  const [churches, setChurches] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [churchFilter, setChurchFilter] = useState('')
  const [sortType, setSortType] = useState('total_time') // 'total_time', 'avg_time', 'count', 'effectiveness'
  const [expandedId, setExpandedId] = useState(null)
  const [badges, setBadges] = useState([])
  const [assignments, setAssignments] = useState({})
  const [showBadgeModal, setShowBadgeModal] = useState(false)
  const [assignTarget, setAssignTarget] = useState(null)
  const [assignChoice, setAssignChoice] = useState('')
  

  useEffect(() => { fetchData() }, [])

  useEffect(()=>{
    // refresh badges/assignments occasionally
    // (initial load done via fetchData)
  }, [])

  // helper: check if current user is admin (stored by login flow)
  function isAdmin(){
    try{
      const raw = localStorage.getItem('trecker:user')
      if(!raw) return false
      const u = JSON.parse(raw)
      return u && (u.role === 'admin' || u.role === 'superadmin')
    }catch(e){ return false }
  }

  async function fetchData(){
    try{
      const [p, s, c] = await Promise.all([
        axios.get('/api/preachers'),
        axios.get('/api/sessions'),
        axios.get('/api/churches')
      ])
      setPreachers(p.data)
      setSessions(s.data)
      setChurches(c.data)
      // fetch badges and assignments from server
      try{
        const [bRes, aRes] = await Promise.all([
          axios.get('/api/badges'),
          axios.get('/api/badges/assignments')
        ])
        setBadges(bRes.data || [])
        setAssignments(aRes.data || {})
      }catch(err){ console.warn('Failed to load badges/assignments', err) }
    }catch(e){ console.error(e) }
  }

  async function removeAssignedBadge(preacherId, badgeId){
    // Prefer POST /unassign (works on local backend). If not supported, fall back to DELETE variants.
    try{
      await axios.post('/api/badges/unassign', { preacher_id: preacherId, badge_id: badgeId })
    }catch(err){
      // If server doesn't support POST /unassign (404/405), try DELETE variants
      if(err && err.response && (err.response.status === 404 || err.response.status === 405)){
        try{
          await axios.delete('/api/badges/assign', { data: { preacher_id: preacherId, badge_id: badgeId } })
        }catch(inner){
          if(inner && inner.response && inner.response.status === 404){
            try{
              await axios.delete(`/api/badges/assign?preacher_id=${encodeURIComponent(preacherId)}&badge_id=${encodeURIComponent(badgeId)}`)
            }catch(last){
              console.warn('Unassign failed on all methods', last)
              alert('Unassign failed')
              return
            }
          } else {
            console.warn('Unassign failed', inner)
            alert('Unassign failed')
            return
          }
        }
      } else {
        console.warn('Unassign failed', err)
        alert('Unassign failed')
        return
      }
    }

    try{
      const aRes = await axios.get('/api/badges/assignments')
      setAssignments(aRes.data || {})
    }catch(e){ console.warn(e) }
  }

  // Compute stats for each preacher
  const stats = useMemo(() => {
    return preachers.map(p => {
      const ps = sessions.filter(s => s.preacher_id === p.id)
      const totalSec = ps.reduce((sum, x) => sum + (x.duration_sec || 0), 0)
      const avgSec = ps.length > 0 ? Math.round(totalSec / ps.length) : 0
      const count = ps.length
      // effectiveness = sessions count (higher = more active)
      const effectiveness = count
      return {
        preacher: p,
        sessionCount: count,
        totalSeconds: totalSec,
        avgSeconds: avgSec,
        effectiveness,
        churchName: churches.find(c => c.id === p.church_id)?.name || '—'
      }
    })
  }, [preachers, sessions, churches])

  // Filter and sort
  const filtered = useMemo(() => {
    let items = stats.slice()
    
    // Apply search and church filter
    if(searchQuery){
      const q = searchQuery.toLowerCase()
      items = items.filter(s => s.preacher.name.toLowerCase().includes(q))
    }
    if(churchFilter){
      items = items.filter(s => String(s.preacher.church_id) === String(churchFilter))
    }

    // Sort
    items.sort((a, b) => {
      switch(sortType){
        case 'total_time':
          return b.totalSeconds - a.totalSeconds
        case 'avg_time':
          return b.avgSeconds - a.avgSeconds
        case 'count':
          return b.sessionCount - a.sessionCount
        case 'effectiveness':
          return b.effectiveness - a.effectiveness
        default:
          return 0
      }
    })

    return items
  }, [stats, searchQuery, churchFilter, sortType])

  // Compute top badges (computed by metrics)
  const computedBadges = useMemo(() => {
    const topByTotal = [...stats].sort((a, b) => b.totalSeconds - a.totalSeconds).slice(0, 3).map(s => s.preacher.id)
    const topByCount = [...stats].sort((a, b) => b.sessionCount - a.sessionCount).slice(0, 3).map(s => s.preacher.id)
    const topByAvg = [...stats].sort((a, b) => b.avgSeconds - a.avgSeconds).slice(0, 3).map(s => s.preacher.id)
    
    return { topByTotal, topByCount, topByAvg }
  }, [stats])

  // Assignments and badges are stored on the server; BadgeModal performs create/update/delete/assign operations.

  function getBadge(preacherId){
    const badgeList = []
      if(computedBadges.topByTotal.includes(preacherId)){
        const rank = computedBadges.topByTotal.indexOf(preacherId) + 1
        if(rank === 1) badgeList.push({ label: '⭐ Longest', color: 'text-neutral-900 dark:text-text-dark' })
        else if(rank === 2) badgeList.push({ label: '🥈 2nd longest', color: 'text-neutral-900 dark:text-text-dark' })
        else badgeList.push({ label: '🥉 3rd longest', color: 'text-neutral-900 dark:text-text-dark' })
      }
      if(computedBadges.topByCount.includes(preacherId)){
        const rank = computedBadges.topByCount.indexOf(preacherId) + 1
        if(rank === 1) badgeList.push({ label: '🔥 Most active', color: 'text-neutral-900 dark:text-text-dark' })
      }
      if(computedBadges.topByAvg.includes(preacherId)){
        const rank = computedBadges.topByAvg.indexOf(preacherId) + 1
        if(rank === 1) badgeList.push({ label: '💎 Top average', color: 'text-neutral-900 dark:text-text-dark' })
      }
    return badgeList
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold">LeaderBoard</h3>
        <div className="text-sm muted">Preachers ranking by metrics</div>
      </div>

      <Card className="space-y-3">
        <div className="flex gap-2 flex-wrap items-center">
          <input
            type="text"
            placeholder="Search by name..."
            aria-label="Search by name"
            className="form-control flex-1 min-w-[200px]"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <select
            className="form-control w-auto"
            aria-label="Filter by church"
            value={churchFilter}
            onChange={e => setChurchFilter(e.target.value)}
          >
            <option value="">All churches</option>
            {churches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select
            className="form-control w-auto"
            aria-label="Sort by"
            value={sortType}
            onChange={e => setSortType(e.target.value)}
          >
            <option value="total_time">Total time</option>
            <option value="avg_time">Avg time</option>
            <option value="count">Session count</option>
            <option value="effectiveness">Effectiveness</option>
          </select>
          <Button size="sm" variant="secondary" onClick={() => { setSearchQuery(''); setChurchFilter(''); setSortType('total_time'); }}>
            Clear
          </Button>
        </div>
        <div className="pt-2 border-t flex items-center">
          <div className="flex items-center gap-2">
            {isAdmin() && <Button size="sm" variant="secondary" onClick={(e)=>{ e.stopPropagation(); setShowBadgeModal(true) }}>Manage Rewards</Button>}
          </div>
        </div>
      </Card>

      <div className="space-y-3">
          {filtered.length === 0 ? (
          <Card className="p-4 text-center muted">
            <div className="text-sm muted">No preachers found</div>
          </Card>
        ) : (
          filtered.map((item, idx) => {
            const isExpanded = expandedId === item.preacher.id
            const badgeList = getBadge(item.preacher.id)
            return (
              <Card
                key={item.preacher.id}
                className={`p-4 cursor-pointer transition-colors hover:bg-surface ${ (assignments[item.preacher.id] && assignments[item.preacher.id].length>0) ? 'badge-awarded' : '' } ${idx === 0 ? 'gold-outline' : idx === 1 ? 'silver-outline' : idx === 2 ? 'bronze-outline' : ''}`}
                onClick={() => setExpandedId(isExpanded ? null : item.preacher.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 text-center">
                    <div className="text-2xl font-bold text-neutral-900 dark:text-text-dark">{idx + 1}</div>
                    <Avatar src={item.preacher.avatar_url} name={item.preacher.name} id={item.preacher.id} size={56} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div>
                        <h4 className="text-lg font-semibold">{item.preacher.name}</h4>
                        <div className="text-sm muted">{item.churchName}</div>
                      </div>
                    </div>

                            <div className="mt-2 flex flex-wrap gap-2 items-center">
                              {badgeList.map((badge, i) => (
                                <span key={i} className={`text-xs font-medium ${badge.color}`}>
                                  {badge.label}
                                </span>
                              ))}
                              {/* user-assigned badges */}
                              {(assignments[item.preacher.id] || []).map(bid => {
                                const b = (badges || []).find(x=>x.id===bid)
                                if(!b) return null
                                return (
                                  <div key={b.id} className={`badge-pill badge-pop ${b.color}`}>
                                      <span className="badge-emoji">{b.emoji}</span> {b.label}
                                      <button aria-label="Unassign reward" className="ml-2 text-xs muted focus-ring focus:ring-offset-2 rounded p-1" onClick={(e)=>{ e.stopPropagation(); removeAssignedBadge(item.preacher.id, b.id) }}>×</button>
                                    </div>
                                )
                              })}
                            </div>

                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                      <div>
                        <div className="muted text-xs">Total time</div>
                        <div className="font-semibold tabular-nums">{formatDuration(item.totalSeconds)}</div>
                      </div>
                      <div>
                        <div className="muted text-xs">Avg time</div>
                        <div className="font-semibold tabular-nums">{formatDuration(item.avgSeconds)}</div>
                      </div>
                      <div>
                        <div className="muted text-xs">Session count</div>
                        <div className="font-semibold tabular-nums">{item.sessionCount}</div>
                      </div>
                      <div>
                        <div className="muted text-xs">Engagement</div>
                        <div className="font-semibold tabular-nums">{item.effectiveness}</div>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t space-y-2">
                        <div className="text-sm">
                          <div className="font-medium">Detailed statistics:</div>
                          <ul className="muted text-xs mt-2 space-y-1">
                            <li>• Total sessions: <span className="font-medium">{item.sessionCount}</span></li>
                            <li>• Total time: <span className="font-medium">{formatDuration(item.totalSeconds)}</span></li>
                            <li>• Average session: <span className="font-medium">{formatDuration(item.avgSeconds)}</span></li>
                            <li>• Church: <span className="font-medium">{item.churchName}</span></li>
                            {item.sessionCount > 0 && (
                              <li>• Engagement rating: <span className="font-medium">⭐⭐⭐ ({Math.round(item.effectiveness / Math.max(1, item.sessionCount) * 10)}/10)</span></li>
                            )}
                          </ul>
                        </div>
                        <div className="pt-2">
                          {isAdmin() ? (
                            <div className="space-y-2">
                              {!assignTarget && (
                                <div className="flex items-center gap-2">
                                  <Button size="sm" variant="primary" onClick={(e)=>{ e.stopPropagation(); setAssignTarget(item.preacher.id); setAssignChoice('') }}>Assign Reward</Button>
                                </div>
                              )}

                              {assignTarget === item.preacher.id && (
                                <div className="flex items-center gap-2">
                                  <select className="form-control w-auto" value={assignChoice} onChange={e=>setAssignChoice(e.target.value)}>
                                    <option value="">Choose reward...</option>
                                    {(badges||[]).map(b=> <option key={b.id} value={b.id}>{b.emoji} {b.label}</option>)}
                                  </select>
                                  <Button size="sm" variant="primary" onClick={async (e)=>{ e.stopPropagation(); if(!assignChoice) return alert('Select a reward'); try{ await axios.post('/api/badges/assign', { preacher_id: item.preacher.id, badge_id: assignChoice }); const aRes = await axios.get('/api/badges/assignments'); setAssignments(aRes.data || {}); setAssignTarget(null); setAssignChoice(''); }catch(err){ console.error(err); alert('Assign failed') } }}>Assign</Button>
                                  <Button size="sm" variant="secondary" onClick={(e)=>{ e.stopPropagation(); setAssignTarget(null); setAssignChoice('') }}>Cancel</Button>
                                </div>
                              )}

                              <div className="text-sm font-medium">Assigned rewards</div>
                              <div className="text-xs muted">Click × to remove an assigned reward.</div>
                            </div>
                          ) : (
                            <div className="text-sm font-medium">Rewards are managed in Admin</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>
        <RewardModal open={showBadgeModal} badges={badges} onClose={()=>{ setShowBadgeModal(false); fetchData() }} onChange={(list)=>setBadges(list)} onDelete={(id)=>{ setBadges(prev => prev.filter(b=>b.id!==id)); fetchData() }} />
    </div>
  )
}
