import { Check, ArrowRight, ShoppingCart, Share2, Printer, Shirt, Image, PenTool, FileText, Megaphone, Palette, Scissors } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

// Currency configuration - Rwandan Franc (RWF)
const CURRENCY = {
  symbol: 'RF', // Rwandan Franc symbol
  code: 'RWF', // Currency code
}

// Business Services
const services = [
  {
    id: 'banner-printing',
    name: 'Banner Printing',
    icon: Printer,
    description: 'High-quality banners in various sizes and materials for events, advertising, and branding',
    startingPrice: 30000,
    priceNote: 'Starting from',
    features: ['Custom sizes', 'Multiple materials', 'Fast turnaround', 'UV resistant'],
    category: 'Printing',
  },
  {
    id: 'garment-branding',
    name: 'T-Shirt & Garment Printing',
    icon: Shirt,
    description: 'Custom t-shirts, hoodies, and apparel printing with vinyl, heat transfer, or screen printing',
    startingPrice: 18000,
    priceNote: 'Per item from',
    features: ['All garment types', 'Multiple print methods', 'Bulk discounts', 'Design assistance'],
    category: 'Apparel',
  },
  {
    id: 'vinyl-printing',
    name: 'Vinyl Printing & Cutting',
    icon: Scissors,
    description: 'Professional vinyl graphics for vehicles, windows, walls, and custom applications',
    startingPrice: 36000,
    priceNote: 'Per square meter',
    features: ['Car wraps', 'Window decals', 'Signage vinyl', 'Custom shapes'],
    category: 'Signage',
  },
  {
    id: 'digital-printing',
    name: 'Digital Printing',
    icon: Image,
    description: 'High-resolution digital printing for flyers, posters, business cards, and marketing materials',
    startingPrice: 500,
    priceNote: 'Per page from',
    features: ['High resolution', 'Quick turnaround', 'Multiple paper types', 'Full color'],
    category: 'Printing',
  },
  {
    id: 'graphic-design',
    name: 'Graphic Design Services',
    icon: PenTool,
    description: 'Professional logo design, branding, and graphic design for your business needs',
    startingPrice: 180000,
    priceNote: 'Starting from',
    features: ['Logo design', 'Brand identity', 'Marketing materials', 'Revisions included'],
    category: 'Design',
  },
  {
    id: 'business-cards',
    name: 'Business Cards',
    icon: FileText,
    description: 'Premium business cards with various finishes, materials, and design options',
    startingPrice: 60000,
    priceNote: 'Per 100 cards',
    features: ['Premium finishes', 'Multiple sizes', 'Quick delivery', 'Design templates'],
    category: 'Printing',
  },
  {
    id: 'signage',
    name: 'Custom Signage',
    icon: Megaphone,
    description: 'Outdoor and indoor signage solutions including illuminated signs, directories, and displays',
    startingPrice: 240000,
    priceNote: 'Starting from',
    features: ['Indoor/Outdoor', 'Illuminated options', 'Custom sizes', 'Installation service'],
    category: 'Signage',
  },
  {
    id: 'embroidery',
    name: 'Embroidery Services',
    icon: Palette,
    description: 'Professional embroidery on caps, jackets, bags, and corporate apparel',
    startingPrice: 24000,
    priceNote: 'Per item from',
    features: ['All fabric types', 'Custom logos', 'Bulk pricing', 'Quick turnaround'],
    category: 'Apparel',
  },
  {
    id: 'large-format',
    name: 'Large Format Printing',
    icon: Printer,
    description: 'Posters, billboards, trade show displays, and large-scale printing projects',
    startingPrice: 6000,
    priceNote: 'Per square meter',
    features: ['Up to 3m width', 'Various materials', 'Trade show displays', 'Rush orders'],
    category: 'Printing',
  },
]

const plans = [
  {
    name: 'Starter',
    price: 60000,
    period: '/month',
    description: 'Perfect for small businesses getting started',
    features: [
      'Up to 5 users',
      'CRM & Orders module',
      'Basic inventory management',
      'Email support',
      '5GB storage',
      'Mobile app access',
    ],
    popular: false,
  },
  {
    name: 'Professional',
    price: 180000,
    period: '/month',
    description: 'Ideal for growing teams and businesses',
    features: [
      'Up to 25 users',
      'All 8 modules included',
      'AI-powered analytics',
      'Omnichannel communications',
      'Priority support',
      '50GB storage',
      'API access',
      'Custom integrations',
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations with advanced needs',
    features: [
      'Unlimited users',
      'All features included',
      'Advanced AI & ML',
      'Dedicated account manager',
      '24/7 phone support',
      'Unlimited storage',
      'Custom SLA',
      'On-premise deployment option',
      'White-label solution',
    ],
    popular: false,
  },
]

export default function PricingPage() {
  const [shareService, setShareService] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleOrder = (serviceId: string) => {
    // Navigate to order page with service parameter
    navigate(`/order?service=${serviceId}`)
  }

  const handleShare = async (serviceId: string, serviceName: string) => {
    const url = `${window.location.origin}/pricing#${serviceId}`
    const text = `Check out ${serviceName} from TOP Design: ${url}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: serviceName,
          text: text,
          url: url,
        })
      } catch (err) {
        // User cancelled or error occurred
        console.log('Share cancelled')
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(url)
        setShareService(serviceId)
        setTimeout(() => setShareService(null), 2000)
      } catch (err) {
        // Fallback: Show URL in alert
        alert(`Share this link: ${url}`)
      }
    }
  }

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-24 sm:pt-32 pb-4 sm:pb-6">
        <div className="container-professional">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Simple, transparent pricing
            </h1>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="pt-8 sm:pt-10 pb-16 sm:pb-24 bg-gray-50">
        <div className="container-professional">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Our Services
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Professional printing and design services to meet all your business needs
            </p>
          </div>
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon
              return (
                <Card key={service.id} hover className="flex flex-col group">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-secondary-600 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {service.name}
                        </h3>
                      </div>
                      <span className="inline-block mt-1 text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
                        {service.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 flex-grow">{service.description}</p>
                  
                  <div className="mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {typeof service.startingPrice === 'number' && service.startingPrice < 1000
                          ? `${CURRENCY.symbol} ${service.startingPrice.toLocaleString('en-RW')}`
                          : `${CURRENCY.symbol} ${service.startingPrice.toLocaleString('en-RW')}`}
                      </span>
                      {service.priceNote && (
                        <span className="text-xs text-gray-500">{service.priceNote}</span>
                      )}
                    </div>
                    <ul className="mt-3 space-y-2">
                      {service.features.slice(0, 2).map((feature, idx) => (
                        <li key={idx} className="flex items-center text-xs text-gray-600">
                          <Check className="h-3 w-3 text-primary-600 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="md"
                      variant="primary"
                      className="flex-1 group/btn"
                      onClick={() => handleOrder(service.id)}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Order Now
                    </Button>
                    <Button
                      size="md"
                      variant="outline"
                      className="px-3"
                      onClick={() => handleShare(service.id, service.name)}
                      title="Share service"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {shareService === service.id && (
                    <p className="mt-2 text-xs text-green-600 text-center">Link copied to clipboard!</p>
                  )}
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      {/* Pricing Cards / Subscription Plans */}
      <div className="py-24 sm:py-32">
        <div className="container-professional">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Subscription Plans
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Choose the perfect plan for your business. All plans include a 14-day free trial.
            </p>
          </div>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                hover
                className={`relative flex flex-col ${
                  plan.popular ? 'ring-2 ring-primary-600 shadow-premium' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center rounded-full bg-primary-600 px-3 py-1 text-xs font-semibold text-white">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="mt-2 text-sm text-gray-600">{plan.description}</p>
                  <div className="mt-6 flex items-baseline">
                    {plan.price === 'Custom' ? (
                      <span className="text-5xl font-bold tracking-tight text-gray-900">
                        {plan.price}
                      </span>
                    ) : (
                      <>
                        <span className="text-5xl font-bold tracking-tight text-gray-900">
                          {typeof plan.price === 'number' ? `${CURRENCY.symbol} ${plan.price.toLocaleString('en-RW')}` : plan.price}
                        </span>
                        {plan.period && (
                          <span className="ml-1 text-xl font-semibold text-gray-500">
                            {plan.period}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <ul className="mt-8 space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <Check className="h-5 w-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-10">
                  <Button
                    size="lg"
                    variant={plan.popular ? 'primary' : 'outline'}
                    className="w-full group"
                  >
                    {plan.price === 'Custom' ? 'Contact Sales' : 'Start Free Trial'}
                    {plan.price !== 'Custom' && (
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="container-professional">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to know about our pricing plans.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-3xl space-y-8">
            {[
              {
                question: 'Can I change plans later?',
                answer:
                  'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any billing adjustments.',
              },
              {
                question: 'What payment methods do you accept?',
                answer:
                  'We accept all major credit cards, bank transfers, and PayPal. Enterprise customers can also arrange invoicing.',
              },
              {
                question: 'Is there a setup fee?',
                answer:
                  'No setup fees for any plan. You only pay the monthly or annual subscription fee.',
              },
              {
                question: 'Do you offer discounts for annual plans?',
                answer:
                  'Yes! Save 20% when you pay annually. Contact us for enterprise pricing with additional discounts.',
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                <p className="mt-2 text-sm text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 py-16 sm:py-24">
        <div className="container-professional">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-50">
              Join thousands of businesses using TOP Design to streamline their operations.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link to="/login">
                <Button size="lg" variant="secondary" className="bg-white text-primary-600 hover:bg-gray-100">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

