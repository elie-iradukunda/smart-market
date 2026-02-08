import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '@/components/ecommerce/ProductCard'
import { fetchProducts, fetchDesigns, getImageUrl } from '@/api/apiClient'
import { Product } from '@/contexts/CartContext'
import { Loader2, Search, Sparkles, SlidersHorizontal, Package, Layout } from 'lucide-react'

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [searchParams] = useSearchParams()
    const view = searchParams.get('view')
    const categoryParam = searchParams.get('category')
    const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || 'All')
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        loadProducts()
    }, [view])

    const loadProducts = async () => {
        setLoading(true)
        try {
            let data;
            if (view === 'designs') {
                const designsData = await fetchDesigns()
                // Map Design shape to Product shape for the UI
                data = designsData.map((d: any) => ({
                    id: d.id,
                    name: d.title,
                    description: d.category + ' - Professional Design',
                    price: Number(d.price) || 0,
                    image: d.preview_url,
                    category: d.category,
                    stock: 1,
                    rating: 5,
                    reviews: 0
                }))
            } else {
                data = await fetchProducts()
            }
            setProducts(data)
        } catch (error) {
            console.error('Failed to load products:', error)
            setProducts([])
        } finally {
            setLoading(false)
        }
    }

    const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))]

    const filteredProducts = products.filter((product: any) => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory

        // In public shop, only show active/published products
        const isActive = product.status === 'active' || product.status === 'published' || !product.status;

        return matchesSearch && matchesCategory && isActive
    })

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Premium Hero Section */}
            <div className="relative bg-indigo-950 pt-32 pb-48 overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0 opacity-20">
                    <img
                        src={getImageUrl('/uploads/six.png')}
                        className="w-full h-full object-cover animate-ken-burns scale-110"
                        alt="Background"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-indigo-950/90 to-slate-50" />
                </div>

                {/* Animated Watermark */}
                <div className="absolute inset-0 flex items-center justify-center z-0 opacity-[0.03] pointer-events-none select-none">
                    <span className="text-[20vw] font-black tracking-tighter whitespace-nowrap animate-drift">
                        {view === 'designs' ? 'CREATIVE SERVICES' : 'MARKET CATALOG'}
                    </span>
                </div>

                {/* Glowing Energy Blobs */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-blob" />
                    <div className="absolute top-1/2 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600/20 backdrop-blur-md rounded-full border border-white/10 shadow-xl">
                        <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                        <span className="text-sm font-bold text-white tracking-widest uppercase italic">
                            {view === 'designs' ? 'Top Tier Services' : 'Premium Retail'}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-none">
                        {view === 'designs' ? (
                            <>Professional <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-white to-purple-300">Design Studio</span></>
                        ) : (
                            <>Explore Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-white to-indigo-300">Shop Catalog</span></>
                        )}
                    </h1>

                    <p className="text-lg md:text-xl text-blue-100/70 max-w-2xl mx-auto font-medium">
                        {view === 'designs'
                            ? 'Bespoke creative solutions tailored to elevate your corporate identity across Rwanda'
                            : 'High-quality physical assets and marketing materials ready for professional deployment'}
                    </p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 pb-24">
                {/* Search and Filter Floating Bar - Glassmorphism */}
                <div className="bg-white/80 backdrop-blur-2xl p-6 rounded-[2.5rem] shadow-premium border border-white/20 mb-12 space-y-6 animate-fade-in-up animation-delay-200">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                        {/* Search Bar */}
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-400 group-focus-within:text-indigo-600 transition-colors w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search our catalog..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all text-slate-900 font-medium placeholder:text-slate-400"
                            />
                        </div>

                        {/* View Toggle Info */}
                        <div className="hidden lg:flex items-center gap-6 px-6 border-l border-slate-200/50">
                            <div className="text-left">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active View</p>
                                <div className="flex items-center gap-2 text-indigo-900 font-black">
                                    {view === 'designs' ? <Layout size={16} /> : <Package size={16} />}
                                    {view === 'designs' ? 'Services' : 'Products'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2 items-center">
                        <div className="flex items-center gap-2 px-3 py-2 text-slate-400">
                            <SlidersHorizontal size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Filters</span>
                        </div>
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${selectedCategory === category
                                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-105'
                                    : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-indigo-100 rounded-full animate-pulse" />
                            <Loader2 className="absolute inset-0 w-16 h-16 text-indigo-600 animate-spin" />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing Catalog...</p>
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className="space-y-8 animate-fade-in-up animation-delay-400">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                            <div className="flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs">
                                    {filteredProducts.length}
                                </span>
                                <span className="text-sm font-bold text-slate-500">Items matching criteria</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {filteredProducts.map((product, index) => (
                                <div
                                    key={product.id}
                                    className="animate-fade-in-up"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-32 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <Search size={40} />
                        </div>
                        <p className="text-2xl font-black text-slate-900">Zero Results Found</p>
                        <p className="text-slate-500 mt-2 font-medium">Try adjusting your filters or search terms</p>
                        <button
                            onClick={() => { setSearchQuery(''); setSelectedCategory('All') }}
                            className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all active:scale-95"
                        >
                            Reset All Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
