import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, Package, Truck, CheckCircle, Clock, Home } from 'lucide-react'
import { Order } from '@/contexts/CartContext'

export default function OrderTrackingPage() {
    const [searchParams] = useSearchParams()
    const [searchInput, setSearchInput] = useState('')
    const [order, setOrder] = useState<Order | null>(null)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        const orderId = searchParams.get('orderId')
        if (orderId) {
            handleSearch(orderId)
        }
    }, [searchParams])

    const handleSearch = async (orderIdToSearch?: string) => {
        const searchId = orderIdToSearch || searchInput
        setNotFound(false)
        setOrder(null)

        try {
            const response = await fetch(`http://localhost:3000/api/ecommerce/orders/${searchId}`)
            if (!response.ok) {
                setNotFound(true)
                return
            }
            const data = await response.json()
            setOrder(data)
        } catch (error) {
            console.error('Error fetching order:', error)
            setNotFound(true)
        }
    }

    const getStatusIcon = (status: Order['status']) => {
        switch (status) {
            case 'Pending':
                return <Clock className="w-8 h-8 text-yellow-500" />
            case 'Processing':
                return <Package className="w-8 h-8 text-blue-500" />
            case 'Shipped':
                return <Truck className="w-8 h-8 text-purple-500" />
            case 'Delivered':
                return <CheckCircle className="w-8 h-8 text-green-500" />
        }
    }

    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300'
            case 'Processing':
                return 'bg-blue-100 text-blue-800 border-blue-300'
            case 'Shipped':
                return 'bg-purple-100 text-purple-800 border-purple-300'
            case 'Delivered':
                return 'bg-green-100 text-green-800 border-green-300'
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Track Your Order</h1>
                    <p className="text-gray-600">
                        Enter your order ID or email to check your order status
                    </p>
                </div>

                {/* Search Box */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Enter Order ID (e.g., ORD-1234567890)"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            onClick={() => handleSearch()}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                        >
                            Track Order
                        </button>
                    </div>
                </div>

                {/* Order Not Found */}
                {notFound && (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h3>
                        <p className="text-gray-600 mb-6">
                            We couldn't find an order with that ID. Please check and try again.
                        </p>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
                        >
                            <Home className="w-5 h-5" />
                            Back to Home
                        </Link>
                    </div>
                )}

                {/* Order Details */}
                {order && (
                    <div className="space-y-6">
                        {/* Status Card */}
                        <div className="bg-white rounded-xl shadow-sm p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                        Order #{order.orderId}
                                    </h2>
                                    <p className="text-gray-600">
                                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    {getStatusIcon(order.status)}
                                    <span
                                        className={`px-4 py-2 rounded-full font-semibold border ${getStatusColor(
                                            order.status
                                        )}`}
                                    >
                                        {order.status}
                                    </span>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="relative pt-8">
                                <div className="flex justify-between mb-2">
                                    {['Pending', 'Processing', 'Shipped', 'Delivered'].map((status, index) => {
                                        const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered']
                                        const currentIndex = statuses.indexOf(order.status)
                                        const isActive = index <= currentIndex

                                        return (
                                            <div key={status} className="flex flex-col items-center flex-1">
                                                <div
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-200 text-gray-400'
                                                        }`}
                                                >
                                                    {index + 1}
                                                </div>
                                                <p
                                                    className={`text-sm mt-2 ${isActive ? 'text-gray-900 font-medium' : 'text-gray-500'
                                                        }`}
                                                >
                                                    {status}
                                                </p>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Customer Details */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Customer Details</h3>
                            <div className="grid md:grid-cols-2 gap-4 text-gray-600">
                                <div>
                                    <p className="font-medium text-gray-900">Name</p>
                                    <p>{order.customerDetails.fullName}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Email</p>
                                    <p>{order.customerDetails.email}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Phone</p>
                                    <p>{order.customerDetails.phoneNumber}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Shipping Address</p>
                                    <p>
                                        {order.customerDetails.address}, {order.customerDetails.city},{' '}
                                        {order.customerDetails.zipCode}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Order Items</h3>
                            <div className="space-y-4">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-20 h-20 object-cover rounded-lg"
                                        />
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                            <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                                            <p className="font-semibold text-gray-900 mt-1">
                                                {(item.price * item.quantity).toLocaleString('en-RW')} RF
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t pt-4 mt-4">
                                <div className="flex justify-between text-xl font-bold text-gray-900">
                                    <span>Total</span>
                                    <span>{order.total.toLocaleString('en-RW')} RF</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
