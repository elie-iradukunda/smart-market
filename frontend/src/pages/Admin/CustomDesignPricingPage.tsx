import { useState, useEffect } from 'react'
import {
    Layout,
    Plus,
    Save,
    Trash2,
    Edit,
    CheckCircle,
    XCircle,
    Settings,
    ArrowLeft,
    Info
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import DashboardLayout from '@/components/layout/DashboardLayout'
import {
    fetchAllCustomDesignSettings,
    updateCustomDesignSetting,
    createCustomDesignSetting,
    deleteCustomDesignSetting
} from '@/api/apiClient'
import { toast } from 'react-toastify'

export default function CustomDesignPricingPage() {
    const [settings, setSettings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)
    const [newProduct, setNewProduct] = useState({
        product_key: '',
        name: '',
        description: '',
        price_per_sqm: ''
    })

    const loadSettings = async () => {
        try {
            setLoading(true)
            const data = await fetchAllCustomDesignSettings()
            setSettings(data)
        } catch (error) {
            toast.error('Failed to load settings')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadSettings()
    }, [])

    const handleUpdate = async (id: number, updatedData: any) => {
        try {
            await updateCustomDesignSetting(id, updatedData)
            toast.success('Setting updated')
            loadSettings()
        } catch (error) {
            toast.error('Failed to update')
        }
    }

    const handleCreate = async () => {
        if (!newProduct.product_key || !newProduct.name || !newProduct.price_per_sqm) {
            toast.warn('Please fill required fields')
            return
        }
        try {
            await createCustomDesignSetting(newProduct)
            toast.success('New product type added')
            setIsAdding(false)
            setNewProduct({ product_key: '', name: '', description: '', price_per_sqm: '' })
            loadSettings()
        } catch (error) {
            toast.error('Failed to create')
        }
    }

    const handleDelete = async (id: number) => {
        if (!window.confirm('Delete this product type?')) return
        try {
            await deleteCustomDesignSetting(id)
            toast.success('Deleted')
            loadSettings()
        } catch (error) {
            toast.error('Failed to delete')
        }
    }

    return (
        <DashboardLayout>
            <div className="p-8 max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-600 mb-2">
                            <Settings className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-widest italic">Management Console</span>
                        </div>
                        <h1 className="text-3xl font-black text-indigo-950 uppercase italic tracking-tighter">
                            Custom Design <span className="text-indigo-600">Pricing</span>
                        </h1>
                        <p className="text-sm text-slate-500 font-medium">Configure unit prices and available product types for the Design Studio.</p>
                    </div>
                    <Button
                        onClick={() => setIsAdding(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 px-6 flex items-center gap-2 shadow-lg shadow-indigo-100"
                    >
                        <Plus className="w-4 h-4" />
                        Add Product Type
                    </Button>
                </div>

                {/* Add New Form */}
                {isAdding && (
                    <Card className="p-8 border-2 border-indigo-100 bg-indigo-50/30 animate-fade-in-up">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black text-indigo-900 uppercase italic">Create New Product Type</h3>
                            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-red-500">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Product Key (Slug)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. roll-up"
                                    value={newProduct.product_key}
                                    onChange={(e) => setNewProduct({ ...newProduct, product_key: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-950"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Display Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Roll-up Banner"
                                    value={newProduct.name}
                                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-950"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Price (RWF / m²)</label>
                                <input
                                    type="number"
                                    placeholder="25000"
                                    value={newProduct.price_per_sqm}
                                    onChange={(e) => setNewProduct({ ...newProduct, price_per_sqm: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-950"
                                />
                            </div>
                            <div className="flex items-end">
                                <Button onClick={handleCreate} className="w-full bg-indigo-600 text-white rounded-xl py-3 shadow-lg shadow-indigo-100">
                                    Save Product
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Settings Table */}
                <Card className="overflow-hidden border-slate-100 shadow-premium rounded-[2rem]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Product Info</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Unit Price (m²)</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Syncing Pricing...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : settings.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="p-4 bg-slate-50 rounded-2xl">
                                                    <Layout className="w-12 h-12 text-slate-200" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-slate-400 font-bold italic">No custom product types defined yet.</p>
                                                    <p className="text-[10px] text-slate-300 font-medium uppercase tracking-widest">Pricing for the Design Studio is not configured.</p>
                                                </div>
                                                <Button
                                                    onClick={async () => {
                                                        const defaults = [
                                                            { product_key: 'signboard', name: 'Signboard', price_per_sqm: 45000, description: 'Durable outdoor & indoor signboards' },
                                                            { product_key: 'banner', name: 'Banner', price_per_sqm: 15000, description: 'High-quality vinyl PVC banners' },
                                                            { product_key: 'shirt', name: 'T-shirt printing', price_per_sqm: 8500, description: 'Custom garment & apparel branding' },
                                                            { product_key: 'other', name: 'Others', price_per_sqm: 20000, description: 'Miscellaneous design services' }
                                                        ];
                                                        try {
                                                            setLoading(true);
                                                            for (const item of defaults) {
                                                                await createCustomDesignSetting(item);
                                                            }
                                                            toast.success('Default categories initialized');
                                                            loadSettings();
                                                        } catch (err) {
                                                            toast.error('Failed to initialize defaults');
                                                        } finally {
                                                            setLoading(false);
                                                        }
                                                    }}
                                                    className="mt-4 bg-slate-900 hover:bg-black text-white rounded-xl py-2 px-6 text-xs font-black uppercase tracking-widest"
                                                >
                                                    Initialize Default Categories
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (

                                    settings.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6 border-b border-slate-50">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                                        <Layout className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-indigo-950 uppercase italic leading-none mb-1">{item.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold tracking-widest">KEY: {item.product_key}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 border-b border-slate-50 text-center">
                                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl group-hover:bg-white transition-colors">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase">RWF</span>
                                                    <input
                                                        type="number"
                                                        value={item.price_per_sqm}
                                                        onChange={(e) => {
                                                            const val = e.target.value
                                                            setSettings(prev => prev.map(s => s.id === item.id ? { ...s, price_per_sqm: val } : s))
                                                        }}
                                                        onBlur={(e) => handleUpdate(item.id, { ...item, price_per_sqm: e.target.value })}
                                                        className="w-24 bg-transparent border-none outline-none font-black text-indigo-950 text-center"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 border-b border-slate-50 text-center">
                                                <button
                                                    onClick={() => handleUpdate(item.id, { ...item, is_active: !item.is_active })}
                                                    className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all ${item.is_active
                                                        ? 'bg-green-50 text-green-600 border-green-100'
                                                        : 'bg-slate-50 text-slate-400 border-slate-100'
                                                        }`}
                                                >
                                                    {item.is_active ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="px-8 py-6 border-b border-slate-50 text-right space-x-2">
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Info Card */}
                <div className="bg-indigo-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden flex flex-col md:flex-row items-center gap-8 border border-white/5">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl -mr-20 -mt-20 opacity-50" />
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/10 shrink-0">
                        <Info className="w-8 h-8 text-indigo-300" />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-xl font-black uppercase italic tracking-tighter">Pro Tip: Scaling Pricing</h4>
                        <p className="text-sm text-indigo-200/70 font-medium max-w-2xl">
                            Updating prices here reflects immediately in the Design Studio for both customers and staff.
                            Ensure the <span className="text-white font-bold">Product Key</span> matches the predefined logic if you want specific icons to appear,
                            otherwise a default icon will be used.
                        </p>
                    </div>
                    <Link to="/dashboard/admin/design/hub" className="md:ml-auto px-6 py-3 bg-white text-indigo-950 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-indigo-50 transition-all shrink-0">
                        Back to Design Hub
                    </Link>
                </div>
            </div>
        </DashboardLayout>
    )
}
