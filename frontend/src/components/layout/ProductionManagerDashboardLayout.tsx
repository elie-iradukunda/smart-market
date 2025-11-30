import React, { useState } from 'react';
import ProductionManagerSidebar from './ProductionManagerSidebar';
import ProductionManagerTopNav from './ProductionManagerTopNav';

interface ProductionManagerDashboardLayoutProps {
    children: React.ReactNode;
}

const ProductionManagerDashboardLayout: React.FC<ProductionManagerDashboardLayoutProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <ProductionManagerTopNav onMenuClick={() => setIsSidebarOpen(true)} />
            <div className="flex flex-1">
                <ProductionManagerSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
                <main className="flex-1 w-full">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default ProductionManagerDashboardLayout;
