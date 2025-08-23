// src/components/ui/Button/Button.types.ts
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  children: React.ReactNode
  isLoading?: boolean
  disabled?: boolean
  onClick?: () => void
  className?: string
}

// src/components/ui/Button/Button.tsx
import { forwardRef } from 'react'
import { cn } from '@/utils/classNames'
import { ButtonProps } from './Button.types'

const buttonVariants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
  outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
  ghost: 'hover:bg-gray-100 text-gray-700'
}

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  xl: 'px-8 py-4 text-xl'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  children,
  isLoading = false,
  disabled = false,
  onClick,
  className = '',
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={cn(
        'rounded-lg font-medium transition-all duration-200 disabled:opacity-50',
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  )
})

Button.displayName = 'Button'

// src/components/ui/Button/index.ts
export { Button } from './Button'
export type { ButtonProps } from './Button.types'
