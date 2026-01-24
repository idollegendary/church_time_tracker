import React from 'react'

const VARIANT_STYLES = {
  // prefer theme tokens defined in tailwind.config and helpers in index.css
  primary: 'btn-primary',
  secondary: 'btn-outline',
  danger: 'btn-danger',
  success: 'btn-success',
  ghost: 'btn-ghost',
}

const SIZE_STYLES = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-2 text-base',
}

const Button = React.forwardRef(function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  ...rest
}, ref) {
  const variantClass = VARIANT_STYLES[variant] || VARIANT_STYLES.primary
  const sizeClass = SIZE_STYLES[size] || SIZE_STYLES.md

  const base = 'btn'

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={`${base} ${variantClass} ${sizeClass} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
})

export default Button
