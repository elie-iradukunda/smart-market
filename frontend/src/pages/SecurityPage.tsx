import { Shield, Lock, Eye, Server, Check } from 'lucide-react'
import Card from '@/components/ui/Card'

const securityFeatures = [
  {
    icon: Lock,
    title: 'Encryption',
    description: 'All data is encrypted at rest using AES-256 and in transit using TLS 1.3.',
  },
  {
    icon: Shield,
    title: 'Access Controls',
    description: 'Role-based access control (RBAC) ensures users only access what they need.',
  },
  {
    icon: Server,
    title: 'Infrastructure',
    description: 'Hosted on enterprise-grade infrastructure with 99.9% uptime SLA.',
  },
  {
    icon: Eye,
    title: 'Monitoring',
    description: '24/7 security monitoring and automated threat detection systems.',
  },
]

const complianceItems = [
  'SOC 2 Type II Certified',
  'GDPR Compliant',
  'Regular Security Audits',
  'Penetration Testing',
  'Data Backup & Recovery',
  'Incident Response Plan',
]

export default function SecurityPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-24 sm:py-32">
        <div className="container-professional">
          <div className="mx-auto max-w-2xl text-center">
            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary-100">
                <Shield className="h-8 w-8 text-primary-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Security First
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl">
              Your data security is our top priority. Learn about how we protect your information.
            </p>
          </div>
        </div>
      </div>

      {/* Security Features */}
      <div className="py-24 sm:py-32">
        <div className="container-professional">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Enterprise-Grade Security
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Built with security best practices from the ground up.
            </p>
          </div>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-2">
            {securityFeatures.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} hover>
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 flex-shrink-0">
                      <Icon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      {/* Compliance Section */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="container-professional">
          <div className="mx-auto max-w-3xl">
            <div className="bg-white rounded-xl shadow-professional border border-gray-200 p-8 sm:p-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Compliance & Certifications</h2>
              <ul className="space-y-4">
                {complianceItems.map((item) => (
                  <li key={item} className="flex items-center">
                    <Check className="h-5 w-5 text-primary-600 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Data Protection Section */}
      <div className="py-24 sm:py-32">
        <div className="container-professional">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-8">
              Data Protection
            </h2>
            <div className="prose prose-lg prose-gray">
              <p className="text-gray-600 leading-relaxed mb-6">
                We implement multiple layers of security to protect your data:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-3 mb-6">
                <li>
                  <strong>Data Encryption:</strong> All sensitive data is encrypted using industry-standard
                  algorithms both at rest and in transit.
                </li>
                <li>
                  <strong>Regular Backups:</strong> Automated daily backups with point-in-time recovery
                  capabilities.
                </li>
                <li>
                  <strong>Access Logging:</strong> Comprehensive audit logs track all access and modifications
                  to your data.
                </li>
                <li>
                  <strong>Data Isolation:</strong> Strict tenant isolation ensures your data is completely
                  separated from other customers.
                </li>
              </ul>
              <p className="text-gray-600 leading-relaxed">
                For more information about our security practices, please contact us at{' '}
                <a href="mailto:security@topdesign.com" className="text-primary-600 hover:text-primary-700">
                  security@topdesign.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

