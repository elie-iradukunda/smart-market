// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { fetchRoles, fetchPermissions } from '@/api/apiClient';
import DashboardLayout from '@/components/layout/DashboardLayout';
import EditRoleModal from './EditRoleModal';

const COLOR_CLASSES: Record<string, { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-700' },
  green: { bg: 'bg-green-100', text: 'text-green-700' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-700' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-700' }
};

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const parseIncludes = (includesJson: string | undefined): string[] => {
    if (!includesJson) return [];
    try {
      const parsed = JSON.parse(includesJson);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  };

  const getColorForRole = (roleName: string) => {
    const colors = ['blue', 'green', 'amber', 'purple'];
    const index = roleName.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const loadData = async () => {
    try {
      const [rolesData, permsData] = await Promise.all([fetchRoles(), fetchPermissions()]);
      setRoles(rolesData);
      setPermissions(permsData);
    } catch (error) {
      console.error("Failed to load data", error);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleEditClick = (role) => {
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Access Control</h1>
          <p className="text-gray-500">Select a role to modify its system-wide permissions.</p>
        </div>

        <div className="grid gap-4">
          {roles.map(role => {
            const includedRoles = parseIncludes(role.includes);
            const color = getColorForRole(role.name);
            const colorClass = COLOR_CLASSES[color];

            return (
              <div 
                key={role.id} 
                onClick={() => handleEditClick(role)}
                className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-md hover:border-blue-200 cursor-pointer transition-all flex justify-between items-center group"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg text-gray-900">{role.name}</h3>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                      {role.usersCount || 0} Users
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-500">{role.description}</p>
                  
                  {includedRoles.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {includedRoles.map((inc, i) => (
                        <span key={i} className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${colorClass.bg} ${colorClass.text}`}>
                          {inc}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <button className="bg-slate-50 text-slate-600 group-hover:bg-blue-600 group-hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-all">
                  Edit
                </button>
              </div>
            );
          })}
        </div>

        <EditRoleModal 
          isOpen={isModalOpen}
          role={selectedRole}
          allPermissions={permissions}
          onClose={() => setIsModalOpen(false)}
          onSuccess={loadData}
        />
      </div>
    </DashboardLayout>
  );
}