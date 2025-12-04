import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuthUser } from '@/utils/apiClient';

const getDashboardPath = (roleId: number) => {
    switch (Number(roleId)) {
        case 1: return '/dashboard/owner';
        case 2: return '/dashboard/admin';
        case 3: return '/dashboard/accountant';
        case 4: return '/dashboard/controller';
        case 5: return '/dashboard/reception';
        case 6: return '/dashboard/technician';
        case 7: return '/dashboard/production';
        case 8: return '/dashboard/inventory';
        case 9: return '/dashboard/sales';
        case 10: return '/dashboard/marketing';
        case 11: return '/dashboard/pos';
        case 12: return '/dashboard/support';
        default: return '/login';
    }
};

export default function RouteGuard({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    const navigate = useNavigate();
    const isFirstLoad = useRef(true);

    useEffect(() => {
        // Only run this check on the very first load of this component (app load/refresh)
        if (isFirstLoad.current) {
            isFirstLoad.current = false;

            // Allow access if the path is a dashboard root
            // We assume any path starting with /dashboard/ is a valid entry point
            // or at least a safe place to land.
            if (location.pathname.startsWith('/dashboard/')) {
                return;
            }

            // If we are here, it's a "deep link" (e.g. /crm/customers, /files)
            // We want to block direct access to these and force the user to the dashboard.
            const user = getAuthUser();
            if (user) {
                const dashboardPath = getDashboardPath(Number(user.role_id));
                console.log(`RouteGuard: Redirecting from ${location.pathname} to ${dashboardPath}`);
                navigate(dashboardPath, { replace: true });
            } else {
                // If not authenticated, LegacyBusinessApp might render, but usually 
                // protected pages check auth. If we are here unauthenticated, 
                // sending to login is safe.
                navigate('/login', { replace: true });
            }
        }
    }, [location, navigate]);

    return <>{children}</>;
}
