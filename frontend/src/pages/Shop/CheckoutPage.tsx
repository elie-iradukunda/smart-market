import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { MapPin, CreditCard, CheckCircle, User } from 'lucide-react'
import { toast } from 'react-toastify'

export default function CheckoutPage() {
    const { cart, getCartTotal, clearCart } = useCart()
    const { user } = useAuth()
    const navigate = useNavigate()

    const [shippingInfo, setShippingInfo] = useState({
        address: '',
        city: '',
        zipCode: '',
    })

    const [mtnPhoneNumber, setMtnPhoneNumber] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value })
    }

    const [isSubmitting, setIsSubmitting] = useState(false)

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!shippingInfo.address || !shippingInfo.city || !shippingInfo.zipCode) {
            toast.error('Please fill in all shipping information')
            return
        }

        if (!mtnPhoneNumber) {
            toast.error('Please enter your MTN Mobile Money phone number')
            return
        }

        setIsSubmitting(true)

        try {
            const orderData = {
                customerDetails: {
                    fullName: user!.fullName,
                    email: user!.email,
                    phoneNumber: user!.phoneNumber,
                    address: shippingInfo.address,
                    city: shippingInfo.city,
                    zipCode: shippingInfo.zipCode,
                },
                items: cart.map((item) => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image,
                })),
                total: getCartTotal(),
                paymentMethod: 'mtn',
                mtnPhoneNumber: mtnPhoneNumber
            }

            const token = sessionStorage.getItem('token')
            const response = await fetch('http://localhost:3000/api/ecommerce/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to place order')
            }

            const data = await response.json()

            // Clear cart
            clearCart()

            // Show success message
            toast.success('Order placed successfully!')

            // Redirect to order tracking
            navigate(`/order-tracking?orderId=${data.orderId}`)
        } catch (error: any) {
            console.error('Order placement error:', error)

            let errorMessage = error.message || 'Failed to place order. Please try again.'

            // enhance error message for common payment issues
            if (errorMessage.toLowerCase().includes('insufficient funds') || errorMessage.toLowerCase().includes('not enough')) {
                errorMessage = 'Payment failed: Insufficient funds on your mobile money account. Please top up and try again.'
            } else if (errorMessage.toLowerCase().includes('timeout') || errorMessage.toLowerCase().includes('timed out')) {
                errorMessage = 'Payment timed out. Please check your phone for the prompt and try again.'
            } else if (errorMessage.toLowerCase().includes('user cancelled') || errorMessage.toLowerCase().includes('rejected')) {
                errorMessage = 'Payment was cancelled or rejected. Please try again.'
            }

            toast.error(errorMessage, {
                autoClose: 5000,
                position: "top-center"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (cart.length === 0) {
        navigate('/cart')
        return null
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-8">Checkout</h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Checkout Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handlePlaceOrder} className="space-y-6">
                            {/* Customer Information */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <User className="w-6 h-6 text-blue-600" />
                                    Customer Information
                                </h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            value={user?.fullName}
                                            disabled
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={user?.email}
                                            disabled
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={user?.phoneNumber}
                                            disabled
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <MapPin className="w-6 h-6 text-blue-600" />
                                    Shipping Address
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Street Address *
                                        </label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={shippingInfo.address}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="123 Main Street"
                                        />
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                City *
                                            </label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={shippingInfo.city}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Kigali"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                ZIP Code *
                                            </label>
                                            <input
                                                type="text"
                                                name="zipCode"
                                                value={shippingInfo.zipCode}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="250"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <CreditCard className="w-6 h-6 text-blue-600" />
                                    Payment Method
                                </h2>
                                <div className="p-4 border-2 border-yellow-500 bg-yellow-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <p className="font-medium text-gray-900">MTN Mobile Money</p>
                                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                                            Secure Payment
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Pay securely with MTN MoMo
                                    </p>

                                    {/* MTN Phone Number Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            MTN Mobile Money Number *
                                        </label>
                                        <input
                                            type="tel"
                                            value={mtnPhoneNumber}
                                            onChange={(e) => setMtnPhoneNumber(e.target.value)}
                                            placeholder="078XXXXXXX"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-2">
                                            You will receive a payment prompt on your phone
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Place Order Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Check your phone to confirm...
                                    </span>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Place Order
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

                            {/* Items */}
                            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                                {cart.map((item) => {
                                    const getImageUrl = (path: string) => {
                                        if (!path) return '';
                                        if (path.startsWith('http')) return path;
                                        const cleanPath = path.startsWith('/') ? path : `/${path}`;
                                        return `http://localhost:3000${cleanPath}`;
                                    };

                                    return (
                                        <div key={item.id} className="flex gap-3">
                                            <img
                                                src={getImageUrl(item.image || '')}
                                                alt={item.name}
                                                className="w-16 h-16 object-cover rounded-lg"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = 'https://via.placeholder.com/64?text=No+Image';
                                                }}
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 text-sm line-clamp-1">
                                                    {item.name}
                                                </p>
                                                <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                                                <p className="font-semibold text-gray-900">
                                                    {(item.price * item.quantity).toLocaleString('en-RW')} RF
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Totals */}
                            <div className="space-y-3 border-t pt-4">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-semibold">{getCartTotal().toLocaleString('en-RW')} RF</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="font-semibold text-green-600">FREE</span>
                                </div>
                                <div className="border-t pt-3">
                                    <div className="flex justify-between text-xl font-bold text-gray-900">
                                        <span>Total</span>
                                        <span>{getCartTotal().toLocaleString('en-RW')} RF</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
