// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPurchaseOrder, fetchSuppliers, fetchMaterials } from '../../api/apiClient';
import { toast } from 'react-toastify';
import { format, addDays } from 'date-fns';
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';
import InventoryTopNav from '@/components/layout/InventoryTopNav';
import OwnerTopNav from '@/components/layout/OwnerTopNav';
import ControllerTopNav from '@/components/layout/ControllerTopNav';
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
  material_id: string | number;
  quantity: number;
  unit_price: number;
  total: number;
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

export default function NewPurchaseOrderPage() {
  const navigate = useNavigate();
  const user = getAuthUser();
  const isController = user?.role_id === 4;
  const isOwner = user?.role_id === 1;

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

  // Load suppliers and materials
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [suppliersResponse, materialsResponse] = await Promise.all([
          fetchSuppliers(),
          fetchMaterials()
        ]);

        // Handle suppliers data
        const suppliersData = Array.isArray(suppliersResponse?.data) 
          ? suppliersResponse.data 
          : Array.isArray(suppliersResponse) 
            ? suppliersResponse 
            : [];
        
        // Handle materials data
        const materialsData = Array.isArray(materialsResponse?.data) 
          ? materialsResponse.data 
          : Array.isArray(materialsResponse) 
            ? materialsResponse 
            : [];

        setSuppliers(suppliersData);
        setMaterials(materialsData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data');
        setSuppliers([]);
        setMaterials([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    const item = { ...newItems[index], [field]: value };
    
    // Calculate total if quantity or unit_price changes
    if (field === 'quantity' || field === 'unit_price') {
      const quantity = field === 'quantity' ? parseFloat(value) || 0 : item.quantity;
      const unitPrice = field === 'unit_price' ? parseFloat(value) || 0 : item.unit_price;
      item.total = quantity * unitPrice;
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
      
      const createdOrder = await createPurchaseOrder(orderData);
      toast.success('Purchase order created successfully!');
      navigate(`/inventory/purchase-orders/${createdOrder.id}`);
    } catch (error: any) {
      console.error('Error creating purchase order:', error);
      toast.error(error.message || 'Failed to create purchase order');
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
          {material.name} - {material.code || 'N/A'}
        </option>
      ));
  };

  // Render supplier options
  const renderSupplierOptions = () => {
    if (loading) {
      return <option>Loading suppliers...</option>;
    }
    
    if (!suppliers || suppliers.length === 0) {
      return <option value="">No suppliers available</option>;
    }
    
    return (
      <>
        <option value="">Select Supplier</option>
        {suppliers.map(supplier => (
          <option key={supplier.id} value={supplier.id}>
            {supplier.name}
          </option>
        ))}
      </>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isOwner ? (
        <OwnerTopNav />
      ) : isController ? (
        <ControllerTopNav />
      ) : (
        <InventoryTopNav />
      )}

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to orders
            </button>
            <h2 className="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
              New Purchase Order
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({ ...prev, status: 'draft' }));
                handleSubmit({ preventDefault: () => {} } as React.FormEvent);
              }}
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              disabled={submitting}
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
              {submitting ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save & Submit'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left Column - Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Information */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Order Information</h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="reference_number" className="block text-sm font-medium text-gray-700">
                        PO Number
                      </label>
                      <input
                        type="text"
                        name="reference_number"
                        id="reference_number"
                        value={formData.reference_number}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        readOnly
                      />
                    </div>
                    <div>
                      <label htmlFor="order_date" className="block text-sm font-medium text-gray-700">
                        Order Date
                      </label>
                      <input
                        type="date"
                        name="order_date"
                        id="order_date"
                        value={formData.order_date}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="supplier_id" className="block text-sm font-medium text-gray-700">
                        Supplier <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="supplier_id"
                        name="supplier_id"
                        value={formData.supplier_id}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        disabled={loading || suppliers.length === 0}
                      >
                        {renderSupplierOptions()}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="expected_delivery" className="block text-sm font-medium text-gray-700">
                        Expected Delivery
                      </label>
                      <input
                        type="date"
                        name="expected_delivery"
                        id="expected_delivery"
                        value={formData.expected_delivery}
                        onChange={handleChange}
                        min={formData.order_date}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="delivery_address" className="block text-sm font-medium text-gray-700">
                        Delivery Address
                      </label>
                      <textarea
                        id="delivery_address"
                        name="delivery_address"
                        rows={2}
                        value={formData.delivery_address}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Enter delivery address"
                      />
                    </div>
                    <div>
                      <label htmlFor="payment_terms" className="block text-sm font-medium text-gray-700">
                        Payment Terms
                      </label>
                      <select
                        id="payment_terms"
                        name="payment_terms"
                        value={formData.payment_terms}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        {PAYMENT_TERMS.map(term => (
                          <option key={term.value} value={term.value}>
                            {term.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Order Items</h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Material
                          </th>
                          <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Unit Price (RWF)
                          </th>
                          <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total (RWF)
                          </th>
                          <th scope="col" className="relative px-3 py-3">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {formData.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <select
                                value={item.material_id}
                                onChange={(e) => handleItemChange(index, 'material_id', e.target.value)}
                                required
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                disabled={loading || materials.length === 0}
                              >
                                <option value="">Select Material</option>
                                {getMaterialOptions(item.material_id)}
                              </select>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                required
                                className="block w-full text-right rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              />
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unit_price}
                                onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                                required
                                className="block w-full text-right rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              />
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                              {item.total.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                              {formData.items.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeItem(index)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={addItem}
                      className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      disabled={materials.length === 0}
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add Item
                    </button>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Additional Notes</h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="notes"
                      name="notes"
                      rows={3}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                      placeholder="Any special instructions or notes for this order..."
                      value={formData.notes}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Order Summary</h3>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <div className="flow-root">
                    <dl className="-my-4 divide-y divide-gray-200">
                      <div className="flex items-center justify-between py-4">
                        <dt className="text-sm text-gray-600">Subtotal</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {calculateSubtotal().toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'RWF',
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between py-4">
                        <dt className="text-sm text-gray-600">Tax (18%)</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {calculateTax().toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'RWF',
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between py-4">
                        <dt className="text-base font-medium text-gray-900">Total</dt>
                        <dd className="text-base font-bold text-indigo-600">
                          {calculateTotal().toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'RWF',
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>

              {/* Order Actions */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Actions</h3>
                </div>
                <div className="px-4 py-5 sm:p-6 space-y-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Save & Submit Order'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        status: 'draft'
                      }));
                      handleSubmit({ preventDefault: () => {} } as React.FormEvent);
                    }}
                    disabled={submitting}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {submitting ? 'Saving...' : 'Save as Draft'}
                  </button>
                  <button
                    type="button"
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <PrinterIcon className="h-4 w-4 mr-2" />
                    Print Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}