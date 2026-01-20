import React, {useEffect, useState} from 'react'
import TimeSeriesChart from '../components/TimeSeriesChart'
import PrettyTimeSeries from '../components/PrettyTimeSeries'
import PreachersDonut from '../components/PreachersDonut'
import Avatar from '../components/Avatar'
import Button from '../components/Button'
import Card from '../components/Card'
import axios from '../services/api'
import { formatDuration, formatDateTime } from '../utils/format'

export default function Dashboard(){
  const [preachers, setPreachers] = useState([])
  const [sel, setSel] = useState('')
  const [data, setData] = useState([])
  const [totalSec, setTotalSec] = useState(0)
  const [preacherMap, setPreacherMap] = useState({})
  const [chartType, setChartType] = useState('line')
  const [topPreachers, setTopPreachers] = useState([])
  const [topSort, setTopSort] = useState('time')
  const [summary, setSummary] = useState(null)
  const [dateFrom, setDateFrom] = useState(() => { const d = new Date(); d.setDate(d.getDate()-14); return d.toISOString().slice(0,10) })
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0,10))
  const [interval, setInterval] = useState('day')
  const [shortestSessions, setShortestSessions] = useState([])
  const [churches, setChurches] = useState([])
  const [churchFilter, setChurchFilter] = useState('')
  const [churchMap, setChurchMap] = useState({})
  const [sortKey, setSortKey] = useState('start_at')
  const [sortOrder, setSortOrder] = useState('asc')
  const [recentSessions, setRecentSessions] = useState([])
  const [recentMode, setRecentMode] = useState('recent') // recent | longest | shortest
  const [recentCount, setRecentCount] = useState(10)

  // Avatar component handles initials and color fallback

  useEffect(()=>{fetchPreachers()},[])
  useEffect(()=>{fetchChurches()},[])
  useEffect(()=>{fetchSeries()},[sel, chartType])
  useEffect(()=>{fetchTop(); fetchSummary(); fetchShortest(); fetchRecent()},[sel, churchFilter])

  // debounce auto-refresh when filters change
  useEffect(()=>{
    const id = setTimeout(()=>{
      fetchSeries(); fetchTop(); fetchSummary(); fetchShortest(); fetchRecent()
    }, 600)
    return ()=> clearTimeout(id)
  }, [sel, churchFilter, dateFrom, dateTo, interval])

  async function fetchPreachers(){
    try{
      const res = await axios.get('/api/preachers')
      setPreachers(res.data)
      const map = {}
      res.data.forEach(p=> map[p.id]=p)
      setPreacherMap(map)
    }catch(e){console.error(e)}
  }

  async function fetchChurches(){
    try{
      const res = await axios.get('/api/churches')
      setChurches(res.data)
      const map = {}
      res.data.forEach(c=> map[c.id]=c)
      setChurchMap(map)
    }catch(e){console.error(e)}
  }

  async function fetchSeries(){
    try{
      const params = {}
      if(sel) params.preacher_id = sel
      if(dateFrom) params.date_from = dateFrom
      if(dateTo) params.date_to = dateTo
      if(interval) params.interval = interval
      const res = await axios.get('/api/analytics/time-series', { params })
      // convert to chart format
      const chart = res.data.map(r=> ({ name: r.day.split('T')[0], value: r.total_sec }))
      setData(chart)
      // compute totals for header
      const total = res.data.reduce((acc, x)=> acc + (x.total_sec||0), 0)
      setTotalSec(total)
    }catch(e){console.error(e)}
  }

  async function fetchTop(){
    try{
      const params = {}
      if(sel) params.preacher_id = sel
      if(dateFrom) params.date_from = dateFrom
      if(dateTo) params.date_to = dateTo
      const res = await axios.get('/api/analytics/top', { params })
      setTopPreachers(res.data)
    }catch(e){console.error(e)}
  }

  async function fetchShortest(){
    try{
      const params = { limit: 10 }
      if(sel) params.preacher_id = sel
      if(dateFrom) params.date_from = dateFrom
      if(dateTo) params.date_to = dateTo
      if(churchFilter) params.church_id = churchFilter
      const res = await axios.get('/api/analytics/shortest', { params })
      setShortestSessions(res.data || [])
    }catch(e){console.error(e)}
  }

  async function fetchRecent(){
    try{
      const params = {}
      if(sel) params.preacher_id = sel
      if(dateFrom) params.date_from = dateFrom
      if(dateTo) params.date_to = dateTo
      if(churchFilter) params.church_id = churchFilter
      const res = await axios.get('/api/sessions', { params })
      setRecentSessions(res.data || [])
    }catch(e){console.error(e)}
  }

  async function fetchSummary(){
    try{
      const params = {}
      if(sel) params.preacher_id = sel
      if(dateFrom) params.date_from = dateFrom
      if(dateTo) params.date_to = dateTo
      const res = await axios.get('/api/analytics/summary', { params })
      // try to compute simple totals if array returned
      if(Array.isArray(res.data)){
        const total = res.data.reduce((acc,x)=> acc + (x.total_sec||0), 0)
        const sessions = res.data.reduce((acc,x)=> acc + (x.sessions_count||0), 0)
        setSummary({ total_sec: total, sessions_count: sessions })
      }else{
        setSummary(res.data)
      }
    }catch(e){console.error(e)}
  }


  return (
    <div className="mx-auto px-4 space-y-6" style={{ maxWidth: 1440 }}>
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h3 className="page-header">Dashboard</h3>
          <div className="page-sub">Overview of tracked sessions and recent activity</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="stat-badge">Last 14 days</div>
        </div>
      </div>

      {/* Centered donut chart to give space and avoid overlap */}
      <div className="flex justify-center mt-4">
        <Card className="max-w-4xl w-full" title="Top Preachers — Share & List">
          <div className="flex flex-col md:flex-row items-stretch gap-4">
            <div className="flex-1 flex justify-center items-center">
              <PreachersDonut items={topPreachers} preachers={preachers} />
            </div>
            <div className="w-full md:w-1/2 md:pl-4 md:border-l md:border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-muted">Sort by</div>
                <div>
                  <select className="border rounded px-2 py-1 text-sm" value={topSort} onChange={e=>setTopSort(e.target.value)}>
                    <option value="time">Total time</option>
                    <option value="sessions">Sessions count</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                {(() => {
                  const sorted = [...topPreachers].sort((a,b)=>{
                    const ak = topSort === 'time' ? (a.total_sec||0) : (a.sessions_count||0)
                    const bk = topSort === 'time' ? (b.total_sec||0) : (b.sessions_count||0)
                    return bk - ak
                  })
                  return sorted.map(tp=> {
                    const p = preachers.find(p=>p.id===tp.preacher_id)
                    return (
                      <div key={tp.preacher_id} className="flex items-center justify-between p-2 rounded card-hover">
                        <div className="flex items-center gap-3">
                          <Avatar src={p?.avatar_url} name={p?.name} id={tp.preacher_id} size={36} />
                          <div>
                            <div className="text-sm font-medium">{p?.name || tp.preacher_id}</div>
                            <div className="text-xs text-muted">{tp.sessions_count ?? 0} sessions</div>
                          </div>
                        </div>
                        <div className="text-sm font-semibold">{formatDuration(tp.total_sec)}</div>
                      </div>
                    )
                  })
                })()}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Top stat row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="label">Total tracked</div>
          <div className="value">{formatDuration(totalSec)}</div>
          <div className="mt-2 text-sm text-muted">Sessions: {summary?.sessions_count ?? '—'}</div>
        </div>
        <div className="stat-card">
          <div className="label">Active Preachers</div>
          <div className="value">{topPreachers.length}</div>
          <div className="mt-2 text-sm text-muted">Top performer: {preachers.find(p=>p.id===topPreachers[0]?.preacher_id)?.name || '—'}</div>
        </div>
        <div className="stat-card">
          <div className="label">Avg / day</div>
          <div className="value">{Math.round((totalSec/86400) || 0)}</div>
          <div className="mt-2 text-sm text-muted">Range: {dateFrom} → {dateTo}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <div className="flex items-center justify-between mb-3">
              <div className="flex flex-wrap items-center gap-3">
                  <div className="w-full sm:w-auto">
                    <label className="text-xs font-medium mb-1 block">Preacher</label>
                    <select className="border rounded px-2 py-1 w-full sm:w-auto max-w-xs" value={sel} onChange={e=>setSel(e.target.value)}>
                      <option value="">— all —</option>
                      {preachers.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="w-full sm:w-auto">
                    <label className="text-xs font-medium mb-1 block">Church</label>
                    <select className="border rounded px-2 py-1 w-full sm:w-auto max-w-xs" value={churchFilter} onChange={e=>setChurchFilter(e.target.value)}>
                      <option value="">— all —</option>
                      {churches.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <label className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="sr-only">Interval</span>
                    <select className="border rounded px-2 py-1 w-full sm:w-auto max-w-xs" value={interval} onChange={e=>setInterval(e.target.value)}>
                      <option value="day">Day</option>
                      <option value="week">Week</option>
                      <option value="month">Month</option>
                    </select>
                  </label>
                  <div className="w-full sm:w-auto mt-2 sm:mt-0">
                    <Button variant="primary" size="sm" onClick={async ()=>{ await fetchSeries(); await fetchTop(); await fetchSummary(); await fetchShortest(); await fetchRecent(); }}>Apply</Button>
                  </div>
                </div>
              <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                <Button size="sm" variant={chartType==='line' ? 'primary' : 'secondary'} onClick={()=>setChartType('line')}>Line</Button>
                <Button size="sm" variant={chartType==='bar' ? 'primary' : 'secondary'} onClick={()=>setChartType('bar')}>Bar</Button>
                <Button size="sm" variant={chartType==='area' ? 'primary' : 'secondary'} onClick={()=>setChartType('area')}>Area</Button>
              </div>
            </div>

            <div className="chart-shell h-80">
              <PrettyTimeSeries data={data} color="#6366F1" type={chartType} />
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Recent Sessions">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted">Show</div>
              <div className="flex items-center gap-2">
                <select className="border rounded px-2 py-1 text-sm" value={recentMode} onChange={e=>setRecentMode(e.target.value)}>
                  <option value="recent">Recent</option>
                  <option value="longest">Longest</option>
                  <option value="shortest">Shortest</option>
                </select>
                <select className="border rounded px-2 py-1 text-sm" value={recentCount} onChange={e=>setRecentCount(parseInt(e.target.value,10))}>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>

            <div className="mt-2 space-y-3">
              {(() => {
                let items = []
                if(recentMode === 'shortest') items = shortestSessions.slice(0)
                else items = recentSessions.slice(0)

                if(recentMode === 'longest') items.sort((a,b)=> (b.duration_sec||0) - (a.duration_sec||0))
                if(recentMode === 'shortest') items.sort((a,b)=> (a.duration_sec||0) - (b.duration_sec||0))
                if(recentMode === 'recent') items.sort((a,b)=> new Date(b.start_at || b.created_at).getTime() - new Date(a.start_at || a.created_at).getTime())

                items = items.slice(0, recentCount)

                if(items.length===0) return <div className="text-xs text-gray-500">No sessions in range</div>

                return items.map(s=> (
                  <div key={(s.id||s.preacher_id)+"-"+(s.start_at||s.created_at)} className="flex items-center justify-between p-2 rounded hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <Avatar src={preachers.find(p=>p.id===s.preacher_id)?.avatar_url} name={preachers.find(p=>p.id===s.preacher_id)?.name} id={s.preacher_id} size={40} />
                      <div>
                        <div className="text-sm font-medium">{(preachers.find(p=>p.id===s.preacher_id)?.name) || s.preacher_id || '—'}</div>
                        <div className="text-xs text-muted">{formatDateTime(s.start_at || s.created_at)}</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium">{formatDuration(s.duration_sec)}</div>
                  </div>
                ))
              })()}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
