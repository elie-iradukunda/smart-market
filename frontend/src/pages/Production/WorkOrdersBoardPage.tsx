// @ts-nocheck
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWorkOrders } from '../../api/apiClient';
import { getAuthUser } from '@/utils/apiClient';
import DashboardLayout from '@/components/layout/DashboardLayout';

import { 
    PlusCircle, 
    Search, 
    AlertTriangle, 
    Loader2, 
    UserPlus, 
    Eye, 
    X, 
    FileText, 
    CheckCircle, 
    Clock 
} from 'lucide-react';
import AssignWorkerModal from '@/components/orders/AssignWorkerModal';

export default function WorkOrdersBoardPage() {
    const [workOrders, setWorkOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [myTasksOnly, setMyTasksOnly] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showQuoteModal, setShowQuoteModal] = useState(false);
    const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError(null);

        const user = getAuthUser();
        if (user && isMounted) {
            setCurrentUser(user);
        }

        fetchWorkOrders()
            .then((data) => {
                if (!isMounted) return;
                setWorkOrders(Array.isArray(data) ? data : []);
            })
            .catch((err) => {
                if (!isMounted) return;
                setError(err.message || 'Failed to load work orders');
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const handleAssignClick = (workOrder, e) => {
        e.stopPropagation();
        setSelectedWorkOrder(workOrder);
        setShowAssignModal(true);
    };

    const handleViewQuoteClick = (workOrder, e) => {
        e.stopPropagation();
        setSelectedWorkOrder(workOrder);
        setShowQuoteModal(true);
    };

    const handleAssignmentComplete = async () => {
        setShowAssignModal(false);
        setSelectedWorkOrder(null);
        try {
            const data = await fetchWorkOrders();
            setWorkOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to refresh work orders:', err);
        }
    };

    const getStageColor = (stage) => {
        switch ((stage || '').toLowerCase()) {
            case 'design':
                return 'bg-purple-100 text-purple-800 border-purple-200 capitalize';
            case 'print':
            case 'prepress':
                return 'bg-blue-100 text-blue-600 border-blue-200 capitalize';
            case 'finish':
            case 'finishing':
                return 'bg-amber-100 text-amber-800 border-amber-200 capitalize';
            case 'ready':
                return 'bg-teal-100 text-teal-800 border-teal-200 capitalize';
            case 'delivered':
            case 'complete':
                return 'bg-green-100 text-green-800 border-green-200 capitalize';
            default:
                return 'bg-gray-100 text-gray-600 border-gray-200 capitalize';
        }
    };

    const myAssignedWorkOrders = useMemo(() => {
        if (!currentUser) return [];
        const userId = currentUser.id;
        const userName = (currentUser.name || '').toLowerCase();
        const userEmail = (currentUser.email || '').toLowerCase();

        return workOrders.filter((wo) => {
            if (wo.assigned_to === userId || wo.assigned_to_id === userId || wo.technician_id === userId) {
                return true;
            }
            if (typeof wo.technician === 'string') {
                const tech = wo.technician.toLowerCase();
                if (userName && tech.includes(userName)) return true;
                if (userEmail && tech.includes(userEmail)) return true;
            }
            return false;
        });
    }, [workOrders, currentUser]);

    const visibleBaseList = useMemo(() => {
        if (myTasksOnly && currentUser) {
            return myAssignedWorkOrders;
        }
        return workOrders;
    }, [myTasksOnly, currentUser, myAssignedWorkOrders, workOrders]);

    const filteredWorkOrders = useMemo(() => {
        if (!searchTerm) return visibleBaseList;
        const lowerCaseSearch = searchTerm.toLowerCase();

        return visibleBaseList.filter((wo) =>
            (wo.customer || wo.customer_name || '').toLowerCase().includes(lowerCaseSearch) ||
            (wo.technician || 'Unassigned').toLowerCase().includes(lowerCaseSearch) ||
            (String(wo.id) || '').toLowerCase().includes(lowerCaseSearch)
        );
    }, [visibleBaseList, searchTerm]);

    const totalActiveJobs = workOrders.filter((wo) => wo.status !== 'Complete').length;
    const myTasksCount = myAssignedWorkOrders.length;
    const isAdmin = currentUser?.role_id === 1 || currentUser?.role_id === 2;

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 font-sans">
                <div className="mx-auto max-w-7xl space-y-6">

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                            Work Orders
                        </h1>
                        <div className="flex items-center gap-3">
                            {currentUser && (
                                <button
                                    type="button"
                                    className={`inline-flex items-center rounded-lg px-4 py-2 text-xs font-bold border transition ${myTasksOnly
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                        }`}
                                    onClick={() => setMyTasksOnly((prev) => !prev)}
                                >
                                    My tasks ({myTasksCount})
                                </button>
                            )}
                            <button
                                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 transition duration-150 flex items-center"
                                onClick={() => navigate('/production/new-order')}
                            >
                                <PlusCircle className="h-4 w-4 mr-1" />
                                New Order
                            </button>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                            <div className="relative w-full sm:max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search jobs..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none transition duration-150"
                                />
                            </div>
                            <div className="text-sm font-bold text-slate-500">
                                Total Active: {totalActiveJobs}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        <th className="px-6 py-3">ID</th>
                                        <th className="px-6 py-3">Customer</th>
                                        <th className="px-6 py-3">Stage</th>
                                        <th className="px-6 py-3">Technician</th>
                                        <th className="px-6 py-3 text-right">Priority</th>
                                        <th className="px-6 py-3 text-center">Actions</th>
                                    </tr>
                                </thead>

                                {error ? (
                                    <tbody>
                                        <tr>
                                            <td colSpan={6} className="p-4 text-sm text-red-600 bg-red-50 text-center font-bold">
                                                Error: {error}
                                            </td>
                                        </tr>
                                    </tbody>
                                ) : loading ? (
                                    <tbody>
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-slate-400 font-bold italic">
                                                Loading...
                                            </td>
                                        </tr>
                                    </tbody>
                                ) : (
                                    <tbody className="divide-y divide-slate-50">
                                        {filteredWorkOrders.map((wo, index) => {
                                            const isAssignedToMe = Number(wo.assigned_to) === Number(currentUser?.id);
                                            const canClick = isAdmin || isAssignedToMe;

                                            return (
                                                <tr
                                                    key={wo.id || index}
                                                    onClick={canClick ? () => navigate(`/orders/${wo.order_id || wo.order_number}`) : undefined}
                                                    className={`transition-all hover:bg-slate-50 ${canClick ? 'cursor-pointer' : ''}`}
                                                >
                                                    <td className="px-6 py-4 text-slate-500 font-mono text-xs font-bold">
                                                        {wo.id}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-900 font-bold">
                                                        {wo.customer || wo.customer_name || `Order #${wo.id}`}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-bold border uppercase tracking-tighter ${getStageColor(wo.order_status || wo.stage || wo.status)}`}>
                                                            {wo.order_status || wo.stage || wo.status || 'Pending'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-700 font-medium">
                                                        {wo.assigned_user_name || wo.technician || '—'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-bold">
                                                        <span className={wo.priority === 'High' ? 'text-red-600' : wo.priority === 'Medium' ? 'text-amber-600' : 'text-green-600'}>
                                                            {wo.priority || 'Low'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center space-x-2">
                                                        <button
                                                            onClick={(e) => handleViewQuoteClick(wo, e)}
                                                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                                                        >
                                                            <Eye size={14} />
                                                            View
                                                        </button>
                                                        {isAdmin && (
                                                            <button
                                                                onClick={(e) => handleAssignClick(wo, e)}
                                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-all shadow-sm"
                                                            >
                                                                <UserPlus size={14} />
                                                                Assign
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                )}
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {showAssignModal && selectedWorkOrder && (
                <AssignWorkerModal
                    orderId={selectedWorkOrder.id}
                    currentAssignee={selectedWorkOrder.technician ? {
                        id: selectedWorkOrder.assigned_to || selectedWorkOrder.technician_id,
                        name: selectedWorkOrder.technician
                    } : undefined}
                    onClose={() => setShowAssignModal(false)}
                    onAssigned={handleAssignmentComplete}
                />
            )}

            {showQuoteModal && selectedWorkOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
                    <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                            <h2 className="text-lg font-bold text-slate-900">Reference: #{selectedWorkOrder.id}</h2>
                            <button onClick={() => setShowQuoteModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-100">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Customer</p>
                                    <p className="text-sm font-bold text-slate-900">{selectedWorkOrder.customer || selectedWorkOrder.customer_name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Stage</p>
                                    <p className="text-sm font-bold text-slate-900 uppercase">{selectedWorkOrder.order_status || selectedWorkOrder.stage}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowQuoteModal(false)}
                                className="w-full rounded-lg border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}