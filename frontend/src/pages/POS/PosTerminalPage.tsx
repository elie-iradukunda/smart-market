// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, ShoppingCart, Search, User, UserPlus, X, FileText, Send, Check, Package } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { fetchProducts, createPOSSale, fetchCustomers, createCustomer, createInvoice, recordPayment, getImageUrl } from '@/api/apiClient';

export default function POSTerminalPage() {
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [processingMethod, setProcessingMethod] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [lastSale, setLastSale] = useState(null);
  const [sendingInvoice, setSendingInvoice] = useState(false);

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    Promise.all([fetchProducts(), fetchCustomers()])
      .then(([productsData, customersData]) => {
        if (!isMounted) return;
        setProducts(Array.isArray(productsData) ? productsData : []);
        setCustomers(Array.isArray(customersData) ? customersData : []);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to load data');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddProduct = (product) => {
    if (!product) return;
    setCartItems((prev) => {
      const existing = prev.find((it) => it.id === product.id);
      if (existing) {
        return prev.map((it) =>
          it.id === product.id ? { ...it, qty: (it.qty || 1) + 1 } : it
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name || product.sku,
          qty: 1,
          price: Number(product.price || 0),
        },
      ];
    });
  };

  const handleUpdateQuantity = (itemId, delta) => {
    setCartItems((prev) =>
      prev
        .map((it) => {
          if (it.id === itemId) {
            const newQty = (it.qty || 1) + delta;
            return newQty > 0 ? { ...it, qty: newQty } : null;
          }
          return it;
        })
        .filter(Boolean)
    );
  };

  const handleRemoveItem = (itemId) => {
    setCartItems((prev) => prev.filter((it) => it.id !== itemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
    setSelectedCustomer(null);
    setSuccessMessage('');
    setLastSale(null);
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.phone) {
      setError('Customer name and phone are required');
      return;
    }

    try {
      const created = await createCustomer({
        ...newCustomer,
        source: 'walkin'
      });

      const updatedCustomers = await fetchCustomers();
      setCustomers(Array.isArray(updatedCustomers) ? updatedCustomers : []);

      setSelectedCustomer({
        id: created.id,
        name: newCustomer.name,
        phone: newCustomer.phone,
        email: newCustomer.email
      });

      setNewCustomer({ name: '', phone: '', email: '', address: '' });
      setShowCustomerForm(false);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to create customer');
    }
  };

  const handlePayment = async (method) => {
    if (saving || cartItems.length === 0) return;

    if (!selectedCustomer) {
      setError('Please select or create a customer first');
      return;
    }

    setSaving(true);
    setProcessingMethod(method);
    setError('');
    setSuccessMessage('');

    try {
      const total = cartItems.reduce((sum, it) => sum + (it.qty || 1) * (it.price || 0), 0);

      const saleResult = await createPOSSale({
        customer_id: selectedCustomer.id,
        items: cartItems.map(item => ({
          item_id: item.id,
          quantity: item.qty,
          price: item.price
        })),
        total,
      });

      if (!saleResult || !saleResult.id) {
        throw new Error('Failed to create POS sale record');
      }

      let invoiceId = saleResult.invoice_id;
      if (!invoiceId) {
        const invoiceResult = await createInvoice({
          order_id: saleResult.order_id,
          amount: total,
          status: 'paid'
        });
        invoiceId = invoiceResult.id;
      }

      const paymentResult = await recordPayment({
        invoice_id: invoiceId,
        method: method.toLowerCase().replace(' ', '_'),
        amount: total,
        reference: `POS-${saleResult.id}-${Date.now()}`,
      });

      setLastSale({
        id: saleResult.id,
        invoiceId: invoiceId,
        customer: selectedCustomer,
        items: [...cartItems],
        total: total,
        method,
        date: new Date().toLocaleString(),
        paymentStatus: paymentResult?.status || 'paid',
        remainingBalance: paymentResult?.remainingBalance || 0
      });

      const statusMessage = paymentResult?.status === 'paid'
        ? `Sale of RF ${total.toFixed(2)} completed via ${method}! Invoice fully paid.`
        : `Transaction recorded. View invoice for details.`;

      setSuccessMessage(statusMessage);
      setShowInvoiceModal(true);
      setCartItems([]);
    } catch (err) {
      console.error('POS Payment Error:', err);
      setError(err.message || 'Failed to process payment');
    } finally {
      setSaving(false);
      setProcessingMethod(null);
    }
  };

  const handleSendInvoice = async () => {
    if (!lastSale || !lastSale.customer.email) {
      setError('Customer email is required to send invoice');
      return;
    }

    setSendingInvoice(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          to: lastSale.customer.email,
          subject: `Invoice #${lastSale.invoiceId} - TOP Design`,
          html: `<h2>Invoice #${lastSale.invoiceId}</h2><p>Dear ${lastSale.customer.name}, thank you for your purchase.</p>`
        })
      });

      if (response.ok) {
        setSuccessMessage('Invoice sent successfully to ' + lastSale.customer.email);
      } else {
        setSuccessMessage('Invoice created successfully! (Email service unavailable)');
      }
    } catch (err) {
      setSuccessMessage('Invoice created successfully! (Email service unavailable)');
    } finally {
      setSendingInvoice(false);
      setTimeout(() => {
        setShowInvoiceModal(false);
        handleClearCart();
      }, 1500);
    }
  };

  const handleCloseInvoiceModal = () => {
    setShowInvoiceModal(false);
    handleClearCart();
  };

  const filteredProducts = products.filter((p) => {
    const name = (p.name || p.sku || '').toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  const filteredCustomers = customers.filter((c) => {
    const name = (c.name || '').toLowerCase();
    const phone = (c.phone || '').toLowerCase();
    const query = customerSearchQuery.toLowerCase();
    return name.includes(query) || phone.includes(query);
  });

  const total = cartItems.reduce((sum, it) => sum + (it.qty || 1) * (it.price || 0), 0);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-3xl font-bold text-slate-900">Walk-in Sales Terminal</h1>
            <p className="mt-2 text-sm text-slate-500">Fast checkout for in-person customers.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Customer Selection
                  </h2>
                  {!selectedCustomer && (
                    <button
                      onClick={() => setShowCustomerForm(true)}
                      className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
                    >
                      <UserPlus className="h-4 w-4" />
                      NEW CUSTOMER
                    </button>
                  )}
                </div>

                {selectedCustomer ? (
                  <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <div>
                      <p className="font-bold text-slate-900">{selectedCustomer.name}</p>
                      <p className="text-sm text-slate-600 font-medium">{selectedCustomer.phone}</p>
                    </div>
                    <button
                      onClick={() => setSelectedCustomer(null)}
                      className="rounded-lg bg-white border border-slate-200 p-2 hover:bg-slate-50 transition"
                    >
                      <X className="h-4 w-4 text-slate-600" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search existing customers..."
                        value={customerSearchQuery}
                        onChange={(e) => setCustomerSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {filteredCustomers.length > 0 ? (
                        filteredCustomers.slice(0, 5).map((c) => (
                          <button
                            key={c.id}
                            onClick={() => setSelectedCustomer(c)}
                            className="w-full text-left rounded-lg border border-slate-100 p-3 hover:bg-slate-50 text-sm font-bold text-slate-700 transition flex items-center justify-between group"
                          >
                            <span>{c.name} — {c.phone}</span>
                            <Check className="h-4 w-4 text-green-500 opacity-0 group-hover:opacity-100" />
                          </button>
                        ))
                      ) : (
                        customerSearchQuery && (
                          <button
                            onClick={() => {
                              setNewCustomer({ ...newCustomer, name: customerSearchQuery });
                              setShowCustomerForm(true);
                            }}
                            className="w-full text-center rounded-lg border border-dashed border-slate-300 p-4 hover:bg-slate-50 text-sm font-bold text-blue-600 transition"
                          >
                            <UserPlus className="h-4 w-4 inline mr-2" />
                            Register "{customerSearchQuery}" as New Customer
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search products by name or SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 text-sm font-medium focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {loading ? (
                  <div className="py-12 text-center text-slate-400 font-bold">Loading Products...</div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredProducts.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleAddProduct(p)}
                        disabled={!selectedCustomer}
                        className="group flex flex-col items-stretch rounded-2xl border border-slate-100 bg-white overflow-hidden transition-all hover:shadow-xl hover:border-blue-500 disabled:opacity-40 text-left"
                      >
                        <div className="aspect-[16/9] bg-slate-50 relative overflow-hidden">
                          {p.image ? (
                            <img
                              src={getImageUrl(p.image)}
                              alt={p.name}
                              className="w-full h-full object-cover transition-transform group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Package size={32} strokeWidth={1} />
                            </div>
                          )}
                          <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur rounded text-[8px] font-black uppercase tracking-widest text-slate-500 shadow-sm border border-white/50">
                            {p.category || 'Item'}
                          </div>
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 line-clamp-1">{p.name || p.sku}</span>
                          <p className="text-[10px] text-slate-400 font-medium line-clamp-2 mt-1 mb-3 flex-1 h-8">{p.description || 'Professional grade product/service catalog item.'}</p>
                          <div className="flex items-center justify-between mt-auto">
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Price</p>
                              <p className="text-lg font-black text-slate-900 tracking-tight">RF {Number(p.price || 0).toLocaleString()}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                              <Plus size={20} />
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sticky top-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                    Checkout
                  </h2>
                  {cartItems.length > 0 && (
                    <button onClick={handleClearCart} className="text-xs font-bold text-red-500 uppercase hover:underline">Clear</button>
                  )}
                </div>

                <div className="space-y-3 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 p-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 truncate">{item.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">RF {item.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleUpdateQuantity(item.id, -1)} className="rounded bg-white border border-slate-200 p-1"><Minus className="h-3 w-3" /></button>
                        <span className="text-sm font-bold w-4 text-center">{item.qty}</span>
                        <button onClick={() => handleAddProduct(item)} className="rounded bg-white border border-slate-200 p-1"><Plus className="h-3 w-3" /></button>
                        <button onClick={() => handleRemoveItem(item.id)} className="ml-1 text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  ))}
                  {cartItems.length === 0 && (
                    <div className="py-8 text-center text-slate-400 text-sm font-bold">Your cart is empty.</div>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-500 uppercase">Grand Total</span>
                    <span className="text-2xl font-black text-slate-900">RF {total.toLocaleString()}</span>
                  </div>
                </div>

                {error && <div className="mb-4 text-xs font-bold text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}

                <div className="grid grid-cols-2 gap-2">
                  {['Cash', 'Mobile Money', 'Card', 'Bank'].map((m) => (
                    <button
                      key={m}
                      onClick={() => handlePayment(m)}
                      disabled={saving || cartItems.length === 0 || !selectedCustomer}
                      className="rounded-xl border border-slate-200 bg-white py-3 text-[10px] font-black uppercase tracking-widest text-slate-900 hover:bg-slate-900 hover:text-white disabled:opacity-30 transition-all shadow-sm"
                    >
                      {processingMethod === m ? '...' : m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCustomerForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-6 uppercase tracking-tight">Register New Customer</h3>
            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <input
                required
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                placeholder="Full Name"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold focus:border-blue-500 focus:outline-none"
              />
              <input
                required
                type="tel"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                placeholder="Phone Number"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold focus:border-blue-500 focus:outline-none"
              />
              <input
                type="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                placeholder="Email Address"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold focus:border-blue-500 focus:outline-none"
              />
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowCustomerForm(false)} className="flex-1 rounded-xl border border-slate-200 py-3 text-xs font-bold uppercase text-slate-400">Cancel</button>
                <button type="submit" className="flex-1 rounded-xl bg-blue-600 py-3 text-xs font-bold uppercase text-white hover:bg-blue-700">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showInvoiceModal && lastSale && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-blue-500" />

            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Sale Successful</h3>
                <p className="text-slate-400 font-bold text-sm">Invoice #{lastSale.invoiceId}</p>
              </div>
              <button onClick={handleCloseInvoiceModal} className="text-slate-300 hover:text-slate-900"><X className="h-6 w-6" /></button>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 mb-8">
              <div className="grid grid-cols-2 gap-4 text-xs font-bold uppercase tracking-wider mb-6">
                <div>
                  <p className="text-slate-400 mb-1">Customer</p>
                  <p className="text-slate-900">{lastSale.customer.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 mb-1">Method</p>
                  <p className="text-slate-900">{lastSale.method}</p>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-200 pt-4">
                {lastSale.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600">{item.qty}x {item.name}</span>
                    <span className="text-slate-900">RF {(item.qty * item.price).toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between text-lg font-black border-t border-slate-200 pt-4 mt-2">
                  <span className="text-slate-900">TOTAL PAID</span>
                  <span className="text-blue-600">RF {lastSale.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {lastSale.customer.email ? (
                <button
                  onClick={handleSendInvoice}
                  disabled={sendingInvoice}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 text-xs font-black uppercase tracking-widest text-white hover:bg-slate-800 transition-all"
                >
                  <Send className="h-4 w-4" />
                  {sendingInvoice ? 'SENDING...' : 'EMAIL INVOICE'}
                </button>
              ) : (
                <p className="text-center text-[10px] font-bold text-red-400 uppercase">Email not available for this customer</p>
              )}
              <button
                onClick={handleCloseInvoiceModal}
                className="w-full rounded-2xl border border-slate-200 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
              >
                DONE
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}