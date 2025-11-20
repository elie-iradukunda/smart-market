// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getRole } from '@/api/apiClient'
import RbacMatrix from '../../modules/admin/components/RbacMatrix'

export default function RoleDetailPage() {
  const { id } = useParams()
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return

    let isMounted = true
    setLoading(true)
    setError(null)

    getRole(id)
      .then(data => {
        if (!isMounted) return
        setRole(data)
      })
      .catch(err => {
        if (!isMounted) return
        setError(err.message || 'Failed to load role')
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
        <p className="text-sm text-gray-500">Loading role...</p>
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

  if (!role) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <p className="text-sm text-gray-500">Role not found.</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Role</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-gray-900">{role.name}</h1>
        <p className="mt-2 text-sm text-gray-600 max-w-xl">{role.description}</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <RbacMatrix roleId={id} />
      </div>
    </div>
  )
}
