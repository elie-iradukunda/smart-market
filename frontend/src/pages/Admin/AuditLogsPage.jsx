import React from 'react';
import AuditLogTable from '../../modules/admin/components/AuditLogTable';

export default function AuditLogsPage() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Admin</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">Audit logs</h1>
        <p className="mt-2 text-sm text-gray-600 max-w-xl">
          Every sensitive operation is tracked for compliance. Use this view to review who changed what and when.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <AuditLogTable />
      </div>
    </div>
  );
}

