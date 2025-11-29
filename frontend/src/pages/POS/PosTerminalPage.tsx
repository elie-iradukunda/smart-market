// @ts-nocheck
import React, { useState } from 'react'
import PosCart from '../../modules/pos/components/PosCart'
import PosProductPicker from '../../modules/pos/components/PosProductPicker'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function PosTerminalPage() {
  const [cartItems, setCartItems] = useState([])

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
          name: product.name || product.material_name || product.sku,
          qty: 1,
          price: product.price || 0,
        },
      ]
    })
  }

  return (
    <DashboardLayout>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">POS</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">Walk-in sales</h1>
        <p className="mt-2 text-sm text-gray-600 max-w-xl">
          Quick picking and checkout for counter sales. This screen is designed for speed and clarity at reception.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[3fr,2fr] items-start">
        <PosProductPicker onAdd={handleAddProduct} />
        <PosCart items={cartItems} />
      </div>
    </DashboardLayout>
  )
}
