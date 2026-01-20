import React from 'react'

export default function Avatar({ src, name, id, size = 40, className = '', onClick }){
  const initials = (() => {
    if(!name) return '--'
    return name.split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase()
  })()

  const color = (() => {
    const colors = ['#6366f1','#10b981','#3b82f6','#ec4899','#f59e0b','#8b5cf6']
    if(!id) return '#9ca3af'
    let h = 0
    for(let i=0;i<id.length;i++) h = (h<<5)-h + id.charCodeAt(i)
    return colors[Math.abs(h) % colors.length]
  })()

  const sizeStyle = { width: size, height: size }
  const sizeClass = size === 32 ? 'w-8 h-8' : size === 40 ? 'w-10 h-10' : `w-[${size}px] h-[${size}px]`

  if (src) return (
    <img src={src} alt={name || 'avatar'} style={sizeStyle} className={`${className} ${sizeClass} rounded-full object-cover ring-2 ring-white shadow-sm`} onClick={onClick} />
  )

  return (
    <div onClick={onClick} style={sizeStyle} className={`${className} ${sizeClass} rounded-full overflow-hidden flex items-center justify-center font-medium`}>
      <div className={`w-full h-full flex items-center justify-center shadow-sm`} style={{ backgroundColor: color }}>
        <span className="text-white" style={{ fontSize: Math.max(10, Math.floor(size / 3)) }}>{initials}</span>
      </div>
    </div>
  )
}
