import React from 'react';

export default function WorkLogTable() {
  const logs = [
    { id: 1, tech: 'Joseph', stage: 'Print', startedAt: '09:00', endedAt: '11:30', hours: 2.5 },
    { id: 2, tech: 'Grace', stage: 'Finishing', startedAt: '10:00', endedAt: '12:00', hours: 2 },
  ];

  return (
    <div className="mt-4">
      <h3 className="text-md font-medium">Work Logs</h3>
      <div className="mt-2 overflow-x-auto rounded border border-gray-200 bg-white text-sm">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 font-medium text-gray-700">Technician</th>
              <th className="px-3 py-2 font-medium text-gray-700">Stage</th>
              <th className="px-3 py-2 font-medium text-gray-700">Start</th>
              <th className="px-3 py-2 font-medium text-gray-700">End</th>
              <th className="px-3 py-2 text-right font-medium text-gray-700">Hours</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2 text-gray-800">{log.tech}</td>
                <td className="px-3 py-2 text-gray-800">{log.stage}</td>
                <td className="px-3 py-2 text-gray-800">{log.startedAt}</td>
                <td className="px-3 py-2 text-gray-800">{log.endedAt}</td>
                <td className="px-3 py-2 text-right text-gray-800">{log.hours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

