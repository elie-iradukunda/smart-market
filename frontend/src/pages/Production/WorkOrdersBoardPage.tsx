// @ts-nocheck
import React, { useEffect, useState, useMemo } from 'react'
// Retaining original external imports as requested:
import { useNavigate } from 'react-router-dom'
import { fetchWorkOrders } from '../../api/apiClient'
import { getAuthUser } from '@/utils/apiClient'
import TechnicianTopNav from '@/components/layout/TechnicianTopNav'
import OwnerTopNav from '@/components/layout/OwnerTopNav'
import OwnerSideNav from '@/components/layout/OwnerSideNav'

// Importing Lucide icons for the visual design
import { PlusCircle, Search, AlertTriangle, Loader2 } from 'lucide-react'

export default function WorkOrdersBoardPage() {
    const [workOrders, setWorkOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentUser, setCurrentUser] = useState<any | null>(null)
    const [myTasksOnly, setMyTasksOnly] = useState(false)

    // NOTE: useNavigate is retained from the original imports
    const navigate = useNavigate()

    // --- DATA FETCHING LOGIC ---
    useEffect(() => {
        let isMounted = true
        setLoading(true)
        setError(null)

        // Load current user from auth storage so we can show per-user tasks
        const user = getAuthUser()
        if (user && isMounted) {
            setCurrentUser(user)
        }

        fetchWorkOrders()
            .then((data) => {
                if (!isMounted) return
                // Ensure data is an array before setting state
                setWorkOrders(Array.isArray(data) ? data : [])
            })
            .catch((err) => {
                if (!isMounted) return
                setError(err.message || 'Failed to load work orders')
            })
            .finally(() => {
                if (!isMounted) return
                setLoading(false)
            })

        return () => {
            isMounted = false
        }
    }, [])

    // Helper function to color the stage tag (using Tailwind classes)
    const getStageColor = (stage) => {
        switch (stage) {
            case 'Design':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'Print':
                return 'bg-blue-100 text-blue-600 border-blue-200';
            case 'Finish':
                return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'QC': // Quality Control
            case 'Quality Control':
                return 'bg-teal-100 text-teal-800 border-teal-200';
            case 'Complete':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    // Work orders assigned to the current user (used for "My tasks" notification)
    const myAssignedWorkOrders = useMemo(() => {
        if (!currentUser) return []
        const userId = currentUser.id
        const userName = (currentUser.name || '').toLowerCase()
        const userEmail = (currentUser.email || '').toLowerCase()

        return workOrders.filter((wo: any) => {
            // Try multiple common shapes: assigned_to, technician_id, or technician name/email string
            if (wo.assigned_to === userId || wo.assigned_to_id === userId || wo.technician_id === userId) {
                return true
            }
            if (typeof wo.technician === 'string') {
                const tech = wo.technician.toLowerCase()
                if (userName && tech.includes(userName)) return true
                if (userEmail && tech.includes(userEmail)) return true
            }
            return false
        })
    }, [workOrders, currentUser])

    // Base list depending on whether "My tasks" filter is on
    const visibleBaseList = useMemo(() => {
        if (myTasksOnly && currentUser) {
            return myAssignedWorkOrders
        }
        return workOrders
    }, [myTasksOnly, currentUser, myAssignedWorkOrders, workOrders])

    // Filtered list derived from the search term
    const filteredWorkOrders = useMemo(() => {
        if (!searchTerm) return visibleBaseList
        const lowerCaseSearch = searchTerm.toLowerCase()

        return visibleBaseList.filter((wo: any) =>
            // Check customer/job name
            (wo.customer || wo.customer_name || '').toLowerCase().includes(lowerCaseSearch) ||
            // Check technician name (if available)
            (wo.technician || 'Unassigned').toLowerCase().includes(lowerCaseSearch) ||
            // Check order ID
            (String(wo.id) || '').toLowerCase().includes(lowerCaseSearch)
        )
    }, [visibleBaseList, searchTerm])

    // Calculate total active jobs (non-Complete)
    const totalActiveJobs = workOrders.filter((wo: any) => wo.status !== 'Complete').length
    const myTasksCount = myAssignedWorkOrders.length

    return (
        // 1. Apply the light gradient background for a modern feel
        <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 px-0 pb-10 font-sans">
            {/* Owner (role_id 1) sees OwnerTopNav; technicians see TechnicianTopNav; others currently see no extra nav here */}
            {currentUser?.role_id === 1 ? <OwnerTopNav /> : <TechnicianTopNav />}

            {/* Owner shell: sidebar + main content wrapper. OwnerSideNav self-hides for non-owner roles. */}
            <div className="px-3 sm:px-4 md:px-6 lg:px-8 pt-8">
                <div className="flex gap-6">
                    <OwnerSideNav />

                    <main className="flex-1 space-y-8 max-w-7xl mx-auto">

                        {/* Header Card - Clean and focused */}
                        <div className="rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-8 shadow-xl">
                            <p className="text-sm font-semibold uppercase tracking-wider text-green-700">Production Management</p>
                            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">
                                Job <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">Work Orders</span>
                            </h1>
                            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                                <p className="text-gray-600">
                                    Total Active Jobs:
                                    <span className="font-bold text-gray-800 ml-1">{totalActiveJobs}</span>
                                </p>
                                {currentUser && (
                                    <button
                                        type="button"
                                        className={`inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold border transition ${
                                            myTasksOnly
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                        }`}
                                        onClick={() => setMyTasksOnly((prev) => !prev)}
                                    >
                                        <span className="mr-1">My tasks</span>
                                        <span className="inline-flex items-center justify-center rounded-full bg-white/80 text-blue-700 px-2 py-0.5 text-[10px] font-bold">
                                            {myTasksCount}
                                        </span>
                                    </button>
                                )}
                                <button
                                    className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition duration-150 flex items-center"
                                    onClick={() => navigate('/production/new-order')} // Placeholder navigation
                                >
                                    <PlusCircle className="h-4 w-4 mr-1" aria-hidden="true" />
                                    New Work Order
                                </button>
                            </div>
                        </div>

                        {/* Work Orders Table Card - Main content area */}
                        <div className="mt-8 rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-xl p-6 shadow-xl">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
                                <p className="text-lg font-semibold text-gray-900">Active Production Schedule</p>

                                {/* Search Input */}
                                <div className="relative w-full sm:max-w-sm">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by job, customer, or technician"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 py-2 text-sm text-gray-800 placeholder-gray-400 
                                                    focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition duration-150"
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto -mx-2 sm:mx-0">
                                {/* Table Layout - Using border-spacing for visual separation of rows */}
                                <table className="min-w-full text-left text-sm border-separate border-spacing-y-2">
                                    <thead className="text-xs bg-gray-50/80 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider rounded-tl-lg">ID</th>
                                            <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Customer / Job Name</th>
                                            <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Stage</th>
                                            <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider">Technician</th>
                                            <th className="px-6 py-3 font-semibold text-gray-600 uppercase tracking-wider text-right rounded-tr-lg">Priority</th>
                                        </tr>
                                    </thead>

                                    {error && (
                                        <tbody>
                                            <tr>
                                                <td colSpan={5} className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                                                    <AlertTriangle className="h-4 w-4 inline mr-2" />
                                                    Error: {error}
                                                </td>
                                            </tr>
                                        </tbody>
                                    )}

                                    {loading ? (
                                        <tbody>
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-sm text-gray-500">
                                                    <Loader2 className="h-5 w-5 animate-spin inline mr-2 text-blue-500" />
                                                    Loading work orders...
                                                </td>
                                            </tr>
                                        </tbody>
                                    ) : (
                                        <tbody className="">
                                            {filteredWorkOrders.map((wo, index) => (
                                                <tr
                                                    key={wo.id || index}
                                                    onClick={() => navigate(`/production/work-orders/${wo.id}`)}
                                                    // Row styling with elevation and hover effect
                                                    className="bg-white rounded-xl shadow-md hover:shadow-lg hover:ring-2 hover:ring-blue-500/50 transition duration-200 cursor-pointer"
                                                >
                                                    <td className="px-6 py-4 text-gray-500 font-mono text-xs rounded-l-xl">
                                                        {wo.id}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-800 font-medium truncate">
                                                        {wo.customer || wo.customer_name || `Order #${wo.id}`}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {/* Stage Tag */}
                                                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${getStageColor(wo.status)}`}>
                                                            {wo.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600">
                                                        {wo.technician || '—'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right rounded-r-xl">
                                                        <span className={`text-xs font-semibold ${wo.priority === 'High' ? 'text-red-600' : wo.priority === 'Medium' ? 'text-amber-600' : 'text-green-600'}`}>
                                                            {wo.priority || 'Low'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredWorkOrders.length === 0 && !loading && !error && (
                                                <tr>
                                                    <td colSpan={5} className="p-8 text-center text-sm text-gray-500">
                                                        <AlertTriangle className="h-5 w-5 inline text-amber-500 mr-2" />
                                                        No work orders found matching your search criteria.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    )}
                                </table>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}