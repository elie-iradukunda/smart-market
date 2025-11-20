// @ts-nocheck
import React from 'react'

export default function SystemSettingsPage() {
  return (
    // 1. Apply the light gradient background
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 px-4 py-8 sm:px-6 lg:px-8 space-y-8">

      {/* Header Card - Using the new, cleaner card style */}
      <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-8 shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">Admin</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">
          Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">System Settings</span>
        </h1>
        <p className="mt-3 text-base text-gray-600 max-w-xl">
          Tenant-wide configurations for integrations, financial controls, and security. Configure these once and they apply everywhere.
        </p>
      </div>

      {/* Settings Navigation Cards - Enhanced to look premium and actionable */}
      <div className="grid gap-6 md:grid-cols-3 text-sm">
        
        {/* Integrations Card */}
        <div className="rounded-xl border border-gray-100 bg-white/95 p-6 shadow-lg transition hover:shadow-xl hover:ring-2 hover:ring-blue-200/50 cursor-pointer">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="mr-2 text-xl text-blue-600">🔗</span> Integrations
          </h2>
          <p className="mt-1 text-gray-600">Manage communication providers (WhatsApp, email) and payment gateways (Stripe, PayPal).</p>
        </div>

        {/* Tax & Fiscal Card */}
        <div className="rounded-xl border border-gray-100 bg-white/95 p-6 shadow-lg transition hover:shadow-xl hover:ring-2 hover:ring-purple-200/50 cursor-pointer">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="mr-2 text-xl text-purple-600">💰</span> Tax &amp; Fiscal
          </h2>
          <p className="mt-1 text-gray-600">Set VAT/GST rates, manage fiscal period lock, and define document numbering sequences.</p>
        </div>

        {/* Security Card */}
        <div className="rounded-xl border border-gray-100 bg-white/95 p-6 shadow-lg transition hover:shadow-xl hover:ring-2 hover:ring-indigo-200/50 cursor-pointer">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="mr-2 text-xl text-indigo-600">🛡️</span> Security
          </h2>
          <p className="mt-1 text-gray-600">Configure password strength rules, adjust session timeouts, and enforce 2FA.</p>
        </div>
      </div>
      
      {/* Optional: Add a general settings card if there are more options */}
      <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">General Configuration</h2>
        <p className="text-sm text-gray-600 mb-4">Other essential tenant and regional preferences.</p>
        {/* Placeholder for actual input elements */}
        <div className="border-t border-gray-100 pt-4 space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-gray-50/50">
            <label htmlFor="timezone" className="text-sm font-medium text-gray-700">Default Timezone</label>
            <input id="timezone" type="text" defaultValue="Africa/Kigali" className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-800 w-1/3" />
          </div>
          <div className="flex justify-between items-center py-2">
            <label htmlFor="currency" className="text-sm font-medium text-gray-700">Base Currency</label>
            <input id="currency" type="text" defaultValue="USD" className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-800 w-1/3" />
          </div>
        </div>
      </div>

    </div>
  )
}