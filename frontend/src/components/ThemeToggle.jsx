import React, { useState, useEffect } from 'react'
import Button from './Button'

export default function ThemeToggle(){
  const [dark, setDark] = useState(false)

  useEffect(()=>{
    try{
      const stored = localStorage.getItem('theme')
      const prefers = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      const isDark = stored === 'dark' || (!stored && prefers)
      setDark(isDark)
    }catch(e){}
  },[])

  function apply(d){
    try{
      if(d){
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme','dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme','light')
      }
    }catch(e){}
  }

  function toggle(){
    const next = !dark
    setDark(next)
    apply(next)
  }

  return (
    <Button variant="secondary" size="sm" onClick={toggle} aria-pressed={dark} aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}>
      {dark ? '🌞' : '🌙'}
    </Button>
  )
}
