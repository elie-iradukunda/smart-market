// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPurchaseOrder, fetchSuppliers, fetchMaterials, fetchPurchaseOrder, updatePurchaseOrder } from '../../api/apiClient';
import { toast } from 'react-toastify';
import { format, addDays, parseISO } from 'date-fns';
import {
  ArrowLeft,
  Save,
  Printer,
  Trash2,
  Plus,
  FileText,
  Calendar,
  Truck,
  CreditCard,
  Building2,
  Package
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getAuthUser } from '@/utils/apiClient';

// Types
interface Supplier {
  id: number;
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface Material {
  id: number;
  name: string;
  code?: string;
  unit?: string;
  unit_price?: number;
}

interface OrderItem {
  id?: number;
  material_id: string | number;
  quantity: number;
  unit_price: number;
  total: number;
  material?: Material;
}

interface FormData {
  supplier_id: string;
  reference_number: string;
  order_date: string;
  expected_delivery: string;
  delivery_address: string;
  payment_terms: string;
  notes: string;
  status: string;
  items: OrderItem[];
}

const PAYMENT_TERMS = [
  { value: 'prepaid', label: 'Prepaid' },
  { value: 'net_7', label: 'Net 7 Days' },
  { value: 'net_15', label: 'Net 15 Days' },
  { value: 'net_30', label: 'Net 30 Days' },
  { value: 'net_60', label: 'Net 60 Days' },
  { value: 'cod', label: 'Cash on Delivery' }
];

export default function PurchaseOrderDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const user = getAuthUser();

  const [formData, setFormData] = useState<FormData>({
    supplier_id: '',
    reference_number: `PO-${Date.now().toString().slice(-6)}`,
    order_date: format(new Date(), 'yyyy-MM-dd'),
    expected_delivery: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    delivery_address: '',
    payment_terms: 'net_30',
    notes: '',
    status: 'draft',
    items: [{ material_id: '', quantity: 1, unit_price: 0, total: 0 }]
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Load suppliers and materials
  useEffect(() => {
    const loadData = async () => {
      try {
        const [suppliersResponse, materialsResponse] = await Promise.all([
          fetchSuppliers(),
          fetchMaterials()
        ]);

        const suppliersData = Array.isArray(suppliersResponse?.data)
          ? suppliersResponse.data
          : Array.isArray(suppliersResponse)
            ? suppliersResponse
            : [];

        const materialsData = Array.isArray(materialsResponse?.data)
          ? materialsResponse.data
          : Array.isArray(materialsResponse)
            ? materialsResponse
            : [];

        setSuppliers(suppliersData);
        setMaterials(materialsData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load base data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Load existing PO if editing
  useEffect(() => {
    if (isNew) {
      setInitialLoading(false);
      return;
    }

    const loadPO = async () => {
      try {
        const po = await fetchPurchaseOrder(id);

        setFormData({
          supplier_id: po.supplier_id || '',
          reference_number: po.reference_number || '',
          order_date: po.order_date ? format(parseISO(po.order_date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
          expected_delivery: po.expected_delivery ? format(parseISO(po.expected_delivery), 'yyyy-MM-dd') : '',
          delivery_address: po.delivery_address || '',
          payment_terms: po.payment_terms || 'net_30',
          notes: po.notes || '',
          status: po.status || 'draft',
          items: Array.isArray(po.items) ? po.items.map((item: any) => ({
            id: item.id,
            material_id: item.material_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total: item.total_price || (item.quantity * item.unit_price),
            material: item.material
          })) : []
        });
      } catch (error) {
        console.error('Error loading PO:', error);
        toast.error('Failed to load purchase order details');
        navigate('/inventory/purchase-orders');
      } finally {
        setInitialLoading(false);
      }
    };

    loadPO();
  }, [id, isNew, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    const item = { ...newItems[index], [field]: value };

    if (field === 'quantity' || field === 'unit_price') {
      const quantity = field === 'quantity' ? parseFloat(value) || 0 : item.quantity;
      const unitPrice = field === 'unit_price' ? parseFloat(value) || 0 : item.unit_price;
      item.total = quantity * unitPrice;
    }

    if (field === 'material_id') {
      const material = materials.find(m => String(m.id) === String(value));
      if (material && material.unit_price) {
        item.unit_price = material.unit_price;
        item.total = (item.quantity || 0) * material.unit_price;
      }
    }

    newItems[index] = item;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { material_id: '', quantity: 1, unit_price: 0, total: 0 }]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, items: newItems }));
    }
  };

  const calculateSubtotal = (): number => {
    return formData.items.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  const calculateTax = (): number => {
    return calculateSubtotal() * 0.18; // 18% tax
  };

  const calculateTotal = (): number => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const orderData = {
        ...formData,
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        total: calculateTotal(),
        created_by: user?.id || null
      };

      if (isNew) {
        const createdOrder = await createPurchaseOrder(orderData);
        toast.success('Purchase order created successfully!');
        navigate(`/inventory/purchase-orders/${createdOrder.id}`);
      } else {
        await updatePurchaseOrder(id, orderData);
        toast.success('Purchase order updated successfully!');
      }
    } catch (error: any) {
      console.error('Error saving purchase order:', error);
      toast.error(error.message || 'Failed to save purchase order');
    } finally {
      setSubmitting(false);
    }
  };

  const getMaterialOptions = (currentMaterialId: string | number = '') => {
    if (!materials || !Array.isArray(materials)) return null;

    return materials
      .filter(material =>
        !formData.items.some((item, idx) =>
          String(item.material_id) === String(material.id) &&
          String(material.id) !== String(currentMaterialId)
        )
      )
      .map(material => (
        <option key={material.id} value={material.id}>
          {material.name} {material.code ? `(${material.code})` : ''}
        </option>
      ));
  };

  if (initialLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
            <p className="text-gray-600 font-medium">Loading order details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const selectedSupplier = suppliers.find(s => String(s.id) === String(formData.supplier_id));

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/inventory/purchase-orders')}
                className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {isNew ? 'New Purchase Order' : formData.reference_number}
                  </h1>
                  {!isNew && (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${formData.status === 'received' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        formData.status === 'sent' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          formData.status === 'approved' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            'bg-gray-100 text-gray-700 border-gray-200'
                      }`}>
                      {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {isNew ? 'Create a new purchase order for your suppliers' : `Order Date: ${format(parseISO(formData.order_date), 'MMM dd, yyyy')}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-all"
              >
                <Printer size={18} className="mr-2" />
                Print
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center px-5 py-2.5 rounded-xl border border-transparent bg-gradient-to-r from-indigo-600 to-indigo-700 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:from-indigo-700 hover:to-indigo-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} className="mr-2" />
                {submitting ? 'Saving...' : 'Save Order'}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">

              {/* Supplier & Order Info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                  <div className="flex items-center gap-2">
                    <Building2 size={20} className="text-indigo-600" />
                    <h3 className="font-semibold text-gray-900">Supplier & Order Information</h3>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Supplier <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="supplier_id"
                      value={formData.supplier_id}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition"
                      disabled={loading || suppliers.length === 0}
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    {selectedSupplier && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                        <p><span className="font-medium">Contact:</span> {selectedSupplier.contact || 'N/A'}</p>
                        {selectedSupplier.email && <p><span className="font-medium">Email:</span> {selectedSupplier.email}</p>}
                        {selectedSupplier.phone && <p><span className="font-medium">Phone:</span> {selectedSupplier.phone}</p>}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">PO Number</label>
                    <input
                      type="text"
                      name="reference_number"
                      value={formData.reference_number}
                      onChange={handleChange}
                      className="w-full rounded-xl border-gray-300 bg-gray-50 text-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Order Date</label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        name="order_date"
                        value={formData.order_date}
                        onChange={handleChange}
                        className="w-full pl-10 rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package size={20} className="text-emerald-600" />
                    <h3 className="font-semibold text-gray-900">Order Items</h3>
                  </div>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition"
                  >
                    <Plus size={16} />
                    Add Item
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Material</th>
                        <th className="px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider w-28">Quantity</th>
                        <th className="px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider w-36">Unit Price</th>
                        <th className="px-6 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider w-36 text-right">Total</th>
                        <th className="px-6 py-3 w-16"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {formData.items.map((item, index) => (
                        <tr key={index} className="group hover:bg-gray-50/50 transition">
                          <td className="px-6 py-4">
                            <select
                              value={item.material_id}
                              onChange={(e) => handleItemChange(index, 'material_id', e.target.value)}
                              required
                              className="w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                              <option value="">Select Material</option>
                              {getMaterialOptions(item.material_id)}
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                              required
                              className="w-full rounded-lg border-gray-300 text-sm text-right shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unit_price}
                              onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                              required
                              className="w-full rounded-lg border-gray-300 text-sm text-right shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-gray-900">
                            RF {item.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {formData.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText size={16} className="inline mr-2 text-gray-400" />
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Any special instructions or terms..."
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-xl overflow-hidden text-white">
                <div className="px-6 py-4 border-b border-white/10">
                  <h3 className="font-semibold">Order Summary</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-indigo-100">Subtotal</span>
                    <span className="font-semibold">
                      RF {calculateSubtotal().toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-indigo-100">Tax (18%)</span>
                    <span className="font-semibold">
                      RF {calculateTax().toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-white/20 flex justify-between items-center">
                    <span className="text-base font-bold">Total</span>
                    <span className="text-2xl font-bold">
                      RF {calculateTotal().toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery & Payment */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                  <h3 className="font-semibold text-gray-900">Delivery & Payment</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Truck size={14} className="inline mr-1.5 text-gray-400" />
                      Expected Delivery
                    </label>
                    <input
                      type="date"
                      name="expected_delivery"
                      value={formData.expected_delivery}
                      onChange={handleChange}
                      min={formData.order_date}
                      className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <CreditCard size={14} className="inline mr-1.5 text-gray-400" />
                      Payment Terms
                    </label>
                    <select
                      name="payment_terms"
                      value={formData.payment_terms}
                      onChange={handleChange}
                      className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      {PAYMENT_TERMS.map(term => (
                        <option key={term.value} value={term.value}>{term.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
                    <textarea
                      name="delivery_address"
                      rows={3}
                      value={formData.delivery_address}
                      onChange={handleChange}
                      className="w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Enter delivery address..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}