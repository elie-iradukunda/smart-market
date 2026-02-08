import { Scale, FileCheck, Users, CreditCard, Activity, AlertCircle, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react'
import { getImageUrl } from '@/api/apiClient'

export default function TermsPage() {
  const sections = [
    {
      id: 1,
      icon: Scale,
      title: 'Acceptance of Terms',
      content: 'By accessing and using TOP Design services, you accept and agree to be bound by the terms and provisions of this agreement. This contract establishes a binding legal relationship between you and TOP Design Ltd. If you do not agree to these terms, please do not use our services.'
    },
    {
      id: 2,
      icon: FileCheck,
      title: 'Use License',
      content: 'Permission is granted to temporarily access and use TOP Design for business purposes. This is the grant of a license, not a transfer of title, and under this license you may not:',
      list: [
        'Modify or copy the proprietary design materials',
        'Use materials for commercial purposes without explicit written consent',
        'Attempt to decompile or reverse engineer any provided software',
        'Remove any copyright or other proprietary notations'
      ]
    },
    {
      id: 3,
      icon: Users,
      title: 'User Accounts',
      content: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to immediately notify our security team of any unauthorized use of your account or security breach.'
    },
    {
      id: 4,
      icon: CreditCard,
      title: 'Payment Terms',
      content: 'Subscriptions and service orders are billed in advance on a milestone or annual basis. All fees are non-refundable except as required by Rwandan law. We reserve the right to change our pricing structures with 30 days notice to active clients.'
    },
    {
      id: 5,
      icon: Activity,
      title: 'Service Availability',
      content: 'We strive to maintain 99.9% uptime for digital assets but do not guarantee uninterrupted service. We reserve the right to perform scheduled maintenance that may result in temporary service interruptions for system upgrades.'
    }
  ]

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen overflow-hidden">
      {/* SECTION 1: PREMIUM HERO */}
      <section className="relative pt-40 pb-56 flex items-center justify-center overflow-hidden bg-indigo-950">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
          <img
            src={getImageUrl('/uploads/six.png')}
            className="w-full h-full object-cover animate-ken-burns opacity-30 mix-blend-overlay scale-110"
            alt="Terms Background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-indigo-950/80 to-slate-50" />
        </div>

        {/* Drifting Brand Watermark */}
        <div className="absolute inset-0 flex items-center justify-center z-0 opacity-[0.03] pointer-events-none select-none overflow-hidden text-white font-black whitespace-nowrap animate-drift text-[25vw] tracking-tighter">
          LEGAL FRAMEWORK • TERMS • AGREEMENT • SERVICE
        </div>

        {/* Ambient Glows */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-blob" />
          <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600/20 backdrop-blur-md rounded-full border border-white/10 shadow-xl">
            <Scale className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span className="text-sm font-bold text-white tracking-widest uppercase italic">Governing Principles</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-none">
            Terms <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-white to-indigo-300">of Service.</span>
          </h1>

          <p className="text-xl text-blue-100/70 max-w-2xl mx-auto font-medium leading-relaxed">
            Our commitment to excellence is grounded in clear, professional agreements that protect both our craft and your business.
          </p>

          <div className="pt-4 flex items-center justify-center gap-2 text-indigo-400 font-bold uppercase tracking-widest text-xs">
            <span className="w-8 h-[1px] bg-indigo-500/30"></span>
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            <span className="w-8 h-[1px] bg-indigo-500/30"></span>
          </div>
        </div>
      </section>

      {/* SECTION 2: TERMS CONTENT */}
      <section className="relative -mt-24 z-20 pb-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {sections.map((section, i) => (
              <div
                key={section.id}
                className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-premium border border-indigo-100/20 overflow-hidden group hover:shadow-2xl transition-all duration-500 animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="p-8 md:p-12 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 transform group-hover:rotate-6 transition-all duration-300">
                      <section.icon size={28} className="text-white" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Article {section.id}.0</span>
                      <h2 className="text-2xl font-black text-indigo-950 uppercase tracking-tighter italic">{section.title}</h2>
                    </div>
                  </div>

                  <div className="h-[1px] w-full bg-slate-100" />

                  <p className="text-lg text-slate-600 leading-relaxed font-medium">
                    {section.content}
                  </p>

                  {section.list && (
                    <ul className="space-y-4">
                      {section.list.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-4 group/item">
                          <div className="mt-1.5 w-5 h-5 rounded-full border-2 border-indigo-100 flex items-center justify-center group-hover/item:border-indigo-600 transition-colors shrink-0">
                            <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity" />
                          </div>
                          <span className="text-slate-600 font-bold group-hover/item:text-indigo-950 transition-colors uppercase tracking-tight text-sm">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}

            {/* Contact CTA */}
            <div className="bg-indigo-950 rounded-[3rem] p-12 relative overflow-hidden group shadow-2xl animate-fade-in-up" style={{ animationDelay: '600ms' }}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -mr-32 -mt-32" />
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between">
                <div className="space-y-4 text-center md:text-left">
                  <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">Need Clarification?</h3>
                  <p className="text-indigo-200/60 font-medium">Our legal advisors can explain any clause in detail before you start your project.</p>
                </div>
                <a
                  href="mailto:legal@topdesign.com"
                  className="px-10 py-5 bg-white text-indigo-950 rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-xl active:scale-95 flex items-center gap-3 group"
                >
                  Legal Inquiry
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>

            {/* Master Trust Footer */}
            <div className="pt-8 text-center space-y-4 opacity-50">
              <div className="flex items-center justify-center gap-6">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <ShieldCheck size={12} />
                  Binding Contract
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <Scale size={12} />
                  Fair Use Policy
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <Sparkles size={12} />
                  Service Excellence
                </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                &copy; {new Date().getFullYear()} TOP Design Studio Ltd • Legal Affairs Department
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
