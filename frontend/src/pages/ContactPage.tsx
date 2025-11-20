import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

const contactMethods = [
  {
    icon: Mail,
    title: 'Email',
    description: 'Send us an email anytime',
    contact: 'hello@topdesign.com',
    href: 'mailto:hello@topdesign.com',
  },
  {
    icon: Phone,
    title: 'Phone',
    description: 'Mon-Fri from 8am to 6pm',
    contact: '+1 (555) 123-4567',
    href: 'tel:+15551234567',
  },
  {
    icon: MapPin,
    title: 'Office',
    description: 'Come say hello at our office',
    contact: '123 Musanze, Rwanda',
    href: '#',
  },
  {
    icon: MessageSquare,
    title: 'Live Chat',
    description: 'Chat with our support team',
    contact: 'Available 24/7',
    href: '#',
  },
]

const serviceNames: Record<string, string> = {
  'banner-printing': 'Banner Printing',
  'garment-branding': 'T-Shirt & Garment Printing',
  'vinyl-printing': 'Vinyl Printing & Cutting',
  'digital-printing': 'Digital Printing',
  'graphic-design': 'Graphic Design Services',
  'business-cards': 'Business Cards',
  'signage': 'Custom Signage',
  'embroidery': 'Embroidery Services',
  'large-format': 'Large Format Printing',
}

export default function ContactPage() {
  const [searchParams] = useSearchParams()
  const serviceParam = searchParams.get('service')
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: serviceParam ? `Inquiry about ${serviceNames[serviceParam] || serviceParam}` : '',
    message: serviceParam ? `I'm interested in ${serviceNames[serviceParam] || serviceParam} service.\n\n` : '',
  })

  useEffect(() => {
    if (serviceParam && serviceNames[serviceParam]) {
      setFormData(prev => ({
        ...prev,
        subject: `Inquiry about ${serviceNames[serviceParam]}`,
        message: `I'm interested in ${serviceNames[serviceParam]} service.\n\n`,
      }))
    }
  }, [serviceParam])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Contact form:', formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-24 sm:py-32">
        <div className="container-professional">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Get in touch
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl">
              Have a question? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Methods */}
      <div className="py-16 sm:py-24">
        <div className="container-professional">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {contactMethods.map((method) => {
              const Icon = method.icon
              return (
                <Card key={method.title} hover className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                      <Icon className="h-6 w-6 text-primary-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{method.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{method.description}</p>
                  <a
                    href={method.href}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    {method.contact}
                  </a>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="container-professional">
          <div className="mx-auto max-w-3xl">
            <div className="bg-white rounded-xl shadow-professional border border-gray-200 p-8 sm:p-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      name="company"
                      id="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="Acme Inc."
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select
                      name="subject"
                      id="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="block w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    >
                      <option value="">Select a subject</option>
                      <option value="sales">Sales Inquiry</option>
                      <option value="support">Support Request</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    id="message"
                    rows={6}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="Tell us how we can help..."
                  />
                </div>

                <div>
                  <Button type="submit" size="lg" className="w-full sm:w-auto group">
                    Send Message
                    <Send className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

