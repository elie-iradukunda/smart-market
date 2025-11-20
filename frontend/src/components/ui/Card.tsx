import { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export default function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-white p-6 shadow-sm border border-gray-100 transition-all duration-300',
        hover && 'hover:shadow-professional hover:-translate-y-1 hover:border-gray-200',
        className
      )}
    >
      {children}
    </div>
  )
}

