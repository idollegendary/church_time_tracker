export function pad(n){return n<10? '0'+n: String(n)}

export function parseServerIso(iso){
  // Treat naive ISO datetimes (no timezone) as UTC by appending 'Z'
  if(!iso) return null
  // already has Z or timezone offset
  if(/Z$|[+-]\d{2}:?\d{2}$/.test(iso)) return new Date(iso)
  return new Date(iso + 'Z')
}

export function formatDuration(sec){
  if(sec==null) return '-'
  sec = Number(sec)
  if(sec < 60) return sec + 's'
  const hrs = Math.floor(sec/3600)
  const mins = Math.floor((sec%3600)/60)
  const secs = sec%60
  if(hrs>0) return `${hrs}h ${mins}m ${secs}s`
  if(mins>0) return `${mins}m ${secs}s`
  return `${secs}s`
}

export function toDateInput(iso){
  if(!iso) return ''
  const d = parseServerIso(iso)
  const y = d.getFullYear()
  const m = pad(d.getMonth()+1)
  const day = pad(d.getDate())
  return `${y}-${m}-${day}`
}

export function toTimeInput(iso){
  if(!iso) return ''
  const d = parseServerIso(iso)
  const h = pad(d.getHours())
  const m = pad(d.getMinutes())
  const s = pad(d.getSeconds())
  return `${h}:${m}:${s}`
}

export function combineDateTime(dateStr, timeStr){
  if(!dateStr && !timeStr) return null
  const date = dateStr || new Date().toISOString().slice(0,10)
  const time = timeStr || '00:00:00'
  return new Date(date + 'T' + time).toISOString()
}

export function formatDateTime(iso){
  if(!iso) return '-'
  try{
    const d = parseServerIso(iso)
    return d.toLocaleString()
  }catch(e){
    return iso
  }
}
