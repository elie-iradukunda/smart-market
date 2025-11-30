import React from 'react';
import { getAuthUser } from '@/utils/apiClient';
import OwnerDashboardLayout from './OwnerDashboardLayout';
import AdminDashboardLayout from './AdminDashboardLayout';
import FinanceDashboardLayout from './FinanceDashboardLayout';
import ControllerDashboardLayout from './ControllerDashboardLayout';
import ReceptionDashboardLayout from './ReceptionDashboardLayout';
import TechnicianDashboardLayout from './TechnicianDashboardLayout';
import ProductionManagerDashboardLayout from './ProductionManagerDashboardLayout';
import InventoryManagerDashboardLayout from './InventoryManagerDashboardLayout';
import SalesDashboardLayout from './SalesDashboardLayout';
import MarketingDashboardLayout from './MarketingDashboardLayout';
import POSDashboardLayout from './POSDashboardLayout';
import SupportDashboardLayout from './SupportDashboardLayout';

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

    switch (roleId) {
        case 1: // Owner
            return <OwnerDashboardLayout>{children}</OwnerDashboardLayout>;
        case 2: // Admin
            return <AdminDashboardLayout>{children}</AdminDashboardLayout>;
        case 3: // Accountant
            return <FinanceDashboardLayout>{children}</FinanceDashboardLayout>;
        case 4: // Controller
            return <ControllerDashboardLayout>{children}</ControllerDashboardLayout>;
        case 5: // Reception
            return <ReceptionDashboardLayout>{children}</ReceptionDashboardLayout>;
        case 6: // Technician
            return <TechnicianDashboardLayout>{children}</TechnicianDashboardLayout>;
        case 7: // Production Manager
            return <ProductionManagerDashboardLayout>{children}</ProductionManagerDashboardLayout>;
        case 8: // Inventory Manager
            return <InventoryManagerDashboardLayout>{children}</InventoryManagerDashboardLayout>;
        case 9: // Sales Rep
            return <SalesDashboardLayout>{children}</SalesDashboardLayout>;
        case 10: // Marketing
            return <MarketingDashboardLayout>{children}</MarketingDashboardLayout>;
        case 11: // POS Cashier
            return <POSDashboardLayout>{children}</POSDashboardLayout>;
        case 12: // Support Agent
            return <SupportDashboardLayout>{children}</SupportDashboardLayout>;
        default:
            // Fallback: If the user is an Owner/Admin but role_id wasn't caught above (shouldn't happen with updated switch)
            if (roleId === 1) {
                return <OwnerDashboardLayout>{children}</OwnerDashboardLayout>;
            }
            // For unknown roles, just render children to avoid breaking the app, 
            // but ideally we should have a default layout or error page.
            return <>{children}</>;
    }
};

export default DashboardLayout;
