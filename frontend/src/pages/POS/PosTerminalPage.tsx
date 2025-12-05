// @ts-nocheck
import React, { useState, useEffect } from 'react'
import { Plus, Minus, Trash2, ShoppingCart, Search, User, UserPlus, X, FileText, Send, Check } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { fetchProducts, createPOSSale, fetchCustomers, createCustomer, createInvoice, recordPayment } from '@/api/apiClient'

export default function POSTerminalPage() {
  const [cartItems, setCartItems] = useState([])
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [customerSearchQuery, setCustomerSearchQuery] = useState('')
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [lastSale, setLastSale] = useState(null)
  const [sendingInvoice, setSendingInvoice] = useState(false)

  // New customer form state
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  })

  // Load products and customers on mount
  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError('')

    Promise.all([fetchProducts(), fetchCustomers()])
      .then(([productsData, customersData]) => {
        if (!isMounted) return
        setProducts(Array.isArray(productsData) ? productsData : [])
        setCustomers(Array.isArray(customersData) ? customersData : [])
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err.message || 'Failed to load data')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const handleAddProduct = (product) => {
    if (!product) return
    setCartItems((prev) => {
      const existing = prev.find((it) => it.id === product.id)
      if (existing) {
        return prev.map((it) =>
          it.id === product.id ? { ...it, qty: (it.qty || 1) + 1 } : it
        )
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name || product.sku,
          qty: 1,
          price: Number(product.price || 0),
        },
      ]
    })
  }

  const handleUpdateQuantity = (itemId, delta) => {
    setCartItems((prev) =>
      prev
        .map((it) => {
          if (it.id === itemId) {
            const newQty = (it.qty || 1) + delta
            return newQty > 0 ? { ...it, qty: newQty } : null
          }
          return it
        })
        .filter(Boolean)
    )
  }

  const handleRemoveItem = (itemId) => {
    setCartItems((prev) => prev.filter((it) => it.id !== itemId))
  }

  const handleClearCart = () => {
    setCartItems([])
    setSelectedCustomer(null)
    setSuccessMessage('')
    setLastSale(null)
  }

  const handleCreateCustomer = async (e) => {
    e.preventDefault()
    if (!newCustomer.name || !newCustomer.phone) {
      setError('Customer name and phone are required')
      return
    }

    try {
      const created = await createCustomer({
        ...newCustomer,
        source: 'walkin'
      })

      // Refresh customers list
      const updatedCustomers = await fetchCustomers()
      setCustomers(Array.isArray(updatedCustomers) ? updatedCustomers : [])

      // Select the newly created customer
      setSelectedCustomer({
        id: created.id,
        name: newCustomer.name,
        phone: newCustomer.phone,
        email: newCustomer.email
      })

      // Reset form and close modal
      setNewCustomer({ name: '', phone: '', email: '', address: '' })
      setShowCustomerForm(false)
      setError('')
    } catch (err) {
      setError(err.message || 'Failed to create customer')
    }
  }

  const handlePayment = async (method) => {
    if (saving || cartItems.length === 0) return

    if (!selectedCustomer) {
      setError('Please select or create a customer first')
      return
    }

    setSaving(true)
    setError('')
    setSuccessMessage('')

    try {
      const subtotal = cartItems.reduce((sum, it) => sum + (it.qty || 1) * (it.price || 0), 0)
      const tax = Math.round(subtotal * 0.18 * 100) / 100
      const total = subtotal + tax

      // 1. Create POS Sale
      const saleResult = await createPOSSale({
        customer_id: selectedCustomer.id,
        items: cartItems.map(item => ({
          item_id: item.id,
          quantity: item.qty,
          price: item.price
        })),
        total,
      })

      // 2. Create Invoice (using order ID created by POS sale)
      const invoiceResult = await createInvoice({
        order_id: saleResult.order_id,
        amount: total,
        status: 'paid'
      })

      // 3. Record Payment
      const paymentResult = await recordPayment({
        invoice_id: invoiceResult.id,
        method: method.toLowerCase().replace(' ', '_'),
        amount: total,
        reference: `POS-${saleResult.id}-${Date.now()}`,
      })

      // Store sale details for invoice modal
      setLastSale({
        id: saleResult.id,
        invoiceId: invoiceResult.id,
        customer: selectedCustomer,
        items: cartItems,
        subtotal,
        tax,
        total,
        method,
        date: new Date().toLocaleString(),
        paymentStatus: paymentResult.status,
        remainingBalance: paymentResult.remainingBalance || 0
      })

      const statusMessage = paymentResult.status === 'paid'
        ? `Sale of RF ${total.toFixed(2)} completed via ${method}! Invoice fully paid.`
        : `Partial payment of RF ${total.toFixed(2)} recorded. Remaining balance: RF ${paymentResult.remainingBalance.toFixed(2)}`

      setSuccessMessage(statusMessage)
      setShowInvoiceModal(true)

    } catch (err) {
      setError(err.message || 'Failed to process payment')
    } finally {
      setSaving(false)
    }
  }

  const handleSendInvoice = async () => {
    if (!lastSale || !selectedCustomer.email) {
      setError('Customer email is required to send invoice')
      return
    }

    setSendingInvoice(true)
    setError(null)
    try {
      // Import email service
      const response = await fetch('http://localhost:3000/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          to: selectedCustomer.email,
          subject: `Invoice #${lastSale.invoiceId} - TOP Design`,
          html: `
            <h2>Invoice #${lastSale.invoiceId}</h2>
            <p>Dear ${selectedCustomer.name},</p>
            <p>Thank you for your purchase. Here are the details:</p>
            <table style="width:100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f3f4f6;">
                  <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Item</th>
                  <th style="padding: 8px; text-align: center; border: 1px solid #ddd;">Qty</th>
                  <th style="padding: 8px; text-align: right; border: 1px solid #ddd;">Price</th>
                  <th style="padding: 8px; text-align: right; border: 1px solid #ddd;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${lastSale.items.map(item => `
                  <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;">${item.name}</td>
                    <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${item.qty}</td>
                    <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">RF ${item.price.toFixed(2)}</td>
                    <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">RF ${(item.qty * item.price).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="padding: 8px; text-align: right; border: 1px solid #ddd;"><strong>Subtotal:</strong></td>
                  <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">RF ${lastSale.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="3" style="padding: 8px; text-align: right; border: 1px solid #ddd;"><strong>VAT (18%):</strong></td>
                  <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">RF ${lastSale.tax.toFixed(2)}</td>
                </tr>
                <tr style="background: #f3f4f6;">
                  <td colspan="3" style="padding: 8px; text-align: right; border: 1px solid #ddd;"><strong>Total:</strong></td>
                  <td style="padding: 8px; text-align: right; border: 1px solid #ddd;"><strong>RF ${lastSale.total.toFixed(2)}</strong></td>
                </tr>
              </tfoot>
            </table>
            <p style="margin-top: 20px;">Payment Method: ${lastSale.method}</p>
            <p>Status: <strong style="color: green;">PAID</strong></p>
            <p>Thank you for your business!</p>
            <p>TOP Design</p>
          `
        })
      })

      if (response.ok) {
        setSuccessMessage('Invoice sent successfully to ' + selectedCustomer.email)
      } else {
        // Email failed but invoice was created - show warning instead of error
        setSuccessMessage('Invoice created successfully! (Email service not configured - please send invoice manually)')
      }
    } catch (err) {
      // Email failed but invoice was created - show warning instead of error
      setSuccessMessage('Invoice created successfully! (Email service not configured - please send invoice manually)')
      console.warn('Email sending failed:', err.message)
    } finally {
      setSendingInvoice(false)
      // Close modal and clear cart after sending (or attempting to send) email
      setTimeout(() => {
        setShowInvoiceModal(false)
        handleClearCart()
      }, 1500) // Give user time to see the success message
    }
  }

  const handleCloseInvoiceModal = () => {
    setShowInvoiceModal(false)
    handleClearCart()
  }

  const filteredProducts = products.filter((p) => {
    const name = (p.name || p.sku || '').toLowerCase()
    return name.includes(searchQuery.toLowerCase())
  })

  const filteredCustomers = customers.filter((c) => {
    const name = (c.name || '').toLowerCase()
    const phone = (c.phone || '').toLowerCase()
    const query = customerSearchQuery.toLowerCase()
    return name.includes(query) || phone.includes(query)
  })

  const subtotal = cartItems.reduce((sum, it) => sum + (it.qty || 1) * (it.price || 0), 0)
  const tax = Math.round(subtotal * 0.18 * 100) / 100
  const total = subtotal + tax

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-6 shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">POS Terminal</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">Walk-in Sales</h1>
            <p className="mt-2 text-sm text-gray-600 max-w-2xl">
              Select customer, add products, process payment, and send invoice automatically.
            </p>
          </div>

          {/* Main Content */}
          <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            {/* Left Column: Customer Selection & Products */}
            <div className="space-y-4">
              {/* Customer Selection */}
              <div className="rounded-2xl border border-gray-100 bg-white/95 backdrop-blur-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <User className="h-5 w-5 text-indigo-600" />
                    Customer
                  </h2>
                  <button
                    onClick={() => setShowCustomerForm(true)}
                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
                  >
                    <UserPlus className="h-4 w-4" />
                    New Customer
                  </button>
                </div>

                {selectedCustomer ? (
                  <div className="flex items-center justify-between rounded-lg border-2 border-indigo-200 bg-indigo-50 p-4">
                    <div>
                      <p className="font-semibold text-gray-900">{selectedCustomer.name}</p>
                      <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
                      {selectedCustomer.email && (
                        <p className="text-xs text-gray-500">{selectedCustomer.email}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedCustomer(null)}
                      className="rounded-lg bg-white border border-gray-300 p-2 hover:bg-gray-100 transition"
                    >
                      <X className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search customers by name or phone..."
                        value={customerSearchQuery}
                        onChange={(e) => setCustomerSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {filteredCustomers.slice(0, 5).map((customer) => (
                        <button
                          key={customer.id}
                          onClick={() => setSelectedCustomer(customer)}
                          className="w-full text-left rounded-lg border border-gray-200 bg-white p-3 hover:border-indigo-300 hover:bg-indigo-50 transition"
                        >
                          <p className="font-medium text-gray-900">{customer.name}</p>
                          <p className="text-xs text-gray-600">{customer.phone}</p>
                        </button>
                      ))}
                      {filteredCustomers.length === 0 && (
                        <p className="text-center py-4 text-sm text-gray-500">
                          No customers found. Create a new customer above.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Product Search */}
              <div className="rounded-2xl border border-gray-100 bg-white/95 backdrop-blur-xl p-4 shadow-lg">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* Products Grid */}
              <div className="rounded-2xl border border-gray-100 bg-white/95 backdrop-blur-xl p-6 shadow-lg">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Products</h2>
                {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-3 text-sm text-gray-500">Loading products...</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <p className="text-center py-12 text-sm text-gray-500">
                    {searchQuery ? 'No products found.' : 'No products available.'}
                  </p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredProducts.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleAddProduct(p)}
                        disabled={!selectedCustomer}
                        className="group flex flex-col items-start rounded-xl border border-gray-200 bg-white p-4 text-left transition hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="text-sm font-medium text-gray-900 group-hover:text-indigo-700">
                          {p.name || p.sku}
                        </span>
                        <span className="mt-1 text-xs text-gray-500">{p.category || 'Product'}</span>
                        <p className="mt-2 text-lg font-bold text-indigo-600">
                          RF {Number(p.price || 0).toFixed(2)}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Cart & Payment */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-gray-100 bg-white/95 backdrop-blur-xl p-6 shadow-lg sticky top-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-indigo-600" />
                    Cart ({cartItems.length})
                  </h2>
                  {cartItems.length > 0 && (
                    <button
                      onClick={handleClearCart}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Cart Items */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto mb-4">
                  {cartItems.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">Cart is empty</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {selectedCustomer ? 'Add products to get started' : 'Select a customer first'}
                      </p>
                    </div>
                  ) : (
                    cartItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                          <p className="text-xs text-gray-500">RF {item.price} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, -1)}
                            className="rounded-lg bg-white border border-gray-300 p-1 hover:bg-gray-100 transition"
                          >
                            <Minus className="h-4 w-4 text-gray-600" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, 1)}
                            className="rounded-lg bg-white border border-gray-300 p-1 hover:bg-gray-100 transition"
                          >
                            <Plus className="h-4 w-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="rounded-lg bg-red-50 border border-red-200 p-1 hover:bg-red-100 transition ml-1"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            RF {((item.qty || 1) * (item.price || 0)).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-2 border-t border-gray-200 pt-4 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">RF {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">VAT (18%)</span>
                    <span className="font-medium text-gray-900">RF {tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                    <span className="text-gray-900">Total</span>
                    <span className="text-indigo-600">RF {total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Messages */}
                {successMessage && !showInvoiceModal && (
                  <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
                    {successMessage}
                  </div>
                )}

                {/* Payment Buttons */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-700 mb-2">Payment Method</p>
                  <button
                    onClick={() => handlePayment('Cash')}
                    disabled={saving || cartItems.length === 0 || !selectedCustomer}
                    className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg hover:shadow-xl"
                  >
                    {saving ? 'Processing...' : 'Cash'}
                  </button>
                  <button
                    onClick={() => handlePayment('Mobile Money')}
                    disabled={saving || cartItems.length === 0 || !selectedCustomer}
                    className="w-full rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg hover:shadow-xl"
                  >
                    {saving ? 'Processing...' : 'Mobile Money'}
                  </button>
                  <button
                    onClick={() => handlePayment('Card')}
                    disabled={saving || cartItems.length === 0 || !selectedCustomer}
                    className="w-full rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg hover:shadow-xl"
                  >
                    {saving ? 'Processing...' : 'Card'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Customer Modal */}
      {showCustomerForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">New Customer</h3>
              <button
                onClick={() => {
                  setShowCustomerForm(false)
                  setNewCustomer({ name: '', phone: '', email: '', address: '' })
                  setError('')
                }}
                className="rounded-lg p-2 hover:bg-gray-100 transition"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Customer name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="+250..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="customer@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  rows="2"
                  placeholder="Customer address"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomerForm(false)
                    setNewCustomer({ name: '', phone: '', email: '', address: '' })
                    setError('')
                  }}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition"
                >
                  Create Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && lastSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 p-3">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Sale Completed!</h3>
                  <p className="text-sm text-gray-600">Invoice #{lastSale.invoiceId}</p>
                </div>
              </div>
              <button
                onClick={handleCloseInvoiceModal}
                className="rounded-lg p-2 hover:bg-gray-100 transition"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Invoice Details */}
            <div className="border border-gray-200 rounded-lg p-6 mb-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="font-bold text-gray-900">TOP Design</h4>
                  <p className="text-sm text-gray-600">Walk-in Sale</p>
                  <p className="text-xs text-gray-500 mt-1">{lastSale.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">Bill To:</p>
                  <p className="font-semibold text-gray-900">{lastSale.customer.name}</p>
                  <p className="text-sm text-gray-600">{lastSale.customer.phone}</p>
                  {lastSale.customer.email && (
                    <p className="text-xs text-gray-500">{lastSale.customer.email}</p>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-sm mb-4">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Item</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-700">Qty</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-700">Price</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {lastSale.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2 text-gray-900">{item.name}</td>
                      <td className="px-3 py-2 text-center text-gray-600">{item.qty}</td>
                      <td className="px-3 py-2 text-right text-gray-600">RF {item.price.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right font-medium text-gray-900">
                        RF {(item.qty * item.price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-gray-300">
                  <tr>
                    <td colSpan="3" className="px-3 py-2 text-right font-medium text-gray-700">Subtotal:</td>
                    <td className="px-3 py-2 text-right font-medium text-gray-900">RF {lastSale.subtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan="3" className="px-3 py-2 text-right font-medium text-gray-700">VAT (18%):</td>
                    <td className="px-3 py-2 text-right font-medium text-gray-900">RF {lastSale.tax.toFixed(2)}</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td colSpan="3" className="px-3 py-2 text-right font-bold text-gray-900">Total:</td>
                    <td className="px-3 py-2 text-right font-bold text-indigo-600 text-lg">
                      RF {lastSale.total.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-600">Payment Method:</p>
                  <p className="font-semibold text-gray-900">{lastSale.method}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Status:</p>
                  <p className={`font-semibold ${lastSale.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>{lastSale.paymentStatus === 'paid' ? 'PAID' : 'PARTIAL'}</p>
                  {lastSale.remainingBalance > 0 && (
                    <p className="text-xs text-red-600 mt-1">
                      Balance: RF {lastSale.remainingBalance.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {lastSale.customer.email ? (
                <button
                  onClick={handleSendInvoice}
                  disabled={sendingInvoice}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition"
                >
                  <Send className="h-4 w-4" />
                  {sendingInvoice ? 'Sending...' : 'Send Invoice via Email'}
                </button>
              ) : (
                <div className="flex-1 rounded-lg bg-gray-100 border border-gray-300 px-4 py-3 text-sm text-gray-600 text-center">
                  No email address on file
                </div>
              )}
              <button
                onClick={handleCloseInvoiceModal}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                New Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
