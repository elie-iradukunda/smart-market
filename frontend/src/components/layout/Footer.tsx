import { Link } from 'react-router-dom'
import { Facebook, Instagram, Mail, MessageCircle, Box, ArrowRight, ShieldCheck, Zap, Globe } from 'lucide-react'

const navigation = {
  product: [
    { name: 'Featured Designs', href: '/products?view=designs' },
    { name: 'Retail Catalog', href: '/products' },
    { name: 'Branding Kits', href: '/products?category=Branding' },
    { name: 'Custom Quote', href: '/contact' },
  ],
  company: [
    { name: 'Our Story', href: '/about' },
    { name: 'The Studio', href: '/about#studio' },
    { name: 'Contact Center', href: '/contact' },
    { name: 'Careers', href: '/contact?reason=careers' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Print Guidelines', href: '/about' },
  ],
}

const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/topdesign' },
  { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/topdesign' },
  { name: 'WhatsApp', icon: MessageCircle, href: 'https://wa.me/250788123456' },
  { name: 'Email', icon: Mail, href: 'mailto:hello@topdesign.rw' },
]

export default function Footer() {
  return (
    <footer className="bg-indigo-950 border-t border-white/5 pt-24 pb-12 overflow-hidden relative" aria-labelledby="footer-heading">
      {/* Decorative Background Blob */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="xl:grid xl:grid-cols-3 xl:gap-24">
          <div className="space-y-12">
            <div className="space-y-6">
              <Link to="/" className="group flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center transform group-hover:rotate-12 transition-all shadow-xl">
                  <Box className="w-7 h-7 text-indigo-950" />
                </div>
                <div className="flex flex-col -space-y-1">
                  <span className="text-2xl font-black text-white tracking-tighter">TOP <span className="text-blue-400 italic">Design</span></span>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300">Creative Agency</span>
                </div>
              </Link>
              <p className="text-base leading-relaxed text-indigo-100/60 font-medium">
                Designing the future of East African brands. We specialize in high-impact visual engineering, from boutique identities to heavy-industry fabrication.
              </p>
            </div>

            <div className="flex space-x-4">
              {socialLinks.map((item) => {
                const Icon = item.icon
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-300 hover:text-white hover:bg-indigo-600 hover:border-indigo-500 transition-all duration-300"
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </a>
                )
              })}
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3 text-sm text-indigo-200/50 font-bold uppercase tracking-widest">
                <Globe size={16} />
                <span>Headquarters: Kigali, Rwanda</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-indigo-200/50 font-bold uppercase tracking-widest">
                <ShieldCheck size={16} />
                <span>Established 2014</span>
              </div>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-12 xl:col-span-2 xl:mt-0 xl:pl-12 border-l border-white/5">
            <div className="md:grid md:grid-cols-2 md:gap-12">
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-10">Engineering</h3>
                <ul role="list" className="space-y-5">
                  {navigation.product.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className="text-sm font-bold text-indigo-100/70 hover:text-blue-400 transition-all flex items-center gap-2 group"
                      >
                        <ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-10">The Agency</h3>
                <ul role="list" className="space-y-5">
                  {navigation.company.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className="text-sm font-bold text-indigo-100/70 hover:text-blue-400 transition-all flex items-center gap-2 group"
                      >
                        <ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-12">
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-10">Governance</h3>
                <ul role="list" className="space-y-5">
                  {navigation.legal.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className="text-sm font-bold text-indigo-100/70 hover:text-blue-400 transition-all flex items-center gap-2 group"
                      >
                        <ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0 bg-white/5 rounded-3xl p-8 border border-white/10 space-y-4">
                <Zap className="text-blue-400" size={32} />
                <h4 className="text-white font-black uppercase tracking-tighter text-xl">Work with us.</h4>
                <p className="text-xs text-indigo-200/50 font-medium leading-relaxed">Let's create something iconic together.</p>
                <Link to="/contact" className="inline-flex px-4 py-2 bg-white text-indigo-950 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-400 hover:text-white transition-all">
                  Start Project
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-24 border-t border-white/5 pt-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300/40">
            &copy; {new Date().getFullYear()} TOP Design Studio Ltd. Engineered in Rwanda.
          </p>
          <div className="flex gap-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300/40 border-r border-white/10 pr-8">256-bit Secure Encryption</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300/40">ISO 9001 Certified Quality</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
