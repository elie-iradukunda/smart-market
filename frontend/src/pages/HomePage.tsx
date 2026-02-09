import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '@/components/ecommerce/ProductCard'
import { fetchProducts, getImageUrl } from '@/api/apiClient'
import { Product } from '@/contexts/CartContext'
import {
  ArrowRight,
  Sparkles,
  Palette,
  Zap
} from 'lucide-react'

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      const allData = await fetchProducts()
      // Filter for Retail Products only (Exclude designs/services)
      const retailProducts = allData.filter((p: Product) => {
        const cat = (p.category || '').toLowerCase()
        return !['design', 'print', 'banner', 'sign', 'card', 'flyer', 'poster', 'sticker', 'shirt', 'brand'].some(k => cat.includes(k))
      })
      setProducts(retailProducts.slice(0, 4)) // Show only 4 featured retail products
    } catch (err) {
      console.error('Failed to load home content', err)
    }
  }

  return (
    <div className="flex flex-col bg-white">
      {/* SECTION 1: HERO - Using one.png */}
      <section className="relative h-[95vh] flex items-center justify-center overflow-hidden bg-slate-950">
        {/* Deep Blue Professional Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={getImageUrl('/uploads/one.png')}
            className="w-full h-full object-cover animate-ken-burns opacity-40 scale-110"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-blue-900/60 to-indigo-950 mix-blend-multiply" />
          <div className="absolute inset-0 bg-black/20" />

          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/40 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center space-y-10 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-blue-500/10 backdrop-blur-xl rounded-full border border-blue-400/20 shadow-[0_0_20px_rgba(59,130,238,0.1)]">
            <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
            <span className="text-sm font-bold text-blue-100 tracking-[0.3em] uppercase italic">Rwanda's Creative Powerhouse</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter leading-[0.85] filter drop-shadow-2xl">
              Design that <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 animate-gradient">
                Moves Business
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100/80 max-w-2xl mx-auto font-medium leading-relaxed">
              From concept to execution, we redefine your brand identity across <span className="text-blue-400">East Africa.</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-6 pt-4">
            <Link to="/products" className="group relative px-10 py-5 bg-white text-blue-950 rounded-2xl font-black text-lg transition-all shadow-[0_20px_40px_-15px_rgba(255,255,255,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(255,255,255,0.5)] hover:-translate-y-1 active:scale-95 overflow-hidden">
              <span className="relative z-10">Explore Portfolio</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            <Link to="/custom-design" className="group relative px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-lg transition-all shadow-[0_20px_40px_-15px_rgba(37,99,235,0.4)] hover:shadow-[0_25px_50px_-12px_rgba(37,99,235,0.6)] hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2">
              Order Custom Design
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 2: THE STUDIO - Using two.png as background side */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-blue-50/50 to-white">
        {/* Decorative Blue Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyan-100/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2 space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100/50 backdrop-blur-sm rounded-full border border-blue-200 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-700 italic">Art & Innovation</span>
            </div>

            <h2 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight tracking-tighter">
              We engineer <br />
              <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">icons.</span>
            </h2>

            <p className="text-xl text-slate-600 leading-relaxed font-medium">
              Our creative studio merges technology with craftsmanship to deliver products that command attention and drive results.
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div className="group p-6 bg-white border border-blue-50 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all hover:-translate-y-1">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Zap size={24} />
                </div>
                <p className="font-black text-slate-900">Fast Delivery</p>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-bold">Standard turnaround</p>
              </div>
              <div className="group p-6 bg-white border border-blue-50 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all hover:-translate-y-1">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Palette size={24} />
                </div>
                <p className="font-black text-slate-900">Expert Design</p>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-bold">Bespoke excellence</p>
              </div>
            </div>
          </div>

          <div className="md:w-1/2 relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-[3rem] blur-2xl opacity-50" />
            <div className="relative h-[500px] overflow-hidden rounded-[2.5rem] shadow-2xl group border-4 border-white">
              <img src={getImageUrl('/uploads/two.png')} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Studio" />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MASTERPIECES - Fixed Background three.jpg with Infinite Animations */}
      <section className="relative py-32 flex items-center justify-center text-white overflow-hidden bg-gradient-to-br from-blue-950 via-slate-950 to-blue-950 border-y border-blue-500/10">
        {/* Glowing Blue Blobs */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-blob" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-600/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        </div>

        <div className="absolute inset-0 z-0">
          <img
            src={getImageUrl('/uploads/three.jpg')}
            className="w-full h-full object-cover opacity-[0.15] fixed-bg grayscale contrast-125 mix-blend-overlay"
            alt="Showcase Background"
          />
        </div>

        {/* Massive Animated Brand Watermark - Now more visible and on top of bg image */}
        <div className="absolute inset-0 flex items-center justify-center z-[1] pointer-events-none opacity-[0.15] overflow-hidden select-none">
          <h2 className="text-[22vw] font-black tracking-tighter whitespace-nowrap animate-drift text-blue-300 drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            TOP DESIGN • INNOVATION • EXCELLENCE
          </h2>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter italic animate-pulse text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-300 to-blue-200">Capture Attention.</h2>
            <p className="text-xl text-blue-200/60 max-w-2xl mx-auto font-medium">From billboards to business cards, we master every scale.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 items-center">
            {[
              { img: 'one.png', delay: '0ms', dur: '6s' },
              { img: 'four.png', delay: '500ms', dur: '8s' },
              { img: 'five.webp', delay: '1000ms', dur: '7s' },
              { img: 'six.png', delay: '1500ms', dur: '9s' }
            ].map((item, i) => (
              <div
                key={i}
                className="aspect-[4/5] rounded-3xl overflow-hidden border border-blue-500/20 group shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)] transition-all duration-700 hover:scale-110 hover:border-blue-400/50 animate-float"
                style={{
                  animationDelay: item.delay,
                  animationDuration: item.dur
                }}
              >
                <img
                  src={getImageUrl(`/uploads/${item.img}`)}
                  className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                  alt="Creative Masterpiece"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: SOLUTIONS - Grid of Products */}
      <section className="py-24 bg-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="mb-16 space-y-2">
            <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px]">Curated Collections</span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase">Our Top Solutions</h2>
            <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-16">
            <Link to="/products" className="inline-flex items-center gap-2 py-4 px-8 bg-white border border-blue-100 rounded-2xl text-blue-600 font-bold hover:bg-blue-600 hover:text-white transition-all shadow-sm">
              View All Products
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 5: CTA - Using six.png background */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={getImageUrl('/uploads/six.png')} className="w-full h-full object-cover opacity-40 animate-float" alt="CTA BG" />
          <div className="absolute inset-0 bg-slate-900/90" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center space-y-8">
          <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-none">
            Start your <br /><span className="text-blue-400 italic">Masterpiece</span>
          </h2>
          <Link to="/shop/register" className="inline-flex items-center gap-3 px-12 py-5 bg-white text-slate-900 rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-2xl">
            Register Today
            <ArrowRight />
          </Link>
        </div>
      </section>
    </div>
  )
}
