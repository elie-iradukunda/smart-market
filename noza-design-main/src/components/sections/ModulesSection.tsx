import {
  ShoppingCart,
  Factory,
  Package,
  CreditCard,
  DollarSign,
  Megaphone,
  MessageCircle,
  Brain,
} from 'lucide-react'
import Card from '../ui/Card'

const modules = [
  {
    name: 'CRM & Orders',
    description:
      'Lead capture from multiple channels, quotes with itemized services, file intake, proofing workflows, and deposit management.',
    icon: ShoppingCart,
    features: ['Lead Management', 'Quote Generation', 'File Intake', 'Approval Workflows'],
  },
  {
    name: 'Production/Job Management',
    description:
      'Auto-generated work orders, Kanban stages, time tracking, technician assignments, quality checks, and rework loops.',
    icon: Factory,
    features: ['Work Orders', 'Kanban Board', 'Time Tracking', 'Quality Assurance'],
  },
  {
    name: 'Inventory (Stock)',
    description:
      'BOM/Recipe management, stock movements, GRN, issues, returns, adjustments. AI-powered reorder points and supplier ranking.',
    icon: Package,
    features: ['BOM Management', 'Stock Movements', 'AI Reordering', 'Supplier Management'],
  },
  {
    name: 'Sales & POS',
    description:
      'Point of sale for walk-in sales, barcode scanning, discounts with approval rules, deposits, invoices, and loyalty points.',
    icon: CreditCard,
    features: ['POS System', 'Barcode Scanning', 'Discount Management', 'Loyalty Programs'],
  },
  {
    name: 'Finance',
    description:
      'Double-entry ledger, chart of accounts, AR/AP, expense claims, tax compliance, bank reconciliation, and financial reports.',
    icon: DollarSign,
    features: ['Double-Entry Accounting', 'AR/AP', 'Tax Management', 'Bank Reconciliation'],
  },
  {
    name: 'Marketing',
    description:
      'Campaign management, promo codes, referral links, audience segmentation, attribution dashboards, and paid API ads.',
    icon: Megaphone,
    features: ['Campaign Management', 'Audience Segmentation', 'Ads Management', 'Attribution'],
  },
  {
    name: 'Communications',
    description:
      'Unified inbox for all channels, SLA timers, canned responses, file sharing, chatbot handoff, conversation tagging, CSAT.',
    icon: MessageCircle,
    features: ['Unified Inbox', 'SLA Management', 'Canned Responses', 'CSAT Tracking'],
  },
  {
    name: 'AI & Analytics',
    description:
      'Demand forecasting, price elasticity, dynamic pricing, stock optimization, lead scoring, churn risk, and executive dashboards.',
    icon: Brain,
    features: ['Demand Forecasting', 'Dynamic Pricing', 'Lead Scoring', 'Executive Dashboards'],
  },
]

export default function ModulesSection() {
  return (
    <section id="modules" className="section-padding bg-gradient-to-b from-gray-50 to-white">
      <div className="container-professional">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Comprehensive Business Modules
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600 sm:text-xl">
            Eight powerful modules working together to streamline your entire operation.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl auto-rows-fr grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          {modules.map((module) => {
            const Icon = module.icon
            return (
              <Card key={module.name} hover className="flex flex-col group h-full">
                <div className="flex items-start gap-4 mb-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-secondary-600 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300 flex-shrink-0">
                    <Icon className="h-7 w-7 text-white" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold leading-7 text-gray-900 group-hover:text-primary-600 transition-colors">
                      {module.name}
                    </h3>
                  </div>
                </div>
                <p className="text-sm leading-6 text-gray-600 mb-5 flex-grow">
                  {module.description}
                </p>
                <ul className="space-y-2.5 border-t border-gray-100 pt-4">
                  {module.features.map((feature) => (
                    <li key={feature} className="flex items-center text-sm text-gray-700">
                      <svg
                        className="mr-3 h-4 w-4 text-primary-600 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2.5"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

