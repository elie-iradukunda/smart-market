// @ts-nocheck
import React from 'react'
import AuditLogTable from '../../modules/admin/components/AuditLogTable'

export default function AuditLogsPage() {
  return (
    // 1. Apply the light gradient background
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 px-4 py-8 sm:px-6 lg:px-8 space-y-8">

      {/* Header Card - Using the new, cleaner card style */}
      <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-8 shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">Admin</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">
          Security & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Audit Logs</span>
        </h1>
        <p className="mt-3 text-base text-gray-600 max-w-xl">
          Every sensitive operation is tracked for compliance. Use this view to review who changed what and when across the platform.
        </p>
      </div>

      {/* Audit Log Table Container - Applying the same clean aesthetic */}
      <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-6 shadow-xl">
        <p className="text-lg font-semibold text-gray-900 mb-5">Activity Timeline</p>
        <AuditLogTable />
      </div>
    </div>
  )
}