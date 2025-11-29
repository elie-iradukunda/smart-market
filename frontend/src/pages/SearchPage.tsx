// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import OwnerTopNav from '@/components/layout/OwnerTopNav'
import OwnerSideNav from '@/components/layout/OwnerSideNav'
import { fetchUsers, fetchCustomers, fetchOrders, fetchQuotes, fetchMaterials } from '@/api/apiClient'

function useQuery() {
  const { search } = useLocation()
  return new URLSearchParams(search)
}

export default function SearchPage() {
  const query = useQuery()
  const q = (query.get('q') || '').trim()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [quotes, setQuotes] = useState<any[]>([])
  const [materials, setMaterials] = useState<any[]>([])

  useEffect(() => {
    if (!q) {
      setUsers([])
      setCustomers([])
      setOrders([])
      setQuotes([])
      setMaterials([])
      setError(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    async function runSearch() {
      try {
        const [u, c, o, qu, m] = await Promise.all([
          fetchUsers().catch(() => []),
          fetchCustomers().catch(() => []),
          fetchOrders().catch(() => []),
          fetchQuotes().catch(() => []),
          fetchMaterials().catch(() => []),
        ])

        if (cancelled) return

        const term = q.toLowerCase()

        setUsers((u || []).filter((item: any) =>
          (item.name || '').toLowerCase().includes(term) ||
          (item.email || '').toLowerCase().includes(term)
        ))

        setCustomers((c || []).filter((item: any) =>
          (item.name || '').toLowerCase().includes(term) ||
          (item.email || '').toLowerCase().includes(term) ||
          (item.phone || '').toLowerCase().includes(term)
        ))

        setOrders((o || []).filter((item: any) =>
          String(item.id || '').toLowerCase().includes(term) ||
          (item.customer || item.customer_name || '').toLowerCase().includes(term)
        ))

        setQuotes((qu || []).filter((item: any) =>
          String(item.id || '').toLowerCase().includes(term) ||
          (item.customer_name || '').toLowerCase().includes(term) ||
          (item.status || '').toLowerCase().includes(term)
        ))

        setMaterials((m || []).filter((item: any) =>
          (item.name || item.material_name || '').toLowerCase().includes(term) ||
          (item.sku || '').toLowerCase().includes(term)
        ))
      } catch (err: any) {
        if (cancelled) return
        setError(err.message || 'Search failed')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    runSearch()

    return () => {
      cancelled = true
    }
  }, [q])

  const hasQuery = !!q
  const hasResults =
    users.length > 0 || customers.length > 0 || orders.length > 0 || quotes.length > 0 || materials.length > 0

  return (
    <div className="min-h-screen bg-slate-50">
      <OwnerTopNav />

      {/* Owner shell: sidebar + main content wrapper. OwnerSideNav self-hides for non-owner roles. */}
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          <OwnerSideNav />

          <main className="flex-1 max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">Global Search</h1>
        <p className="text-sm text-slate-500 mb-4">
          Search across users, customers, orders, quotes and materials.
        </p>

        {!hasQuery && (
          <p className="text-sm text-slate-500">Type a search term in the top bar to begin.</p>
        )}

        {hasQuery && (
          <p className="text-xs text-slate-500 mb-4">
            Showing results for <span className="font-semibold text-slate-800">“{q}”</span>
          </p>
        )}

        {loading && <p className="text-sm text-slate-500">Searching...</p>}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-3">{error}</p>
        )}

        {hasQuery && !loading && !error && !hasResults && (
          <p className="text-sm text-slate-500">No results found.</p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {users.length > 0 && (
            <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
              <h2 className="text-sm font-semibold text-slate-800 mb-2">Users</h2>
              <ul className="space-y-1 text-xs">
                {users.slice(0, 10).map((u: any) => (
                  <li key={u.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-slate-900">{u.name}</p>
                      <p className="text-slate-500">{u.email}</p>
                    </div>
                    <Link
                      to={`/admin/users/${u.id}`}
                      className="text-blue-600 text-[11px] hover:underline"
                    >
                      View
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {customers.length > 0 && (
            <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
              <h2 className="text-sm font-semibold text-slate-800 mb-2">Customers</h2>
              <ul className="space-y-1 text-xs">
                {customers.slice(0, 10).map((c: any) => (
                  <li key={c.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-slate-900">{c.name}</p>
                      <p className="text-slate-500">{c.email || c.phone}</p>
                    </div>
                    <Link
                      to={`/crm/customers/${c.id}`}
                      className="text-blue-600 text-[11px] hover:underline"
                    >
                      View
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {orders.length > 0 && (
            <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
              <h2 className="text-sm font-semibold text-slate-800 mb-2">Orders</h2>
              <ul className="space-y-1 text-xs">
                {orders.slice(0, 10).map((o: any) => (
                  <li key={o.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-slate-900">Order #{o.id}</p>
                      <p className="text-slate-500">{o.customer || o.customer_name}</p>
                    </div>
                    <Link
                      to={`/orders/${o.id}`}
                      className="text-blue-600 text-[11px] hover:underline"
                    >
                      View
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {quotes.length > 0 && (
            <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
              <h2 className="text-sm font-semibold text-slate-800 mb-2">Quotes</h2>
              <ul className="space-y-1 text-xs">
                {quotes.slice(0, 10).map((qt: any) => (
                  <li key={qt.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-slate-900">Quote #{qt.id}</p>
                      <p className="text-slate-500">{qt.customer_name}</p>
                    </div>
                    <Link
                      to="/crm/quotes"
                      className="text-blue-600 text-[11px] hover:underline"
                    >
                      Open quotes
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {materials.length > 0 && (
            <section className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
              <h2 className="text-sm font-semibold text-slate-800 mb-2">Materials</h2>
              <ul className="space-y-1 text-xs">
                {materials.slice(0, 10).map((m: any) => (
                  <li key={m.id || m.sku} className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-slate-900">{m.name || m.material_name}</p>
                      <p className="text-slate-500">{m.sku}</p>
                    </div>
                    <Link
                      to="/inventory/materials"
                      className="text-blue-600 text-[11px] hover:underline"
                    >
                      Open materials
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
          </main>
        </div>
      </div>
    </div>
  )
}
