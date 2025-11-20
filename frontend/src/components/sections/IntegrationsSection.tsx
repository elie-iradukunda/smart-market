import { Check } from 'lucide-react'
import Card from '../ui/Card'

const integrations = {
  messaging: {
    title: 'Messaging & Social',
    description: 'Official SDKs with paid tiers for reliable, SLA-backed operations',
    items: [
      'Meta WhatsApp Business Cloud API',
      'Instagram Graph API',
      'Facebook Graph/Marketing API',
      'X (Twitter) API',
      'SendGrid/Mailgun Email',
    ],
  },
  payments: {
    title: 'Payments & Finance',
    description: 'Secure payment processing and financial integrations',
    items: [
      'MTN/Airtel Mobile Money',
      'Bank Gateways',
      'Stripe & PayPal',
      'Multi-currency Support',
    ],
  },
  infrastructure: {
    title: 'Infrastructure',
    description: 'Enterprise-grade storage, security, and observability',
    items: [
      'AWS S3 / Backblaze Storage',
      'CDN Integration',
      'Datadog / ELK Logging',
      'Sentry Error Tracking',
      'CloudWatch Monitoring',
    ],
  },
}

export default function IntegrationsSection() {
  return (
    <section id="integrations" className="section-padding bg-white">
      <div className="container-professional">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Official Integrations
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600 sm:text-xl">
            Built on official APIs and paid tiers for long-term stability and reliability.
            No scraping, no unofficial endpoints.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl auto-rows-fr grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {Object.entries(integrations).map(([key, integration]) => (
            <Card key={key} hover className="group">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-1 w-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full group-hover:w-12 transition-all duration-300"></div>
                <h3 className="text-xl font-bold leading-7 text-gray-900 group-hover:text-primary-600 transition-colors">
                  {integration.title}
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                {integration.description}
              </p>
              <ul className="space-y-3">
                {integration.items.map((item) => (
                  <li key={item} className="flex items-start group/item">
                    <Check className="h-5 w-5 text-primary-600 mr-3 flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform" />
                    <span className="text-sm text-gray-700 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            All integrations use official APIs with proper authentication, rate limiting, 
            and error handling. Budget for paid quotas is included in operational costs.
          </p>
        </div>
      </div>
    </section>
  )
}

