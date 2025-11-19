import React from 'react';

export default function SystemSettingsPage() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Admin</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">System settings</h1>
        <p className="mt-2 text-sm text-gray-600 max-w-xl">
          Tenant-wide settings for integrations, tax, and security. Configure these once and they apply everywhere.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3 text-sm">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-md font-medium text-gray-900">Integrations</h2>
          <p className="mt-1 text-gray-600">Manage WhatsApp, Meta, email, and payment providers.</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-md font-medium text-gray-900">Tax &amp; fiscal</h2>
          <p className="mt-1 text-gray-600">VAT rates, fiscal period lock, and numbering.</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-md font-medium text-gray-900">Security</h2>
          <p className="mt-1 text-gray-600">Password rules, session timeouts, and 2FA.</p>
        </div>
      </div>
    </div>
  );
}

