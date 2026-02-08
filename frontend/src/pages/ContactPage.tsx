import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Mail, Phone, MapPin, Send, Sparkles, Globe, Clock } from 'lucide-react'
import { toast } from 'react-toastify'
import { getImageUrl } from '@/api/apiClient'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const contactMethods = [
  {
    icon: Mail,
    title: 'Digital Correspondence',
    description: 'Our strategist team is ready to review your brief.',
    contact: 'hello@topdesign.com',
    href: 'mailto:hello@topdesign.com',
    color: 'bg-blue-500/10 text-blue-400'
  },
  {
    icon: Phone,
    title: 'Direct Line',
    description: 'Instant creative consultation via our Rwanda office.',
    contact: '+250 780 000 000',
    href: 'tel:+250780000000',
    color: 'bg-indigo-500/10 text-indigo-400'
  },
  {
    icon: MapPin,
    title: 'The Studio',
    description: 'Visit our creative facility for a personal session.',
    contact: 'Kigali, Rwanda',
    href: '#',
    color: 'bg-purple-500/10 text-purple-400'
  }
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
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch(`${API_BASE}/communication/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      if (data.success) {
        toast.success(data.message || 'Message sent successfully!')
        setFormData({ name: '', email: '', company: '', subject: '', message: '' })
      } else {
        throw new Error(data.error || 'Failed to send message')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen overflow-hidden">
      {/* SECTION 1: PREMIUM HERO */}
      <section className="relative pt-40 pb-56 flex items-center justify-center overflow-hidden bg-indigo-950">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
          <img
            src={getImageUrl('/uploads/six.png')}
            className="w-full h-full object-cover animate-ken-burns opacity-30 mix-blend-overlay scale-110"
            alt="Contact Background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-indigo-950/80 to-slate-50" />
        </div>

        {/* Drifting Brand Watermark */}
        <div className="absolute inset-0 flex items-center justify-center z-0 opacity-[0.03] pointer-events-none select-none overflow-hidden">
          <h2 className="text-[25vw] font-black tracking-tighter whitespace-nowrap animate-drift text-white">
            START YOUR PROJECT • GET IN TOUCH • CONNECT
          </h2>
        </div>

        {/* Ambient Glows */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-blob" />
          <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600/20 backdrop-blur-md rounded-full border border-white/10 shadow-xl">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span className="text-sm font-bold text-white tracking-widest uppercase italic">The Creative Brief</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-none">
            Ready to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-white to-indigo-300">Level Up?</span>
          </h1>

          <p className="text-xl text-blue-100/70 max-w-3xl mx-auto font-medium leading-relaxed">
            Whether it's a massive billboard or a nationwide branding rollout, we've got the machinery and the mindset.
          </p>
        </div>
      </section>

      {/* SECTION 2: CONTACT GRID & FORM */}
      <section className="relative -mt-24 z-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Side: Methods */}
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-white/80 backdrop-blur-2xl p-10 rounded-[3rem] shadow-premium border border-white/20 space-y-12 animate-fade-in-up">
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-indigo-950 uppercase tracking-tighter italic">Channels of Success.</h2>
                  <div className="w-12 h-1 bg-indigo-600 rounded-full" />
                </div>

                <div className="space-y-8">
                  {contactMethods.map((method, i) => (
                    <a
                      key={i}
                      href={method.href}
                      className="flex items-center gap-6 group hover:translate-x-2 transition-transform duration-300"
                    >
                      <div className={`w-14 h-14 rounded-2xl ${method.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <method.icon size={28} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{method.title}</p>
                        <p className="text-lg font-black text-indigo-900">{method.contact}</p>
                      </div>
                    </a>
                  ))}
                </div>

                <div className="pt-8 border-t border-slate-100 grid grid-cols-2 gap-6">
                  <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
                    <Clock className="text-indigo-600" size={18} />
                    <span>8AM • 6PM (CAT)</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
                    <Globe className="text-indigo-600" size={18} />
                    <span>Musanze & Kigali</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Form */}
            <div className="lg:col-span-7">
              <div className="bg-indigo-950 p-10 md:p-16 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                {/* Blob Inner */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -mr-32 -mt-32" />

                <div className="relative z-10 space-y-10">
                  <div className="space-y-4">
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight uppercase">Submit your <br /><span className="italic text-indigo-400">Masterplan.</span></h2>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-indigo-300 ml-4 italic">Full Name</label>
                        <input
                          name="name" required value={formData.name} onChange={handleChange}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-4 focus:ring-indigo-500/20 focus:bg-white/10 transition-all outline-none" placeholder="Identity..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-indigo-300 ml-4 italic">Digital Address</label>
                        <input
                          name="email" type="email" required value={formData.email} onChange={handleChange}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-4 focus:ring-indigo-500/20 focus:bg-white/10 transition-all outline-none" placeholder="Email..."
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-indigo-300 ml-4 italic">Strategy Topic</label>
                      <select
                        name="subject" required value={formData.subject} onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-4 focus:ring-indigo-500/20 focus:bg-white/10 transition-all outline-none appearance-none"
                      >
                        <option value="" className="text-indigo-900">Select Department...</option>
                        <option value="sales" className="text-indigo-900">High-Impact Sales</option>
                        <option value="support" className="text-indigo-900">Creative Support</option>
                        <option value="partnership" className="text-indigo-900">Strategic Alliance</option>
                        <option value="other" className="text-indigo-900">General Inquiry</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-indigo-300 ml-4 italic">The Blueprint Details</label>
                      <textarea
                        name="message" required rows={5} value={formData.message} onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-4 focus:ring-indigo-500/20 focus:bg-white/10 transition-all outline-none resize-none" placeholder="Tell us about the project..."
                      />
                    </div>

                    <button
                      disabled={isSubmitting}
                      className="w-full py-5 bg-white text-indigo-950 rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {isSubmitting ? 'Transmitting...' : 'Initiate Communication'}
                      <Send size={20} className={isSubmitting ? 'animate-pulse' : ''} />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
