import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, Upload, Calendar, FileText, CheckCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

// Service data - should match PricingPage services
const servicesData: Record<string, any> = {
  'banner-printing': {
    name: 'Banner Printing',
    description: 'High-quality banners in various sizes and materials for events, advertising, and branding',
    startingPrice: 30000,
    priceNote: 'Starting from',
    category: 'Printing',
  },
  'garment-branding': {
    name: 'T-Shirt & Garment Printing',
    description: 'Custom t-shirts, hoodies, and apparel printing with vinyl, heat transfer, or screen printing',
    startingPrice: 18000,
    priceNote: 'Per item from',
    category: 'Apparel',
  },
  'vinyl-printing': {
    name: 'Vinyl Printing & Cutting',
    description: 'Professional vinyl graphics for vehicles, windows, walls, and custom applications',
    startingPrice: 36000,
    priceNote: 'Per square meter',
    category: 'Signage',
  },
  'digital-printing': {
    name: 'Digital Printing',
    description: 'High-resolution digital printing for flyers, posters, business cards, and marketing materials',
    startingPrice: 500,
    priceNote: 'Per page from',
    category: 'Printing',
  },
  'graphic-design': {
    name: 'Graphic Design Services',
    description: 'Professional logo design, branding, and graphic design for your business needs',
    startingPrice: 180000,
    priceNote: 'Starting from',
    category: 'Design',
  },
  'business-cards': {
    name: 'Business Cards',
    description: 'Premium business cards with various finishes, materials, and design options',
    startingPrice: 60000,
    priceNote: 'Per 100 cards',
    category: 'Printing',
  },
  'signage': {
    name: 'Custom Signage',
    description: 'Outdoor and indoor signage solutions including illuminated signs, directories, and displays',
    startingPrice: 240000,
    priceNote: 'Starting from',
    category: 'Signage',
  },
  'embroidery': {
    name: 'Embroidery Services',
    description: 'Professional embroidery on caps, jackets, bags, and corporate apparel',
    startingPrice: 24000,
    priceNote: 'Per item from',
    category: 'Apparel',
  },
  'large-format': {
    name: 'Large Format Printing',
    description: 'Posters, billboards, trade show displays, and large-scale printing projects',
    startingPrice: 6000,
    priceNote: 'Per square meter',
    category: 'Printing',
  },
}

const CURRENCY = {
  symbol: 'RF',
  code: 'RWF',
}

export default function OrderPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const serviceId = searchParams.get('service')
  const service = serviceId ? servicesData[serviceId] : null

  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    company: '',
    quantity: '',
    specifications: '',
    deliveryDate: '',
    deliveryAddress: '',
    specialInstructions: '',
  })

  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!serviceId || !service) {
      // Redirect to pricing if service not found
      navigate('/pricing')
    }
  }, [serviceId, service, navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      console.log('Order submitted:', { service, formData, files: selectedFiles })
      setIsSubmitting(false)
      // You would typically redirect to a confirmation page here
      alert('Order submitted successfully! We will contact you soon.')
    }, 1500)
  }

  if (!service) {
    return null
  }

  const estimatedTotal = formData.quantity 
    ? (typeof service.startingPrice === 'number' 
        ? service.startingPrice * parseFloat(formData.quantity || '0')
        : service.startingPrice)
    : service.startingPrice

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="container-professional">
        {/* Back Button */}
        <Link
          to="/pricing"
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors group mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to services
        </Link>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Form - Left Column (2/3) */}
            <div className="lg:col-span-2">
              <Card className="p-6 sm:p-8">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Place Your Order</h1>
                  <p className="text-gray-600">Fill in the details below to complete your order</p>
                </div>

                {/* Service Summary */}
                <div className="mb-8 p-4 bg-primary-50 rounded-lg border border-primary-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{service.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="inline-block text-xs font-medium text-primary-600 bg-primary-100 px-2 py-1 rounded">
                      {service.category}
                    </span>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">{service.priceNote}</span>
                      <span className="ml-2 text-xl font-bold text-primary-600">
                        {CURRENCY.symbol} {service.startingPrice.toLocaleString('en-RW')}
                      </span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Customer Information */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Information</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="customerName"
                          name="customerName"
                          required
                          value={formData.customerName}
                          onChange={handleChange}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                          placeholder="john@example.com"
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                          placeholder="+250 788 123 456"
                        />
                      </div>
                      <div>
                        <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                          Company Name
                        </label>
                        <input
                          type="text"
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                          placeholder="Your Company"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Details</h2>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          id="quantity"
                          name="quantity"
                          required
                          min="1"
                          value={formData.quantity}
                          onChange={handleChange}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                          placeholder="Enter quantity"
                        />
                      </div>
                      <div>
                        <label htmlFor="specifications" className="block text-sm font-medium text-gray-700 mb-2">
                          Specifications / Requirements *
                        </label>
                        <textarea
                          id="specifications"
                          name="specifications"
                          required
                          rows={4}
                          value={formData.specifications}
                          onChange={handleChange}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                          placeholder="Please provide details such as size, material, color, design specifications, etc."
                        />
                      </div>
                      <div>
                        <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Delivery Date
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Calendar className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="date"
                            id="deliveryDate"
                            name="deliveryDate"
                            value={formData.deliveryDate}
                            onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]}
                            className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-700 mb-2">
                          Delivery Address
                        </label>
                        <textarea
                          id="deliveryAddress"
                          name="deliveryAddress"
                          rows={3}
                          value={formData.deliveryAddress}
                          onChange={handleChange}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                          placeholder="Street address, City, Country"
                        />
                      </div>
                      <div>
                        <label htmlFor="specialInstructions" className="block text-sm font-medium text-gray-700 mb-2">
                          Special Instructions
                        </label>
                        <textarea
                          id="specialInstructions"
                          name="specialInstructions"
                          rows={3}
                          value={formData.specialInstructions}
                          onChange={handleChange}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                          placeholder="Any additional notes or special requirements..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* File Upload */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Files</h2>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="text-sm font-medium text-primary-600 hover:text-primary-700">
                          Click to upload files
                        </span>
                        <span className="text-sm text-gray-500"> or drag and drop</span>
                      </label>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        multiple
                        accept="image/*,.pdf,.ai,.eps,.psd"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <p className="mt-2 text-xs text-gray-500">
                        PNG, JPG, PDF, AI, EPS, PSD up to 10MB each
                      </p>
                      {selectedFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                              <span className="flex items-center text-gray-700">
                                <FileText className="h-4 w-4 mr-2 text-gray-400" />
                                {file.name}
                              </span>
                              <span className="text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full group"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Submitting Order...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="mr-2 h-5 w-5" />
                          Submit Order
                          <ArrowLeft className="ml-2 h-5 w-5 rotate-180 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>

            {/* Order Summary - Right Column (1/3) */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <Card className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{service.name}</p>
                        <p className="text-sm text-gray-500">{service.category}</p>
                      </div>
                    </div>
                    
                    {formData.quantity && (
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Quantity</span>
                          <span className="font-medium text-gray-900">{formData.quantity}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Unit Price</span>
                          <span className="font-medium text-gray-900">
                            {CURRENCY.symbol} {service.startingPrice.toLocaleString('en-RW')}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-medium text-gray-900">
                            {CURRENCY.symbol} {estimatedTotal.toLocaleString('en-RW')}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">Estimated Total</span>
                        <span className="text-2xl font-bold text-primary-600">
                          {CURRENCY.symbol} {estimatedTotal.toLocaleString('en-RW')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Final price may vary based on specifications
                      </p>
                    </div>
                  </div>

                  {/* What's Next */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">What happens next?</h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Order Review</p>
                          <p className="text-xs text-gray-600">We'll review your order within 24 hours</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Quote Confirmation</p>
                          <p className="text-xs text-gray-600">You'll receive a detailed quote via email</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-primary-600 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Production</p>
                          <p className="text-xs text-gray-600">We'll start production upon approval</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Support */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Need help?{' '}
                      <Link to="/contact" className="font-medium text-primary-600 hover:text-primary-700">
                        Contact our support team
                      </Link>
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

