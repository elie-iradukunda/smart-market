import { Check, Printer, Shirt, PenTool, Megaphone, Zap, Scissors } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { getImageUrl } from '@/api/apiClient'

const CURRENCY = {
  symbol: 'RF',
  code: 'RWF',
}

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
    name: 'T-Shirt & Garment Branding',
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
    period: '/mo',
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
    color: 'bg-white',
    textColor: 'text-indigo-950'
  },
  {
    name: 'Professional',
    price: 180000,
    period: '/mo',
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
    color: 'bg-indigo-600',
    textColor: 'text-white'
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
      'White-label solution',
    ],
    popular: false,
    color: 'bg-white',
    textColor: 'text-indigo-950'
  },
]

export default function PricingPage() {
  const navigate = useNavigate()

  const handleOrder = (serviceId: string) => {
    const designServices = ['signage', 'banner-printing', 'vinyl-printing', 'large-format', 'garment-branding']
    if (designServices.includes(serviceId)) {
      navigate(`/custom-design?product=${serviceId}`)
    } else {
      navigate(`/contact?service=${serviceId}`)
    }
  }

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen overflow-hidden">
      {/* SECTION 1: PREMIUM HERO */}
      <section className="relative pt-40 pb-56 flex items-center justify-center overflow-hidden bg-indigo-950">
        <div className="absolute inset-0 z-0">
          <img
            src={getImageUrl('/uploads/six.png')}
            className="w-full h-full object-cover animate-ken-burns opacity-30 mix-blend-overlay scale-110"
            alt="Pricing Background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-indigo-950/80 to-slate-50" />
        </div>

        <div className="absolute inset-0 flex items-center justify-center z-0 opacity-[0.03] pointer-events-none select-none overflow-hidden text-white font-black whitespace-nowrap animate-drift text-[25vw] tracking-tighter">
          TRANSPARENT VALUE • SCALE • GROWTH • SUCCESS
        </div>

        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-blob" />
          <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600/20 backdrop-blur-md rounded-full border border-white/10 shadow-xl">
            <Zap className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span className="text-sm font-bold text-white tracking-widest uppercase italic">Investment in Impact</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-none">
            Simple. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-white to-indigo-300">Transparent.</span>
          </h1>

          <p className="text-xl text-blue-100/70 max-w-3xl mx-auto font-medium leading-relaxed">
            Scalable solutions for Rwandan visionaries. From boutique design to enterprise-wide infrastructure.
          </p>
        </div>
      </section>

      {/* SECTION 2: SERVICE PRICING GRID */}
      <section className="relative -mt-24 z-20 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <div
                key={service.id}
                className="bg-white/80 backdrop-blur-2xl rounded-[3rem] p-10 shadow-premium border border-indigo-100/20 group hover:translate-y-[-8px] transition-all duration-500 animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 transform group-hover:rotate-6 transition-transform">
                      <service.icon size={28} className="text-white" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 bg-indigo-50 px-3 py-1 rounded-full">
                      {service.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-indigo-950 uppercase tracking-tighter italic">{service.name}</h3>
                    <p className="text-sm text-slate-500 font-medium mt-2 line-clamp-2">{service.description}</p>
                  </div>

                  <div className="py-6 border-y border-slate-100 flex flex-col items-baseline gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{service.priceNote}</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-indigo-950">{CURRENCY.symbol} {service.startingPrice.toLocaleString('en-RW')}</span>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    {service.features.slice(0, 3).map((f, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-xs font-bold text-slate-600 uppercase tracking-tight">
                        <Check className="text-indigo-600" size={14} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleOrder(service.id)}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
                  >
                    Get Quote
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: SUBSCRIPTION PLANS */}
      <section className="py-24 bg-indigo-950 relative overflow-hidden">
        {/* Blob Inner */}
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] -ml-64 -mb-64" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic">Software <span className="text-indigo-400">Ecosystem.</span></h2>
            <p className="text-indigo-200/50 font-medium max-w-2xl mx-auto uppercase tracking-widest text-xs">Unlock your studio's full potential with our business management suite.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`${plan.color} ${plan.textColor} p-12 rounded-[3.5rem] relative overflow-hidden group border border-white/10 shadow-2xl transition-all duration-500 hover:scale-[1.02]`}
              >
                {plan.popular && (
                  <div className="absolute top-6 right-6">
                    <span className="px-4 py-1.5 bg-white text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl animate-pulse">
                      Most Scalable
                    </span>
                  </div>
                )}

                <div className="space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black tracking-tighter uppercase italic">{plan.name}</h3>
                    <p className="opacity-60 text-sm font-medium">{plan.description}</p>
                  </div>

                  <div className="flex items-baseline">
                    <span className="text-6xl font-black tracking-tighter">
                      {typeof plan.price === 'number' ? `${CURRENCY.symbol}${plan.price.toLocaleString('en-RW')}` : plan.price}
                    </span>
                    <span className="text-lg font-bold opacity-50 ml-2">{plan.period}</span>
                  </div>

                  <div className="h-[1px] w-full bg-current opacity-10" />

                  <ul className="space-y-5">
                    {plan.features.map((f, idx) => (
                      <li key={idx} className="flex items-center gap-4 text-sm font-bold tracking-tight">
                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${plan.popular ? 'bg-white/20' : 'bg-indigo-50'}`}>
                          <Check size={12} className={plan.popular ? 'text-white' : 'text-indigo-600'} />
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl active:scale-95 ${plan.popular
                    ? 'bg-white text-indigo-600 hover:bg-indigo-50'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
                    }`}>
                    {plan.price === 'Custom' ? 'Connect with Sales' : 'Initiate 14-Day Cycle'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: FAQ SECTION */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16 space-y-2">
            <h2 className="text-4xl font-black text-indigo-950 tracking-tighter uppercase leading-tight italic">Clear Answers.</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Everything you need to know about our value proposition.</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[
              { q: 'Can I scale my plan later?', a: 'Absolute flexibility. Upgrade or downgrade as your production demands shift. Changes take effect on the next billing cycle.' },
              { q: 'What payment methods do you accept in Rwanda?', a: 'We accept Mobile Money (MoMo), Bank Transfers, and all major credit cards. Enterprise billing available for institutional clients.' },
              { q: 'Is there a setup fee?', a: 'Zero. We focus on value from day one. Your only investment is the recurring subscription or project fee.' },
              { q: 'Do you offer bulk design discounts?', a: 'Yes. For high-volume design needs or nationwide branding rollouts, we provide custom strategic alliance pricing.' }
            ].map((faq, i) => (
              <div key={i} className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-indigo-100 transition-all group">
                <h4 className="text-lg font-black text-indigo-950 uppercase tracking-tighter mb-4 flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                  {faq.q}
                </h4>
                <p className="text-slate-600 font-medium leading-relaxed pl-4.5">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 bg-indigo-50 border-t border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-12">
          <div className="space-y-6">
            <h2 className="text-5xl md:text-7xl font-black text-indigo-950 tracking-tighter uppercase leading-none">Ready to <br /><span className="text-indigo-600 italic">Dominate?</span></h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Join Rwanda's fastest growing brands powered by TOP Design.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/contact" className="px-12 py-6 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-2xl shadow-indigo-200">
              Start Project
            </Link>
            <Link to="/about" className="px-12 py-6 bg-white text-indigo-950 rounded-2xl font-black text-lg border border-slate-200 hover:bg-slate-50 transition-all">
              View Pedigree
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
