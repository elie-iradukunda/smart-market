import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuthUser } from '@/utils/apiClient';

const getDashboardPath = (roleId: number) => {
    switch (Number(roleId)) {
        case 1: return '/dashboard/admin'; // Admin
        case 2: return '/dashboard/sales'; // Sales
        case 3: return '/dashboard/staff'; // Staff
        case 4: return '/client';           // Client (Controller?)
        case 13: return '/client';          // Customer (E-commerce)
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
