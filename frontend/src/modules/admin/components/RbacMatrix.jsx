import React from 'react';

export default function RbacMatrix() {
  const permissions = ['Leads', 'Orders', 'Inventory', 'Finance', 'Marketing'];
  const actions = ['Create', 'Read', 'Update', 'Delete', 'Approve'];

  return (
    <div className="rounded border border-gray-200 bg-white p-4 text-xs">
      <h2 className="text-md font-medium">RBAC Matrix (demo)</h2>
      <div className="mt-2 overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 font-medium text-gray-700">Module</th>
              {actions.map(action => (
                <th key={action} className="px-3 py-2 font-medium text-gray-700">
                  {action}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permissions.map(module => (
              <tr key={module} className="border-t border-gray-100">
                <td className="px-3 py-2 text-gray-800">{module}</td>
                {actions.map(action => (
                  <td key={action} className="px-3 py-2 text-center text-gray-700">
                    ✓
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

