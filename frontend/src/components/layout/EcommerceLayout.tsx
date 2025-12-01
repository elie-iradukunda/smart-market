import { ReactNode } from 'react'
import EcommerceNavbar from '@/components/ecommerce/EcommerceNavbar'

interface EcommerceLayoutProps {
    children: ReactNode
}

export default function EcommerceLayout({ children }: EcommerceLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col">
            <EcommerceNavbar />
            <main className="flex-1">{children}</main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4">TOP Design</h3>
                            <p className="text-gray-400">
                                Rwanda's premier design agency for branding, web, and print solutions.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="/" className="hover:text-white transition-colors">Home</a></li>
                                <li><a href="/products" className="hover:text-white transition-colors">Services</a></li>
                                <li><a href="/order-tracking" className="hover:text-white transition-colors">Track Order</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Customer Service</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                                <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; {new Date().getFullYear()} TOP Design. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
