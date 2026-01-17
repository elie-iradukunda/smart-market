// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAuthToken } from '@/utils/apiClient'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { API_BASE } from '@/config/api'

export default function UserPermissionsPage() {
  const { user_id } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [permissions, setPermissions] = useState([])
  const [allPermissions, setAllPermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedPermissions, setSelectedPermissions] = useState([])

  useEffect(() => {
    loadData()
  }, [user_id])

  const loadData = async () => {
    try {
      setLoading(true)
      const token = getAuthToken()
      if (!token) {
        navigate('/login')
        return
      }

      // Load user info
      const userRes = await fetch(`${API_BASE}/users/${user_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const userData = await userRes.json()
      setUser(userData)

      // Load user permissions (role + custom)
      const permRes = await fetch(`${API_BASE}/users/${user_id}/permissions`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const permData = await permRes.json()
      setPermissions(permData.permissions || [])
      setSelectedPermissions(permData.permissions?.map((p: any) => p.id) || [])

      // Load all available permissions
      const allPermRes = await fetch(`${API_BASE}/permissions`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const allPermData = await allPermRes.json()
      setAllPermissions(allPermData || [])
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissions((prev: number[]) => {
      if (prev.includes(permissionId)) {
        return prev.filter((id: number) => id !== permissionId)
      } else {
        return [...prev, permissionId]
      }
    })
  }

  const handleSavePermissions = async () => {
    try {
      setSaving(true)
      const token = getAuthToken()
      if (!token) return

      // Get current role permissions
      const rolePermissions = permissions
        .filter((p: any) => p.source === 'role')
        .map((p: any) => p.id)

      // Get selected custom permissions (excluding role permissions)
      const customPermissions = selectedPermissions.filter(
        (id: number) => !rolePermissions.includes(id)
      )

      // Revoke all existing custom permissions
      await fetch(`${API_BASE}/users/${user_id}/permissions`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      // Grant new custom permissions
      if (customPermissions.length > 0) {
        await fetch(`${API_BASE}/users/${user_id}/permissions/bulk`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            permission_ids: customPermissions
          })
        })
      }

      alert('Permissions updated successfully!')
      loadData()
    } catch (error) {
      console.error('Failed to save permissions:', error)
      alert('Failed to save permissions')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">Loading...</div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="p-6">User not found</div>
      </DashboardLayout>
    )
  }

  const rolePermissions = permissions.filter((p: any) => p.source === 'role')
  const customPermissions = permissions.filter((p: any) => p.source === 'custom')

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Permissions</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage custom permissions for {user.name} ({user.email})
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/users')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Back to Users
          </button>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900">Role Permissions</p>
            <p className="text-2xl font-bold text-blue-600">{rolePermissions.length}</p>
            <p className="text-xs text-blue-700 mt-1">From role assignment</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-medium text-green-900">Custom Permissions</p>
            <p className="text-2xl font-bold text-green-600">{customPermissions.length}</p>
            <p className="text-xs text-green-700 mt-1">User-specific grants</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm font-medium text-purple-900">Total Permissions</p>
            <p className="text-2xl font-bold text-purple-600">{permissions.length}</p>
            <p className="text-xs text-purple-700 mt-1">Combined access</p>
          </div>
        </div>

        {/* Permissions List */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Available Permissions</h2>
            <p className="text-sm text-gray-600 mt-1">
              Select permissions to grant to this user. Role permissions are shown for reference but cannot be removed.
            </p>
          </div>

          <div className="p-4 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {allPermissions.map((perm: any) => {
                const hasRolePermission = rolePermissions.some((rp: any) => rp.id === perm.id)
                const hasCustomPermission = customPermissions.some((cp: any) => cp.id === perm.id)
                const isSelected = selectedPermissions.includes(perm.id)

                return (
                  <label
                    key={perm.id}
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                      hasRolePermission
                        ? 'bg-blue-50 border-blue-200'
                        : isSelected
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handlePermissionToggle(perm.id)}
                      disabled={hasRolePermission}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{perm.code}</span>
                        {hasRolePermission && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            Role
                          </span>
                        )}
                        {hasCustomPermission && !hasRolePermission && (
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                            Custom
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{perm.description}</p>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
            <button
              onClick={handleSavePermissions}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Permissions'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

