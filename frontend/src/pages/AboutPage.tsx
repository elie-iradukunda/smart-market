import { Users, Sparkles, Shield, Lightbulb, Zap } from 'lucide-react'
import { getImageUrl } from '@/api/apiClient'

const values = [
  {
    icon: Lightbulb,
    title: 'Creative Excellence',
    description: 'We push the boundaries of visual storytelling, ensuring your brand stands out with unique, industry-leading innovation.',
    color: 'bg-blue-500/10 text-blue-400'
  },
  {
    icon: Shield,
    title: 'Quality Authority',
    description: 'From heavy-duty billboards to precise corporate stationery, our craftsmanship is engineered for durability and impact.',
    color: 'bg-indigo-500/10 text-indigo-400'
  },
  {
    icon: Users,
    title: 'Partnership First',
    description: 'We dont just work for you; we work with you. Your vision is the blueprint for our engineering process.',
    color: 'bg-purple-500/10 text-purple-400'
  },
  {
    icon: Zap,
    title: 'High-Response Delivery',
    description: 'Our workflows are optimized for speed without compromising the premium finish that TOP Design is known for.',
    color: 'bg-amber-500/10 text-amber-400'
  },
]

const stats = [
  { label: 'High-Impact Projects', value: '5,000+' },
  { label: 'Strategic Partners', value: '2,500+' },
  { label: 'Industry Leadership', value: '10+ Years' },
  { label: 'Creative Solutions', value: 'Unlimited' },
]

export default function AboutPage() {
  return (
    <div className="flex flex-col bg-slate-50 overflow-hidden">
      {/* SECTION 1: PREMIUM HERO */}
      <section className="relative pt-40 pb-56 flex items-center justify-center overflow-hidden bg-indigo-950">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
          <img
            src={getImageUrl('/uploads/one.png')}
            className="w-full h-full object-cover animate-ken-burns opacity-30 mix-blend-overlay"
            alt="About Background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-indigo-950/80 to-slate-50" />
        </div>

        {/* Drifting Brand Watermark */}
        <div className="absolute inset-0 flex items-center justify-center z-0 opacity-[0.03] pointer-events-none select-none overflow-hidden">
          <h2 className="text-[25vw] font-black tracking-tighter whitespace-nowrap animate-drift text-white">
            THE STUDIO • THE LEGACY • THE DESIGN
          </h2>
        </div>

        {/* Ambient Glows */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-blob" />
          <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600/20 backdrop-blur-md rounded-full border border-white/10 shadow-xl">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span className="text-sm font-bold text-white tracking-widest uppercase italic">Architects of Identity</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-none">
            We are <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-white to-purple-300">TOP Design.</span>
          </h1>

          <p className="text-xl text-blue-100/70 max-w-3xl mx-auto font-medium leading-relaxed">
            Rwanda's premier creative engineering house, dedicated to transforming abstract visions into high-impact visual realities.
          </p>
        </div>
      </section>

      {/* SECTION 2: THE STORY - TWO COLUMN GRID */}
      <section className="relative py-32 -mt-24 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-[3rem] shadow-premium overflow-hidden flex flex-col lg:flex-row items-stretch border border-slate-100">
            <div className="lg:w-1/2 p-12 md:p-20 space-y-8 flex flex-col justify-center">
              <div className="space-y-4">
                <span className="text-indigo-600 font-black uppercase tracking-widest text-xs italic">Our Heritage</span>
                <h2 className="text-4xl md:text-6xl font-black text-indigo-950 leading-tight">Engineering <br /><span className="italic text-indigo-600">Icons.</span></h2>
              </div>

              <div className="space-y-6 text-slate-600 leading-relaxed text-lg">
                <p>
                  TOP Design Ltd was born from a simple realization: **Great design should be an engine for business growth, not just an ornament.**
                </p>
                <p>
                  What started as a specialized design cell in Kigali has evolved into Rwanda's most trusted creative powerhouse. We have spent over a decade perfecting the intersection of **craftsmanship and scale**.
                </p>
                <p>
                  Whether it's the precision of an embroidered logo or the massive presence of a capital billboard, our team treats every project as a masterpiece in engineering.
                </p>
              </div>

              <div className="pt-8 grid grid-cols-2 gap-8 border-t border-slate-100">
                {stats.slice(0, 2).map((s, i) => (
                  <div key={i}>
                    <p className="text-3xl font-black text-indigo-600 tracking-tight">{s.value}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:w-1/2 relative min-h-[400px]">
              <img
                src={getImageUrl('/uploads/two.png')}
                className="absolute inset-0 w-full h-full object-cover"
                alt="The Studio"
              />
              <div className="absolute inset-0 bg-indigo-900/10 mix-blend-overlay" />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: CORE VALUES - GRID */}
      <section className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-20">
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-indigo-950 tracking-tighter uppercase">Our Core Pillars</h2>
            <div className="w-24 h-1.5 bg-indigo-600 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v, i) => (
              <div
                key={i}
                className="group bg-white p-10 rounded-[2.5rem] shadow-elegant border border-slate-100 hover:border-indigo-500/30 hover:scale-105 transition-all duration-500 text-left space-y-6"
              >
                <div className={`w-16 h-16 rounded-2xl ${v.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <v.icon size={32} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-black text-indigo-900">{v.title}</h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">{v.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: CAPABILITIES - DARK THEME */}
      <section className="relative py-32 bg-indigo-950 text-white overflow-hidden">
        {/* Luminous Glow */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-600/30 rounded-full blur-[150px] animate-pulse" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-indigo-100 uppercase">Mastery at scale.</h2>
              <p className="text-xl text-blue-100/60 font-medium leading-relaxed">
                Our facility is equipped with the latest in digital fabrication and industrial printing technology, allowing us to maintain boutique design quality at heavy-industry volumes.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8">
                {['Billboard Engineering', 'Corporate Identity', 'Industrial Garments', 'Visual Strategy'].map((cap, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                    <Shield className="text-indigo-400" size={20} />
                    <span className="font-bold text-sm text-blue-100">{cap}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative aspect-square">
              <div className="absolute inset-0 border-2 border-dashed border-indigo-400/30 rounded-full animate-spin-slow" />
              <div className="absolute inset-8 rounded-full overflow-hidden shadow-2xl shadow-blue-500/20">
                <img src={getImageUrl('/uploads/three.jpg')} className="w-full h-full object-cover grayscale opacity-80" alt="Mastery" />
                <div className="absolute inset-0 bg-indigo-900/40" />
              </div>
              {/* Floating elements */}
              <div className="absolute top-0 right-0 p-6 bg-white rounded-3xl shadow-2xl animate-float">
                <p className="text-4xl font-black text-indigo-600">100%</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Precision Rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
