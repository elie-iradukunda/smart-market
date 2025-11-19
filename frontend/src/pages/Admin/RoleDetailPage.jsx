import React from 'react';
import RbacMatrix from '../../modules/admin/components/RbacMatrix';

export default function RoleDetailPage() {
  const role = {
    name: 'Receptionist',
    description: 'Handles leads, quotes, orders, deposits, and receipts.',
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Role</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">{role.name}</h1>
        <p className="mt-2 text-sm text-gray-600 max-w-xl">{role.description}</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <RbacMatrix />
      </div>
    </div>
  );
}

