import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '@/components/ecommerce/ProductCard'
import { fetchProducts, getImageUrl } from '@/api/apiClient'
import { Product } from '@/contexts/CartContext'
import {
  ArrowRight,
  Sparkles,
  Palette,
  Zap,
  Layers
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
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={getImageUrl('/uploads/one.png')}
            className="w-full h-full object-cover animate-ken-burns opacity-60"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/40 to-white" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600/20 backdrop-blur-md rounded-full border border-white/10 shadow-xl">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span className="text-sm font-bold text-white tracking-widest uppercase italic">Rwanda's Creative Powerhouse</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-none">
            Design that <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 animate-gradient">Moves Business</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto font-medium">
            From concept to execution, we redefine your brand identity across East Africa.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link to="/products" className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-lg hover:scale-105 transition-transform shadow-2xl">
              Explore Portfolio
            </Link>
            <Link to="/custom-design" className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:scale-105 transition-transform shadow-2xl flex items-center justify-center gap-2">
              Order Custom Design
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 2: THE STUDIO - Using two.png as background side */}
      <section className="py-20 relative overflow-hidden bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2 space-y-6">
            <span className="text-indigo-600 font-black uppercase tracking-widest text-xs italic">Art & Innovation</span>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight">We engineer <span className="italic text-indigo-600">icons.</span></h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Our creative studio merges technology with craftsmanship to deliver products that command attention.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <Zap className="text-indigo-600 mb-2" size={20} />
                <p className="font-bold text-sm">Fast Delivery</p>
              </div>
              <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <Palette className="text-indigo-600 mb-2" size={20} />
                <p className="font-bold text-sm">Expert Design</p>
              </div>
            </div>
          </div>
          <div className="md:w-1/2 h-[400px] overflow-hidden rounded-[2.5rem] shadow-elegant group">
            <img src={getImageUrl('/uploads/two.png')} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Studio" />
          </div>
        </div>
      </section>

      {/* SECTION 3: MASTERPIECES - Fixed Background three.jpg with Infinite Animations */}
      <section className="relative py-32 flex items-center justify-center text-white overflow-hidden bg-gradient-to-br from-indigo-950 via-blue-950 to-indigo-950 border-y border-indigo-500/10">
        {/* Glowing Blue Blobs */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-blob" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
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
          <h2 className="text-[22vw] font-black tracking-tighter whitespace-nowrap animate-drift text-indigo-300 drop-shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            TOP DESIGN • INNOVATION • EXCELLENCE
          </h2>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter italic animate-pulse text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-300 to-indigo-200">Capture Attention.</h2>
            <p className="text-xl text-indigo-200/60 max-w-2xl mx-auto font-medium">From billboards to business cards, we master every scale.</p>
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
                className="aspect-[4/5] rounded-3xl overflow-hidden border border-indigo-500/20 group shadow-[0_0_50px_-12px_rgba(79,70,229,0.3)] transition-all duration-700 hover:scale-110 hover:border-blue-400/50 animate-float"
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
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="mb-12">
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Our Top Solutions</h2>
            <div className="w-20 h-1 bg-indigo-600 mx-auto mt-2" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
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
            Start your <br /><span className="text-indigo-400 italic">Masterpiece</span>
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
