import { ReactNode } from 'react'
import EcommerceNavbar from '@/components/ecommerce/EcommerceNavbar'
import Footer from './Footer'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <EcommerceNavbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}

