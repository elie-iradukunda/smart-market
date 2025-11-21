// @ts-nocheck
import React, { useEffect, useState, useMemo } from 'react'
import { fetchUsers, updateUser, deleteUser, fetchRoles } from '@/api/apiClient'
import { Trash2 } from 'lucide-react'

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
	const [saving, setSaving] = useState(false)
	const [actionMessage, setActionMessage] = useState<string | null>(null)

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

	const handleSelectUser = (user: any) => {
		setSelectedUser(user)
		setActionMessage(null)
		setFormName(user.name || '')
		setFormEmail(user.email || '')
		setFormPhone(user.phone || '')
		// Normalize to lowercase for backend compatibility (active/inactive/pending)
		setFormStatus((user.status || 'active').toString().toLowerCase())

		// Try multiple shapes: role_id or roleId; if not present, leave empty
		setFormRoleId(user.role_id ?? user.roleId ?? '')
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
				phone: selectedUser.phone ?? null,
				status: formStatus,
				role_id: formRoleId || null,
			})
			const refreshed = await fetchUsers()
			setUsers(refreshed || [])
			const updated = (refreshed || []).find((u: any) => u.id === selectedUser.id)
			if (updated) {
				setSelectedUser(updated)
			}
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
			setActionMessage('User deleted successfully')
		} catch (err: any) {
			setError(err.message || 'Failed to delete user')
		} finally {
			setSaving(false)
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

	const getRoleNameForUser = (user: any) => {
		// Prefer role_name from backend if available

		if (user.role_name) return user.role_name
		if (user.role) return user.role
		const rid = user.role_id ?? user.roleId
		if (!rid) return 'N/A'
		const role = roles.find((r: any) => r.id === rid)
		return role ? role.name : 'N/A'
	}

	return (
		// Subtle, professional background gradient
		<div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 px-4 py-8 sm:px-6 lg:px-8 space-y-8">

			{/* Header Card */}
			<div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-8 shadow-xl">
				<p className="text-sm font-semibold uppercase tracking-wider text-blue-700">Admin</p>
				<h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">
					Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Users</span>
				</h1>
				<p className="mt-3 text-base text-gray-600 max-w-xl">
					User accounts for all roles in TOP Design. Control who can access which part of the platform.
				</p>
			</div>

			{/* Users management card */}
			<div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-6 shadow-xl space-y-6">
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
					<p className="text-lg font-semibold text-gray-900">System Accounts</p>
					<input
						type="text"
						placeholder="Search by name or email"
						value={search}
						onChange={e => setSearch(e.target.value)}
						className="w-full sm:max-w-xs rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-800 placeholder-gray-400 
									focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-150"
					/>
				</div>

				{error && <p className="mb-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 font-medium border border-red-200">{error}</p>}
				{actionMessage && !error && (
					<p className="mb-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 font-medium border border-emerald-200">{actionMessage}</p>
				)}

				{loading ? (
					<p className="text-sm text-gray-500 py-4">Loading users...</p>
				) : (
					<div className="overflow-x-auto -mx-6 sm:mx-0">
						<table className="min-w-full text-left text-sm">
							<thead className="bg-gray-50/80 border-b border-gray-200">
								<tr>
									<th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Name</th>
									<th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Email</th>
									<th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Status</th>
									<th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Role</th>
									<th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100">
								{filteredUsers.map((user: any) => (
									<tr
										key={user.id}
										className={`transition duration-150 hover:bg-blue-50/40 ${selectedUser?.id === user.id ? 'bg-blue-50/70' : ''}`}
									>
										<td className="px-6 py-3 text-gray-800 font-medium">{user.name}</td>
										<td className="px-6 py-3 text-gray-600">{user.email}</td>
										<td className="px-6 py-3">
											{(() => {
												const rawStatus = (user.status || 'pending').toString().toLowerCase()
												const isActive = rawStatus === 'active'
												const label = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1)
												return (
													<span
														className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium 
															${isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
													>
														{label}
													</span>
												)
											})()}
										</td>
										<td className="px-6 py-3 text-gray-600">{getRoleNameForUser(user)}</td>
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
								{filteredUsers.length === 0 && !loading && (
									<tr>
										<td colSpan={5} className="px-6 py-6 text-center text-sm text-gray-500">
											No users found matching your search criteria.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				)}

				{/* Details / edit panel */}
				{selectedUser && (
					<div className="mt-6 border-t border-gray-100 pt-4 grid gap-4 md:grid-cols-[1.3fr,1.7fr]">
						<div>
							<p className="text-sm font-semibold text-gray-900 mb-2">Selected user</p>
							<p className="text-sm text-gray-700">
								<span className="font-semibold">{selectedUser.name}</span>
								<span className="mx-1 text-gray-400">•</span>
								<span>{selectedUser.email}</span>
							</p>
							<p className="mt-1 text-xs text-gray-500">
								Role: <span className="font-medium text-gray-700">{getRoleNameForUser(selectedUser)}</span>
							</p>
						</div>
						<form onSubmit={handleSaveUser} className="space-y-3 text-sm">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<div>
									<label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
									<input
										type="text"
										value={formName}
										onChange={e => setFormName(e.target.value)}
										className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
										required
									/>
								</div>
								<div>
									<label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
									<input
										type="email"
										value={formEmail}
										onChange={e => setFormEmail(e.target.value)}
										className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
										required
									/>
								</div>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<div>
									<label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
									<select
										value={formStatus}
										onChange={e => setFormStatus(e.target.value)}
										className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
									>
										<option value="active">Active</option>
										<option value="inactive">Inactive</option>
										<option value="pending">Pending</option>

									</select>
								</div>
								<div>
									<label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
									<select
										value={formRoleId}
										onChange={e => setFormRoleId(e.target.value)}
										className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 bg-gray-50 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
									>
										<option value="">Select role</option>
										{roles.map((role: any) => (
											<option key={role.id} value={role.id}>
												{role.name}
											</option>
										))}
									</select>
								</div>
							</div>
							<div className="flex flex-wrap items-center gap-3 pt-2">
								<button
									type="submit"
									disabled={saving}
									className="inline-flex items-center rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
								>
									{saving ? 'Saving...' : 'Save changes'}
								</button>
								<button
									type="button"
									onClick={handleDeleteUser}
									disabled={saving}
									className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-2 text-[11px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-60"
								>
									<Trash2 className="w-3.5 h-3.5" />
									<span>Delete user</span>
								</button>
								<button
									type="button"
									onClick={() => {
										setSelectedUser(null)
										setFormName('')
										setFormEmail('')
										setFormPhone('')
										setFormStatus('active')
										setFormRoleId('')
									}}
									className="inline-flex items-center rounded-full border border-gray-200 px-3 py-2 text-[11px] font-medium text-gray-700 bg-gray-50 hover:bg-gray-100"
								>
									Close
								</button>
							</div>
						</form>
					</div>
				)}
			</div>
		</div>
	)
}