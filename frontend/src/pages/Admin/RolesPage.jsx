import React from 'react';

export default function RolesPage() {
  const roles = [
    'Boss/Admin',
    'Receptionist',
    'Accountant',
    'Marketing Officer',
    'Technician Officer',
    'Controller',
  ];

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Admin</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">Roles</h1>
        <p className="mt-2 text-sm text-gray-600 max-w-xl">
          High-level roles configured for RBAC. Combine these with permissions to control access across the platform.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-gray-900 mb-3">Defined roles</p>
        <ul className="max-w-md space-y-2 text-sm">
          {roles.map(role => (
            <li key={role} className="rounded border border-gray-200 bg-gray-50 px-3 py-2 text-gray-800">
              {role}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

