// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { fetchAuditLogs } from '@/api/apiClient'

export default function AuditLogTable() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    fetchAuditLogs()
      .then(data => {
        if (!isMounted) return
        setLogs(data || [])
      })
      .catch(err => {
        if (!isMounted) return
        setError(err.message || 'Failed to load audit logs')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="rounded border border-gray-200 bg-white p-4 text-sm">
      <h2 className="text-md font-medium">Audit Log</h2>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {loading ? (
        <p className="mt-2 text-xs text-gray-500">Loading audit logs...</p>
      ) : (
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
                  <td className="px-3 py-2 text-gray-800">{log.actor || log.user_name || log.user_id}</td>
                  <td className="px-3 py-2 text-gray-800">{log.action}</td>
                  <td className="px-3 py-2 text-gray-800">{log.module || log.table_name}</td>
                  <td className="px-3 py-2 text-gray-800">{log.time || log.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
