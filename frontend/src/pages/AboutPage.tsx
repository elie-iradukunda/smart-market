import { Users, Target, Award, TrendingUp } from 'lucide-react'
import Card from '@/components/ui/Card'

const values = [
  {
    icon: Target,
    title: 'Mission-Driven',
    description:
      'We empower design businesses to streamline operations, increase efficiency, and scale with confidence through intelligent technology.',
  },
  {
    icon: Users,
    title: 'Customer-Centric',
    description:
      'Your success is our success. We build features based on real customer feedback and continuously improve based on your needs.',
  },
  {
    icon: Award,
    title: 'Innovation First',
    description:
      'We leverage cutting-edge AI and machine learning to provide predictive insights and automation that gives you a competitive edge.',
  },
  {
    icon: TrendingUp,
    title: 'Growth Focused',
    description:
      'Our platform scales with you—from startup to enterprise. Start small and grow without the complexity of switching systems.',
  },
]

const stats = [
  { label: 'Active Users', value: '10,000+' },
  { label: 'Businesses', value: '2,500+' },
  { label: 'Orders Processed', value: '5M+' },
  { label: 'Uptime', value: '99.9%' },
]

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-24 sm:py-32">
        <div className="container-professional">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              About TOP Design
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl">
              We're building the future of business management for design companies worldwide.
            </p>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-24 sm:py-32">
        <div className="container-professional">
          <div className="mx-auto max-w-3xl">
            <div className="prose prose-lg prose-gray mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                TOP Design was born from a simple observation: design businesses were struggling with
                fragmented systems that didn't talk to each other. From managing orders in spreadsheets
                to tracking inventory manually, businesses were spending more time on administration than
                on what they do best—creating amazing designs.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                We set out to change that by creating an intelligent, all-in-one platform that unifies
                every aspect of your business. Today, TOP Design helps thousands of businesses streamline
                operations, reduce costs, and scale efficiently.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 py-16 sm:py-24">
        <div className="container-professional">
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm font-medium text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-24 sm:py-32">
        <div className="container-professional">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Our Values
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              The principles that guide everything we do.
            </p>
          </div>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-2">
            {values.map((value) => {
              const Icon = value.icon
              return (
                <Card key={value.title} hover>
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 flex-shrink-0">
                      <Icon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{value.description}</p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="container-professional">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Built by Experts, For Experts
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Our team combines decades of experience in business software, design, and AI to deliver
              solutions that actually work.
            </p>
          </div>
          <div className="mx-auto max-w-3xl">
            <div className="bg-white rounded-xl p-8 shadow-professional border border-gray-200">
              <p className="text-lg text-gray-700 leading-relaxed">
                We're a passionate team of engineers, designers, and business strategists dedicated to
                making business management simple, intelligent, and powerful. Every feature we build is
                tested with real businesses and refined based on actual usage patterns.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

