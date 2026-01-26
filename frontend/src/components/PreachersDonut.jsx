import React, { useEffect, useState } from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { formatDuration } from '../utils/format'

export default function PreachersDonut({ items = [], preachers = [] }){
  // items: [{preacher_id, total_sec, sessions_count}]
  const data = items.map(it => ({
    name: (preachers.find(p=>p.id===it.preacher_id)?.name) || String(it.preacher_id),
    value: it.total_sec || 0,
    sessions: it.sessions_count || 0,
  })).filter(d=>d.value>0)

  const colors = ['#6366F1','#06B6D4','#10B981','#F97316','#EF4444','#8B5CF6','#06B6D4','#FB923C']

  const [strokeColor, setStrokeColor] = useState(() => ((typeof document !== 'undefined') && document.documentElement.classList.contains('dark')) ? '#ffffff' : '#000000')

  useEffect(()=>{
    if(typeof document === 'undefined') return
    const el = document.documentElement
    const obs = new MutationObserver(()=>{
      setStrokeColor(el.classList.contains('dark') ? '#ffffff' : '#000000')
    })
    obs.observe(el, { attributes: true, attributeFilter: ['class'] })
    return ()=> obs.disconnect()
  },[])

  const tooltipFormatter = (value, name, props) => [formatDuration(value), name]

  return (
    <div className="w-full">
      {data.length===0 ? (
        <div className="text-xs text-gray-500">No data</div>
      ) : (
        <>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  <linearGradient id="gradDonut" x1="0" x2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.95" />
                  </linearGradient>
                </defs>
                <Pie data={data} dataKey="value" nameKey="name" innerRadius={48} outerRadius={88} paddingAngle={4} labelLine={false} label={({percent}) => `${(percent*100).toFixed(0)}%`}>
                  {data.map((entry, idx) => (
                    <Cell key={`c-${idx}`} fill={colors[idx % colors.length]} stroke={strokeColor} strokeWidth={1} />
                  ))}
                </Pie>
                <Tooltip formatter={tooltipFormatter} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* custom legend below chart, vertical list top-to-bottom */}
          <div className="mt-3">
            <ul className="flex flex-col gap-2">
              {data.map((d, idx) => (
                <li key={`l-${idx}`} className="flex items-center gap-3">
                  <span className="inline-block w-3 h-3 rounded-sm" style={{background: colors[idx % colors.length]}} />
                  <div className="text-sm truncate">
                    <div className="font-medium" title={d.name}>{d.name}</div>
                    <div className="text-xs text-muted">{formatDuration(d.value)} • {d.sessions} sessions</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
