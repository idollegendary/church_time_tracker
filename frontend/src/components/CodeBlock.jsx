import React, { useState } from 'react'

export default function CodeBlock({ children, language = '' }){
  const [copied, setCopied] = useState(false)

  const code = typeof children === 'string' ? children : (Array.isArray(children) ? children.join('') : (children && children.props ? children.props.children : ''))

  async function handleCopy(){
    try{
      await navigator.clipboard.writeText(String(code))
      setCopied(true)
      setTimeout(()=>setCopied(false), 1800)
    }catch(e){
      // ignore
    }
  }

  return (
    <div className="code-block">
      <pre aria-label={language ? `${language} code` : 'code block'}>
        <code>{code}</code>
      </pre>
      <button onClick={handleCopy} className="copy-btn btn btn-outline" aria-label="Copy code">
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}
