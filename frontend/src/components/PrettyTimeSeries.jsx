import React from 'react'
import { ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { formatDuration } from '../utils/format'

export default function PrettyTimeSeries({ data = [], color = '#6366F1', type = 'line' }){
  const common = (
    <>
      <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.06} />
      <XAxis dataKey="name" tick={{fontSize:12}} />
      <YAxis tickFormatter={(v)=>formatDuration(v)} tick={{fontSize:12}} />
      <Tooltip formatter={(v)=>formatDuration(v)} labelFormatter={(l)=>l} />
    </>
  )

  if(type === 'bar'){
    return (
      <div className="w-full h-full rounded-md overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{top:10,right:20,left:0,bottom:0}}>
            {common}
            <Bar dataKey="value" fill={color} radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if(type === 'area'){
    return (
      <div className="w-full h-full rounded-md overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{top:10,right:20,left:0,bottom:0}}>
            <defs>
              <linearGradient id="gradArea" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.24} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            {common}
            <Area type="monotone" dataKey="value" stroke={color} fill="url(#gradArea)" strokeWidth={2.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    )
  }

  // default: line
  return (
    <div className="w-full h-full rounded-md overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{top:10,right:20,left:0,bottom:0}}>
          {common}
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
