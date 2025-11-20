// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { fetchUsers } from '@/api/apiClient'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    fetchUsers()
      .then(data => {
        if (!isMounted) return
        setUsers(data || [])
      })
      .catch(err => {
        if (!isMounted) return
        setError(err.message || 'Failed to load users')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const filteredUsers = users.filter(user => {
    const term = (search || '').toLowerCase()
    if (!term) return true
    return (
      (user.name || '').toLowerCase().includes(term) ||
      (user.email || '').toLowerCase().includes(term)
    )
  })

  return (
    // 1. Add a subtle, professional background gradient to the whole page
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 px-4 py-8 sm:px-6 lg:px-8 space-y-8">

      {/* Header Card - Using the new, cleaner card style */}
      <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-8 shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">Admin</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">
          Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Users</span>
        </h1>
        <p className="mt-3 text-base text-gray-600 max-w-xl">
          User accounts for all roles in TOP Design. Control who can access which part of the platform.
        </p>
      </div>

      {/* Users Table Card - Applying the same clean aesthetic */}
      <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
          <p className="text-lg font-semibold text-gray-900">System Accounts</p>
          {/* Search Input - Cleaned up and uses primary focus color */}
          <input
            type="text"
            placeholder="Search by name or email"
            value={search}
            onChange={e => setSearch(e.target.value)}
            // Professional input styling
            className="w-full sm:max-w-xs rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-800 placeholder-gray-400 
                     focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-150"
          />
        </div>

        {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 font-medium border border-red-200">{error}</p>}
        {loading ? (
          <p className="text-sm text-gray-500 py-4">Loading users...</p>
        ) : (
          <div className="overflow-x-auto -mx-6 sm:mx-0"> {/* Use negative margin to allow full-width table on mobile */}
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50/80 border-b border-gray-200">
                <tr>
                  {/* Table Headers - Increased padding and clear typography */}
                  <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Role</th> {/* Added a placeholder for 'Role' column for better data table design */}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map(user => (
                  // Table Row - Cleaner hover effect and consistent padding
                  <tr key={user.id} className="hover:bg-blue-50/50 transition duration-150">
                    <td className="px-6 py-3 text-gray-800 font-medium">{user.name}</td>
                    <td className="px-6 py-3 text-gray-600">{user.email}</td>
                    <td className="px-6 py-3">
                        {/* Status Tag - Styled as a small, professional tag */}
                        <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium 
                          ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                        >
                          {user.status || 'Pending'}
                        </span>
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                        {user.role || 'N/A'} {/* Placeholder for Role */}
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && !loading && (
                    <tr>
                        <td colSpan="4" className="px-6 py-6 text-center text-sm text-gray-500">
                            No users found matching your search criteria.
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}