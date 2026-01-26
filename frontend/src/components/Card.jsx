import React from 'react'

export default function Card({ children, className = '', title, ...rest }){
  return (
    <div className={`card ${className}`} {...rest}>
      {title ? <div className="card-title">{title}</div> : null}
      {children}
    </div>
  )
}
