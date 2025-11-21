import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, Upload, Calendar, FileText, CheckCircle, Package, User } from 'lucide-react'
// Assuming these are styled components that accept Tailwind classes via className prop
import Button from '@/components/ui/Button' 
import Card from '@/components/ui/Card' 

// Service data - KEEPING THIS EXACTLY AS IS
const servicesData = {
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

// Custom Input Field for Reusability and Cleanliness
const FormInput = ({ label, name, type = 'text', value, onChange, placeholder, required = false, icon: Icon, min }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-semibold text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
      )}
      <input
        type={type}
        id={name}
        name={name}
        required={required}
        value={value}
        onChange={onChange}
        min={min}
        placeholder={placeholder}
        className={`block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 transition-colors ${Icon ? 'pl-10' : ''}`}
      />
    </div>
  </div>
)

// Custom Textarea Field
const FormTextarea = ({ label, name, value, onChange, placeholder, rows = 3, required = false }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-semibold text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      id={name}
      name={name}
      required={required}
      rows={rows}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500 transition-colors"
    />
  </div>
)

export default function OrderPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const serviceId = searchParams.get('service')
  const service = serviceId ? servicesData[serviceId] : null

  // KEEPING ALL STATE AND HANDLERS EXACTLY AS IS
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
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    if (!serviceId || !service) {
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
    
    // BACKEND LOGIC (SIMULATED) - KEEPING THIS EXACTLY AS IS
    // In a real application, you would make a POST request here
    setTimeout(() => {
      console.log('Order submitted:', { service, formData, files: selectedFiles })
      setIsSubmitting(false)
      // Set submitted state for success message
      setIsSubmitted(true) 
      // alert('Order submitted successfully! We will contact you soon.') // Replacing alert with a visual success state
    }, 1500)
  }
  // END OF KEEPING ALL STATE AND HANDLERS EXACTLY AS IS

  if (!service) {
    return null
  }

  const estimatedTotal = formData.quantity 
    ? (typeof service.startingPrice === 'number' 
        ? service.startingPrice * parseFloat(formData.quantity || '0')
        : service.startingPrice)
    : service.startingPrice

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <Card className="p-10 text-center max-w-md w-full shadow-2xl">
          <CheckCircle className="mx-auto h-20 w-20 text-green-500 mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your order. We have received your request for **{service.name}** and will contact you within 24 hours with a detailed quote and confirmation.
          </p>
          <div className="space-y-3">
            <Link to="/pricing">
              <Button className="w-full">
                Continue Browsing Services
              </Button>
            </Link>
            <Link to="/" className="block text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">
              Go to Homepage
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/pricing"
          className="inline-flex items-center text-base font-medium text-gray-600 hover:text-primary-600 transition-colors group mb-8"
        >
          <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
          Back to services
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Order Form - Left Column (2/3) */}
          <div className="lg:col-span-2">
            <Card className="p-8 sm:p-10 shadow-xl">
              <div className="mb-8">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
                  <ShoppingCart className="inline-block h-8 w-8 mr-3 text-primary-500"/>
                  Complete Your Order
                </h1>
                <p className="text-lg text-gray-600">Provide your contact details and project specifications below.</p>
              </div>

              {/* Service Summary - Enhanced Styling */}
              <div className="mb-10 p-5 bg-primary-50 rounded-2xl border border-primary-200 flex justify-between items-center shadow-inner">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{service.name}</h3>
                  <p className="text-sm text-gray-600">{service.description}</p>
                  <span className="mt-2 inline-block text-xs font-semibold text-primary-700 bg-primary-200 px-3 py-1 rounded-full">
                    {service.category}
                  </span>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="text-sm text-gray-500">{service.priceNote}</span>
                  <span className="text-3xl font-extrabold text-primary-600">
                    {CURRENCY.symbol} {service.startingPrice.toLocaleString('en-RW')}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Section: Customer Information */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-5 border-b pb-2 flex items-center">
                    <User className="h-6 w-6 mr-3 text-primary-500"/>
                    Customer Information
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormInput 
                      label="Full Name" 
                      name="customerName" 
                      value={formData.customerName} 
                      onChange={handleChange} 
                      placeholder="John Doe" 
                      required 
                    />
                    <FormInput 
                      label="Email Address" 
                      name="email" 
                      type="email"
                      value={formData.email} 
                      onChange={handleChange} 
                      placeholder="john@example.com" 
                      required 
                    />
                    <FormInput 
                      label="Phone Number" 
                      name="phone" 
                      type="tel"
                      value={formData.phone} 
                      onChange={handleChange} 
                      placeholder="+250 788 123 456" 
                      required 
                    />
                    <FormInput 
                      label="Company Name (Optional)" 
                      name="company" 
                      value={formData.company} 
                      onChange={handleChange} 
                      placeholder="Your Company" 
                    />
                  </div>
                </div>

                {/* Section: Project Details */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-5 border-b pb-2 flex items-center">
                    <Package className="h-6 w-6 mr-3 text-primary-500"/>
                    Project Details
                  </h2>
                  <div className="space-y-6">
                    <FormInput 
                      label="Quantity" 
                      name="quantity" 
                      type="number"
                      value={formData.quantity} 
                      onChange={handleChange} 
                      placeholder="e.g. 500 (units/pcs/m²)" 
                      required 
                      min="1"
                    />
                    <FormTextarea
                      label="Specifications / Requirements"
                      name="specifications"
                      value={formData.specifications}
                      onChange={handleChange}
                      placeholder="Provide details: size, material, color, design, finishing, etc."
                      required
                      rows={5}
                    />
                    <FormInput 
                      label="Preferred Delivery Date (Optional)" 
                      name="deliveryDate" 
                      type="date"
                      icon={Calendar}
                      value={formData.deliveryDate} 
                      onChange={handleChange} 
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <FormTextarea
                      label="Delivery Address (Optional)"
                      name="deliveryAddress"
                      value={formData.deliveryAddress}
                      onChange={handleChange}
                      placeholder="Street address, City, Country"
                    />
                    <FormTextarea
                      label="Special Instructions (Optional)"
                      name="specialInstructions"
                      value={formData.specialInstructions}
                      onChange={handleChange}
                      placeholder="Any additional notes or requirements for our team."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Section: File Upload */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-5 border-b pb-2 flex items-center">
                    <Upload className="h-6 w-6 mr-3 text-primary-500"/>
                    Design File Upload
                  </h2>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-500 transition-colors bg-white">
                    <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-base font-semibold text-primary-600 hover:text-primary-700">
                        Click to select files
                      </span>
                      <span className="text-base text-gray-500"> or drag and drop</span>
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
                    <p className="mt-2 text-sm text-gray-500">
                      Accepted formats: PNG, JPG, PDF, AI, EPS, PSD (Max 10MB per file)
                    </p>
                    {selectedFiles.length > 0 && (
                      <div className="mt-6 space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50 text-left">
                        <p className="text-sm font-medium text-gray-700">Files to upload:</p>
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm text-sm">
                            <span className="flex items-center text-gray-800 truncate">
                              <FileText className="h-4 w-4 mr-2 text-primary-400 flex-shrink-0" />
                              {file.name}
                            </span>
                            <span className="text-gray-500 text-xs flex-shrink-0 ml-4">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full group py-4 text-lg font-semibold shadow-primary-500/50 hover:shadow-lg transition-shadow"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin mr-3">🌀</span>
                        Submitting Order...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-3 h-6 w-6" />
                        Submit Order Request
                        <ArrowLeft className="ml-3 h-6 w-6 rotate-180 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Order Summary - Right Column (1/3) */}
          <div className="lg:col-span-1">
            <div className="sticky top-12 space-y-8">
              <Card className="p-6 shadow-xl bg-white border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-3">Pricing Overview</h2>
                
                <div className="space-y-4 mb-6">
                  {/* Service Item */}
                  <div className="flex justify-between items-start pb-4 border-b border-gray-100">
                    <div>
                      <p className="font-semibold text-gray-900">{service.name}</p>
                      <p className="text-sm text-gray-500">{service.category}</p>
                    </div>
                  </div>
                  
                  {/* Calculation Details */}
                  {(formData.quantity && parseFloat(formData.quantity) > 0) && (
                    <div className="space-y-3 pt-4 border-t border-gray-200">
                      <div className="flex justify-between text-base">
                        <span className="text-gray-600">Quantity</span>
                        <span className="font-medium text-gray-900">{formData.quantity} {service.priceNote.toLowerCase().includes('per square meter') ? 'm²' : 'units'}</span>
                      </div>
                      <div className="flex justify-between text-base">
                        <span className="text-gray-600">Unit Price</span>
                        <span className="font-medium text-gray-900">
                          {CURRENCY.symbol} {service.startingPrice.toLocaleString('en-RW')}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-100">
                        <span className="text-gray-700">Estimated Subtotal</span>
                        <span className="text-primary-600">
                          {CURRENCY.symbol} {estimatedTotal.toLocaleString('en-RW')}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="pt-5 border-t-2 border-primary-200">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-extrabold text-gray-900">Final Estimated Total</span>
                      <span className="text-3xl font-extrabold text-primary-600">
                        {CURRENCY.symbol} {estimatedTotal.toLocaleString('en-RW')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-right italic">
                      This is an estimate. Final price will be confirmed after design review.
                    </p>
                  </div>
                </div>

                {/* What's Next */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Your Next Steps</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Step 1: Order Review</p>
                        <p className="text-xs text-gray-600">Our team reviews your specs & files within 24 hours.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Step 2: Quote Confirmation</p>
                        <p className="text-xs text-gray-600">You'll receive a **final, detailed quote** via email.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Step 3: Production & Delivery</p>
                        <p className="text-xs text-gray-600">We begin work upon your quote approval and payment.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Support */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Need assistance with your order?{' '}
                    <Link to="/contact" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                      Contact our dedicated support team
                    </Link>
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}