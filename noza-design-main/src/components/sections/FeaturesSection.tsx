import {
  Bot,
  BarChart3,
  Shield,
  Zap,
  Users,
  TrendingUp,
  MessageSquare,
  Lock,
} from 'lucide-react'
import Card from '../ui/Card'

const features = [
  {
    name: 'AI-Powered Analytics',
    description:
      'Predictive demand forecasting, dynamic pricing recommendations, and intelligent inventory optimization with ML algorithms.',
    icon: Bot,
    color: 'text-primary-600',
    bgColor: 'bg-primary-50',
  },
  {
    name: 'Omnichannel Communication',
    description:
      'Unified inbox for WhatsApp Business, Instagram, Facebook, email, and website chat. SLA timers and automated responses.',
    icon: MessageSquare,
    color: 'text-secondary-600',
    bgColor: 'bg-secondary-50',
  },
  {
    name: 'Role-Based Access Control',
    description:
      'Granular permissions with approval chains. Full audit trail for all actions. Principle of least privilege enforced.',
    icon: Lock,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    name: 'Real-Time Dashboards',
    description:
      'Executive dashboards with key metrics, performance indicators, and scheduled reports via email and WhatsApp.',
    icon: BarChart3,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    name: 'Production Workflow',
    description:
      'Kanban-style job management with stages from design to delivery. Time tracking, quality checks, and material usage logging.',
    icon: Zap,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    name: 'Financial Management',
    description:
      'Double-entry accounting, AR/AP, tax compliance, bank reconciliation, and comprehensive financial reports.',
    icon: TrendingUp,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    name: 'Team Collaboration',
    description:
      'Multi-user workspace with real-time updates, internal notes, mentions, and seamless handoffs between roles.',
    icon: Users,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
  {
    name: 'Enterprise Security',
    description:
      'Encrypted at rest and in transit, tenant isolation, hourly backups, and disaster recovery with RPO ≤ 1h, RTO ≤ 4h.',
    icon: Shield,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="section-padding bg-white">
      <div className="container-professional">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Everything you need to run your business
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600 sm:text-xl">
            Powerful features designed to streamline operations, boost productivity, 
            and drive growth.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.name} hover className="border-none group">
                  <dt className="flex items-start gap-x-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${feature.bgColor} group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                      <Icon className={`h-6 w-6 ${feature.color}`} aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold leading-7 text-gray-900 group-hover:text-primary-600 transition-colors">
                        {feature.name}
                      </h3>
                      <dd className="mt-3 flex flex-auto flex-col text-sm leading-6 text-gray-600">
                        <p className="flex-auto">{feature.description}</p>
                      </dd>
                    </div>
                  </dt>
                </Card>
              )
            })}
          </dl>
        </div>
      </div>
    </section>
  )
}

