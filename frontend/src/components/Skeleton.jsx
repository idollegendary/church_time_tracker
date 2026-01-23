import React from 'react'

export default function Skeleton({ className = '', height = 'h-4', style = {} }){
  return (
    <div
      className={`skeleton ${height} ${className}`}
      style={style}
      aria-hidden="true"
    />
  )
}
