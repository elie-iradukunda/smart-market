// src/components/layout/InventoryLayout.tsx
import React from 'react';
import InventoryTopNav from './InventoryTopNav';
import InventoryControllerSideNav from './InventoryControllerSideNav';

interface InventoryLayoutProps {
  children: React.ReactNode;
}

const InventoryLayout: React.FC<InventoryLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-white to-lime-50/50">
      <InventoryTopNav />
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 border-r border-gray-200 bg-white/80 backdrop-blur-sm">
          <InventoryControllerSideNav />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default InventoryLayout;