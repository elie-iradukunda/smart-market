// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { fetchSellableMaterials, recordMaterialSale, fetchMaterialSales, fetchCustomers } from '../../api/apiClient'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { currentUserHasPermission } from '@/utils/apiClient'
import { ShoppingCart, Plus, Search, Package, DollarSign, Calendar } from 'lucide-react'
import { toast } from 'react-toastify'

export default function MaterialSalesPage() {
  const [materials, setMaterials] = useState([])
  const [customers, setCustomers] = useState([])
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    material_id: '',
    customer_id: '',
    metres_sold: '',
    price_per_metre: '',
    notes: ''
  })
  const [selectedMaterial, setSelectedMaterial] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [materialsData, customersData, salesData] = await Promise.all([
        fetchSellableMaterials().catch((err) => {
          console.error('Error fetching sellable materials:', err)
          toast.error('Failed to load sellable materials. Make sure materials are marked as sellable with prices set.')
          return []
        }),
        fetchCustomers().catch(() => []),
        fetchMaterialSales({ limit: 50 }).catch(() => ({ data: [], pagination: {} }))
      ])
      setMaterials(Array.isArray(materialsData) ? materialsData : [])
      setCustomers(Array.isArray(customersData) ? customersData : [])
      setSales(salesData.data || [])
      
      // Show helpful message if no sellable materials
      if (Array.isArray(materialsData) && materialsData.length === 0) {
        toast.info('No sellable materials found. Please set prices and mark materials as sellable in Material Pricing page.', {
          autoClose: 5000
        })
      }
    } catch (err) {
      console.error('Error loading data:', err)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleMaterialChange = (materialId) => {
    const material = materials.find(m => m.id === parseInt(materialId))
    setSelectedMaterial(material)
    setFormData({
      ...formData,
      material_id: materialId,
      price_per_metre: material?.price_per_metre || '',
      metres_sold: '' // Reset metres when material changes
    })
  }

  const handleMetresChange = (value) => {
    const metres = parseFloat(value) || 0
    setFormData({ ...formData, metres_sold: value })
    
    // Real-time validation
    if (selectedMaterial && metres > (selectedMaterial.current_stock || 0)) {
      // Error will be shown in the UI
    }
  }

  const getStockValidation = () => {
    if (!selectedMaterial || !formData.metres_sold) return null
    
    const availableStock = parseFloat(selectedMaterial.current_stock) || 0
    const metresToSell = parseFloat(formData.metres_sold) || 0
    
    if (metresToSell > availableStock) {
      return {
        error: true,
        message: `Insufficient stock. Available: ${availableStock.toFixed(2)} metres`
      }
    }
    
    if (metresToSell <= 0) {
      return {
        error: true,
        message: 'Metres sold must be greater than 0'
      }
    }
    
    return {
      error: false,
      message: `${(availableStock - metresToSell).toFixed(2)} metres will remain in stock`
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Frontend validation
    const stockValidation = getStockValidation()
    if (stockValidation?.error) {
      toast.error(stockValidation.message)
      return
    }
    
    try {
      const payload = {
        material_id: parseInt(formData.material_id),
        metres_sold: parseFloat(formData.metres_sold),
        price_per_metre: formData.price_per_metre ? parseFloat(formData.price_per_metre) : undefined,
        customer_id: formData.customer_id ? parseInt(formData.customer_id) : undefined,
        notes: formData.notes || undefined
      }

      await recordMaterialSale(payload)
      toast.success('Material sale recorded successfully')
      setShowForm(false)
      setFormData({
        material_id: '',
        customer_id: '',
        metres_sold: '',
        price_per_metre: '',
        notes: ''
      })
      setSelectedMaterial(null)
      loadData()
    } catch (err) {
      toast.error(err.message || 'Failed to record sale')
    }
  }

  const calculateTotal = () => {
    const metres = parseFloat(formData.metres_sold) || 0
    const price = parseFloat(formData.price_per_metre) || 0
    return (metres * price).toFixed(2)
  }

  if (!currentUserHasPermission('material.sell')) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Package className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to record material sales.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 mb-2">
                Inventory
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Material Sales</h1>
              <p className="mt-2 text-gray-500 max-w-xl">
                Record sales of materials sold by the metre (e.g., banners, vinyl rolls).
              </p>
            </div>

            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 hover:shadow-emerald-500/40 transition-all"
            >
              <Plus className="h-5 w-5" />
              {showForm ? 'Cancel' : 'Record Sale'}
            </button>
          </div>
        </div>

        {/* Sales Form */}
        {showForm && (
          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Record New Sale</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Material <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.material_id}
                    onChange={(e) => handleMaterialChange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                    disabled={materials.length === 0}
                  >
                    <option value="">
                      {materials.length === 0 
                        ? 'No sellable materials available. Set prices in Material Pricing first.' 
                        : 'Select material...'}
                    </option>
                    {materials.map((m) => {
                      const stock = parseFloat(m.current_stock || 0)
                      const isOutOfStock = stock <= 0
                      return (
                        <option 
                          key={m.id} 
                          value={m.id}
                          disabled={isOutOfStock}
                        >
                          {m.name} 
                          {m.price_per_metre ? ` (RWF ${parseFloat(m.price_per_metre).toLocaleString()}/m)` : ''}
                          {isOutOfStock ? ' - OUT OF STOCK' : ` - Stock: ${stock.toFixed(2)}m`}
                        </option>
                      )
                    })}
                  </select>
                  {materials.length === 0 && (
                    <p className="mt-2 text-sm text-amber-600">
                      <span className="font-medium">Tip:</span> Go to <a href="/inventory/material-pricing" className="text-emerald-600 hover:underline font-medium">Material Pricing</a> to set prices and mark materials as sellable.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer (Optional)
                  </label>
                  <select
                    value={formData.customer_id}
                    onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                  >
                    <option value="">No customer</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.phone ? `(${c.phone})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Metres Sold <span className="text-red-500">*</span>
                    {selectedMaterial && (
                      <span className="ml-2 text-xs font-normal text-gray-500">
                        (Available: {parseFloat(selectedMaterial.current_stock || 0).toFixed(2)} m)
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={selectedMaterial ? selectedMaterial.current_stock : undefined}
                    required
                    value={formData.metres_sold}
                    onChange={(e) => handleMetresChange(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:ring-2 ${
                      getStockValidation()?.error
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-200'
                    }`}
                    placeholder="0.00"
                  />
                  {getStockValidation() && (
                    <p className={`mt-1.5 text-xs ${
                      getStockValidation().error
                        ? 'text-red-600 font-medium'
                        : 'text-emerald-600'
                    }`}>
                      {getStockValidation().message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per Metre (RWF)
                    {selectedMaterial?.price_per_metre && (
                      <span className="text-gray-500 text-xs ml-2">
                        (Default: {parseFloat(selectedMaterial.price_per_metre).toLocaleString()})
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price_per_metre}
                    onChange={(e) => setFormData({ ...formData, price_per_metre: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                    placeholder={selectedMaterial?.price_per_metre || "0.00"}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                    placeholder="Additional notes about this sale..."
                  />
                </div>
              </div>

              {formData.metres_sold && formData.price_per_metre && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Total Amount:</span>
                    <span className="text-2xl font-bold text-emerald-700">
                      RWF {parseFloat(calculateTotal()).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setFormData({
                      material_id: '',
                      customer_id: '',
                      metres_sold: '',
                      price_per_metre: '',
                      notes: ''
                    })
                    setSelectedMaterial(null)
                  }}
                  className="px-6 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/30"
                >
                  Record Sale
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Sales History */}
        <div className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Sales</h2>
          </div>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              <p className="mt-4 text-gray-600">Loading sales...</p>
            </div>
          ) : sales.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No sales recorded yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metres</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price/M</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sold By</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(sale.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {sale.material_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sale.customer_name || 'Walk-in'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {parseFloat(sale.metres_sold).toFixed(2)} m
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        RWF {parseFloat(sale.price_per_metre).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        RWF {parseFloat(sale.total_amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sale.sold_by_name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

