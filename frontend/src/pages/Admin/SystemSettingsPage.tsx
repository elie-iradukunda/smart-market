// @ts-nocheck
import React from 'react';
import { getAuthUser } from '@/utils/apiClient';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function SystemSettingsPage() {
  const user = getAuthUser();

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white px-3 sm:px-4 md:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Header Section - Clean text with border, no shadows or gradients */}
          <div className="rounded-xl border border-gray-200 bg-white p-8">
            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Global System Settings
            </h1>
          
          </div>

       
          {/* General Configuration Section - Flat, bordered container */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">General Configuration</h2>
            <p className="text-sm text-gray-500 mb-6">Other essential tenant and regional preferences.</p>
            
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between items-center py-3 border-b border-gray-50">
                <label htmlFor="timezone" className="text-sm font-semibold text-gray-700">Default Timezone</label>
                <input 
                  id="timezone" 
                  type="text" 
                  defaultValue="Africa/Kigali" 
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 w-full max-w-[200px] focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                />
              </div>
              <div className="flex justify-between items-center py-3">
                <label htmlFor="currency" className="text-sm font-semibold text-gray-700">Base Currency</label>
                <input 
                  id="currency" 
                  type="text" 
                  defaultValue="RWF" 
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 w-full max-w-[200px] focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                />
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button className="px-6 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors">
                Save Changes
              </button>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}