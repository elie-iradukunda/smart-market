// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getUser } from '@/api/apiClient'

export default function UserDetailPage() {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return

    let isMounted = true
    setLoading(true)
    setError(null)

    getUser(id)
      .then(data => {
        if (!isMounted) return
        setUser(data)
      })
      .catch(err => {
        if (!isMounted) return
        setError(err.message || 'Failed to load user')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <p className="text-sm text-gray-500">Loading user...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <p className="text-sm text-gray-500">User not found.</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">User</p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">{user.name}</h1>
          <p className="mt-2 text-sm text-gray-600">Role ID: {user.role_id || '—'}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-500">Email</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{user.email}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2 border border-gray-100">
            <p className="text-gray-500">Status</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{user.status}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          to={`/admin/users/${id}/permissions`}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          Manage Permissions
        </Link>
        <Link
          to="/admin/users"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
        >
          Back to Users
        </Link>
      </div>
    </div>
  )
}
