import React from 'react';

export default function UsersPage() {
  const users = [
    { id: 1, name: 'Alice', role: 'Boss/Admin', email: 'alice@topdesign.ug' },
    { id: 2, name: 'Mary', role: 'Receptionist', email: 'mary@topdesign.ug' },
    { id: 3, name: 'Joseph', role: 'Technician Officer', email: 'joseph@topdesign.ug' },
  ];

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Admin</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">Users</h1>
        <p className="mt-2 text-sm text-gray-600 max-w-xl">
          User accounts for all roles in TOP Design. Control who can access which part of the platform.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-3">
          <p className="text-sm font-medium text-gray-900">Users</p>
          <input
            type="text"
            placeholder="Search by name or email"
            className="w-full max-w-xs rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs sm:text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 font-medium text-gray-700">Name</th>
                <th className="px-3 py-2 font-medium text-gray-700">Role</th>
                <th className="px-3 py-2 font-medium text-gray-700">Email</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-800">{user.name}</td>
                  <td className="px-3 py-2 text-gray-800">{user.role}</td>
                  <td className="px-3 py-2 text-gray-800">{user.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

