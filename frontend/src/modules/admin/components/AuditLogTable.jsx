import React from 'react';

export default function AuditLogTable() {
  const logs = [
    { id: 1, actor: 'Alice', action: 'Approved PO-1001', module: 'Inventory', time: '2025-11-18 10:03' },
    { id: 2, actor: 'Mary', action: 'Created INV-2025-001', module: 'Finance', time: '2025-11-18 10:10' },
  ];

  return (
    <div className="rounded border border-gray-200 bg-white p-4 text-sm">
      <h2 className="text-md font-medium">Audit Log</h2>
      <div className="mt-2 overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 font-medium text-gray-700">Actor</th>
              <th className="px-3 py-2 font-medium text-gray-700">Action</th>
              <th className="px-3 py-2 font-medium text-gray-700">Module</th>
              <th className="px-3 py-2 font-medium text-gray-700">Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2 text-gray-800">{log.actor}</td>
                <td className="px-3 py-2 text-gray-800">{log.action}</td>
                <td className="px-3 py-2 text-gray-800">{log.module}</td>
                <td className="px-3 py-2 text-gray-800">{log.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

