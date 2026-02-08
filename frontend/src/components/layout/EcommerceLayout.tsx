import { ReactNode } from 'react'
import EcommerceNavbar from '@/components/ecommerce/EcommerceNavbar'
import Footer from './Footer'

interface EcommerceLayoutProps {
    children: ReactNode
}

export default function EcommerceLayout({ children }: EcommerceLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col">
            <EcommerceNavbar />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    )
}
