import { Shield, Lock, Eye, Server, Check, Globe, ShieldCheck, ArrowRight } from 'lucide-react'
import { getImageUrl } from '@/api/apiClient'

const securityFeatures = [
  {
    icon: Lock,
    title: 'Advanced Encryption',
    description: 'All data is encrypted at rest using industry-standard AES-256 and in transit using the latest TLS 1.3 protocol for absolute confidentiality.',
    color: 'bg-blue-500/10 text-blue-400'
  },
  {
    icon: Shield,
    title: 'Intelligent Access',
    description: 'Sophisticated Role-Based Access Control (RBAC) ensures that only authorized personnel can access sensitive design and business assets.',
    color: 'bg-indigo-500/10 text-indigo-400'
  },
  {
    icon: Server,
    title: 'Elite Infrastructure',
    description: 'Hosted on top-tier enterprise infrastructure with 99.9% uptime SLA and multi-regional redundancy for maximum reliability.',
    color: 'bg-purple-500/10 text-purple-400'
  },
  {
    icon: Eye,
    title: 'Active Monitoring',
    description: '24/7 proactive security monitoring with automated threat detection systems and real-time incident response capabilities.',
    color: 'bg-indigo-500/10 text-indigo-400'
  },
]

const complianceItems = [
  'SOC 2 Type II Certified',
  'GDPR & CCPA Compliant',
  'Regular Third-Party Security Audits',
  'Advanced Penetration Testing',
  'Automated Data Backup & Recovery',
  'Global Incident Response Framework',
]

export default function SecurityPage() {
  return (
    <div className="flex flex-col bg-slate-50 min-h-screen overflow-hidden">
      {/* SECTION 1: PREMIUM HERO */}
      <section className="relative pt-40 pb-56 flex items-center justify-center overflow-hidden bg-indigo-950">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
          <img
            src={getImageUrl('/uploads/six.png')}
            className="w-full h-full object-cover animate-ken-burns opacity-30 mix-blend-overlay scale-110"
            alt="Security Background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-indigo-950/80 to-slate-50" />
        </div>

        {/* Drifting Brand Watermark */}
        <div className="absolute inset-0 flex items-center justify-center z-0 opacity-[0.03] pointer-events-none select-none overflow-hidden text-white font-black whitespace-nowrap animate-drift text-[25vw] tracking-tighter">
          ENCRYPTION • FORTRESS • TRUST • RELIABILITY
        </div>

        {/* Ambient Glows */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-blob" />
          <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600/20 backdrop-blur-md rounded-full border border-white/10 shadow-xl">
            <Lock className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span className="text-sm font-bold text-white tracking-widest uppercase italic">The Vault Status</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-none">
            Security <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-white to-indigo-300">By Design.</span>
          </h1>

          <p className="text-xl text-blue-100/70 max-w-2xl mx-auto font-medium leading-relaxed">
            We build creative solutions on an enterprise-grade foundation of absolute data security and operational integrity.
          </p>
        </div>
      </section>

      {/* SECTION 2: SECURITY FEATURES */}
      <section className="relative -mt-24 z-20 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {securityFeatures.map((feature, i) => (
              <div
                key={i}
                className="bg-white/80 backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-premium border border-indigo-100/20 group hover:translate-y-[-5px] transition-all duration-500 animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-start gap-6">
                  <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <feature.icon size={28} />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-black text-indigo-950 uppercase tracking-tighter italic">{feature.title}</h3>
                    <p className="text-slate-600 font-medium leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: COMPLIANCE & PROTECTION GRID */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-12 animate-fade-in-up">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-black text-indigo-950 tracking-tighter uppercase leading-tight italic">Compliance <br />& <span className="text-indigo-600">Standards.</span></h2>
                <div className="w-20 h-2 bg-indigo-600 rounded-full" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {complianceItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-slate-100 group hover:border-indigo-200 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <Check size={16} />
                    </div>
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:pl-12">
              <div className="bg-indigo-950 p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden space-y-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -mr-32 -mt-32" />

                <div className="space-y-6">
                  <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">Data Protection.</h3>
                  <p className="text-indigo-200/60 font-medium leading-relaxed">
                    We implement multiple layers of security to protect your data, ensuring tenant isolation and comprehensive audit logging across all systems.
                  </p>

                  <div className="space-y-4 pt-4">
                    {[
                      { title: 'Data Isolation', desc: 'Strict multi-tenant separation protocols' },
                      { title: 'Access Logging', desc: 'Comprehensive audit trails for every modification' },
                      { title: 'Regular Backups', desc: 'Automated 24h point-in-time recovery' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="mt-1 w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.5)]" />
                        <div>
                          <p className="text-white font-black text-sm uppercase tracking-widest">{item.title}</p>
                          <p className="text-indigo-300/50 text-xs font-medium">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5">
                  <a
                    href="mailto:security@topdesign.com"
                    className="w-full py-5 bg-white text-indigo-950 rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
                  >
                    Security Response Team
                    <ArrowRight size={20} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Footer */}
      <section className="py-20 border-t border-slate-200 bg-slate-100/50">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-12">
          <div className="flex flex-wrap justify-center gap-12 opacity-40">
            <div className="flex items-center gap-2 font-black text-slate-500 uppercase tracking-widest">
              <ShieldCheck size={24} />
              <span>ISO 27001 Certified</span>
            </div>
            <div className="flex items-center gap-2 font-black text-slate-500 uppercase tracking-widest">
              <Lock size={24} />
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2 font-black text-slate-500 uppercase tracking-widest">
              <Globe size={24} />
              <span>SOC2 Type II</span>
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            &copy; {new Date().getFullYear()} TOP Design Studio Ltd • Information Security Division
          </p>
        </div>
      </section>
    </div>
  )
}
