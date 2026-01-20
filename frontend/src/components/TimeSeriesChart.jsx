import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from 'recharts'
import { formatDuration } from '../utils/format'

export default function TimeSeriesChart({ data, chartType = 'line', color = '#8884d8' }){
  const common = (
    <>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis tickFormatter={(v)=> formatDuration(v)} />
      <Tooltip formatter={(value)=> formatDuration(value)} labelFormatter={(label)=> label} />
    </>
  )

  return (
    <div className="w-full h-full rounded-md overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        {chartType === 'bar' ? (
          <BarChart data={data}>
            {common}
            <Bar dataKey="value" fill={color} radius={[4,4,0,0]} />
          </BarChart>
        ) : chartType === 'area' ? (
          <AreaChart data={data}>
            {common}
            <Area dataKey="value" stroke={color} fill={color} fillOpacity={0.18} />
          </AreaChart>
        ) : (
          <LineChart data={data}>
            {common}
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={3} dot={false} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
