import React from 'react';
import { getAuthUser } from '@/utils/apiClient';
import AdminDashboardLayout from './AdminDashboardLayout';
import SalesDashboardLayout from './SalesDashboardLayout';
import StaffDashboardLayout from './StaffDashboardLayout';
// import ClientDashboardLayout from './ClientDashboardLayout';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const user = getAuthUser();

    if (!user) {
        return <>{children}</>; // Or redirect to login
    }

    // Ensure role_id is treated as a number
    const roleId = Number(user.role_id);

    console.log(roleId)
    switch (roleId) {
        case 1: // Admin (includes: owner, admin, accountant, controller)
            return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
        case 2: // Sales (includes: sales_rep, marketing, pos_cashier)
            return <SalesDashboardLayout>{children}</SalesDashboardLayout>;
        case 3: // Staff (includes: production_manager, inventory_manager, technician, reception, support_agent)
            return <StaffDashboardLayout>{children}</StaffDashboardLayout>;
        case 4: // Client (customer)
          return <p>Not found</p>
            // return <ClientDashboardLayout>{children}</ClientDashboardLayout>;
        default:
            // Fallback to Admin layout for unknown roles
            return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
    }
};

export default DashboardLayout;