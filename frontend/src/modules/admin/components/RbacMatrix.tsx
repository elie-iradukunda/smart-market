// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { fetchPermissions, fetchRolePermissions } from '@/api/apiClient'

export default function RbacMatrix({ roleId }) {
  const [permissions, setPermissions] = useState([])
  const [rolePerms, setRolePerms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!roleId) return

    let isMounted = true
    setLoading(true)
    setError(null)

    Promise.all([fetchPermissions(), fetchRolePermissions(roleId)])
      .then(([allPerms, rolePermsResp]) => {
        if (!isMounted) return
        setPermissions(allPerms || [])
        setRolePerms(rolePermsResp || [])
      })
      .catch(err => {
        if (!isMounted) return
        setError(err.message || 'Failed to load permissions')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [roleId])

  const hasPermission = code => {
    return rolePerms.some(p => p.code === code)
  }

  return (
    <div className="rounded border border-gray-200 bg-white p-4 text-xs">
      <h2 className="text-md font-medium">RBAC Matrix</h2>

      {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
      {loading ? (
        <p className="mt-2 text-[11px] text-gray-500">Loading permissions...</p>
      ) : (
        <div className="mt-2 overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 font-medium text-gray-700">Permission code</th>
                <th className="px-3 py-2 font-medium text-gray-700">Assigned</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map(p => (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="px-3 py-2 text-gray-800">{p.code}</td>
                  <td className="px-3 py-2 text-center text-gray-700">
                    {hasPermission(p.code) ? '✓' : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
