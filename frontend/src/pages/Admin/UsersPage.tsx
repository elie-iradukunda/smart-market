// @ts-nocheck
import React, { useEffect, useState, useMemo } from 'react'
import { fetchUsers, updateUser, deleteUser, fetchRoles, createUser } from '@/api/apiClient'
import { Trash2, Plus, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formStatus, setFormStatus] = useState('Active')
  const [formRoleId, setFormRoleId] = useState<number | string>('')
  const [formAccessTo, setFormAccessTo] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  // Create user modal state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserPhone, setNewUserPhone] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')
  const [newUserRoleId, setNewUserRoleId] = useState<number | string>('')
  const [newUserAccessTo, setNewUserAccessTo] = useState<string[]>([])

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Available modules for access control
  const AVAILABLE_MODULES = [
    'dashboard',
    'customers',
    'leads',
    'quotes',
    'orders',
    'production',
    'inventory',
    'finance',
    'marketing',
    'communications',
    'reports',
    'settings',
    'users',
    'roles'
  ]

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)
    setActionMessage(null)

    Promise.all([fetchUsers(), fetchRoles()])
      .then(([usersData, rolesData]) => {
        if (!isMounted) return
        setUsers(usersData || [])
        setRoles(rolesData || [])
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

  // Parse includes JSON from role
  const getRoleIncludes = (roleId: number | string) => {
    if (!roleId) return []
    const role = roles.find((r: any) => r.id === Number(roleId))
    if (!role || !role.includes) return []
    
    try {
      const parsed = JSON.parse(role.includes)
      return Array.isArray(parsed) ? parsed : []
    } catch (error) {
      console.error('Failed to parse role includes:', error)
      return []
    }
  }

  // When role changes, update access_to based on role's includes
  useEffect(() => {
    if (selectedUser) {
      const includes = getRoleIncludes(formRoleId)
      setFormAccessTo(includes)
    }
  }, [formRoleId, roles])

  useEffect(() => {
    if (newUserRoleId) {
      const includes = getRoleIncludes(newUserRoleId)
      setNewUserAccessTo(includes)
    }
  }, [newUserRoleId, roles])

  const handleSelectUser = (user: any) => {
    setSelectedUser(user)
    setActionMessage(null)
    setFormName(user.name || '')
    setFormEmail(user.email || '')
    setFormPhone(user.phone || '')
    setFormStatus((user.status || 'active').toString().toLowerCase())
    setFormRoleId(user.role_id ?? user.roleId ?? '')
    
    // Parse user's access_to if exists, otherwise get from role
    if (user.access_to) {
      try {
        const parsed = JSON.parse(user.access_to)
        setFormAccessTo(Array.isArray(parsed) ? parsed : [])
      } catch (error) {
        console.error('Failed to parse user access_to:', error)
        setFormAccessTo(getRoleIncludes(user.role_id ?? user.roleId))
      }
    } else {
      setFormAccessTo(getRoleIncludes(user.role_id ?? user.roleId))
    }
  }

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return
    setSaving(true)
    setError(null)
    setActionMessage(null)
    try {
      await updateUser(selectedUser.id, {
        name: formName,
        email: formEmail,
        phone: formPhone || null,
        status: formStatus,
        role_id: formRoleId || null,
        access_to: JSON.stringify(formAccessTo)
      })
      const refreshed = await fetchUsers()
      setUsers(refreshed || [])
      const updated = (refreshed || []).find((u: any) => u.id === selectedUser.id)
      if (updated) setSelectedUser(updated)
      setActionMessage('User updated successfully')
    } catch (err: any) {
      setError(err.message || 'Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return
    setSaving(true)
    setError(null)
    setActionMessage(null)
    try {
      await deleteUser(selectedUser.id)
      const refreshed = await fetchUsers()
      setUsers(refreshed || [])
      setSelectedUser(null)
      setFormName('')
      setFormEmail('')
      setFormPhone('')
      setFormStatus('active')
      setFormRoleId('')
      setFormAccessTo([])
      setActionMessage('User deleted successfully')
    } catch (err: any) {
      setError(err.message || 'Failed to delete user')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setActionMessage(null)
    try {
      await createUser({
        name: newUserName,
        email: newUserEmail,
        phone: newUserPhone || undefined,
        password: newUserPassword,
        role_id: newUserRoleId ? Number(newUserRoleId) : undefined,
        access_to: JSON.stringify(newUserAccessTo)
      })
      const refreshed = await fetchUsers()
      setUsers(refreshed || [])
      setShowCreateModal(false)
      setNewUserName('')
      setNewUserEmail('')
      setNewUserPhone('')
      setNewUserPassword('')
      setNewUserRoleId('')
      setNewUserAccessTo([])
      setActionMessage('User created successfully')
    } catch (err: any) {
      setError(err.message || 'Failed to create user')
    } finally {
      setSaving(false)
    }
  }

  const toggleModuleAccess = (module: string, isNewUser: boolean = false) => {
    if (isNewUser) {
      setNewUserAccessTo(prev => 
        prev.includes(module) 
          ? prev.filter(m => m !== module)
          : [...prev, module]
      )
    } else {
      setFormAccessTo(prev => 
        prev.includes(module) 
          ? prev.filter(m => m !== module)
          : [...prev, module]
      )
    }
  }

  const filteredUsers = useMemo(() => {
    const term = (search || '').toLowerCase()
    if (!term) return users
    return users.filter((user: any) =>
      (user.name || '').toLowerCase().includes(term) ||
      (user.email || '').toLowerCase().includes(term)
    )
  }, [users, search])

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentUsers = filteredUsers.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const getRoleNameForUser = (user: any) => {
    if (user.role_name) return user.role_name
    if (user.role) return user.role
    const rid = user.role_id ?? user.roleId
    if (!rid) return 'N/A'
    const role = roles.find((r: any) => r.id === rid)
    return role ? role.name : 'N/A'
  }

  const getUserAccessTo = (user: any) => {
    if (user.access_to) {
      try {
        const parsed = JSON.parse(user.access_to)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.join(', ')
        }
      } catch (error) {
        console.error('Failed to parse user access_to:', error)
      }
    }
    return 'Default from role'
  }

  return (
    <DashboardLayout>
      
      <div className="px-4 py-4">
  <div className="mx-auto max-w-7xl space-y-4">
    {/* Header */}
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-bold text-gray-900">
        Platform Users
      </h1>
    </div>

    {/* Users management card */}
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-3">
          <p className="text-sm font-semibold text-gray-900">System Accounts</p>
          {filteredUsers.length > 0 && (
            <span className="text-sm text-gray-500">
              ({filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''})
            </span>
          )}
        </div>
        <div className="w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by name or email"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full sm:w-64 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-150"
          />
        </div>
      </div>

      {error && (
        <p className="mx-4 mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 font-medium border border-red-200">
          {error}
        </p>
      )}
      {actionMessage && !error && (
        <p className="mx-4 mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 font-medium border border-emerald-200">
          {actionMessage}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-gray-500 py-8 text-center">Loading users...</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Access Modules</th>
                  <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentUsers.map((user) => (
                  <tr
                    key={user.id}
                    className={`transition duration-150 hover:bg-blue-50/40 ${selectedUser?.id === user.id ? 'bg-blue-50/70' : ''}`}
                  >
                    <td className="px-6 py-3 text-gray-800 font-medium">{user.name}</td>
                    <td className="px-6 py-3 text-gray-600">{user.email}</td>
                    <td className="px-6 py-3">
                      {(() => {
                        const rawStatus = (user.status || 'pending').toString().toLowerCase();
                        const isActive = rawStatus === 'active';
                        const label = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);
                        return (
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium 
                              ${isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                          >
                            {label}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-3 text-gray-600">{getRoleNameForUser(user)}</td>
                    <td className="px-6 py-3 text-gray-600">
                      <div className="text-xs max-w-xs truncate" title={getUserAccessTo(user)}>
                        {getUserAccessTo(user)}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right text-xs">
                      <button
                        type="button"
                        onClick={() => handleSelectUser(user)}
                        className="inline-flex items-center rounded-full border border-blue-200 px-3 py-1 text-[11px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
                      >
                        View / Edit
                      </button>
                    </td>
                  </tr>
                ))}
                {currentUsers.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                      No users found matching your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 flex items-center justify-between border-t border-gray-200">
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(endIndex, filteredUsers.length)}</span> of{' '}
                  <span className="font-medium">{filteredUsers.length}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-medium transition ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  </div>
</div>
    </DashboardLayout>
  )
}