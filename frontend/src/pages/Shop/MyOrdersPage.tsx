import { useAuth } from '@/contexts/AuthContext'
import { Link } from 'react-router-dom'
import { Package, Calendar, DollarSign, Eye } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Order } from '@/contexts/CartContext'

export default function MyOrdersPage() {
    const { user } = useAuth()
    const [orders, setOrders] = useState<Order[]>([])

    useEffect(() => {
        const fetchOrders = async () => {
            if (user?.email) {
                try {
                    const response = await fetch(`http://localhost:3000/api/ecommerce/orders/user?email=${user.email}`)
                    if (response.ok) {
                        const data = await response.json()
                        setOrders(data)
                    }
                } catch (error) {
                    console.error('Error fetching orders:', error)
                }
            }
        }

        fetchOrders()
    }, [user])

    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'Processing':
                return 'bg-blue-100 text-blue-800'
            case 'Shipped':
                return 'bg-purple-100 text-purple-800'
            case 'Delivered':
                return 'bg-green-100 text-green-800'
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">My Orders</h1>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h3>
                        <p className="text-gray-600 mb-6">
                            You haven't placed any orders. Start shopping now!
                        </p>
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
                        >
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div
                                key={order.orderId}
                                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    {/* Order Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <h3 className="text-xl font-bold text-gray-900">
                                                Order #{order.orderId}
                                            </h3>
                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                                                    order.status
                                                )}`}
                                            >
                                                {order.status}
                                            </span>
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-4 text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                <span className="text-sm">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Package className="w-4 h-4" />
                                                <span className="text-sm">
                                                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="w-4 h-4" />
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {order.total.toLocaleString('en-RW')} RF
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <Link
                                        to={`/order-tracking?orderId=${order.orderId}`}
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                        View Details
                                    </Link>
                                </div>

                                {/* Order Items Preview */}
                                <div className="mt-4 pt-4 border-t">
                                    <div className="flex gap-2 overflow-x-auto">
                                        {order.items.slice(0, 4).map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex-shrink-0 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg"
                                            >
                                                {item.name} x{item.quantity}
                                            </div>
                                        ))}
                                        {order.items.length > 4 && (
                                            <div className="flex-shrink-0 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                                                +{order.items.length - 4} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
