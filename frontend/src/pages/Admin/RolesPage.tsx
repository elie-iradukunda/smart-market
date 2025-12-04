// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { fetchRoles, fetchPermissions, fetchRolePermissions, updateRole, createRole, updateRolePermissions, deleteRole } from '@/api/apiClient'
import { currentUserHasPermission } from '@/utils/apiClient'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function RolesPage() {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [permissions, setPermissions] = useState([])
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([])
  const [saving, setSaving] = useState(false)

  const canManageRoles = currentUserHasPermission('role.manage')

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    Promise.all([fetchRoles(), fetchPermissions()])
      .then(([rolesData, perms]) => {
        if (!isMounted) return
        setRoles(rolesData || [])
        setPermissions(perms || [])
      })
      .catch(err => {
        if (!isMounted) return
        setError(err.message || 'Failed to load roles')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // When a role is selected, load its details + permissions
  useEffect(() => {
    if (!selectedRoleId) return
    const role = roles.find((r: any) => r.id === selectedRoleId)
    if (role) {
      setFormName(role.name || '')
      setFormDescription(role.description || '')
    }

    fetchRolePermissions(selectedRoleId)
      .then((permsForRole) => {
        // Handle both array and object response formats
        const permsList = Array.isArray(permsForRole) ? permsForRole : (permsForRole.data || [])
        const ids = permsList.map((p: any) => p.id)
        setSelectedPermissionIds(ids)
      })
      .catch((err) => {
        console.error('Failed to fetch role permissions:', err)
        setSelectedPermissionIds([])
      })
  }, [selectedRoleId, roles])

  const handleSelectRole = (roleId: number) => {
    setSelectedRoleId(roleId)
  }

  const handleTogglePermission = (permId: number) => {
    setSelectedPermissionIds(prev =>
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    )
  }

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canManageRoles) return
    setSaving(true)
    setError(null)
    try {
      const created = await createRole({ name: formName, description: formDescription })
      const refreshed = await fetchRoles()
      setRoles(refreshed || [])
      setSelectedRoleId(created.id)
      // Also save permissions for the new role if any were selected (though usually empty for new)
      if (selectedPermissionIds.length > 0) {
        await updateRolePermissions(created.id, selectedPermissionIds)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create role')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canManageRoles || !selectedRoleId) return
    setSaving(true)
    setError(null)
    try {
      await updateRole(selectedRoleId, { name: formName, description: formDescription })
      await updateRolePermissions(selectedRoleId, selectedPermissionIds)
      const refreshed = await fetchRoles()
      setRoles(refreshed || [])
    } catch (err: any) {
      setError(err.message || 'Failed to save role')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRole = async () => {
    if (!canManageRoles || !selectedRoleId) return
    const role = roles.find((r: any) => r.id === selectedRoleId)
    if (role && role.usersCount > 0) {
      setError('Cannot delete a role that still has users assigned.')
      return
    }
    if (!window.confirm('Are you sure you want to delete this role? This cannot be undone.')) return

    setSaving(true)
    setError(null)
    try {
      await deleteRole(selectedRoleId)
      const refreshed = await fetchRoles()
      setRoles(refreshed || [])
      setSelectedRoleId(null)
      setFormName('')
      setFormDescription('')
      setSelectedPermissionIds([])
    } catch (err: any) {
      setError(err.message || 'Failed to delete role')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">

          {/* Header Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Admin</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">
              Role-Based <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Access Control</span>
            </h1>
            <p className="mt-3 text-base text-gray-600 max-w-xl">
              Manage roles and the permissions that each role has in the system.
            </p>
          </div>

          {/* Main content: roles list + editor */}
          <div className="grid gap-6 lg:grid-cols-[1.4fr,2fr] items-start">
            {/* Roles list */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
              <p className="text-lg font-semibold text-gray-900 mb-3">Defined Roles</p>
              {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 font-medium border border-red-200">{error}</p>}
              {loading ? (
                <p className="text-sm text-gray-500 py-4">Loading roles...</p>
              ) : (
                <ul className="space-y-3">
                  {roles.map((role: any) => (
                    <li
                      key={role.id}
                      className={`rounded-xl border px-5 py-3 text-gray-900 flex flex-col sm:flex-row items-start sm:items-center justify-between transition shadow-sm cursor-pointer ${selectedRoleId === role.id ? 'bg-blue-50/80 border-blue-200' : 'bg-gray-50/50 border-gray-100 hover:bg-blue-50/50'}`}
                      onClick={() => handleSelectRole(role.id)}
                    >
                      <div className="flex flex-col">
                        <span className="text-base font-semibold">{role.name}</span>
                        {role.description && (
                          <span className="mt-0.5 text-xs text-gray-500 max-w-lg">{role.description}</span>
                        )}
                      </div>
                      <div className="mt-2 sm:mt-0 text-right">
                        <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-800 px-3 py-1 text-xs font-medium">
                          {role.usersCount ?? 0} users
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Role editor */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <p className="text-lg font-semibold text-gray-900">Role details</p>
                {canManageRoles && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRoleId(null)
                      setFormName('')
                      setFormDescription('')
                      setSelectedPermissionIds([])
                    }}
                    className="text-xs font-medium text-blue-600 hover:text-blue-800"
                  >
                    + New role
                  </button>
                )}
              </div>

              {!canManageRoles && (
                <p className="text-sm text-gray-500 mb-4">
                  You can view roles, but changes are restricted to system administrators.
                </p>
              )}

              <form onSubmit={selectedRoleId ? handleSaveRole : handleCreateRole} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role name</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. Controller"
                    disabled={!canManageRoles}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[72px]"
                    placeholder="Short description of what this role can do"
                    disabled={!canManageRoles}
                  />
                </div>

                <div>
                  <p className="block text-sm font-medium text-gray-700 mb-2">Permissions</p>
                  <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
                    {permissions.map((perm: any) => (
                      <label key={perm.id} className="flex items-center justify-between rounded-md bg-white px-3 py-1.5 text-xs border border-gray-100 cursor-pointer hover:bg-gray-50">
                        <span className="font-mono text-[11px] text-gray-700 mr-3">{perm.code}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-gray-500 hidden sm:inline">{perm.description}</span>
                          <input
                            type="checkbox"
                            checked={selectedPermissionIds.includes(perm.id)}
                            onChange={() => handleTogglePermission(perm.id)}
                            disabled={!canManageRoles}
                            className="h-3.5 w-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {canManageRoles && (
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : selectedRoleId ? 'Save changes' : 'Create role'}
                    </button>
                    {selectedRoleId && (
                      <button
                        type="button"
                        onClick={handleDeleteRole}
                        disabled={saving || roles.find((r: any) => r.id === selectedRoleId)?.usersCount > 0}
                        className="inline-flex items-center rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        Delete role
                      </button>
                    )}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}