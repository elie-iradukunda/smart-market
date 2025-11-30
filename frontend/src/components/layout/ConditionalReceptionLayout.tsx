// @ts-nocheck
import React from 'react'
import { getAuthUser } from '@/utils/apiClient'
import ReceptionDashboardLayout from './ReceptionDashboardLayout'

interface ConditionalReceptionLayoutProps {
    children: React.ReactNode
}

/**
 * Conditional layout wrapper that applies ReceptionDashboardLayout only for role_id 5 (Receptionist)
 * For other roles, it just renders the children without the reception layout
 */
export default function ConditionalReceptionLayout({ children }: ConditionalReceptionLayoutProps) {
    const user = getAuthUser()

    // If user is Receptionist (role_id 5), wrap with ReceptionDashboardLayout
    if (user && user.role_id === 5) {
        return <ReceptionDashboardLayout>{children}</ReceptionDashboardLayout>
    }

    // For other roles, render children without reception layout
    return <>{children}</>
}
